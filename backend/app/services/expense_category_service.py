from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.expense_category import ExpenseCategory
from app.schemas.expense_category import ExpenseCategoryCreate, ExpenseCategoryUpdate


async def get_categories(db: AsyncSession, business_id: int = None):
    query = (
        select(ExpenseCategory)
        .options(selectinload(ExpenseCategory.subcategories))
        .where(ExpenseCategory.parent_id.is_(None))
        .order_by(ExpenseCategory.name)
    )
    if business_id:
        query = query.where(ExpenseCategory.business_id == business_id)
    result = await db.execute(query)
    return result.scalars().all()


async def create_category(db: AsyncSession, data: ExpenseCategoryCreate, business_id: int = None):
    category = ExpenseCategory(
        name=data.name,
        parent_id=data.parent_id,
        business_id=business_id,
    )
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


async def update_category(db: AsyncSession, category_id: int, data: ExpenseCategoryUpdate):
    result = await db.execute(select(ExpenseCategory).where(ExpenseCategory.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        return None
    if data.name is not None:
        category.name = data.name
    if data.is_active is not None:
        category.is_active = data.is_active
    await db.flush()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category_id: int):
    result = await db.execute(select(ExpenseCategory).where(ExpenseCategory.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        return False
    from app.models.transaction import Transaction
    expense_count = await db.execute(
        select(func.count(Transaction.id)).where(Transaction.expense_category_id == category_id)
    )
    if expense_count.scalar() > 0:
        return False
    await db.delete(category)
    await db.flush()
    return True


async def seed_default_categories(db: AsyncSession, business_id: int):
    """Seed default expense categories for a new business."""
    defaults = {
        "Combos": ["Combos de pescado", "Combos de mariscos"],
        "Servicios": ["Alquiler", "Electricidad", "Agua", "Internet", "Transporte", "Personal"],
        "Impuestos": ["IVA", "Otros impuestos"],
        "Mantenimiento": ["Equipos", "Local", "Vehículos"],
        "Otros": [],
    }
    for parent_name, subcategories in defaults.items():
        parent = ExpenseCategory(name=parent_name, business_id=business_id)
        db.add(parent)
        await db.flush()
        for sub_name in subcategories:
            sub = ExpenseCategory(name=sub_name, parent_id=parent.id, business_id=business_id)
            db.add(sub)
    await db.flush()
