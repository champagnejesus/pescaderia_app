from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.purchase import AccountDebtorResponse, AccountEntryResponse, AccountPaymentRequest, AccountCreateRequest
from app.models.transaction import Transaction
from app.models.manual_entry import ManualEntry
from datetime import datetime, timezone
from app.models.supplier import Supplier
from app.models.client import Client
from app.models.purchase import Purchase
from app.models.order import Order

router = APIRouter(dependencies=[Depends(get_current_user)])


async def get_entries_for_debtor(db: AsyncSession, account_type: str, debtor_id: int) -> list[AccountEntryResponse]:
    """Combine purchase/order entries with manual entries for a debtor."""
    entries = []

    if account_type == "payable":
        result = await db.execute(
            select(Purchase).where(Purchase.supplier_id == debtor_id)
            .order_by(Purchase.created_at.desc()).limit(50)
        )
        for p in result.scalars().all():
            entries.append(AccountEntryResponse(
                id=p.id, reference_id=p.id, reference_number=p.purchase_number,
                reference_type="compra", amount=p.total_value,
                pending_amount=p.total_value if p.payment_status != "PAGADO" else 0,
                status=p.payment_status, date=p.created_at,
            ))
    else:
        result = await db.execute(
            select(Order).where(Order.client_id == debtor_id)
            .order_by(Order.created_at.desc()).limit(50)
        )
        for o in result.scalars().all():
            entries.append(AccountEntryResponse(
                id=o.id, reference_id=o.id, reference_number=o.order_number,
                reference_type="venta", amount=o.total_value,
                pending_amount=o.total_value if o.payment_status != "PAGADO" else 0,
                status=o.payment_status or "PENDIENTE", date=o.created_at,
            ))

    # Add manual entries
    result = await db.execute(
        select(ManualEntry).where(
            ManualEntry.account_type == account_type,
            ManualEntry.debtor_id == debtor_id
        ).order_by(ManualEntry.created_at.desc()).limit(50)
    )
    for m in result.scalars().all():
        entries.append(AccountEntryResponse(
            id=-m.id,  # negative IDs avoid collision with purchase/order IDs
            reference_id=m.id,
            reference_number=f"MANUAL-{m.id}",
            reference_type="manual",
            amount=m.amount,
            pending_amount=m.pending_amount,
            status=m.status,
            date=m.created_at,
        ))

    entries.sort(key=lambda e: e.date or datetime.min, reverse=True)
    return entries


@router.get("/payable", response_model=list[AccountDebtorResponse])
async def list_accounts_payable(search: str = Query(""), db: AsyncSession = Depends(get_db)):
    query = select(Supplier)
    if search:
        query = query.where(Supplier.name.ilike(f"%{search}%"))
    result = await db.execute(query)
    suppliers = result.scalars().all()

    # Also get suppliers from manual entries
    manual = await db.execute(
        select(ManualEntry.debtor_id, ManualEntry.debtor_name)
        .where(ManualEntry.account_type == "payable", ManualEntry.pending_amount > 0)
        .distinct()
    )
    manual_suppliers = {(r.debtor_id, r.debtor_name) for r in manual.fetchall()}

    seen = {s.id for s in suppliers}
    result_list = [
        AccountDebtorResponse(id=s.id, name=s.name, total_pending=s.pending_payment or 0, entries=[])
        for s in suppliers if (s.pending_payment or 0) > 0
    ]
    for mid, mname in manual_suppliers:
        if mid not in seen:
            total = await db.scalar(
                select(ManualEntry.pending_amount)
                .where(ManualEntry.account_type == "payable", ManualEntry.debtor_id == mid)
            )
            result_list.append(AccountDebtorResponse(id=mid, name=mname, total_pending=total or 0, entries=[]))

    return [r for r in result_list if r.total_pending > 0]


@router.get("/payable/{supplier_id}/entries", response_model=list[AccountEntryResponse])
async def get_payable_entries(supplier_id: int, db: AsyncSession = Depends(get_db)):
    return await get_entries_for_debtor(db, "payable", supplier_id)


@router.get("/receivable", response_model=list[AccountDebtorResponse])
async def list_accounts_receivable(search: str = Query(""), db: AsyncSession = Depends(get_db)):
    query = select(Client)
    if search:
        query = query.where(Client.name.ilike(f"%{search}%"))
    result = await db.execute(query)
    clients = result.scalars().all()

    manual = await db.execute(
        select(ManualEntry.debtor_id, ManualEntry.debtor_name)
        .where(ManualEntry.account_type == "receivable", ManualEntry.pending_amount > 0)
        .distinct()
    )
    manual_clients = {(r.debtor_id, r.debtor_name) for r in manual.fetchall()}

    seen = {c.id for c in clients}
    result_list = [
        AccountDebtorResponse(id=c.id, name=c.name, total_pending=c.outstanding_balance or 0, entries=[])
        for c in clients if (c.outstanding_balance or 0) > 0
    ]
    for mid, mname in manual_clients:
        if mid not in seen:
            total = await db.scalar(
                select(ManualEntry.pending_amount)
                .where(ManualEntry.account_type == "receivable", ManualEntry.debtor_id == mid)
            )
            result_list.append(AccountDebtorResponse(id=mid, name=mname, total_pending=total or 0, entries=[]))

    return [r for r in result_list if r.total_pending > 0]


@router.get("/receivable/{client_id}/entries", response_model=list[AccountEntryResponse])
async def get_receivable_entries(client_id: int, db: AsyncSession = Depends(get_db)):
    return await get_entries_for_debtor(db, "receivable", client_id)


@router.post("/receivable/{client_id}/pay", status_code=200)
async def pay_receivable(client_id: int, data: AccountPaymentRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(404, "Cliente no encontrado")
    if data.amount > client.outstanding_balance:
        raise HTTPException(400, "El pago excede el saldo pendiente")
    client.outstanding_balance -= data.amount
    # Mark orders as paid in FIFO order up to the payment amount
    remaining = data.amount
    unpaid = await db.execute(
        select(Order).where(
            Order.client_id == client_id,
            Order.payment_status != "PAGADO"
        ).order_by(Order.created_at.asc())
    )
    for order in unpaid.scalars().all():
        if remaining <= 0:
            break
        if remaining >= order.total_value:
            remaining -= order.total_value
            order.payment_status = "PAGADO"
        else:
            order.payment_status = "PAGO PARCIAL"
            break
    tx = Transaction(
        title=f"Pago de {client.name}", time=datetime.now(timezone.utc).strftime("%I:%M %p"),
        type="Cobro", amount=data.amount,
    )
    db.add(tx)
    await db.flush()
    return {"message": "Pago registrado", "new_balance": client.outstanding_balance}


@router.post("/payable/{supplier_id}/pay", status_code=200)
async def pay_payable(supplier_id: int, data: AccountPaymentRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(404, "Proveedor no encontrado")
    if data.amount > supplier.pending_payment:
        raise HTTPException(400, "El pago excede el saldo pendiente")
    supplier.pending_payment -= data.amount
    if supplier.pending_payment == 0:
        await db.execute(
            update(Purchase).where(Purchase.supplier_id == supplier_id, Purchase.payment_status != "PAGADO")
            .values(payment_status="PAGADO")
        )
    tx = Transaction(
        title=f"Pago a {supplier.name}", time=datetime.now(timezone.utc).strftime("%I:%M %p"),
        type=data.method, amount=-data.amount,
    )
    db.add(tx)
    await db.flush()
    return {"message": "Pago registrado", "new_balance": supplier.pending_payment}


@router.post("/receivable", status_code=201)
async def create_receivable(data: AccountCreateRequest, db: AsyncSession = Depends(get_db)):
    entry = ManualEntry(
        account_type="receivable", debtor_id=data.debtor_id, debtor_name=data.debtor_name,
        description=data.description, amount=data.amount, pending_amount=data.amount,
    )
    db.add(entry)
    # Also update client balance if client exists
    result = await db.execute(select(Client).where(Client.id == data.debtor_id))
    client = result.scalar_one_or_none()
    if client:
        client.outstanding_balance = (client.outstanding_balance or 0) + data.amount
    tx = Transaction(
        title=f"Deuda: {data.debtor_name}", time=datetime.now(timezone.utc).strftime("%I:%M %p"),
        type="Cuenta por Cobrar", amount=data.amount,
    )
    db.add(tx)
    await db.flush()
    return {"message": "Deuda registrada", "id": entry.id}


@router.post("/payable", status_code=201)
async def create_payable(data: AccountCreateRequest, db: AsyncSession = Depends(get_db)):
    entry = ManualEntry(
        account_type="payable", debtor_id=data.debtor_id, debtor_name=data.debtor_name,
        description=data.description, amount=data.amount, pending_amount=data.amount,
    )
    db.add(entry)
    result = await db.execute(select(Supplier).where(Supplier.id == data.debtor_id))
    supplier = result.scalar_one_or_none()
    if supplier:
        supplier.pending_payment = (supplier.pending_payment or 0) + data.amount
    tx = Transaction(
        title=f"Deuda: {data.debtor_name}", time=datetime.now(timezone.utc).strftime("%I:%M %p"),
        type="Cuenta por Pagar", amount=-data.amount,
    )
    db.add(tx)
    await db.flush()
    return {"message": "Deuda registrada", "id": entry.id}
