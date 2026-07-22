from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.purchase import AccountDebtorResponse, AccountEntryResponse, AccountPaymentRequest
from app.models.transaction import Transaction
from datetime import datetime, timezone
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

@router.post("/receivable/{client_id}/pay", status_code=200)
async def pay_receivable(client_id: int, data: AccountPaymentRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        from fastapi import HTTPException; raise HTTPException(404, "Cliente no encontrado")
    if data.amount > client.outstanding_balance:
        from fastapi import HTTPException; raise HTTPException(400, "El pago excede el saldo pendiente")
    client.outstanding_balance -= data.amount
    tx = Transaction(
        title=client.name, time=datetime.now(timezone.utc).strftime("%I:%M %p"),
        type=data.method, amount=data.amount,
    )
    db.add(tx)
    await db.flush()
    return {"message": "Pago registrado", "new_balance": client.outstanding_balance}

@router.post("/payable/{supplier_id}/pay", status_code=200)
async def pay_payable(supplier_id: int, data: AccountPaymentRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        from fastapi import HTTPException; raise HTTPException(404, "Proveedor no encontrado")
    if data.amount > supplier.pending_payment:
        from fastapi import HTTPException; raise HTTPException(400, "El pago excede el saldo pendiente")
    supplier.pending_payment -= data.amount
    tx = Transaction(
        title=f"Pago a {supplier.name}", time=datetime.now(timezone.utc).strftime("%I:%M %p"),
        type=data.method, amount=-data.amount,
    )
    db.add(tx)
    await db.flush()
    return {"message": "Pago registrado", "new_balance": supplier.pending_payment}
