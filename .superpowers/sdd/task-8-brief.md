### Task 8: Orders + Transactions + Reports Endpoints

**Files:**
- Create: `backend/app/services/order_service.py`
- Overwrite: `backend/app/routers/orders.py` (stub)
- Overwrite: `backend/app/routers/transactions.py` (stub)
- Overwrite: `backend/app/routers/reports.py` (stub)
- Create: `backend/app/tests/test_orders.py`
- Create: `backend/app/tests/test_transactions.py`

- [ ] **Create `backend/app/services/order_service.py`**

```python
import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.order import Order, OrderItem
from app.models.product import Product

async def create_order(db: AsyncSession, data: dict) -> Order:
    order_number = f"ORD-{random.randint(1000, 9999)}"
    items_data = data.pop("items", [])
    total_value = sum(i["subtotal"] for i in items_data)
    order = Order(order_number=order_number, total_value=total_value, items_count=len(items_data), **data)
    db.add(order)
    await db.flush()
    for item_data in items_data:
        item = OrderItem(order_id=order.id, **item_data)
        db.add(item)
        product = await db.get(Product, item_data["product_id"])
        if product:
            product.stock = max(0.0, product.stock - item_data["quantity"])
    await db.flush()
    return order

async def get_orders(db: AsyncSession, status: str = "", page: int = 1, limit: int = 50) -> list[Order]:
    query = select(Order)
    if status and status != "Todos":
        status_map = {"Pendientes": "PENDIENTE", "Entregados": "ENTREGADO", "Anulados": "ANULADO"}
        query = query.where(Order.status == status_map.get(status, status))
    query = query.order_by(Order.created_at.desc()).offset((page-1)*limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_order(db: AsyncSession, order_id: int) -> Order | None:
    order = await db.get(Order, order_id)
    if order: await db.refresh(order, ["items"])
    return order

async def update_order_status(db: AsyncSession, order_id: int, new_status: str) -> Order | None:
    order = await db.get(Order, order_id)
    if not order: return None
    order.status = new_status
    await db.flush()
    return order
```

- [ ] **Overwrite `backend/app/routers/orders.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.services import order_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[OrderResponse])
async def list_orders(status: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    return await order_service.get_orders(db, status, page, limit)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    order = await order_service.get_order(db, order_id)
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    return await order_service.create_order(db, data.model_dump())

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_status(order_id: int, data: OrderStatusUpdate, db: AsyncSession = Depends(get_db)):
    order = await order_service.update_order_status(db, order_id, data.status)
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    return order
```

- [ ] **Overwrite `backend/app/routers/transactions.py`**

```python
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
```

- [ ] **Overwrite `backend/app/routers/reports.py`**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.report import DashboardResponse
from app.models.product import Product, Order, Client, Supplier, Transaction

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/dashboard", response_model=DashboardResponse)
async def dashboard(db: AsyncSession = Depends(get_db)):
    products_all = (await db.execute(select(Product))).scalars().all()
    pending = (await db.execute(select(func.count(Order.id)).where(Order.status == "PENDIENTE"))).scalar() or 0
    clients_count = (await db.execute(select(func.count(Client.id)))).scalar() or 0
    suppliers_count = (await db.execute(select(func.count(Supplier.id)))).scalar() or 0
    txs = (await db.execute(select(Transaction))).scalars().all()
    total_sales = sum(t.amount for t in txs if t.amount > 0)
    total_expenses = sum(abs(t.amount) for t in txs if t.amount < 0)
    cash = sum(t.amount for t in txs if t.type == "Efectivo" and t.amount > 0)
    transfer = sum(t.amount for t in txs if t.type in ("Transferencia", "Transfer") and t.amount > 0)
    return DashboardResponse(
        gross_profit=total_sales - total_expenses, sales_total=total_sales, purchases_total=total_expenses,
        cash_total=cash, transfer_total=transfer, pending_orders=pending,
        low_stock_count=sum(1 for p in products_all if p.stock <= p.low_stock_threshold),
        total_clients=clients_count, total_suppliers=suppliers_count,
    )
```

- [ ] **Create `backend/app/tests/test_orders.py`**

```python
import pytest
from app.services.order_service import create_order, get_orders, get_order, update_order_status

@pytest.mark.asyncio
async def test_create_and_list_orders(async_session):
    from app.models.product import Product
    from app.models.client import Client
    p = Product(name="Fish", category="X", stock=10.0, price=15.0)
    c = Client(name="Client", phone="123")
    async_session.add_all([p, c])
    await async_session.flush()
    order = await create_order(async_session, {"client_id": c.id, "client_name": "Client", "items": [{"product_id": p.id, "quantity": 2.0, "unit_price": 15.0, "subtotal": 30.0}]})
    oid = order.id; await async_session.commit()
    orders = await get_orders(async_session)
    assert len(orders) >= 1
    fetched = await get_order(async_session, oid)
    assert fetched is not None and len(fetched.items) == 1

@pytest.mark.asyncio
async def test_update_order_status(async_session):
    from app.models.product import Product
    from app.models.client import Client
    p = Product(name="Fish2", category="X", stock=10.0, price=15.0)
    c = Client(name="Client2", phone="456")
    async_session.add_all([p, c])
    await async_session.flush()
    order = await create_order(async_session, {"client_id": c.id, "client_name": "Client2", "items": [{"product_id": p.id, "quantity": 1.0, "unit_price": 15.0, "subtotal": 15.0}]})
    oid = order.id; await async_session.commit()
    updated = await update_order_status(async_session, oid, "ENTREGADO")
    assert updated.status == "ENTREGADO"
```

- [ ] **Create `backend/app/tests/test_transactions.py`**

```python
import pytest
from app.models.transaction import Transaction

@pytest.mark.asyncio
async def test_create_transaction(async_session):
    tx = Transaction(title="Sale", time="10:00", type="Efectivo", amount=100.0)
    async_session.add(tx)
    await async_session.flush()
    assert tx.id is not None

@pytest.mark.asyncio
async def test_list_transactions(async_session):
    from app.routers.transactions import list_transactions
    async_session.add_all([Transaction(title="S1", time="10:00", type="Efectivo", amount=50.0), Transaction(title="S2", time="11:00", type="Tarjeta", amount=75.0)])
    await async_session.flush(); await async_session.commit()
    txs = await list_transactions(type="", page=1, limit=50, db=async_session)
    assert len(txs) == 2
```

- [ ] **Run tests and commit**

```bash
cd backend && python -m pytest app/tests/test_orders.py app/tests/test_transactions.py -v
git add backend/app/services/order_service.py backend/app/routers/orders.py backend/app/routers/transactions.py backend/app/routers/reports.py backend/app/tests/
git commit -m "feat(backend): add orders, transactions, reports endpoints"
```
