from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.purchase import PurchaseCreate, PurchaseResponse
from app.services import purchase_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[PurchaseResponse])
async def list_purchases(status: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    return await purchase_service.get_purchases(db, status, page, limit)

@router.get("/{purchase_id}", response_model=PurchaseResponse)
async def get_purchase(purchase_id: int, db: AsyncSession = Depends(get_db)):
    purchase = await purchase_service.get_purchase(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return purchase

@router.post("", response_model=PurchaseResponse, status_code=201)
async def create_purchase(data: PurchaseCreate, db: AsyncSession = Depends(get_db)):
    return await purchase_service.create_purchase(db, data.model_dump())
