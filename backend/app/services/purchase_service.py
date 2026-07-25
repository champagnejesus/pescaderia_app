import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.purchase import Purchase, PurchaseItem
from app.models.product import Product
from app.models.supplier import Supplier
from .purchase_price_service import record_price

async def create_purchase(db: AsyncSession, data: dict, business_id: int = 1) -> Purchase:
    purchase_number = f"PUR-{uuid.uuid4().hex[:8].upper()}"
    items_data = data.pop("items", [])
    total_value = sum(i["subtotal"] for i in items_data)
    supplier_id = data.get("supplier_id")
    supplier = None
    if supplier_id:
        result = await db.execute(select(Supplier).where(Supplier.id == supplier_id, Supplier.business_id == business_id))
        supplier = result.scalar_one_or_none()
        if not supplier:
            raise ValueError(f"Supplier with id {supplier_id} not found")
    data["business_id"] = business_id
    purchase = Purchase(purchase_number=purchase_number, total_value=total_value, items_count=len(items_data), **data)
    db.add(purchase)
    await db.flush()
    for item_data in items_data:
        prod_result = await db.execute(select(Product).where(Product.id == item_data["product_id"], Product.business_id == business_id))
        product = prod_result.scalar_one_or_none()
        if not product:
            raise ValueError(f"Product with id {item_data['product_id']} not found")
        item_data["product_name"] = product.name
        item = PurchaseItem(purchase_id=purchase.id, **item_data)
        db.add(item)
        product.price_compra = item_data["unit_price"]
        product.stock = (product.stock or 0) + item_data["quantity"]
    if supplier:
        payment_status = data.get("payment_status", "PENDIENTE")
        if payment_status in ("PENDIENTE", "PAGO PARCIAL"):
            supplier.pending_payment = (supplier.pending_payment or 0) + total_value
    await db.flush()
    await db.refresh(purchase, ["items"])

    # Record purchase prices for each item
    for item_data in items_data:
        if item_data.get("product_id"):
            await record_price(
                db,
                product_id=item_data["product_id"],
                purchase_id=purchase.id,
                supplier_id=supplier_id,
                unit_price=item_data["unit_price"],
                quantity=item_data["quantity"],
                business_id=business_id,
            )

    return purchase

async def get_purchases(db: AsyncSession, business_id: int = 1, payment_status: str = "", supplier_id: int = 0, page: int = 1, limit: int = 50) -> list[Purchase]:
    query = select(Purchase).where(Purchase.business_id == business_id)
    if payment_status:
        query = query.where(Purchase.payment_status == payment_status)
    if supplier_id:
        query = query.where(Purchase.supplier_id == supplier_id)
    query = query.options(selectinload(Purchase.items)).order_by(Purchase.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().unique().all()

async def get_purchase(db: AsyncSession, purchase_id: int, business_id: int = 1) -> Purchase | None:
    result = await db.execute(select(Purchase).where(Purchase.id == purchase_id, Purchase.business_id == business_id))
    purchase = result.scalar_one_or_none()
    if purchase:
        await db.refresh(purchase, ["items"])
    return purchase

async def update_payment_status(db: AsyncSession, purchase_id: int, payment_status: str, business_id: int = 1) -> Purchase | None:
    purchase = await get_purchase(db, purchase_id, business_id)
    if not purchase:
        return None
    old_status = purchase.payment_status
    purchase.payment_status = payment_status
    if payment_status == "PAGADO" and old_status != "PAGADO" and purchase.supplier_id:
        result = await db.execute(select(Supplier).where(Supplier.id == purchase.supplier_id, Supplier.business_id == business_id))
        supplier = result.scalar_one_or_none()
        if supplier:
            supplier.pending_payment = max(0, (supplier.pending_payment or 0) - purchase.total_value)
    elif old_status == "PAGADO" and payment_status != "PAGADO" and purchase.supplier_id:
        result = await db.execute(select(Supplier).where(Supplier.id == purchase.supplier_id, Supplier.business_id == business_id))
        supplier = result.scalar_one_or_none()
        if supplier:
            supplier.pending_payment = (supplier.pending_payment or 0) + purchase.total_value
    await db.flush()
    await db.refresh(purchase, ["items"])
    return purchase
