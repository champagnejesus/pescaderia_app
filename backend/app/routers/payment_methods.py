from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.payment_method import PaymentMethodResponse, PaymentMethodReorder, PaymentMethodToggle
from app.services import payment_method_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[PaymentMethodResponse])
async def list_payment_methods(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await payment_method_service.list_payment_methods(db, user["id"])

@router.put("/reorder")
async def reorder_payment_methods(data: PaymentMethodReorder, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await payment_method_service.reorder_payment_methods(db, user["id"], data.ids)
    return {"ok": True}

@router.patch("/{method_id}/toggle")
async def toggle_payment_method(method_id: int, data: PaymentMethodToggle, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not await payment_method_service.toggle_payment_method(db, method_id, user["id"], data.is_active):
        raise HTTPException(status_code=404, detail="Método de pago no encontrado")
    return {"ok": True}
