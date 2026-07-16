import pytest
from app.services.client_service import create_client, get_clients, get_client, update_client, delete_client, adjust_balance

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
