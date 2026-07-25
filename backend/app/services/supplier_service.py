from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.supplier import Supplier

async def get_suppliers(db: AsyncSession, business_id: int = 1, search: str = "", page: int = 1, limit: int = 50) -> list[Supplier]:
    query = select(Supplier).where(Supplier.business_id == business_id)
    if search:
        query = query.where(Supplier.name.ilike(f"%{search}%"))
    query = query.order_by(Supplier.name.asc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_supplier(db: AsyncSession, supplier_id: int, business_id: int = 1) -> Supplier | None:
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id, Supplier.business_id == business_id))
    return result.scalar_one_or_none()

async def create_supplier(db: AsyncSession, data: dict, business_id: int = 1) -> Supplier:
    data["business_id"] = business_id
    supplier = Supplier(**data)
    db.add(supplier)
    await db.flush()
    return supplier

async def update_supplier(db: AsyncSession, supplier_id: int, data: dict, business_id: int = 1) -> Supplier | None:
    supplier = await get_supplier(db, supplier_id, business_id)
    if not supplier: return None
    for key, value in data.items():
        setattr(supplier, key, value)
    await db.flush()
    return supplier

async def delete_supplier(db: AsyncSession, supplier_id: int, business_id: int = 1) -> bool:
    supplier = await get_supplier(db, supplier_id, business_id)
    if not supplier: return False
    await db.delete(supplier)
    await db.flush()
    return True
