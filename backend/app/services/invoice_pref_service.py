from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.invoice_pref import InvoicePref

async def get_invoice_prefs(db: AsyncSession, business_id: int) -> InvoicePref | None:
    result = await db.execute(select(InvoicePref).where(InvoicePref.business_id == business_id))
    return result.scalar_one_or_none()

async def upsert_invoice_prefs(db: AsyncSession, business_id: int, data: dict) -> InvoicePref:
    existing = await get_invoice_prefs(db, business_id)
    if existing:
        for key, value in data.items():
            setattr(existing, key, value)
        await db.flush()
        return existing
    ip = InvoicePref(business_id=business_id, **data)
    db.add(ip)
    await db.flush()
    return ip
