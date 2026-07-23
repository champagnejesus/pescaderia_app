from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.business import BusinessConfig
from app.services.auth_service import hash_password, verify_password

async def get_profile(db: AsyncSession, user_id: int) -> BusinessConfig | None:
    result = await db.execute(select(BusinessConfig).where(BusinessConfig.id == user_id))
    return result.scalar_one_or_none()

async def update_profile(db: AsyncSession, user_id: int, data: dict) -> BusinessConfig | None:
    business = await db.get(BusinessConfig, user_id)
    if not business:
        return None
    for key, value in data.items():
        if key == "close_day_pin" and value is not None:
            value = hash_password(value)
        setattr(business, key, value)
    await db.flush()
    return business

async def update_pin(db: AsyncSession, user_id: int, pin: str, require_pin: bool) -> BusinessConfig | None:
    business = await db.get(BusinessConfig, user_id)
    if not business:
        return None
    business.close_day_pin = hash_password(pin) if pin else None
    business.require_pin = require_pin
    await db.flush()
    return business

async def verify_pin(db: AsyncSession, user_id: int, pin: str) -> bool:
    business = await db.get(BusinessConfig, user_id)
    if not business or not business.close_day_pin:
        return False
    return verify_password(pin, business.close_day_pin)
