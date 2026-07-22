from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.category import Category

async def list_categories(db: AsyncSession, business_id: int) -> list[Category]:
    result = await db.execute(select(Category).where(Category.business_id == business_id).order_by(Category.name))
    return result.scalars().all()

async def create_category(db: AsyncSession, business_id: int, name: str) -> Category:
    cat = Category(name=name, business_id=business_id)
    db.add(cat)
    await db.flush()
    return cat

async def delete_category(db: AsyncSession, category_id: int, business_id: int) -> bool:
    cat = await db.get(Category, category_id)
    if not cat or cat.business_id != business_id:
        return False
    await db.delete(cat)
    await db.flush()
    return True
