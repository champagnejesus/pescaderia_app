from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product
from app.models.client import Client
from app.models.supplier import Supplier
from app.models.order import Order
from app.models.transaction import Transaction
from sqlalchemy.orm import selectinload

async def pull_changes(db: AsyncSession, since: datetime | None = None, limit: int = 500) -> dict:
    def filter_since(query, model):
        if since:
            col = model.updated_at if hasattr(model, "updated_at") else model.created_at
            return query.where(col >= since)
        return query

    def apply_limit(query):
        return query.limit(limit)

    products = (await db.execute(apply_limit(filter_since(select(Product), Product).order_by(Product.updated_at)))).scalars().all()
    clients = (await db.execute(apply_limit(filter_since(select(Client), Client).order_by(Client.created_at)))).scalars().all()
    suppliers = (await db.execute(apply_limit(filter_since(select(Supplier), Supplier).order_by(Supplier.created_at)))).scalars().all()
    orders_raw = (await db.execute(apply_limit(filter_since(select(Order), Order).options(selectinload(Order.items)).order_by(Order.created_at)))).scalars().all()
    transactions = (await db.execute(apply_limit(filter_since(select(Transaction), Transaction).order_by(Transaction.created_at)))).scalars().all()

    def to_dict(obj):
        d = {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
        d.pop("password_hash", None)
        for k, v in d.items():
            if isinstance(v, datetime): d[k] = v.isoformat()
        return d

    return {
        "products": [to_dict(p) for p in products], "clients": [to_dict(c) for c in clients],
        "suppliers": [to_dict(s) for s in suppliers],
        "orders": [{**to_dict(o), "items": [to_dict(i) for i in o.items]} for o in orders_raw],
        "transactions": [to_dict(t) for t in transactions],
    }
