import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.purchase import Purchase, PurchaseItem
from app.models.product import Product
from app.models.supplier import Supplier

async def create_purchase(db: AsyncSession, data: dict) -> Purchase:
    purchase_number = f"PUR-{uuid.uuid4().hex[:8].upper()}"
    items_data = data.pop("items", [])
    total_value = sum(i["subtotal"] for i in items_data)
    supplier_id = data.get("supplier_id")
    if supplier_id:
        supplier = await db.get(Supplier, supplier_id)
        if not supplier:
            raise ValueError(f"Supplier with id {supplier_id} not found")
    purchase = Purchase(purchase_number=purchase_number, total_value=total_value, items_count=len(items_data), **data)
    db.add(purchase)
    await db.flush()
    for item_data in items_data:
        item = PurchaseItem(purchase_id=purchase.id, **item_data)
        db.add(item)
        product = await db.get(Product, item_data["product_id"])
        if product:
            product.price_compra = item_data["unit_price"]
            product.stock = (product.stock or 0) + item_data["quantity"]
    if supplier_id:
        supplier = await db.get(Supplier, supplier_id)
        if supplier:
            payment_status = data.get("payment_status", "PENDIENTE")
            if payment_status == "PENDIENTE":
                supplier.pending_payment = (supplier.pending_payment or 0) + total_value
            elif payment_status == "PAGO PARCIAL":
                supplier.pending_payment = (supplier.pending_payment or 0) + total_value
    await db.flush()
    await db.refresh(purchase, ["items"])
    return purchase

async def get_purchases(db: AsyncSession, payment_status: str = "", page: int = 1, limit: int = 50) -> list[Purchase]:
    query = select(Purchase)
    if payment_status:
        query = query.where(Purchase.payment_status == payment_status)
    query = query.options(selectinload(Purchase.items)).order_by(Purchase.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().unique().all()

async def get_purchase(db: AsyncSession, purchase_id: int) -> Purchase | None:
    purchase = await db.get(Purchase, purchase_id)
    if purchase:
        await db.refresh(purchase, ["items"])
    return purchase
