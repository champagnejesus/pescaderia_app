from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.purchase_price import PurchasePriceHistoryResponse, PriceAlertResponse
from ..services import purchase_price_service

router = APIRouter(prefix="/api/v1/purchase-prices", tags=["purchase-prices"])

@router.get("/{product_id}", response_model=PurchasePriceHistoryResponse)
async def get_price_history(
    product_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await purchase_price_service.get_price_history(db, product_id)

@router.get("/{product_id}/alert", response_model=PriceAlertResponse)
async def check_price_alert(
    product_id: int,
    threshold: float = Query(20.0),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await purchase_price_service.check_price_alert(db, product_id, threshold)
