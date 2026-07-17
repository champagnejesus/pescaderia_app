### Task 7: CRUD Clients + Suppliers Endpoints

**Files:**
- Create: `backend/app/services/client_service.py`
- Create: `backend/app/services/supplier_service.py`
- Overwrite: `backend/app/routers/clients.py` (stub)
- Overwrite: `backend/app/routers/suppliers.py` (stub)
- Create: `backend/app/tests/test_clients.py`
- Create: `backend/app/tests/test_suppliers.py`

Each follows the same CRUD pattern from Task 6, substituting `Client`/`Supplier` models and schemas.

- [ ] **Create `backend/app/services/client_service.py`**

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.client import Client

async def get_clients(db: AsyncSession, search: str = "", page: int = 1, limit: int = 50) -> list[Client]:
    query = select(Client)
    if search:
        query = query.where(Client.name.ilike(f"%{search}%"))
    query = query.order_by(Client.name.asc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_client(db: AsyncSession, client_id: int) -> Client | None:
    return await db.get(Client, client_id)

async def create_client(db: AsyncSession, data: dict) -> Client:
    client = Client(**data)
    db.add(client)
    await db.flush()
    return client

async def update_client(db: AsyncSession, client_id: int, data: dict) -> Client | None:
    client = await db.get(Client, client_id)
    if not client: return None
    for key, value in data.items():
        setattr(client, key, value)
    await db.flush()
    return client

async def delete_client(db: AsyncSession, client_id: int) -> bool:
    client = await db.get(Client, client_id)
    if not client: return False
    await db.delete(client)
    await db.flush()
    return True

async def adjust_balance(db: AsyncSession, client_id: int, new_balance: float) -> Client | None:
    client = await db.get(Client, client_id)
    if not client: return None
    client.outstanding_balance = new_balance
    await db.flush()
    return client
```

- [ ] **Create `backend/app/services/supplier_service.py`**

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.supplier import Supplier

async def get_suppliers(db: AsyncSession, search: str = "", page: int = 1, limit: int = 50) -> list[Supplier]:
    query = select(Supplier)
    if search:
        query = query.where(Supplier.name.ilike(f"%{search}%"))
    query = query.order_by(Supplier.name.asc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_supplier(db: AsyncSession, supplier_id: int) -> Supplier | None:
    return await db.get(Supplier, supplier_id)

async def create_supplier(db: AsyncSession, data: dict) -> Supplier:
    supplier = Supplier(**data)
    db.add(supplier)
    await db.flush()
    return supplier

async def update_supplier(db: AsyncSession, supplier_id: int, data: dict) -> Supplier | None:
    supplier = await db.get(Supplier, supplier_id)
    if not supplier: return None
    for key, value in data.items():
        setattr(supplier, key, value)
    await db.flush()
    return supplier

async def delete_supplier(db: AsyncSession, supplier_id: int) -> bool:
    supplier = await db.get(Supplier, supplier_id)
    if not supplier: return False
    await db.delete(supplier)
    await db.flush()
    return True
```

- [ ] **Overwrite `backend/app/routers/clients.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.client import ClientCreate, ClientUpdate, BalanceAdjust, ClientResponse
from app.services import client_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[ClientResponse])
async def list_clients(search: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    return await client_service.get_clients(db, search, page, limit)

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: int, db: AsyncSession = Depends(get_db)):
    client = await client_service.get_client(db, client_id)
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("", response_model=ClientResponse, status_code=201)
async def create_client(data: ClientCreate, db: AsyncSession = Depends(get_db)):
    return await client_service.create_client(db, data.model_dump())

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(client_id: int, data: ClientUpdate, db: AsyncSession = Depends(get_db)):
    client = await client_service.update_client(db, client_id, data.model_dump(exclude_unset=True))
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.delete("/{client_id}", status_code=204)
async def delete_client(client_id: int, db: AsyncSession = Depends(get_db)):
    if not await client_service.delete_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")

@router.patch("/{client_id}/balance", response_model=ClientResponse)
async def adjust_client_balance(client_id: int, data: BalanceAdjust, db: AsyncSession = Depends(get_db)):
    client = await client_service.adjust_balance(db, client_id, data.new_balance)
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client
```

- [ ] **Overwrite `backend/app/routers/suppliers.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from app.services import supplier_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[SupplierResponse])
async def list_suppliers(search: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    return await supplier_service.get_suppliers(db, search, page, limit)

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: int, db: AsyncSession = Depends(get_db)):
    supplier = await supplier_service.get_supplier(db, supplier_id)
    if not supplier: raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.post("", response_model=SupplierResponse, status_code=201)
async def create_supplier(data: SupplierCreate, db: AsyncSession = Depends(get_db)):
    return await supplier_service.create_supplier(db, data.model_dump())

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(supplier_id: int, data: SupplierUpdate, db: AsyncSession = Depends(get_db)):
    supplier = await supplier_service.update_supplier(db, supplier_id, data.model_dump(exclude_unset=True))
    if not supplier: raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.delete("/{supplier_id}", status_code=204)
async def delete_supplier(supplier_id: int, db: AsyncSession = Depends(get_db)):
    if not await supplier_service.delete_supplier(db, supplier_id):
        raise HTTPException(status_code=404, detail="Supplier not found")
```

- [ ] **Create `backend/app/tests/test_clients.py`**

```python
import pytest
from app.services.client_service import create_client, get_clients, get_client, update_client, delete_client, adjust_balance

@pytest.mark.asyncio
async def test_create_and_list_clients(async_session):
    await create_client(async_session, {"name": "Test Client", "phone": "123"})
    await async_session.commit()
    clients = await get_clients(async_session)
    assert len(clients) == 1 and clients[0].name == "Test Client"

@pytest.mark.asyncio
async def test_get_client_by_id(async_session):
    c = await create_client(async_session, {"name": "Test", "phone": "456"})
    cid = c.id; await async_session.commit()
    found = await get_client(async_session, cid)
    assert found is not None and found.name == "Test"

@pytest.mark.asyncio
async def test_update_client(async_session):
    c = await create_client(async_session, {"name": "Old", "phone": "111"})
    cid = c.id; await async_session.commit()
    updated = await update_client(async_session, cid, {"name": "New"})
    assert updated.name == "New"

@pytest.mark.asyncio
async def test_delete_client(async_session):
    c = await create_client(async_session, {"name": "Del", "phone": "222"})
    cid = c.id; await async_session.commit()
    assert await delete_client(async_session, cid) is True
    assert await get_client(async_session, cid) is None

@pytest.mark.asyncio
async def test_adjust_balance(async_session):
    c = await create_client(async_session, {"name": "Bal", "phone": "333", "outstanding_balance": 0.0})
    cid = c.id; await async_session.commit()
    adj = await adjust_balance(async_session, cid, 150.0)
    assert adj.outstanding_balance == 150.0

@pytest.mark.asyncio
async def test_not_found(async_session):
    assert await get_client(async_session, 999) is None
    assert await update_client(async_session, 999, {}) is None
    assert await delete_client(async_session, 999) is False
```

- [ ] **Create `backend/app/tests/test_suppliers.py`**

```python
import pytest
from app.services.supplier_service import create_supplier, get_suppliers, get_supplier, update_supplier, delete_supplier

@pytest.mark.asyncio
async def test_create_and_list_suppliers(async_session):
    await create_supplier(async_session, {"name": "Test Supplier", "category": "Mariscos"})
    await async_session.commit()
    suppliers = await get_suppliers(async_session)
    assert len(suppliers) == 1 and suppliers[0].name == "Test Supplier"

@pytest.mark.asyncio
async def test_get_supplier_by_id(async_session):
    s = await create_supplier(async_session, {"name": "Test", "category": "Pescado"})
    sid = s.id; await async_session.commit()
    found = await get_supplier(async_session, sid)
    assert found is not None and found.name == "Test"

@pytest.mark.asyncio
async def test_update_supplier(async_session):
    s = await create_supplier(async_session, {"name": "Old", "category": "X"})
    sid = s.id; await async_session.commit()
    updated = await update_supplier(async_session, sid, {"name": "New"})
    assert updated.name == "New"

@pytest.mark.asyncio
async def test_delete_supplier(async_session):
    s = await create_supplier(async_session, {"name": "Del", "category": "X"})
    sid = s.id; await async_session.commit()
    assert await delete_supplier(async_session, sid) is True
    assert await get_supplier(async_session, sid) is None

@pytest.mark.asyncio
async def test_not_found(async_session):
    assert await get_supplier(async_session, 999) is None
    assert await update_supplier(async_session, 999, {}) is None
    assert await delete_supplier(async_session, 999) is False
```

- [ ] **Run tests and commit**

```bash
cd backend && python -m pytest app/tests/test_clients.py app/tests/test_suppliers.py -v
git add backend/app/services/client_service.py backend/app/services/supplier_service.py backend/app/routers/clients.py backend/app/routers/suppliers.py backend/app/tests/test_clients.py backend/app/tests/test_suppliers.py
git commit -m "feat(backend): add CRUD clients and suppliers endpoints"
```
