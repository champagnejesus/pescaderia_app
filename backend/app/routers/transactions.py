from datetime import date, time, datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionResponse, DailySummaryResponse
from app.models.transaction import Transaction

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[TransactionResponse])
async def list_transactions(type: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    query = select(Transaction)
    if type: query = query.where(Transaction.type == type)
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
    total_sales = sum(t.amount for t in txs if t.amount > 0)
    total_expenses = sum(t.amount for t in txs if t.amount < 0)
    return DailySummaryResponse(
        total_sales=total_sales, total_expenses=total_expenses, net_total=total_sales + total_expenses,
        cash_total=sum(t.amount for t in txs if t.type == "Efectivo" and t.amount > 0),
        card_total=sum(t.amount for t in txs if t.type == "Tarjeta" and t.amount > 0),
        transaction_count=len(txs),
    )
