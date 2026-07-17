### Task 9: Sync Endpoint (Offline Support)

**Files:**
- Create: `backend/app/services/sync_service.py`
- Overwrite: `backend/app/routers/sync.py` (stub)

- [ ] **Create `backend/app/services/sync_service.py`**

```python
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product
from app.models.client import Client
from app.models.supplier import Supplier
from app.models.order import Order
from app.models.transaction import Transaction
from sqlalchemy.orm import selectinload

async def pull_changes(db: AsyncSession, since: datetime | None = None) -> dict:
    def filter_since(query, model):
        if since:
            col = model.updated_at if hasattr(model, "updated_at") else model.created_at
            return query.where(col >= since)
        return query

    products = (await db.execute(filter_since(select(Product), Product).order_by(Product.updated_at))).scalars().all()
    clients = (await db.execute(filter_since(select(Client), Client).order_by(Client.created_at))).scalars().all()
    suppliers = (await db.execute(filter_since(select(Supplier), Supplier).order_by(Supplier.created_at))).scalars().all()
    orders_raw = (await db.execute(filter_since(select(Order), Order).options(selectinload(Order.items)).order_by(Order.created_at))).scalars().all()
    transactions = (await db.execute(filter_since(select(Transaction), Transaction).order_by(Transaction.created_at))).scalars().all()

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
```

- [ ] **Overwrite `backend/app/routers/sync.py`**

```python
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.sync import SyncPullRequest, SyncPullResponse, SyncPushRequest, SyncPushResponse
from app.services.sync_service import pull_changes
from app.services import product_service, order_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.post("/pull", response_model=SyncPullResponse)
async def sync_pull(req: SyncPullRequest, db: AsyncSession = Depends(get_db)):
    data = await pull_changes(db, req.since)
    return SyncPullResponse(**data, server_time=datetime.now(timezone.utc))

@router.post("/push", response_model=SyncPushResponse)
async def sync_push(req: SyncPushRequest, db: AsyncSession = Depends(get_db)):
    accepted = 0; rejected = []
    for change in req.changes:
        try:
            if change.entity == "product" and change.action in ("create", "update"):
                if change.action == "create":
                    await product_service.create_product(db, change.data)
            elif change.entity == "order" and change.action == "create":
                await order_service.create_order(db, {**change.data, "items": change.data.get("items", [])})
            accepted += 1
        except Exception as e: rejected.append(str(e))
    return SyncPushResponse(accepted=accepted, rejected=rejected, server_time=datetime.now(timezone.utc))
```

- [ ] **Verify and commit**

```bash
cd backend && python -c "from app.services.sync_service import pull_changes; print('OK')"
git add backend/app/services/sync_service.py backend/app/routers/sync.py
git commit -m "feat(backend): add sync pull/push endpoints for offline support"
```
