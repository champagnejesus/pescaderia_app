import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.client import Client
from app.models.transaction import Transaction

PAYMENT_TYPE_MAP = {
    "EFECTIVO": "Efectivo",
    "TARJETA": "Tarjeta",
    "TRANSFERENCIA": "Transfer",
    "TRANSFER": "Transfer",
}

async def create_order(db: AsyncSession, data: dict) -> Order:
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    items_data = data.pop("items", [])
    total_value = sum(i["subtotal"] for i in items_data)
    payment_method = data.get("payment_method", "Efectivo")
    client_id = data.get("client_id")
    if client_id:
        client = await db.get(Client, client_id)
        if not client:
            raise ValueError(f"Client with id {client_id} not found")
    order = Order(order_number=order_number, total_value=total_value, items_count=len(items_data), **data)
    db.add(order)
    await db.flush()
    for item_data in items_data:
        item = OrderItem(order_id=order.id, **item_data)
        db.add(item)
        product = await db.get(Product, item_data["product_id"])
        if product:
            if product.stock < item_data["quantity"]:
                raise ValueError(f"Insufficient stock for {product.name}: available {product.stock}, requested {item_data['quantity']}")
            product.stock -= item_data["quantity"]
    now = datetime.now(timezone.utc)
    tx = Transaction(
        title=f"Venta: {data.get('client_name', 'Mostrador')}",
        time=now.strftime("%H:%M"),
        type=PAYMENT_TYPE_MAP.get(payment_method.upper(), "Efectivo"),
        amount=total_value,
        status="PAGADO",
    )
    db.add(tx)
    await db.flush()
    await db.refresh(order, ["items"])
    return order

async def get_orders(db: AsyncSession, status: str = "", page: int = 1, limit: int = 50) -> list[Order]:
    query = select(Order)
    if status and status != "Todos":
        status_map = {"Pendientes": "PENDIENTE", "Entregados": "ENTREGADO", "Anulados": "ANULADO"}
        query = query.where(Order.status == status_map.get(status, status))
    query = query.options(selectinload(Order.items)).order_by(Order.created_at.desc()).offset((page-1)*limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().unique().all()

async def get_order(db: AsyncSession, order_id: int) -> Order | None:
    order = await db.get(Order, order_id)
    if order: await db.refresh(order, ["items"])
    return order

async def update_order_status(db: AsyncSession, order_id: int, new_status: str) -> Order | None:
    order = await db.get(Order, order_id)
    if not order: return None
    old_status = order.status
    order.status = new_status
    if new_status == "ANULADO" and old_status != "ANULADO":
        items = await db.execute(select(OrderItem).where(OrderItem.order_id == order_id))
        for item in items.scalars().all():
            product = await db.get(Product, item.product_id)
            if product:
                product.stock += item.quantity
    elif old_status == "ANULADO" and new_status != "ANULADO":
        items = await db.execute(select(OrderItem).where(OrderItem.order_id == order_id))
        for item in items.scalars().all():
            product = await db.get(Product, item.product_id)
            if product:
                if product.stock < item.quantity:
                    raise ValueError(f"Insufficient stock to reinstate order (product {product.name})")
                product.stock -= item.quantity
    await db.flush()
    await db.refresh(order, ["items"])
    return order
