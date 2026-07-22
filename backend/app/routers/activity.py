from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.activity import RecentActivityItem
from app.models.order import Order
from app.models.purchase import Purchase
from app.models.transaction import Transaction

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/recent", response_model=list[RecentActivityItem])
async def recent_activity(db: AsyncSession = Depends(get_db)):
    items: list[RecentActivityItem] = []

    orders_result = await db.execute(
        select(Order).order_by(Order.created_at.desc()).limit(10)
    )
    for o in orders_result.scalars().all():
        items.append(RecentActivityItem(
            id=f"order-{o.id}",
            type="pedido",
            title=f"{o.client_name}",
            description=f"Pedido #{o.order_number}",
            reference_id=o.id,
            reference=o.order_number,
            amount=o.total_value,
            status=o.status,
            created_at=o.created_at,
        ))

    purchases_result = await db.execute(
        select(Purchase).order_by(Purchase.created_at.desc()).limit(10)
    )
    for p in purchases_result.scalars().all():
        items.append(RecentActivityItem(
            id=f"purchase-{p.id}",
            type="compra",
            title=p.supplier_name,
            description=f"Compra #{p.purchase_number}",
            reference_id=p.id,
            reference=p.purchase_number,
            amount=p.total_value,
            status=p.payment_status,
            created_at=p.created_at,
        ))

    txs_result = await db.execute(
        select(Transaction).order_by(Transaction.created_at.desc()).limit(25)
    )
    for t in txs_result.scalars().all():
        if t.type == "Cobro":
            item_type = "cobro"
        elif t.type == "Transfer":
            item_type = "transferencia"
        elif t.amount < 0:
            item_type = "gasto"
        else:
            item_type = "pago"
        items.append(RecentActivityItem(
            id=f"tx-{t.id}",
            type=item_type,
            title=t.title,
            description=t.time,
            reference_id=t.id,
            reference=t.title,
            amount=t.amount,
            status=t.status,
            created_at=t.created_at,
        ))

    items.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
    return items[:20]
