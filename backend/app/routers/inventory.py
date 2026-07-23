from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.purchase import InventoryItemResponse, InventoryMovementResponse
from app.schemas.inventory import AdjustStockRequest, PhysicalCountRequest, AdjustmentResponse, AdjustmentListResponse
from app.services import inventory_service
from app.models.product import Product
from app.models.purchase import PurchaseItem
from app.models.order import OrderItem
from app.models.purchase import Purchase
from app.models.order import Order

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[InventoryItemResponse])
async def list_inventory(search: str = Query(""), db: AsyncSession = Depends(get_db)):
    query = select(Product).options(selectinload(Product.category_rel))
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    query = query.order_by(Product.name.asc())
    result = await db.execute(query)
    products = result.scalars().all()
    return [
        InventoryItemResponse(
            product_id=p.id,
            product_name=p.name,
            category=p.category_rel.name if p.category_rel else p.category,
            stock=p.stock or 0,
            unit=p.unit,
            price_compra=p.price_compra or 0,
            price_venta=p.price_venta or 0,
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

@router.post("/adjust", response_model=AdjustmentResponse)
async def adjust_stock(
    data: AdjustStockRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        adjustment = await inventory_service.adjust_stock(db, data, user.get("id"))
        return adjustment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/physical-count", response_model=AdjustmentResponse)
async def physical_count(
    data: PhysicalCountRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        adjustment = await inventory_service.physical_count(db, data, user.get("id"))
        return adjustment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/adjustments", response_model=AdjustmentListResponse)
async def list_adjustments(
    product_id: Optional[int] = Query(None),
    adjustment_type: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    adjustments, total = await inventory_service.get_adjustments(
        db, product_id, adjustment_type, limit, offset
    )
    return AdjustmentListResponse(adjustments=adjustments, total=total)
