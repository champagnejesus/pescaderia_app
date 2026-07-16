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
