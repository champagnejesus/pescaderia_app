import pytest
from app.services.supplier_service import create_supplier, get_suppliers, get_supplier, update_supplier, delete_supplier

@pytest.mark.asyncio
async def test_create_and_list_suppliers(async_session):
    await create_supplier(async_session, {"name": "Test Supplier", "category": "Mariscos"})
    await async_session.commit()
    suppliers = await get_suppliers(async_session)
    assert len(suppliers) == 1 and suppliers[0].name == "Test Supplier"

@pytest.mark.asyncio
async def test_get_supplier_by_id(async_session):
    s = await create_supplier(async_session, {"name": "Test", "category": "Pescado"})
    sid = s.id; await async_session.commit()
    found = await get_supplier(async_session, sid)
    assert found is not None and found.name == "Test"

@pytest.mark.asyncio
async def test_update_supplier(async_session):
    s = await create_supplier(async_session, {"name": "Old", "category": "X"})
    sid = s.id; await async_session.commit()
    updated = await update_supplier(async_session, sid, {"name": "New"})
    assert updated.name == "New"

@pytest.mark.asyncio
async def test_delete_supplier(async_session):
    s = await create_supplier(async_session, {"name": "Del", "category": "X"})
    sid = s.id; await async_session.commit()
    assert await delete_supplier(async_session, sid) is True
    assert await get_supplier(async_session, sid) is None

@pytest.mark.asyncio
async def test_not_found(async_session):
    assert await get_supplier(async_session, 999) is None
    assert await update_supplier(async_session, 999, {}) is None
    assert await delete_supplier(async_session, 999) is False
