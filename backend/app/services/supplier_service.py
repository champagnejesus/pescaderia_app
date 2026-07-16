from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.supplier import Supplier

async def get_suppliers(db: AsyncSession, search: str = "", page: int = 1, limit: int = 50) -> list[Supplier]:
    query = select(Supplier)
    if search:
        query = query.where(Supplier.name.ilike(f"%{search}%"))
    query = query.order_by(Supplier.name.asc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_supplier(db: AsyncSession, supplier_id: int) -> Supplier | None:
    return await db.get(Supplier, supplier_id)

async def create_supplier(db: AsyncSession, data: dict) -> Supplier:
    supplier = Supplier(**data)
    db.add(supplier)
    await db.flush()
    return supplier

async def update_supplier(db: AsyncSession, supplier_id: int, data: dict) -> Supplier | None:
    supplier = await db.get(Supplier, supplier_id)
    if not supplier: return None
    for key, value in data.items():
        setattr(supplier, key, value)
    await db.flush()
    return supplier

async def delete_supplier(db: AsyncSession, supplier_id: int) -> bool:
    supplier = await db.get(Supplier, supplier_id)
    if not supplier: return False
    await db.delete(supplier)
    await db.flush()
    return True
