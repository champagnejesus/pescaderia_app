from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.services import order_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[OrderResponse])
async def list_orders(status: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    try:
        return await order_service.get_orders(db, status, page, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    order = await order_service.get_order(db, order_id)
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    return await order_service.create_order(db, data.model_dump())

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_status(order_id: int, data: OrderStatusUpdate, db: AsyncSession = Depends(get_db)):
    order = await order_service.update_order_status(db, order_id, data.status)
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    return order
