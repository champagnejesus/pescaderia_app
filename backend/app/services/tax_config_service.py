from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.tax_config import TaxConfig

async def get_tax_config(db: AsyncSession, business_id: int) -> TaxConfig | None:
    result = await db.execute(select(TaxConfig).where(TaxConfig.business_id == business_id))
    return result.scalar_one_or_none()

async def upsert_tax_config(db: AsyncSession, business_id: int, data: dict) -> TaxConfig:
    existing = await get_tax_config(db, business_id)
    if existing:
        for key, value in data.items():
            setattr(existing, key, value)
        await db.flush()
        return existing
    tc = TaxConfig(business_id=business_id, **data)
    db.add(tc)
    await db.flush()
    return tc
