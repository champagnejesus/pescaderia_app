from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product

async def get_products(db: AsyncSession, search: str = "", category: str = "", page: int = 1, limit: int = 50) -> list[Product]:
    query = select(Product)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if category and category != "TODOS":
        query = query.where(Product.category == category)
    query = query.order_by(Product.name.asc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    return await db.get(Product, product_id)

async def create_product(db: AsyncSession, data: dict) -> Product:
    product = Product(**data)
    db.add(product)
    await db.flush()
    return product

async def update_product(db: AsyncSession, product_id: int, data: dict) -> Product | None:
    product = await db.get(Product, product_id)
    if not product: return None
    for key, value in data.items():
        setattr(product, key, value)
    await db.flush()
    return product

async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = await db.get(Product, product_id)
    if not product: return False
    await db.delete(product)
    await db.flush()
    return True

async def adjust_stock(db: AsyncSession, product_id: int, new_stock: float) -> Product | None:
    product = await db.get(Product, product_id)
    if not product: return None
    product.stock = new_stock
    await db.flush()
    return product

async def get_low_stock(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product).where(Product.stock <= Product.low_stock_threshold).order_by(Product.stock.asc()))
    return result.scalars().all()
