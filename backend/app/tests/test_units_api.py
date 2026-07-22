import pytest
from app.services.unit_service import list_units, create_unit, delete_unit

@pytest.mark.asyncio
async def test_create_and_list_units(async_session):
    unit = await create_unit(async_session, 1, "Kilogramo", "kg")
    await async_session.commit()
    units = await list_units(async_session, 1)
    assert len(units) == 1
    assert units[0].abbreviation == "kg"

@pytest.mark.asyncio
async def test_delete_unit(async_session):
    unit = await create_unit(async_session, 1, "Libra", "lb")
    await async_session.commit()
    assert await delete_unit(async_session, unit.id, 1) is True
    assert await list_units(async_session, 1) == []

@pytest.mark.asyncio
async def test_delete_unit_not_found(async_session):
    assert await delete_unit(async_session, 999, 1) is False
