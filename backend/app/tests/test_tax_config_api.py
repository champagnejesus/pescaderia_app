import pytest
from app.services.tax_config_service import get_tax_config, upsert_tax_config

@pytest.mark.asyncio
async def test_get_tax_config_none(async_session):
    tc = await get_tax_config(async_session, 1)
    assert tc is None

@pytest.mark.asyncio
async def test_upsert_tax_config(async_session):
    tc = await upsert_tax_config(async_session, 1, {"is_enabled": True, "name": "ITBIS", "rate": 18.0, "included_in_price": False})
    await async_session.commit()
    assert tc.name == "ITBIS"
    assert tc.rate == 18.0

@pytest.mark.asyncio
async def test_upsert_tax_config_update(async_session):
    await upsert_tax_config(async_session, 1, {"is_enabled": True, "name": "IVA", "rate": 13.0, "included_in_price": True})
    await async_session.commit()
    updated = await upsert_tax_config(async_session, 1, {"rate": 15.0})
    await async_session.commit()
    assert updated.rate == 15.0
