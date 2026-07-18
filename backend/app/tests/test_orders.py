import pytest
from app.services.order_service import create_order, get_orders, get_order, update_order_status

@pytest.mark.asyncio
async def test_create_and_list_orders(async_session):
    from app.models.product import Product
    from app.models.client import Client
    p = Product(name="Fish", category="X", stock=10.0, price=15.0)
    c = Client(name="Client", phone="123")
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
    from app.models.product import Product
    from app.models.client import Client
    p = Product(name="Fish2", category="X", stock=10.0, price=15.0)
    c = Client(name="Client2", phone="456")
    async_session.add_all([p, c])
    await async_session.flush()
    order = await create_order(async_session, {"client_id": c.id, "client_name": "Client2", "items": [{"product_id": p.id, "quantity": 1.0, "unit_price": 15.0, "subtotal": 15.0}]})
    oid = order.id; await async_session.commit()
    updated = await update_order_status(async_session, oid, "ENTREGADO")
    assert updated.status == "ENTREGADO"

@pytest.mark.asyncio
async def test_cancel_order_restores_stock(async_session):
    from app.models.product import Product
    from app.models.client import Client
    p = Product(name="CancelFish", category="X", stock=10.0, price=15.0)
    c = Client(name="CancelClient", phone="789")
    async_session.add_all([p, c])
    await async_session.flush()
    order = await create_order(async_session, {"client_id": c.id, "client_name": "CancelClient", "items": [{"product_id": p.id, "quantity": 3.0, "unit_price": 15.0, "subtotal": 45.0}]})
    oid = order.id; await async_session.commit()
    cancelled = await update_order_status(async_session, oid, "ANULADO")
    assert cancelled.status == "ANULADO"
    product = await async_session.get(Product, p.id)
    assert product.stock == 10.0

@pytest.mark.asyncio
async def test_create_order_insufficient_stock_raises(async_session):
    from app.models.product import Product
    from app.models.client import Client
    from app.services.order_service import create_order
    import pytest
    p = Product(name="LowStockFish", category="X", stock=1.0, price=15.0)
    c = Client(name="LowStockClient", phone="000")
    async_session.add_all([p, c])
    await async_session.flush()
    with pytest.raises(ValueError, match="Insufficient stock"):
        await create_order(async_session, {"client_id": c.id, "client_name": "LowStockClient", "items": [{"product_id": p.id, "quantity": 5.0, "unit_price": 15.0, "subtotal": 75.0}]})

@pytest.mark.asyncio
async def test_create_order_with_invalid_client_raises(async_session):
    from app.services.order_service import create_order
    import pytest
    with pytest.raises(ValueError, match="Client with id"):
        await create_order(async_session, {"client_id": 999, "client_name": "Ghost", "items": []})
