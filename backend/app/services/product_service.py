from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.product import Product
from app.models.category import Category
from app.models.order import OrderItem

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
    price_venta = data.pop("price_venta", data.pop("price", 0))
    price_compra = data.pop("price_compra", 0)
    category_id = data.pop("category_id", None)
    data["price_compra"] = price_compra
    data["price_venta"] = price_venta
    data["category_id"] = category_id
    if category_id:
        cat = await db.get(Category, category_id)
        if cat:
            data["category"] = cat.name
    product = Product(**data)
    db.add(product)
    await db.flush()
    return product

async def update_product(db: AsyncSession, product_id: int, data: dict) -> Product | None:
    product = await db.get(Product, product_id)
    if not product:
        return None
    for key, value in data.items():
        if key == "price":
            continue
        if key == "category_id":
            cat = await db.get(Category, value)
            if cat:
                product.category = cat.name
        setattr(product, key, value)
    await db.flush()
    return product

async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = await db.get(Product, product_id)
    if not product:
        return False
    await db.execute(update(OrderItem).where(OrderItem.product_id == product_id).values(product_id=None))
    await db.delete(product)
    await db.flush()
    return True

async def adjust_stock(db: AsyncSession, product_id: int, new_stock: float) -> Product | None:
    product = await db.get(Product, product_id)
    if not product:
        return None
    product.stock = new_stock
    await db.flush()
    return product

async def get_low_stock(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product).where(Product.stock <= Product.low_stock_threshold).order_by(Product.stock.asc()))
    return result.scalars().all()
