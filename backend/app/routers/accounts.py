from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.purchase import AccountDebtorResponse, AccountEntryResponse
from app.models.supplier import Supplier
from app.models.client import Client
from app.models.purchase import Purchase
from app.models.order import Order

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/payable", response_model=list[AccountDebtorResponse])
async def list_accounts_payable(search: str = Query(""), db: AsyncSession = Depends(get_db)):
    query = select(Supplier)
    if search:
        query = query.where(Supplier.name.ilike(f"%{search}%"))
    result = await db.execute(query)
    suppliers = result.scalars().all()
    return [
        AccountDebtorResponse(
            id=s.id,
            name=s.name,
            total_pending=s.pending_payment or 0,
            entries=[],
        )
        for s in suppliers if (s.pending_payment or 0) > 0
    ]

@router.get("/payable/{supplier_id}/entries", response_model=list[AccountEntryResponse])
async def get_payable_entries(supplier_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Purchase).where(Purchase.supplier_id == supplier_id)
        .order_by(Purchase.created_at.desc()).limit(50)
    )
    purchases = result.scalars().all()
    return [
        AccountEntryResponse(
            id=p.id,
            reference_id=p.id,
            reference_number=p.purchase_number,
            reference_type="compra",
            amount=p.total_value,
            pending_amount=p.total_value if p.payment_status != "PAGADO" else 0,
            status=p.payment_status,
            date=p.created_at,
        )
        for p in purchases
    ]

@router.get("/receivable", response_model=list[AccountDebtorResponse])
async def list_accounts_receivable(search: str = Query(""), db: AsyncSession = Depends(get_db)):
    query = select(Client)
    if search:
        query = query.where(Client.name.ilike(f"%{search}%"))
    result = await db.execute(query)
    clients = result.scalars().all()
    return [
        AccountDebtorResponse(
            id=c.id,
            name=c.name,
            total_pending=c.outstanding_balance or 0,
            entries=[],
        )
        for c in clients if (c.outstanding_balance or 0) > 0
    ]

@router.get("/receivable/{client_id}/entries", response_model=list[AccountEntryResponse])
async def get_receivable_entries(client_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).where(Order.client_id == client_id)
        .order_by(Order.created_at.desc()).limit(50)
    )
    orders = result.scalars().all()
    return [
        AccountEntryResponse(
            id=o.id,
            reference_id=o.id,
            reference_number=o.order_number,
            reference_type="venta",
            amount=o.total_value,
            pending_amount=o.total_value if o.payment_status != "PAGADO" else 0,
            status=o.payment_status or "PENDIENTE",
            date=o.created_at,
        )
        for o in orders
    ]
