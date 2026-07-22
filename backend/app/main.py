from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base, migrate_add_column, migrate_client_fk, migrate_product_fk
from app.routers import auth, products, clients, suppliers, orders, transactions, reports, sync, purchases, inventory, accounts
from app.config import settings
from app.middleware.rate_limit import RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await migrate_add_column("orders", "payment_method", "VARCHAR(50) DEFAULT 'Efectivo'")
    await migrate_add_column("orders", "payment_status", "VARCHAR(50) DEFAULT 'PENDIENTE'")
    await migrate_add_column("order_items", "presentation", "VARCHAR(50) DEFAULT 'Unidad'")
    await migrate_add_column("products", "price_compra", "FLOAT DEFAULT 0.0")
    await migrate_add_column("products", "price_venta", "FLOAT DEFAULT 0.0")
    await migrate_add_column("clients", "initials", "VARCHAR(10) DEFAULT ''")
    await migrate_add_column("clients", "credit_limit", "FLOAT DEFAULT 1500.0")
    await migrate_client_fk()
    await migrate_product_fk()
    yield

app = FastAPI(title="Abyssal ERP API", version="1.0.0", lifespan=lifespan)
app.add_middleware(RateLimitMiddleware, max_requests=20, window_seconds=60)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(clients.router, prefix="/api/v1/clients", tags=["Clients"])
app.include_router(suppliers.router, prefix="/api/v1/suppliers", tags=["Suppliers"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["Transactions"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(sync.router, prefix="/api/v1/sync", tags=["Sync"])
app.include_router(purchases.router, prefix="/api/v1/purchases", tags=["Purchases"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(accounts.router, prefix="/api/v1/accounts", tags=["Accounts"])

@app.get("/health")
async def health():
    return {"status": "ok"}
