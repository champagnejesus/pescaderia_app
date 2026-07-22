from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.invoice_pref import InvoicePrefUpdate, InvoicePrefResponse
from app.services import invoice_pref_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=InvoicePrefResponse | None)
async def get_invoice_prefs(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await invoice_pref_service.get_invoice_prefs(db, user["id"])

@router.put("", response_model=InvoicePrefResponse)
async def update_invoice_prefs(data: InvoicePrefUpdate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await invoice_pref_service.upsert_invoice_prefs(db, user["id"], data.model_dump())
