from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.payment_method import PaymentMethod

async def list_payment_methods(db: AsyncSession, business_id: int) -> list[PaymentMethod]:
    result = await db.execute(
        select(PaymentMethod).where(PaymentMethod.business_id == business_id).order_by(PaymentMethod.sort_order)
    )
    return result.scalars().all()

async def toggle_payment_method(db: AsyncSession, method_id: int, business_id: int, is_active: bool) -> bool:
    pm = await db.get(PaymentMethod, method_id)
    if not pm or pm.business_id != business_id:
        return False
    pm.is_active = is_active
    await db.flush()
    return True

async def reorder_payment_methods(db: AsyncSession, business_id: int, ids: list[int]) -> bool:
    for idx, mid in enumerate(ids):
        await db.execute(
            update(PaymentMethod).where(PaymentMethod.id == mid, PaymentMethod.business_id == business_id).values(sort_order=idx)
        )
    await db.flush()
    return True
