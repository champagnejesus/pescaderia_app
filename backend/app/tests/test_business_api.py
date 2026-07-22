import pytest
from app.services.business_service import get_profile, update_profile, update_pin

@pytest.mark.asyncio
async def test_get_profile_not_found(async_session):
    profile = await get_profile(async_session, 999)
    assert profile is None

@pytest.mark.asyncio
async def test_update_profile(async_session):
    from app.models.business import BusinessConfig
    biz = BusinessConfig(business_name="Test", owner_name="Owner", email="test@test.com", password_hash="hash")
    async_session.add(biz)
    await async_session.commit()
    updated = await update_profile(async_session, biz.id, {"business_name": "New Name", "phone": "123456789"})
    assert updated is not None
    assert updated.business_name == "New Name"
    assert updated.phone == "123456789"

@pytest.mark.asyncio
async def test_update_pin(async_session):
    from app.models.business import BusinessConfig
    biz = BusinessConfig(business_name="Test", owner_name="Owner", email="test2@test.com", password_hash="hash")
    async_session.add(biz)
    await async_session.commit()
    updated = await update_pin(async_session, biz.id, "1234", True)
    assert updated is not None
    assert updated.require_pin is True
    assert updated.close_day_pin is not None
