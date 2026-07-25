from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.database import engine, Base
from app.routers import auth, products, clients, suppliers, orders, transactions, reports, sync, purchases, inventory, accounts, activity, business, categories, units, payment_methods, tax_config, invoice_prefs, export, data, expense_categories, purchase_prices, pdf
from app.config import settings
from app.models.category import Category
from app.models.unit import Unit
from app.models.payment_method import PaymentMethod
from app.models.tax_config import TaxConfig
from app.models.invoice_pref import InvoicePref
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIDMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Deduplicate business_config rows
    from app.models.business import BusinessConfig
    from sqlalchemy import func, select as sa_select
    from app.database import async_session
    async with engine.begin() as conn:
        dupes = await conn.execute(
            sa_select(BusinessConfig.email, func.count(BusinessConfig.id).label("cnt"), func.min(BusinessConfig.id).label("keep_id"))
            .group_by(BusinessConfig.email)
            .having(func.count(BusinessConfig.id) > 1)
        )
        for row in dupes:
            keep_id = row.keep_id
            await conn.execute(
                text("DELETE FROM business_config WHERE email = :email AND id != :keep_id"),
                {"email": row.email, "keep_id": keep_id}
            )
    # Seed default expense categories if none exist
    from app.models.expense_category import ExpenseCategory
    async with engine.begin() as conn:
        result = await conn.execute(sa_select(func.count(ExpenseCategory.id)))
        if result.scalar() == 0:
            from app.services.expense_category_service import seed_default_categories
            async with async_session() as session:
                await seed_default_categories(session, business_id=1)
                await session.commit()
    yield

app = FastAPI(title="Abyssal ERP API", version="1.0.0", lifespan=lifespan)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=20, window_seconds=60)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
allow_credentials = origins != ["*"]
if origins == ["*"]:
    import logging
    logging.warning("CORS: allow_origins=['*'] disables allow_credentials. Set explicit origins in CORS_ORIGINS for credential support.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    from fastapi import HTTPException
    from starlette.exceptions import HTTPException as StarletteHTTPException
    if isinstance(exc, (HTTPException, StarletteHTTPException)):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
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
app.include_router(activity.router, prefix="/api/v1/activity", tags=["Activity"])
app.include_router(business.router, prefix="/api/v1/business", tags=["Business"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(units.router, prefix="/api/v1/units", tags=["Units"])
app.include_router(payment_methods.router, prefix="/api/v1/payment-methods", tags=["Payment Methods"])
app.include_router(tax_config.router, prefix="/api/v1/tax-config", tags=["Tax Config"])
app.include_router(invoice_prefs.router, prefix="/api/v1/invoice-prefs", tags=["Invoice Prefs"])
app.include_router(export.router, prefix="/api/v1/export", tags=["Export"])
app.include_router(data.router, prefix="/api/v1/data", tags=["Data"])
app.include_router(expense_categories.router, prefix="/api/v1/expense-categories", tags=["Expense Categories"])
app.include_router(purchase_prices.router)
app.include_router(pdf.router, prefix="/api/v1/pdf", tags=["PDF"])

@app.get("/health")
async def health():
    return {"status": "ok"}
