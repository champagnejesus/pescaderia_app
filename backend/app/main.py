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
    from app.models.business import BusinessConfig
    from app.models.category import Category
    from app.models.unit import Unit
    from app.models.payment_method import PaymentMethod
    from app.models.client import Client
    from app.models.supplier import Supplier
    from app.models.product import Product
    from app.models.order import Order, OrderItem
    from app.models.transaction import Transaction
    from app.models.expense_category import ExpenseCategory
    from app.services.auth_service import hash_password
    from sqlalchemy import func, select as sa_select
    from app.database import async_session
    from datetime import datetime, date, timezone

    # Create all tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Ensure required default data exists
    async with async_session() as session:
        admin_email = "admin@pescaderia.com"

        # Create default business if admin user doesn't exist
        result = await session.execute(sa_select(BusinessConfig).where(BusinessConfig.email == admin_email))
        business = result.scalar_one_or_none()
        if not business:
            business = BusinessConfig(
                business_name="Pescadería El Ancla", owner_name="Juan Pérez",
                email=admin_email, password_hash=hash_password("admin123"),
                phone="+56912345678", address="Terminal Pesquero local 42, Santiago",
                require_pin=False
            )
            session.add(business)
            await session.flush()

        # Create default categories if empty
        result = await session.execute(sa_select(func.count(Category.id)).where(Category.business_id == business.id))
        if result.scalar() == 0:
            session.add_all([
                Category(id=1, business_id=business.id, name="Mariscos"),
                Category(id=2, business_id=business.id, name="Pescado Fresco"),
                Category(id=3, business_id=business.id, name="Congelados"),
            ])
            await session.flush()

        # Create default units if empty
        result = await session.execute(sa_select(func.count(Unit.id)).where(Unit.business_id == business.id))
        if result.scalar() == 0:
            session.add_all([
                Unit(id=1, business_id=business.id, name="kg", abbreviation="kg"),
                Unit(id=2, business_id=business.id, name="unidad", abbreviation="ud"),
                Unit(id=3, business_id=business.id, name="bandeja", abbreviation="bdj"),
            ])
            await session.flush()

        # Create default payment methods if empty
        result = await session.execute(sa_select(func.count(PaymentMethod.id)).where(PaymentMethod.business_id == business.id))
        if result.scalar() == 0:
            session.add_all([
                PaymentMethod(id=1, business_id=business.id, name="Efectivo"),
                PaymentMethod(id=2, business_id=business.id, name="Transferencia"),
                PaymentMethod(id=3, business_id=business.id, name="Tarjeta"),
            ])
            await session.flush()

        # Seed default expense categories if empty
        result = await session.execute(sa_select(func.count(ExpenseCategory.id)).where(ExpenseCategory.business_id == business.id))
        if result.scalar() == 0:
            from app.services.expense_category_service import seed_default_categories
            await seed_default_categories(session, business_id=business.id)
            await session.flush()

        # Create default products if empty
        result = await session.execute(sa_select(func.count(Product.id)).where(Product.business_id == business.id))
        if result.scalar() == 0:
            session.add_all([
                Product(id=1, business_id=business.id, name="Camarón Premium", category="Mariscos", category_id=1, stock=150.5, unit="kg", price_compra=8500.0, price_venta=15000.0, avg_purchase_price=8500.0, price=15000.0, description="Camarón ecuatoriano pelado y desvenado", low_stock_threshold=10.0),
                Product(id=2, business_id=business.id, name="Filete de Merluza", category="Pescado Fresco", category_id=2, stock=85.0, unit="kg", price_compra=4200.0, price_venta=7800.0, avg_purchase_price=4200.0, price=7800.0, description="Filete de merluza fresca del día", low_stock_threshold=15.0),
                Product(id=3, business_id=business.id, name="Pulpo Congelado", category="Congelados", category_id=3, stock=45.0, unit="kg", price_compra=12000.0, price_venta=22000.0, avg_purchase_price=12000.0, price=22000.0, description="Pulpo entero congelado I.Q.F.", low_stock_threshold=5.0),
                Product(id=4, business_id=business.id, name="Salmón Fresco", category="Pescado Fresco", category_id=2, stock=3.5, unit="kg", price_compra=15000.0, price_venta=28000.0, avg_purchase_price=15000.0, price=28000.0, description="Salmón fresco entero o porciones", low_stock_threshold=8.0),
                Product(id=5, business_id=business.id, name="Mero Fresco", category="Pescado Fresco", category_id=2, stock=0.0, unit="kg", price_compra=9000.0, price_venta=18500.0, avg_purchase_price=9000.0, price=18500.0, description="Filete de mero fresco", low_stock_threshold=10.0),
            ])
            await session.flush()

        # Create default clients if empty
        result = await session.execute(sa_select(func.count(Client.id)).where(Client.business_id == business.id))
        if result.scalar() == 0:
            session.add_all([
                Client(id=1, business_id=business.id, name="Restaurante El Puerto", phone="+56987654321", email="contacto@elpuerto.com", address="Av. Costanera 123, Valparaíso", outstanding_balance=173000.0, credit_limit=2000000.0, allows_credit=True),
                Client(id=2, business_id=business.id, name="Mariscos del Sur S.A.", phone="+56911223344", email="ventas@mariscosdelsur.com", address="Camino Industrial 450, Puerto Montt", outstanding_balance=0.0, credit_limit=5000000.0, allows_credit=True),
                Client(id=3, business_id=business.id, name="Distribuidora Costera", phone="+56955667788", email="costera@gmail.com", address="Gran Vía 890, Viña del Mar", outstanding_balance=0.0, credit_limit=1500000.0, allows_credit=False),
            ])
            await session.flush()

        # Create default suppliers if empty
        result = await session.execute(sa_select(func.count(Supplier.id)).where(Supplier.business_id == business.id))
        if result.scalar() == 0:
            session.add_all([
                Supplier(id=1, business_id=business.id, name="Pesquera Pacífico", category="Mariscos", pending_payment=350000.0, status="ACTIVO"),
                Supplier(id=2, business_id=business.id, name="Distribuidora del Mar", category="Pescados", pending_payment=0.0, status="ACTIVO"),
            ])
            await session.flush()

        # Create default orders if empty
        result = await session.execute(sa_select(func.count(Order.id)).where(Order.business_id == business.id))
        if result.scalar() == 0:
            order1 = Order(id=1, business_id=business.id, order_number="PED-001284", client_id=2, client_name="Mariscos del Sur S.A.", delivery_date="2026-07-24", items_count=2, status="ENTREGADO", payment_method="Transferencia", payment_status="PAGADO", total_value=410000.0, created_at=datetime.now(timezone.utc), delivered_at=datetime.now(timezone.utc), due_date=date.today())
            session.add(order1)
            await session.flush()
            session.add_all([OrderItem(order_id=1, product_id=1, presentation="kg", quantity=20.0, unit_price=15000.0, subtotal=300000.0), OrderItem(order_id=1, product_id=3, presentation="kg", quantity=5.0, unit_price=22000.0, subtotal=110000.0)])
            await session.flush()
            order2 = Order(id=2, business_id=business.id, order_number="PED-001285", client_id=1, client_name="Restaurante El Puerto", delivery_date="2026-07-26", items_count=2, status="PENDIENTE", payment_method="Efectivo", payment_status="PENDIENTE", total_value=173000.0, created_at=datetime.now(timezone.utc), due_date=date.today())
            session.add(order2)
            await session.flush()
            session.add_all([OrderItem(order_id=2, product_id=2, presentation="kg", quantity=15.0, unit_price=7800.0, subtotal=117000.0), OrderItem(order_id=2, product_id=4, presentation="kg", quantity=2.0, unit_price=28000.0, subtotal=56000.0)])
            await session.flush()
            order3 = Order(id=3, business_id=business.id, order_number="PED-001286", client_id=3, client_name="Distribuidora Costera", delivery_date="2026-07-25", items_count=1, status="PROCESANDO", payment_method="Tarjeta", payment_status="PAGADO", total_value=220000.0, created_at=datetime.now(timezone.utc), due_date=date.today())
            session.add(order3)
            await session.flush()
            session.add_all([OrderItem(order_id=3, product_id=3, presentation="kg", quantity=10.0, unit_price=22000.0, subtotal=220000.0)])
            await session.flush()

        # Create default transactions if empty
        result = await session.execute(sa_select(func.count(Transaction.id)).where(Transaction.business_id == business.id))
        if result.scalar() == 0:
            session.add_all([
                Transaction(business_id=business.id, title="Pago recibido - Mariscos del Sur S.A.", time="10:30", type="INGRESO", amount=410000.0, status="PAGADO", created_at=datetime.now(timezone.utc)),
                Transaction(business_id=business.id, title="Pago recibido - Distribuidora Costera", time="12:15", type="INGRESO", amount=220000.0, status="PAGADO", created_at=datetime.now(timezone.utc)),
                Transaction(business_id=business.id, title="Compra - Pesquera Pacífico (Lote Camarón)", time="09:00", type="EGRESO", amount=350000.0, status="PAGADO", created_at=datetime.now(timezone.utc)),
            ])
        await session.commit()

    # Deduplicate business_config rows
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
