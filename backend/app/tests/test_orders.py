import pytest
from datetime import date, timedelta
from app.services.order_service import create_order, get_orders, get_order, update_order_status
from app.models.client import Client
from app.models.product import Product

@pytest.mark.asyncio
async def test_create_and_list_orders(async_session):
    p = Product(name="Fish", category="X", stock=10.0, price=15.0)
    c = Client(name="Client", phone="123", allows_credit=True)
    async_session.add_all([p, c])
    await async_session.flush()
    order = await create_order(async_session, {"client_id": c.id, "client_name": "Client", "items": [{"product_id": p.id, "quantity": 2.0, "unit_price": 15.0, "subtotal": 30.0}]})
    oid = order.id; await async_session.commit()
    orders = await get_orders(async_session)
    assert len(orders) >= 1
    fetched = await get_order(async_session, oid)
    assert fetched is not None and len(fetched.items) == 1

@pytest.mark.asyncio
async def test_update_order_status(async_session):
    p = Product(name="Fish2", category="X", stock=10.0, price=15.0)
    c = Client(name="Client2", phone="456", allows_credit=True)
    async_session.add_all([p, c])
    await async_session.flush()
    order = await create_order(async_session, {"client_id": c.id, "client_name": "Client2", "items": [{"product_id": p.id, "quantity": 1.0, "unit_price": 15.0, "subtotal": 15.0}]})
    oid = order.id; await async_session.commit()
    updated = await update_order_status(async_session, oid, "ENTREGADO")
    assert updated.status == "ENTREGADO"

@pytest.mark.asyncio
async def test_cancel_order_restores_stock(async_session):
    p = Product(name="CancelFish", category="X", stock=10.0, price=15.0)
    c = Client(name="CancelClient", phone="789", allows_credit=True)
    async_session.add_all([p, c])
    await async_session.flush()
    order = await create_order(async_session, {"client_id": c.id, "client_name": "CancelClient", "items": [{"product_id": p.id, "quantity": 3.0, "unit_price": 15.0, "subtotal": 45.0}]})
    oid = order.id; await async_session.commit()
    cancelled = await update_order_status(async_session, oid, "ANULADO")
    assert cancelled.status == "ANULADO"
    product = await async_session.get(Product, p.id)
    assert float(product.stock) == 10.0

@pytest.mark.asyncio
async def test_create_order_insufficient_stock_raises(async_session):
    p = Product(name="LowStockFish", category="X", stock=1.0, price=15.0)
    c = Client(name="LowStockClient", phone="000", allows_credit=True)
    async_session.add_all([p, c])
    await async_session.flush()
    with pytest.raises(ValueError, match="Insufficient stock"):
        await create_order(async_session, {"client_id": c.id, "client_name": "LowStockClient", "items": [{"product_id": p.id, "quantity": 5.0, "unit_price": 15.0, "subtotal": 75.0}]})

@pytest.mark.asyncio
async def test_create_order_with_invalid_client_raises(async_session):
    with pytest.raises(ValueError, match="Client with id"):
        await create_order(async_session, {"client_id": 999, "client_name": "Ghost", "items": []})

@pytest.mark.asyncio
async def test_create_order_credit_disabled_raises(async_session):
    p = Product(name="CreditFish", category="X", stock=10.0, price=10.0)
    c = Client(name="NoCreditClient", phone="111", allows_credit=False)
    async_session.add_all([p, c])
    await async_session.flush()
    with pytest.raises(ValueError, match="El cliente no tiene autorizado crédito comercial"):
        await create_order(async_session, {
            "client_id": c.id,
            "client_name": "NoCreditClient",
            "payment_status": "PENDIENTE",
            "items": [{"product_id": p.id, "quantity": 1.0, "unit_price": 10.0, "subtotal": 10.0}]
        })

@pytest.mark.asyncio
async def test_create_order_credit_limit_exceeded_raises(async_session):
    p = Product(name="LimitFish", category="X", stock=10.0, price=10.0)
    c = Client(name="LowLimitClient", phone="222", allows_credit=True, credit_limit=50.0, outstanding_balance=40.0)
    async_session.add_all([p, c])
    await async_session.flush()
    with pytest.raises(ValueError, match="Se ha excedido el límite de crédito del cliente"):
        await create_order(async_session, {
            "client_id": c.id,
            "client_name": "LowLimitClient",
            "payment_status": "PENDIENTE",
            "items": [{"product_id": p.id, "quantity": 2.0, "unit_price": 10.0, "subtotal": 20.0}]
        })

@pytest.mark.asyncio
async def test_create_order_overdue_invoices_raises(async_session):
    p = Product(name="OverdueFish", category="X", stock=10.0, price=10.0)
    c = Client(name="OverdueClient", phone="333", allows_credit=True, credit_limit=100.0, payment_terms=7)
    async_session.add_all([p, c])
    await async_session.flush()
    
    # Create an order that is already overdue
    from app.models.order import Order
    from datetime import date, timedelta
    overdue_order = Order(
        order_number="ORD-OLD123",
        client_id=c.id,
        client_name="OverdueClient",
        total_value=20.0,
        items_count=1,
        payment_status="PENDIENTE",
        due_date=date.today() - timedelta(days=2),
        business_id=1
    )
    async_session.add(overdue_order)
    c.outstanding_balance = 20.0
    await async_session.flush()
    
    # Try creating a new order at credit
    with pytest.raises(ValueError, match="El cliente posee facturas vencidas impagadas"):
        await create_order(async_session, {
            "client_id": c.id,
            "client_name": "OverdueClient",
            "payment_status": "PENDIENTE",
            "items": [{"product_id": p.id, "quantity": 1.0, "unit_price": 10.0, "subtotal": 10.0}]
        })
