import pytest
from datetime import datetime, timedelta
from app.services.client_service import create_client, get_clients, get_client, update_client, delete_client, adjust_balance, get_client_orders
from app.models.order import Order

@pytest.mark.asyncio
async def test_create_and_list_clients(async_session):
    await create_client(async_session, {"name": "Test Client", "phone": "123"})
    await async_session.commit()
    clients = await get_clients(async_session)
    assert len(clients) == 1 and clients[0].name == "Test Client"

@pytest.mark.asyncio
async def test_get_client_by_id(async_session):
    c = await create_client(async_session, {"name": "Test", "phone": "456"})
    cid = c.id; await async_session.commit()
    found = await get_client(async_session, cid)
    assert found is not None and found.name == "Test"

@pytest.mark.asyncio
async def test_update_client(async_session):
    c = await create_client(async_session, {"name": "Old", "phone": "111"})
    cid = c.id; await async_session.commit()
    updated = await update_client(async_session, cid, {"name": "New"})
    assert updated.name == "New"

@pytest.mark.asyncio
async def test_delete_client(async_session):
    c = await create_client(async_session, {"name": "Del", "phone": "222"})
    cid = c.id; await async_session.commit()
    assert await delete_client(async_session, cid) is True
    assert await get_client(async_session, cid) is None

@pytest.mark.asyncio
async def test_adjust_balance(async_session):
    c = await create_client(async_session, {"name": "Bal", "phone": "333", "outstanding_balance": 0.0})
    cid = c.id; await async_session.commit()
    adj = await adjust_balance(async_session, cid, 150.0)
    assert adj.outstanding_balance == 150.0

@pytest.mark.asyncio
async def test_not_found(async_session):
    assert await get_client(async_session, 999) is None
    assert await update_client(async_session, 999, {}) is None
    assert await delete_client(async_session, 999) is False


@pytest.mark.asyncio
async def test_get_client_orders(async_session):
    client = await create_client(async_session, {"name": "Order Client", "phone": "789"})
    cid = client.id
    await async_session.flush()

    older = Order(
        order_number="ORD-001", client_id=cid, client_name=client.name,
        items_count=3, status="ENTREGADO", total_value=100.0,
        created_at=datetime(2025, 1, 1, 10, 0, 0),
    )
    newer = Order(
        order_number="ORD-002", client_id=cid, client_name=client.name,
        items_count=2, status="PENDIENTE", total_value=200.0,
        created_at=datetime(2025, 1, 2, 10, 0, 0),
    )
    async_session.add_all([older, newer])
    await async_session.commit()

    orders = await get_client_orders(async_session, cid)
    assert len(orders) == 2
    assert orders[0].order_number == "ORD-002"
    assert orders[1].order_number == "ORD-001"


@pytest.mark.asyncio
async def test_get_client_orders_empty(async_session):
    client = await create_client(async_session, {"name": "No Orders", "phone": "000"})
    cid = client.id
    await async_session.commit()

    orders = await get_client_orders(async_session, cid)
    assert len(orders) == 0
