from datetime import date, time, datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionResponse, DailySummaryResponse, CloseDayRequest
from app.models.transaction import Transaction
from app.models.business import BusinessConfig
from app.services.business_service import verify_pin

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[TransactionResponse])
async def list_transactions(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    type: str = Query(""),
    page: int = Query(1),
    limit: int = Query(50),
    db: AsyncSession = Depends(get_db),
):
    query = select(Transaction)
    if start_date:
        try:
            query = query.where(Transaction.created_at >= datetime.fromisoformat(start_date))
        except (TypeError, ValueError):
            pass
    if end_date:
        try:
            query = query.where(Transaction.created_at <= datetime.fromisoformat(end_date + "T23:59:59"))
        except (TypeError, ValueError):
            pass
    if type:
        query = query.where(Transaction.type == type)
    query = query.order_by(Transaction.created_at.desc()).offset((page-1)*limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=TransactionResponse, status_code=201)
async def create_transaction(data: TransactionCreate, db: AsyncSession = Depends(get_db)):
    tx = Transaction(**data.model_dump())
    db.add(tx)
    await db.flush()
    return tx

@router.get("/daily-summary", response_model=DailySummaryResponse)
async def daily_summary(db: AsyncSession = Depends(get_db)):
    today_start = datetime.combine(date.today(), time.min, tzinfo=timezone.utc)
    today_end = datetime.combine(date.today(), time.max, tzinfo=timezone.utc)
    result = await db.execute(select(Transaction).where(Transaction.created_at.between(today_start, today_end)))
    txs = result.scalars().all()
    total_collections = sum(t.amount for t in txs if t.type == "Cobro")
    total_sales = sum(t.amount for t in txs if t.amount > 0 and t.type != "Cobro")
    total_expenses = sum(t.amount for t in txs if t.amount < 0)
    return DailySummaryResponse(
        total_sales=total_sales, total_expenses=total_expenses, net_total=total_sales + total_collections + total_expenses,
        cash_total=sum(t.amount for t in txs if t.type == "Efectivo" and t.amount > 0),
        card_total=sum(t.amount for t in txs if t.type == "Tarjeta" and t.amount > 0),
        transaction_count=len(txs), total_collections=total_collections,
    )

@router.post("/close-day")
async def close_day(data: CloseDayRequest, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    if len(data.pin) != 4 or not data.pin.isdigit():
        raise HTTPException(400, "PIN inválido: debe tener 4 dígitos")
    business = await db.get(BusinessConfig, user["id"])
    if business and business.require_pin:
        if not await verify_pin(db, user["id"], data.pin):
            raise HTTPException(403, "PIN inválido")
    now = datetime.now(timezone.utc)
    today_start = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)
    today_end = datetime.combine(now.date(), time.max, tzinfo=timezone.utc)
    result = await db.execute(select(Transaction).where(Transaction.created_at.between(today_start, today_end)))
    txs = result.scalars().all()
    total_sales = sum(t.amount for t in txs if t.amount > 0 and t.type != "Cobro")
    total_expenses = sum(t.amount for t in txs if t.amount < 0)
    total_collections = sum(t.amount for t in txs if t.type == "Cobro")
    net = total_sales + total_collections + total_expenses
    tx_close = Transaction(
        title=f"Cierre de caja — {now.strftime('%d/%m/%Y')}",
        time=now.strftime("%H:%M"),
        type="Cierre",
        amount=net,
        status="CERRADO",
    )
    db.add(tx_close)
    await db.flush()
    return {
        "message": "Cierre de caja completado",
        "closed_at": now.isoformat(),
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "total_collections": total_collections,
        "net_total": net,
    }
