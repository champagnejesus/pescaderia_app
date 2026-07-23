from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.inventory_adjustment import InventoryAdjustment
from app.models.product import Product
from ..schemas.inventory import AdjustStockRequest, PhysicalCountRequest


async def adjust_stock(db: AsyncSession, data: AdjustStockRequest, user_id: int = None):
    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise ValueError("Product not found")

    quantity_before = product.stock
    quantity_after = quantity_before + data.quantity_change

    if quantity_after < 0:
        raise ValueError("Stock cannot be negative")

    product.stock = quantity_after

    adjustment = InventoryAdjustment(
        product_id=data.product_id,
        type="Ajuste Manual",
        quantity_before=quantity_before,
        quantity_adjusted=data.quantity_change,
        quantity_after=quantity_after,
        reason=data.reason,
        notes=data.notes,
        created_by=user_id,
    )
    db.add(adjustment)
    await db.commit()
    await db.refresh(adjustment)
    return adjustment


async def physical_count(db: AsyncSession, data: PhysicalCountRequest, user_id: int = None):
    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise ValueError("Product not found")

    quantity_before = product.stock
    quantity_change = data.actual_quantity - quantity_before

    if data.actual_quantity < 0:
        raise ValueError("Physical count cannot be negative")

    product.stock = data.actual_quantity

    adjustment = InventoryAdjustment(
        product_id=data.product_id,
        type="Conteo Físico",
        quantity_before=quantity_before,
        quantity_adjusted=quantity_change,
        quantity_after=data.actual_quantity,
        reason="Conteo",
        notes=data.notes,
        created_by=user_id,
    )
    db.add(adjustment)
    await db.commit()
    await db.refresh(adjustment)
    return adjustment


async def get_adjustments(
    db: AsyncSession,
    product_id: int = None,
    adjustment_type: str = None,
    limit: int = 50,
    offset: int = 0,
):
    query = (
        select(InventoryAdjustment, Product.name.label("product_name"))
        .join(Product, InventoryAdjustment.product_id == Product.id)
        .order_by(InventoryAdjustment.created_at.desc())
    )
    if product_id:
        query = query.where(InventoryAdjustment.product_id == product_id)
    if adjustment_type:
        query = query.where(InventoryAdjustment.type == adjustment_type)

    count_query = select(func.count(InventoryAdjustment.id))
    if product_id:
        count_query = count_query.where(InventoryAdjustment.product_id == product_id)
    if adjustment_type:
        count_query = count_query.where(InventoryAdjustment.type == adjustment_type)
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    adjustments = []
    for row in rows:
        adj = row[0]
        product_name = row[1]
        adjustments.append({
            "id": adj.id,
            "product_id": adj.product_id,
            "product_name": product_name,
            "type": adj.type,
            "quantity_before": adj.quantity_before,
            "quantity_adjusted": adj.quantity_adjusted,
            "quantity_after": adj.quantity_after,
            "reason": adj.reason,
            "notes": adj.notes,
            "created_at": adj.created_at,
        })

    return adjustments, total
