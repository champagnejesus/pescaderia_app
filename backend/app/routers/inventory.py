from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.purchase import InventoryItemResponse, InventoryMovementResponse
from app.models.product import Product
from app.models.purchase import PurchaseItem
from app.models.order import OrderItem
from app.models.purchase import Purchase
from app.models.order import Order

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[InventoryItemResponse])
async def list_inventory(search: str = Query(""), db: AsyncSession = Depends(get_db)):
    query = select(Product)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    query = query.order_by(Product.name.asc())
    result = await db.execute(query)
    products = result.scalars().all()
    return [
        InventoryItemResponse(
            product_id=p.id,
            product_name=p.name,
            category=p.category,
            stock=p.stock or 0,
            unit=p.unit,
            price_compra=p.price_compra or 0,
            price_venta=p.price_venta or p.price,
            status="Stock Bajo" if (p.stock or 0) <= (p.low_stock_threshold or 0) else "Disponible",
            low_stock_threshold=p.low_stock_threshold or 0,
        )
        for p in products
    ]

@router.get("/{product_id}/movements", response_model=list[InventoryMovementResponse])
async def get_product_movements(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        return []
    movements = []
    purchase_items = await db.execute(
        select(PurchaseItem, Purchase.purchase_number, Purchase.created_at)
        .join(Purchase, PurchaseItem.purchase_id == Purchase.id)
        .where(PurchaseItem.product_id == product_id)
        .order_by(Purchase.created_at.desc())
        .limit(50)
    )
    for item, pnum, pdate in purchase_items.all():
        movements.append(InventoryMovementResponse(
            id=item.id,
            product_id=product_id,
            product_name=product.name,
            type="compra",
            quantity=item.quantity,
            unit=product.unit,
            unit_price=item.unit_price,
            total=item.subtotal,
            reference=pnum,
            created_at=pdate,
        ))
    order_items = await db.execute(
        select(OrderItem, Order.order_number, Order.created_at)
        .join(Order, OrderItem.order_id == Order.id)
        .where(OrderItem.product_id == product_id)
        .order_by(Order.created_at.desc())
        .limit(50)
    )
    for item, onum, odate in order_items.all():
        movements.append(InventoryMovementResponse(
            id=item.id,
            product_id=product_id,
            product_name=product.name,
            type="venta",
            quantity=item.quantity,
            unit=product.unit,
            unit_price=item.unit_price,
            total=item.subtotal,
            reference=onum,
            created_at=odate,
        ))
    movements.sort(key=lambda m: m.created_at or "", reverse=True)
    return movements
