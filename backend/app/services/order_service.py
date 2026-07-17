import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.order import Order, OrderItem
from app.models.product import Product

async def create_order(db: AsyncSession, data: dict) -> Order:
    order_number = f"ORD-{random.randint(1000, 9999)}"
    items_data = data.pop("items", [])
    total_value = sum(i["subtotal"] for i in items_data)
    data.pop("payment_method", None)
    order = Order(order_number=order_number, total_value=total_value, items_count=len(items_data), **data)
    db.add(order)
    await db.flush()
    for item_data in items_data:
        item = OrderItem(order_id=order.id, **item_data)
        db.add(item)
        product = await db.get(Product, item_data["product_id"])
        if product:
            product.stock = max(0.0, product.stock - item_data["quantity"])
    await db.flush()
    return order

async def get_orders(db: AsyncSession, status: str = "", page: int = 1, limit: int = 50) -> list[Order]:
    query = select(Order)
    if status and status != "Todos":
        status_map = {"Pendientes": "PENDIENTE", "Entregados": "ENTREGADO", "Anulados": "ANULADO"}
        query = query.where(Order.status == status_map.get(status, status))
    query = query.order_by(Order.created_at.desc()).offset((page-1)*limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_order(db: AsyncSession, order_id: int) -> Order | None:
    order = await db.get(Order, order_id)
    if order: await db.refresh(order, ["items"])
    return order

async def update_order_status(db: AsyncSession, order_id: int, new_status: str) -> Order | None:
    order = await db.get(Order, order_id)
    if not order: return None
    order.status = new_status
    await db.flush()
    return order
