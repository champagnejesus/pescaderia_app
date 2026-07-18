from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base, migrate_add_column, migrate_client_fk
from app.routers import auth, products, clients, suppliers, orders, transactions, reports, sync
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await migrate_add_column("orders", "payment_method", "VARCHAR(50) DEFAULT 'Efectivo'")
    await migrate_add_column("clients", "initials", "VARCHAR(10) DEFAULT ''")
    await migrate_add_column("clients", "credit_limit", "FLOAT DEFAULT 1500.0")
    await migrate_client_fk()
    yield

app = FastAPI(title="Abyssal ERP API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": type(exc).__name__, "message": str(exc)})

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
