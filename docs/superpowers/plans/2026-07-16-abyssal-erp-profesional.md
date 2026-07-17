# Abyssal ERP Professional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Android offline ERP app into professional Web + Android product (single-user, dark/light theme) sellable at $499.

**Architecture:** Backend FastAPI + PostgreSQL (REST API, single-tenant), Web Next.js 14+ replicating pixel-perfect the existing Android UI, Android refactored only in data layer (UI intact), offline-first sync with Room as cache.

**Tech Stack:** FastAPI + SQLAlchemy + Alembic + PostgreSQL + Redis | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui | Retrofit + WorkManager + Room (Android)

**Business Model:** $499 one-time license, optional $99/year renewal. Delivery: cloud-hosted (Railway ~$15/mo) or self-hosted (Docker).

## Global Constraints

- UI Android intact: `Screens.kt`, `Color.kt`, `Theme.kt`, `Type.kt`, `MainActivity.kt` must NOT be modified
- Web app must be pixel-perfect replica of Android design (Abyssal Slate theme)
- Toggle dark/light mode on both platforms, persisted
- Single-user, no multi-tenant, no roles, no Stripe
- Backend FastAPI + PostgreSQL only, no Node.js, no Firebase
- Offline sync: Room as local cache, WorkManager for background sync
- TDD: every feature starts with a failing test

---
## File Structure

```
pescaderia_app-main/
├── backend/                          # NEW
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app entry
│   │   ├── config.py                 # Settings from env vars
│   │   ├── database.py               # SQLAlchemy engine + session
│   │   ├── dependencies.py           # Dependency injection (get_db, get_current_user)
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── business.py
│   │   │   ├── product.py
│   │   │   ├── client.py
│   │   │   ├── supplier.py
│   │   │   ├── order.py
│   │   │   └── transaction.py
│   │   ├── schemas/                  # Pydantic request/response
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── product.py
│   │   │   ├── client.py
│   │   │   ├── supplier.py
│   │   │   ├── order.py
│   │   │   ├── transaction.py
│   │   │   ├── report.py
│   │   │   └── sync.py
│   │   ├── routers/                  # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── clients.py
│   │   │   ├── suppliers.py
│   │   │   ├── orders.py
│   │   │   ├── transactions.py
│   │   │   ├── reports.py
│   │   │   └── sync.py
│   │   ├── services/                 # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── product_service.py
│   │   │   ├── order_service.py
│   │   │   └── sync_service.py
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   └── auth_middleware.py    # JWT dependency
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── conftest.py
│   │       ├── test_auth.py
│   │       ├── test_products.py
│   │       ├── test_clients.py
│   │       ├── test_suppliers.py
│   │       ├── test_orders.py
│   │       ├── test_transactions.py
│   │       ├── test_sync.py
│   │       └── test_reports.py
│   └── docker-compose.yml            # PostgreSQL + Redis + API
│
├── web/                              # NEW
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout (theme provider, auth gate)
│   │   │   ├── page.tsx              # Redirect to /login
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx        # BottomNav + TopBar wrapper
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── clients/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── suppliers/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── cash-register/
│   │   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui base components (button, card, input, etc.)
│   │   │   ├── layout/
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── SparklineChart.tsx
│   │   │   │   ├── BentoGrid.tsx
│   │   │   │   └── RecentOrdersList.tsx
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── CategoryFilter.tsx
│   │   │   │   ├── ProductSearchBar.tsx
│   │   │   │   └── StockBadge.tsx
│   │   │   ├── orders/
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderFilters.tsx
│   │   │   │   ├── ClientSelector.tsx
│   │   │   │   ├── ProductPicker.tsx
│   │   │   │   ├── PaymentMethodSelector.tsx
│   │   │   │   ├── CheckoutSummary.tsx
│   │   │   │   └── SuccessOverlay.tsx
│   │   │   ├── clients/
│   │   │   │   ├── ClientCard.tsx
│   │   │   │   └── ClientStats.tsx
│   │   │   ├── suppliers/
│   │   │   │   └── SupplierCard.tsx
│   │   │   ├── cash-register/
│   │   │   │   ├── DaySummaryCard.tsx
│   │   │   │   ├── CashBentoGrid.tsx
│   │   │   │   ├── TransactionRow.tsx
│   │   │   │   └── PinModal.tsx
│   │   │   └── shared/
│   │   │       ├── StatusBadge.tsx
│   │   │       ├── SearchBar.tsx
│   │   │       └── FilterChip.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProducts.ts
│   │   │   ├── useClients.ts
│   │   │   ├── useSuppliers.ts
│   │   │   ├── useOrders.ts
│   │   │   ├── useTransactions.ts
│   │   │   └── useTheme.ts
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios instance + interceptors
│   │   │   └── utils.ts              # Formatters, helpers
│   │   ├── store/
│   │   │   └── themeStore.ts         # Zustand store for dark/light
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   └── styles/
│   │       ├── globals.css
│   │       └── abyssal-theme.css     # CSS variables dark + light
│   └── public/
│
├── app/                              # EXISTING (Android)
│   └── src/main/java/com/example/
│       ├── data/
│       │   ├── remote/               # NEW
│       │   │   ├── ApiService.kt
│       │   │   ├── RemoteDataSource.kt
│       │   │   └── dto/
│       │   │       ├── ProductDto.kt
│       │   │       ├── ClientDto.kt
│       │   │       ├── SupplierDto.kt
│       │   │       ├── OrderDto.kt
│       │   │       └── TransactionDto.kt
│       │   ├── Repository.kt         # MODIFY
│       │   └── sync/                 # NEW
│       │       ├── SyncWorker.kt
│       │       └── SyncManager.kt
│       └── ui/
│           ├── ErpViewModel.kt       # MODIFY (add theme toggle + remote calls)
│           └── theme/
│               ├── Color.kt          # ADD light mode colors
│               └── Theme.kt          # ADD light color scheme
│
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-07-16-abyssal-erp-profesional.md   # THIS FILE
```

---
## Tasks

### FASE 1: BACKEND (Weeks 1-4)

---

### Task 1: Project Scaffold — Structure, Config, Docker

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/Dockerfile`
- Create: `backend/docker-compose.yml`
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Create: `backend/app/database.py`
- Create: `backend/app/main.py`
- Create: `backend/app/dependencies.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/middleware/__init__.py`
- Create: `backend/app/tests/__init__.py`
- Create: `backend/app/tests/conftest.py`

- [ ] **Step 1: Create `backend/requirements.txt`**

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
asyncpg==0.29.0
alembic==1.13.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
pydantic==2.9.0
pydantic-settings==2.5.0
redis==5.1.0
httpx==0.27.0
pytest==8.3.0
pytest-asyncio==0.24.0
aiosqlite==0.20.0
```

- [ ] **Step 2: Create `backend/app/__init__.py`** (empty file)
- [ ] **Step 3: Create `backend/app/config.py`**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://abyssal:abyssal_pass@localhost:5432/abyssal_erp"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    class Config:
        env_file = ".env"

settings = Settings()
```

- [ ] **Step 4: Create `backend/app/database.py`**

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

- [ ] **Step 5: Create `backend/app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, products, clients, suppliers, orders, transactions, reports, sync

app = FastAPI(title="Abyssal ERP API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(clients.router, prefix="/api/v1/clients", tags=["Clients"])
app.include_router(suppliers.router, prefix="/api/v1/suppliers", tags=["Suppliers"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["Transactions"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(sync.router, prefix="/api/v1/sync", tags=["Sync"])

@app.get("/health")
async def health():
    return {"status": "ok"}
```

- [ ] **Step 6: Create `backend/app/dependencies.py`**

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from app.database import get_db
from app.config import settings

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user_id, "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

- [ ] **Step 7: Create `backend/Dockerfile`**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 8: Create `backend/docker-compose.yml`**

```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: abyssal
      POSTGRES_PASSWORD: abyssal_pass
      POSTGRES_DB: abyssal_erp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://abyssal:abyssal_pass@db:5432/abyssal_erp
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: change-this-in-production
    depends_on:
      - db
      - redis

volumes:
  pgdata:
```

- [ ] **Step 9: Create `backend/app/tests/conftest.py`**

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.database import Base, get_db
from app.main import app

@pytest.fixture
async def async_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSession(engine) as session:
        yield session
```

- [ ] **Step 10: Create all `__init__.py` files** (empty)
- [ ] **Step 11: Commit**

```bash
git add backend/
git commit -m "feat(backend): project scaffold with FastAPI + Docker + PostgreSQL"
```

---

### Task 2: SQLAlchemy Models — Products, Clients, Suppliers

**Files:**
- Create: `backend/app/models/business.py`
- Create: `backend/app/models/product.py`
- Create: `backend/app/models/client.py`
- Create: `backend/app/models/supplier.py`
- Update: `backend/app/models/__init__.py`

- [ ] **Step 1: Create `backend/app/models/business.py`**

```python
from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class BusinessConfig(Base):
    __tablename__ = "business_config"
    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(50))
    address = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 2: Create `backend/app/models/product.py`**

```python
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    stock = Column(Float, nullable=False, default=0.0)
    unit = Column(String(20), nullable=False, default="kg")
    price = Column(Float, nullable=False)
    image_url = Column(String(1000))
    description = Column(String(2000))
    is_extra_quality = Column(Boolean, default=False)
    low_stock_threshold = Column(Float, default=10.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

- [ ] **Step 3: Create `backend/app/models/client.py`**

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50))
    email = Column(String(255))
    address = Column(String(500))
    outstanding_balance = Column(Float, default=0.0)
    initials = Column(String(10))
    credit_limit = Column(Float, default=1500.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 4: Create `backend/app/models/supplier.py`**

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    pending_payment = Column(Float, default=0.0)
    status = Column(String(50), default="PENDIENTE")
    image_url = Column(String(1000))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 5: Update `backend/app/models/__init__.py`**

```python
from app.models.business import BusinessConfig
from app.models.product import Product
from app.models.client import Client
from app.models.supplier import Supplier
__all__ = ["BusinessConfig", "Product", "Client", "Supplier"]
```

- [ ] **Step 6: Commit**

```bash
git add backend/app/models/
git commit -m "feat(backend): add SQLAlchemy models for Product, Client, Supplier"
```

---

### Task 3: SQLAlchemy Models — Orders, Transactions

**Files:**
- Create: `backend/app/models/order.py`
- Create: `backend/app/models/transaction.py`
- Update: `backend/app/models/__init__.py`

- [ ] **Step 1: Create `backend/app/models/order.py`**

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    client_name = Column(String(255), nullable=False)
    delivery_date = Column(String(100))
    items_count = Column(Integer, default=0)
    status = Column(String(50), default="PENDIENTE", index=True)
    total_value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered_at = Column(DateTime(timezone=True))
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    order = relationship("Order", back_populates="items")
```

- [ ] **Step 2: Create `backend/app/models/transaction.py`**

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    time = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="PAGADO")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 3: Update `backend/app/models/__init__.py`**

```python
from app.models.business import BusinessConfig
from app.models.product import Product
from app.models.client import Client
from app.models.supplier import Supplier
from app.models.order import Order, OrderItem
from app.models.transaction import Transaction
__all__ = ["BusinessConfig", "Product", "Client", "Supplier", "Order", "OrderItem", "Transaction"]
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/models/
git commit -m "feat(backend): add Order, OrderItem, Transaction models"
```

---

### Task 4: Pydantic Schemas

**Files:**
- Create: `backend/app/schemas/auth.py`
- Create: `backend/app/schemas/product.py`
- Create: `backend/app/schemas/client.py`
- Create: `backend/app/schemas/supplier.py`
- Create: `backend/app/schemas/order.py`
- Create: `backend/app/schemas/transaction.py`
- Create: `backend/app/schemas/report.py`
- Create: `backend/app/schemas/sync.py`

- [ ] **Step 1: Create `backend/app/schemas/auth.py`**

```python
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    business_name: str
    owner_name: str
    email: str
    password: str
    phone: str | None = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    business_name: str
    owner_name: str
```

- [ ] **Step 2: Create `backend/app/schemas/product.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    category: str
    stock: float = 0.0
    unit: str = "kg"
    price: float
    image_url: str = ""
    description: str = ""
    is_extra_quality: bool = False
    low_stock_threshold: float = 10.0

class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    stock: float | None = None
    unit: str | None = None
    price: float | None = None
    image_url: str | None = None
    description: str | None = None
    is_extra_quality: bool | None = None
    low_stock_threshold: float | None = None

class StockAdjust(BaseModel):
    stock: float

class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    stock: float
    unit: str
    price: float
    image_url: str
    description: str
    is_extra_quality: bool
    low_stock_threshold: float
    created_at: datetime | None = None
    updated_at: datetime | None = None
    class Config: from_attributes = True
```

- [ ] **Step 3: Create `backend/app/schemas/client.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class ClientCreate(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    address: str = ""
    outstanding_balance: float = 0.0
    initials: str = ""
    credit_limit: float = 1500.0

class ClientUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    credit_limit: float | None = None

class BalanceAdjust(BaseModel):
    new_balance: float

class ClientResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    address: str
    outstanding_balance: float
    initials: str
    credit_limit: float
    created_at: datetime | None = None
    class Config: from_attributes = True
```

- [ ] **Step 4: Create `backend/app/schemas/supplier.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class SupplierCreate(BaseModel):
    name: str
    category: str
    pending_payment: float = 0.0
    status: str = "PENDIENTE"
    image_url: str = ""

class SupplierUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    pending_payment: float | None = None
    status: str | None = None
    image_url: str | None = None

class SupplierResponse(BaseModel):
    id: int
    name: str
    category: str
    pending_payment: float
    status: str
    image_url: str
    created_at: datetime | None = None
    class Config: from_attributes = True
```

- [ ] **Step 5: Create `backend/app/schemas/order.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    subtotal: float

class OrderCreate(BaseModel):
    client_id: int
    client_name: str
    delivery_date: str = ""
    items: list[OrderItemCreate]
    payment_method: str = "Efectivo"

class OrderStatusUpdate(BaseModel):
    status: str

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    unit_price: float
    subtotal: float
    class Config: from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    client_id: int
    client_name: str
    delivery_date: str
    items_count: int
    status: str
    total_value: float
    created_at: datetime | None = None
    items: list[OrderItemResponse] = []
    class Config: from_attributes = True
```

- [ ] **Step 6: Create `backend/app/schemas/transaction.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class TransactionCreate(BaseModel):
    title: str
    time: str
    type: str
    amount: float
    status: str = "PAGADO"

class TransactionResponse(BaseModel):
    id: int
    title: str
    time: str
    type: str
    amount: float
    status: str
    created_at: datetime | None = None
    class Config: from_attributes = True

class DailySummaryResponse(BaseModel):
    total_sales: float
    total_expenses: float
    net_total: float
    cash_total: float
    card_total: float
    transaction_count: int
```

- [ ] **Step 7: Create `backend/app/schemas/report.py`**

```python
from pydantic import BaseModel

class DashboardResponse(BaseModel):
    gross_profit: float
    sales_total: float
    purchases_total: float
    cash_total: float
    transfer_total: float
    pending_orders: int
    low_stock_count: int
    total_clients: int
    total_suppliers: int
```

- [ ] **Step 8: Create `backend/app/schemas/sync.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class SyncPullRequest(BaseModel):
    since: datetime | None = None

class SyncPullResponse(BaseModel):
    products: list = []
    clients: list = []
    suppliers: list = []
    orders: list = []
    transactions: list = []
    server_time: datetime

class SyncPushItem(BaseModel):
    action: str
    entity: str
    data: dict
    client_timestamp: datetime | None = None

class SyncPushRequest(BaseModel):
    changes: list[SyncPushItem]

class SyncPushResponse(BaseModel):
    accepted: int = 0
    rejected: list[str] = []
    server_time: datetime
```

- [ ] **Step 9: Commit**

```bash
git add backend/app/schemas/
git commit -m "feat(backend): add Pydantic schemas for all entities"
```

---

### Task 5: Auth Service + Endpoints (Register, Login, JWT)

**Files:**
- Create: `backend/app/services/auth_service.py`
- Create: `backend/app/routers/auth.py`
- Create: `backend/app/tests/test_auth.py`

- [ ] **Step 1: Create `backend/app/services/auth_service.py`**

```python
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models.business import BusinessConfig

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

async def register_business(db: AsyncSession, business_name: str, owner_name: str, email: str, password: str, phone: str = None) -> BusinessConfig:
    existing = await db.scalar(select(BusinessConfig).where(BusinessConfig.email == email))
    if existing:
        raise ValueError("Email already registered")
    business = BusinessConfig(business_name=business_name, owner_name=owner_name, email=email, password_hash=hash_password(password), phone=phone)
    db.add(business)
    await db.flush()
    return business

async def authenticate(db: AsyncSession, email: str, password: str) -> BusinessConfig | None:
    user = await db.scalar(select(BusinessConfig).where(BusinessConfig.email == email))
    if not user or not verify_password(password, user.password_hash):
        return None
    return user
```

- [ ] **Step 2: Create `backend/app/routers/auth.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import register_business, authenticate, create_access_token

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        business = await register_business(db, req.business_name, req.owner_name, req.email, req.password, req.phone)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    token = create_access_token({"sub": str(business.id), "email": business.email})
    return TokenResponse(access_token=token, business_name=business.business_name, owner_name=business.owner_name)

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    business = await authenticate(db, req.email, req.password)
    if not business:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(business.id), "email": business.email})
    return TokenResponse(access_token=token, business_name=business.business_name, owner_name=business.owner_name)
```

- [ ] **Step 3: Create `backend/app/tests/test_auth.py`**

```python
from app.services.auth_service import hash_password, verify_password, create_access_token
from jose import jwt
from app.config import settings

def test_password_hashing():
    hashed = hash_password("test123")
    assert verify_password("test123", hashed)
    assert not verify_password("wrong", hashed)

def test_token_creation():
    token = create_access_token({"sub": "1", "email": "test@test.com"})
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    assert payload["sub"] == "1"
    assert payload["email"] == "test@test.com"
```

- [ ] **Step 4: Run tests**

```bash
cd backend && python -m pytest app/tests/test_auth.py -v
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/auth_service.py backend/app/routers/auth.py backend/app/tests/test_auth.py
git commit -m "feat(backend): add auth with register, login, JWT"
```

---

### Task 6: CRUD Products Endpoints

**Files:**
- Create: `backend/app/services/product_service.py`
- Create: `backend/app/routers/products.py`
- Create: `backend/app/tests/test_products.py`

- [ ] **Step 1: Create `backend/app/services/product_service.py`**

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product

async def get_products(db: AsyncSession, search: str = "", category: str = "", page: int = 1, limit: int = 50) -> list[Product]:
    query = select(Product)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if category and category != "TODOS":
        query = query.where(Product.category == category)
    query = query.order_by(Product.name.asc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    return await db.get(Product, product_id)

async def create_product(db: AsyncSession, data: dict) -> Product:
    product = Product(**data)
    db.add(product)
    await db.flush()
    return product

async def update_product(db: AsyncSession, product_id: int, data: dict) -> Product | None:
    product = await db.get(Product, product_id)
    if not product: return None
    for key, value in data.items():
        if value is not None: setattr(product, key, value)
    await db.flush()
    return product

async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = await db.get(Product, product_id)
    if not product: return False
    await db.delete(product)
    await db.flush()
    return True

async def adjust_stock(db: AsyncSession, product_id: int, new_stock: float) -> Product | None:
    product = await db.get(Product, product_id)
    if not product: return None
    product.stock = new_stock
    await db.flush()
    return product

async def get_low_stock(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product).where(Product.stock <= Product.low_stock_threshold).order_by(Product.stock.asc()))
    return result.scalars().all()
```

- [ ] **Step 2: Create `backend/app/routers/products.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.product import ProductCreate, ProductUpdate, StockAdjust, ProductResponse
from app.services import product_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[ProductResponse])
async def list_products(search: str = Query(""), category: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    return await product_service.get_products(db, search, category, page, limit)

@router.get("/low-stock", response_model=list[ProductResponse])
async def low_stock(db: AsyncSession = Depends(get_db)):
    return await product_service.get_low_stock(db)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await product_service.get_product(db, product_id)
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await product_service.create_product(db, data.model_dump())

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)):
    product = await product_service.update_product(db, product_id, data.model_dump(exclude_unset=True))
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    if not await product_service.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")

@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def adjust_product_stock(product_id: int, data: StockAdjust, db: AsyncSession = Depends(get_db)):
    product = await product_service.adjust_stock(db, product_id, data.stock)
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product
```

- [ ] **Step 3: Create `backend/app/tests/test_products.py`**

```python
import pytest
from app.services.product_service import create_product, get_products, get_product

@pytest.mark.asyncio
async def test_create_and_list_products(async_session):
    await create_product(async_session, {"name": "Test Fish", "category": "PESCADO BLANCO", "stock": 10.0, "price": 15.0})
    await async_session.commit()
    products = await get_products(async_session)
    assert len(products) == 1
    assert products[0].name == "Test Fish"

@pytest.mark.asyncio
async def test_get_product_by_id(async_session):
    p = await create_product(async_session, {"name": "Test", "category": "X", "stock": 5.0, "price": 10.0})
    await async_session.commit()
    found = await get_product(async_session, p.id)
    assert found is not None and found.name == "Test"
```

- [ ] **Step 4: Run tests and commit**

```bash
cd backend && python -m pytest app/tests/test_products.py -v
git add backend/app/services/product_service.py backend/app/routers/products.py backend/app/tests/test_products.py
git commit -m "feat(backend): add CRUD products endpoints"
```

---

### Task 7: CRUD Clients + Suppliers Endpoints

**Files:**
- Create: `backend/app/services/client_service.py`
- Create: `backend/app/services/supplier_service.py`
- Create: `backend/app/routers/clients.py`
- Create: `backend/app/routers/suppliers.py`
- Create: `backend/app/tests/test_clients.py`
- Create: `backend/app/tests/test_suppliers.py`

Each follows the same CRUD pattern from Task 6, substituting `Client`/`Supplier` models and schemas.

- [ ] **`client_service.py`**: functions `get_clients`, `get_client`, `create_client`, `update_client`, `delete_client`, `adjust_balance`
- [ ] **`supplier_service.py`**: functions `get_suppliers`, `get_supplier`, `create_supplier`, `update_supplier`, `delete_supplier`
- [ ] **Routers**: Full CRUD with auth dependency and error handling
- [ ] **Tests**: Create + list + get assertions for each
- [ ] **Commit**

---

### Task 8: Orders + Transactions + Reports Endpoints

**Files:**
- Create: `backend/app/services/order_service.py`
- Create: `backend/app/routers/orders.py`
- Create: `backend/app/routers/transactions.py`
- Create: `backend/app/routers/reports.py`
- Create: `backend/app/tests/test_orders.py`
- Create: `backend/app/tests/test_transactions.py`

- [ ] **Step 1: Create `backend/app/services/order_service.py`**

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

- [ ] **Step 2: Create `backend/app/routers/orders.py`**

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

- [ ] **Step 3: Create `backend/app/routers/transactions.py`**

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

- [ ] **Step 4: Create `backend/app/routers/reports.py`**

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

- [ ] **Step 5: Run tests and commit**

```bash
cd backend && python -m pytest app/tests/test_orders.py app/tests/test_transactions.py -v
git add backend/app/services/order_service.py backend/app/routers/orders.py backend/app/routers/transactions.py backend/app/routers/reports.py backend/app/tests/
git commit -m "feat(backend): add orders, transactions, reports endpoints"
```

---

### Task 9: Sync Endpoint (Offline Support)

**Files:**
- Create: `backend/app/services/sync_service.py`
- Create: `backend/app/routers/sync.py`
- Create: `backend/app/tests/test_sync.py`

- [ ] **Step 1: Create `backend/app/services/sync_service.py`**

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

- [ ] **Step 2: Create `backend/app/routers/sync.py`**

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

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/sync_service.py backend/app/routers/sync.py
git commit -m "feat(backend): add sync pull/push endpoints for offline support"
```

---

### FASE 2: WEB APP NEXT.JS (Weeks 5-7)

---

### Task 10: Web Project Scaffold + Theme System

**Files:**
- Create: `web/package.json`
- Create: `web/next.config.ts`
- Create: `web/tailwind.config.ts`
- Create: `web/tsconfig.json`
- Create: `web/postcss.config.js`
- Create: `web/src/styles/globals.css`
- Create: `web/src/styles/abyssal-theme.css`
- Create: `web/src/store/themeStore.ts`
- Create: `web/src/providers/ThemeProvider.tsx`
- Create: `web/src/lib/api.ts`
- Create: `web/src/lib/utils.ts`
- Create: `web/src/app/layout.tsx`
- Create: `web/src/app/page.tsx`

- [ ] **Step 1: Create `web/package.json`**

```json
{
  "name": "abyssal-erp-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "axios": "^1.7.0",
    "zustand": "^4.5.0",
    "lucide-react": "^0.400.0",
    "recharts": "^2.12.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

- [ ] **Step 2: Create `web/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        abyssal: {
          bg: "var(--abyssal-bg)", surface: "var(--abyssal-surface)",
          "surface-high": "var(--abyssal-surface-high)", "surface-highest": "var(--abyssal-surface-highest)",
          outline: "var(--abyssal-outline)", "outline-variant": "var(--abyssal-outline-variant)",
          primary: "var(--abyssal-primary)", "primary-light": "var(--abyssal-primary-light)",
          "on-primary": "var(--abyssal-on-primary)",
          green: "var(--abyssal-green)", "green-bg": "var(--abyssal-green-bg)",
          yellow: "var(--abyssal-yellow)", "yellow-bg": "var(--abyssal-yellow-bg)",
          red: "var(--abyssal-red)", "red-bg": "var(--abyssal-red-bg)",
          "text-primary": "var(--abyssal-text-primary)", "text-secondary": "var(--abyssal-text-secondary)",
          "text-secondary-variant": "var(--abyssal-text-secondary-variant)",
        },
      },
      borderRadius: { "abyssal-sm": "12px", "abyssal-md": "16px", "abyssal-lg": "20px", "abyssal-xl": "24px", "abyssal-full": "9999px" },
      fontSize: {
        "display-large": ["34px", { lineHeight: "41px", fontWeight: "700", letterSpacing: "-0.5px" }],
        "headline-medium": ["24px", { lineHeight: "30px", fontWeight: "600", letterSpacing: "-0.2px" }],
        "title-large": ["20px", { lineHeight: "25px", fontWeight: "600" }],
        "title-medium": ["17px", { lineHeight: "22px", fontWeight: "600" }],
        "body-large": ["15px", { lineHeight: "20px", fontWeight: "400" }],
        "body-medium": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "label-small": ["11px", { lineHeight: "13px", fontWeight: "700", letterSpacing: "0.5px" }],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 3: Create `web/src/styles/abyssal-theme.css`**

```css
:root {
  --abyssal-bg: #F5F5F7; --abyssal-surface: #FFFFFF; --abyssal-surface-high: #E8E8ED;
  --abyssal-surface-highest: #D1D1D6; --abyssal-outline: #D1D1D6; --abyssal-outline-variant: #C7C4D7;
  --abyssal-primary: #5E5CE6; --abyssal-primary-light: #7B7AF7; --abyssal-on-primary: #FFFFFF;
  --abyssal-green: #30D158; --abyssal-green-bg: rgba(48,209,88,0.12);
  --abyssal-yellow: #FFD60A; --abyssal-yellow-bg: rgba(255,214,10,0.12);
  --abyssal-red: #FF453A; --abyssal-red-bg: rgba(255,69,58,0.12);
  --abyssal-text-primary: #1C1C1E; --abyssal-text-secondary: #8E8E93; --abyssal-text-secondary-variant: #636366;
}
.dark {
  --abyssal-bg: #121212; --abyssal-surface: #1C1C1E; --abyssal-surface-high: #27272A;
  --abyssal-surface-highest: #34343D; --abyssal-outline: #333336; --abyssal-outline-variant: #464554;
  --abyssal-primary: #5E5CE6; --abyssal-primary-light: #C2C1FF; --abyssal-on-primary: #FFFFFF;
  --abyssal-green: #30D158; --abyssal-green-bg: rgba(48,209,88,0.15);
  --abyssal-yellow: #FFD60A; --abyssal-yellow-bg: rgba(255,214,10,0.15);
  --abyssal-red: #FF453A; --abyssal-red-bg: rgba(255,69,58,0.15);
  --abyssal-text-primary: #E4E1ED; --abyssal-text-secondary: #8E8E93; --abyssal-text-secondary-variant: #C7C4D7;
}
```

- [ ] **Step 4: Create `web/src/store/themeStore.ts`**

```typescript
import { create } from "zustand"
type Theme = "dark" | "light"
interface ThemeStore { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }
export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "dark",
  toggle: () => set((s) => { const next = s.theme === "dark" ? "light" : "dark"; localStorage.setItem("abyssal-theme", next); return { theme: next } }),
  setTheme: (t) => { localStorage.setItem("abyssal-theme", t); set({ theme: t }) },
}))
```

- [ ] **Step 5: Create `web/src/providers/ThemeProvider.tsx`**

```tsx
"use client"
import { useEffect } from "react"
import { useThemeStore } from "@/store/themeStore"
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme); const setTheme = useThemeStore((s) => s.setTheme)
  useEffect(() => { const saved = localStorage.getItem("abyssal-theme") as "dark" | "light" | null; if (saved) setTheme(saved) }, [setTheme])
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark") }, [theme])
  return <>{children}</>
}
```

- [ ] **Step 6: Create `web/src/lib/api.ts`**

```typescript
import axios from "axios"
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1", headers: { "Content-Type": "application/json" } })
api.interceptors.request.use((config) => { const token = localStorage.getItem("abyssal-token"); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
api.interceptors.response.use((r) => r, (err) => { if (err.response?.status === 401) { localStorage.removeItem("abyssal-token"); window.location.href = "/login" }; return Promise.reject(err) })
export default api
```

- [ ] **Step 7: Create `web/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next"
import { ThemeProvider } from "@/providers/ThemeProvider"
import "@/styles/globals.css"; import "@/styles/abyssal-theme.css"
export const metadata: Metadata = { title: "Abyssal ERP", description: "Sistema de Gestión Logística" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" className="dark"><body className="bg-abyssal-bg text-abyssal-text-primary font-sans antialiased"><ThemeProvider>{children}</ThemeProvider></body></html>
}
```

- [ ] **Step 8: Create `web/next.config.ts`**, `web/tsconfig.json`, `web/postcss.config.js`, `web/src/app/page.tsx` (redirect to /login)
- [ ] **Step 9: Commit**

```bash
git add web/
git commit -m "feat(web): project scaffold with Next.js + Tailwind + theme system"
```

---

### Task 11: Web — Shared UI Components + Layout

**Files:**
- Create: `web/src/components/ui/button.tsx`
- Create: `web/src/components/ui/card.tsx`
- Create: `web/src/components/ui/input.tsx`
- Create: `web/src/components/ui/dialog.tsx`
- Create: `web/src/components/shared/StatusBadge.tsx`
- Create: `web/src/components/shared/SearchBar.tsx`
- Create: `web/src/components/shared/FilterChip.tsx`
- Create: `web/src/components/layout/BottomNav.tsx`
- Create: `web/src/components/layout/TopBar.tsx`
- Create: `web/src/components/layout/ThemeToggle.tsx`
- Create: `web/src/components/layout/AuthGuard.tsx`
- Create: `web/src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create UI primitives** (button, card, input, dialog) matching Android theme exactly
- [ ] **Step 2: Create shared components** (StatusBadge, SearchBar, FilterChip)
- [ ] **Step 3: Create layout components** (BottomNav with 6 tabs, TopBar with title + notifications + theme toggle, AuthGuard)
- [ ] **Step 4: Create dashboard layout** with BottomNav wrapper, AuthGuard, max-width 480px
- [ ] **Step 5: Commit**

---

### Task 12: Web — Login Screen

**Files:**
- Create: `web/src/hooks/useAuth.ts`
- Create: `web/src/app/login/page.tsx`

Replicates Android LoginScreen exactly: fish icon, "Bienvenido" title, credential fields with icons, "Ingresar" button, footer capsule.

- [ ] **Commit**

---

### Task 13: Web — Dashboard Screen

**Files:**
- Create: `web/src/hooks/useProducts.ts`
- Create: `web/src/hooks/useOrders.ts`
- Create: `web/src/hooks/useTransactions.ts`
- Create: `web/src/components/dashboard/SparklineChart.tsx`
- Create: `web/src/components/dashboard/StatsCard.tsx`
- Create: `web/src/components/dashboard/BentoGrid.tsx`
- Create: `web/src/components/dashboard/RecentOrdersList.tsx`
- Create: `web/src/app/(dashboard)/dashboard/page.tsx`

Replicates Android DashboardScreen: gross profit card with sparkline, bento grid (Ventas, Compras, Efectivo, Transferencia, Pendientes, Stock Bajo), recent orders list, action buttons.

- [ ] **Commit**

---

### Task 14: Web — Products List + Product Detail

**Files:**
- Create: `web/src/components/products/ProductCard.tsx`
- Create: `web/src/components/products/CategoryFilter.tsx`
- Create: `web/src/components/products/ProductSearchBar.tsx`
- Create: `web/src/components/products/StockBadge.tsx`
- Create: `web/src/app/(dashboard)/products/page.tsx`
- Create: `web/src/app/(dashboard)/products/[id]/page.tsx`

Replicates ProductosScreen and ProductDetailScreen: search, category chips, product rows (image + name + stock + price), detail with hero image, stock/price grid, price trend bar chart, stock adjustment dialog.

- [ ] **Commit**

---

### Task 15: Web — Orders List + New Order

**Files:**
- Create: `web/src/components/orders/OrderCard.tsx`
- Create: `web/src/components/orders/OrderFilters.tsx`
- Create: `web/src/components/orders/ClientSelector.tsx`
- Create: `web/src/components/orders/ProductPicker.tsx`
- Create: `web/src/components/orders/PaymentMethodSelector.tsx`
- Create: `web/src/components/orders/CheckoutSummary.tsx`
- Create: `web/src/components/orders/SuccessOverlay.tsx`
- Create: `web/src/app/(dashboard)/orders/page.tsx`
- Create: `web/src/app/(dashboard)/orders/new/page.tsx`

Replicates PedidosScreen and NuevoPedidoScreen: filter chips, order cards, client selector with initials, product picker with quantity controls, payment toggle, checkout summary with 10% tax, success overlay.

- [ ] **Commit**

---

### Task 16: Web — Clients, Suppliers, Cash Register

**Files:**
- Create: `web/src/components/clients/ClientCard.tsx`
- Create: `web/src/components/clients/ClientStats.tsx`
- Create: `web/src/app/(dashboard)/clients/page.tsx`
- Create: `web/src/components/suppliers/SupplierCard.tsx`
- Create: `web/src/app/(dashboard)/suppliers/page.tsx`
- Create: `web/src/components/cash-register/DaySummaryCard.tsx`
- Create: `web/src/components/cash-register/CashBentoGrid.tsx`
- Create: `web/src/components/cash-register/TransactionRow.tsx`
- Create: `web/src/components/cash-register/PinModal.tsx`
- Create: `web/src/app/(dashboard)/cash-register/page.tsx`

Replicates ClientesScreen (stats, list, map section), ProveedoresScreen (stats, list, status badges), and CierreDeCajaScreen (total card, bento 2x2, transactions, close button, PIN modal).

- [ ] **Commit**

---

### FASE 3: ANDROID REFACTOR (Week 8)

---

### Task 17: Android — DTOs + ApiService + RemoteDataSource

**Files:**
- Create: `app/src/main/java/com/example/data/remote/dto/AuthDto.kt`
- Create: `app/src/main/java/com/example/data/remote/dto/ProductDto.kt`
- Create: `app/src/main/java/com/example/data/remote/dto/ClientDto.kt`
- Create: `app/src/main/java/com/example/data/remote/dto/SupplierDto.kt`
- Create: `app/src/main/java/com/example/data/remote/dto/OrderDto.kt`
- Create: `app/src/main/java/com/example/data/remote/dto/TransactionDto.kt`
- Create: `app/src/main/java/com/example/data/remote/ApiService.kt`
- Create: `app/src/main/java/com/example/data/remote/RemoteDataSource.kt`

- [ ] **Step 1: Create DTOs** — Kotlin serializable data classes matching API JSON structure (snake_case field names, matches Pydantic schemas)
- [ ] **Step 2: Create `ApiService.kt`** — Retrofit interface with all endpoints (login, register, CRUD products/clients/suppliers/orders/transactions)
- [ ] **Step 3: Create `RemoteDataSource.kt`** — Wraps API calls, maps DTOs to Room entities, updates local database
- [ ] **Step 4: Commit**

---

### Task 18: Android — Repository Refactor + SyncWorker

**Files:**
- Modify: `app/src/main/java/com/example/data/Repository.kt`
- Create: `app/src/main/java/com/example/data/sync/SyncWorker.kt`
- Create: `app/src/main/java/com/example/data/sync/SyncManager.kt`

- [ ] **Step 1: Modify `Repository.kt`** — Add RemoteDataSource parameter. Keep all public function signatures identical. Internally: save to Room first (immediate), then call RemoteDataSource in background.
- [ ] **Step 2: Create `SyncWorker.kt`** — PeriodicWorkRequest (15 min), pulls changes from server, updates Room
- [ ] **Step 3: Create `SyncManager.kt`** — Manages sync queue, connectivity observer, retry logic
- [ ] **Step 4: Commit**

---

### Task 19: Android — Theme Dark/Light + Dashboard Toggle

**Files:**
- Modify: `app/src/main/java/com/example/ui/theme/Color.kt`
- Modify: `app/src/main/java/com/example/ui/theme/Theme.kt`
- Modify: `app/src/main/java/com/example/ui/ErpViewModel.kt`
- Modify: `app/src/main/java/com/example/ui/Screens.kt` (only add toggle icon)

- [ ] **Step 1: Add light colors to `Color.kt`** — AbyssalBackgroundLight, AbyssalSurfaceLight, etc.
- [ ] **Step 2: Add light scheme to `Theme.kt`** — AbyssalLightColorScheme with lightColorScheme()
- [ ] **Step 3: Add `isDarkMode` StateFlow + `toggleTheme()` to `ErpViewModel.kt`**
- [ ] **Step 4: Add sun/moon toggle icon to DashboardScreen top bar** (2 lines: IconButton next to Notifications)
- [ ] **Step 5: Commit**

---

### FASE 4: INTEGRATION & POLISH (Weeks 9-10)

---

### Task 20: Integration — Sync End-to-End, Data Migration

**Files:**
- Modify: `app/src/main/java/com/example/ui/ErpViewModel.kt`
- Create: `docs/migration-guide.md`

- [ ] **Step 1: Add migration flow to `ErpViewModel.init{}`** — Check if local data exists and no prior sync → prompt user to push to cloud
- [ ] **Step 2: Create migration guide** for existing users
- [ ] **Step 3: Commit**

---

### Task 21: Docker Production + Deploy Configuration

**Files:**
- Create: `docker-compose.prod.yml`
- Create: `backend/Dockerfile.prod`
- Create: `web/Dockerfile`
- Create: `.env.example`

- [ ] **Step 1: Create `docker-compose.prod.yml`** with PostgreSQL + Redis + API + Web + Nginx
- [ ] **Step 2: Create production Dockerfiles** (multi-stage builds)
- [ ] **Step 3: Create `.env.example`** with all required env vars
- [ ] **Step 4: Commit**

---

### Task 22: Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/api.md`
- Create: `docs/deploy.md`
- Create: `docs/onboarding.md`

- [ ] **Step 1: Update `README.md`** with new architecture, setup instructions
- [ ] **Step 2: Create `docs/api.md`** with all endpoints, request/response examples
- [ ] **Step 3: Create `docs/deploy.md`** with Docker deployment (Railway + self-hosted)
- [ ] **Step 4: Create `docs/onboarding.md`** for new business owners
- [ ] **Step 5: Commit**

---

### Task 23: Final Polish

**Files:** Various across all subsystems

- [ ] **Step 1: Backend** — Add error handlers, CORS hardening, rate limiting
- [ ] **Step 2: Web** — Add loading skeletons, toast notifications, error boundaries
- [ ] **Step 3: Android** — Handle sync retry, offline indicator
- [ ] **Step 4: Commit**
