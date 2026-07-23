from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.database import engine, Base
from app.routers import auth, products, clients, suppliers, orders, transactions, reports, sync, purchases, inventory, accounts, activity, business, categories, units, payment_methods, tax_config, invoice_prefs, export, data, expense_categories
from app.config import settings
from app.models.category import Category
from app.models.unit import Unit
from app.models.payment_method import PaymentMethod
from app.models.tax_config import TaxConfig
from app.models.invoice_pref import InvoicePref
from app.middleware.rate_limit import RateLimitMiddleware


async def migrate(conn):
    """Schema migrations compatible with SQLite and PostgreSQL."""
    dialect = engine.dialect.name
    is_sqlite = dialect == "sqlite"

    if is_sqlite:
        tables = await conn.run_sync(lambda sync_conn: {
            r[0] for r in sync_conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).fetchall()
        })
    else:
        tables = await conn.run_sync(lambda sync_conn: {
            r[0] for r in sync_conn.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            ).fetchall()
        })

    if not tables:
        return

    def column_names_sync(sync_conn, table):
        if is_sqlite:
            return {r[1] for r in sync_conn.execute(text(f'PRAGMA table_info("{table}")')).fetchall()}
        else:
            return {r[0] for r in sync_conn.execute(
                text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND table_schema = 'public'")
            ).fetchall()}

    # --- Add missing columns ---
    col_migrations = [
        ("products", "price_compra", "FLOAT DEFAULT 0.0"),
        ("products", "price_venta", "FLOAT DEFAULT 0.0"),
        ("products", "avg_purchase_price", "FLOAT DEFAULT 0.0"),
        ("transactions", "expense_category_id", "INTEGER"),
        ("orders", "payment_status", "VARCHAR(50) DEFAULT 'PENDIENTE'"),
        ("orders", "payment_method", "VARCHAR(50) DEFAULT 'Efectivo'"),
        ("order_items", "presentation", "VARCHAR(50) DEFAULT 'Unidad'"),
        ("clients", "initials", "VARCHAR(10) DEFAULT ''"),
        ("clients", "credit_limit", "FLOAT DEFAULT 1500.0"),
        ("purchases", "notes", "VARCHAR(500) DEFAULT ''"),
        ("purchase_items", "product_name", "VARCHAR(255) DEFAULT ''"),
        ("business_config", "close_day_pin", "VARCHAR(255)"),
        ("business_config", "require_pin", "BOOLEAN DEFAULT false"),
    ]
    for table, col, definition in col_migrations:
        if table not in tables:
            continue
        cols = await conn.run_sync(lambda sync_conn, t=table: column_names_sync(sync_conn, t))
        if col not in cols:
            sql = f'ALTER TABLE "{table}" ADD COLUMN {col} {definition}'
            if not is_sqlite:
                sql = f'ALTER TABLE "{table}" ADD COLUMN {col} {definition}'
            try:
                await conn.execute(text(sql))
            except Exception as e:
                # PostgreSQL will error if column already exists (race condition)
                if "already exists" not in str(e).lower():
                    raise

    if not is_sqlite:
        # PostgreSQL: create_all handles everything else
        return

    # --- Create new tables for SQLite ---
    await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS inventory_adjustments (
            id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            type VARCHAR(50) NOT NULL,
            quantity_before FLOAT NOT NULL,
            quantity_adjusted FLOAT NOT NULL,
            quantity_after FLOAT NOT NULL,
            reason VARCHAR(100) NOT NULL,
            notes TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
            PRIMARY KEY (id),
            FOREIGN KEY(product_id) REFERENCES products(id)
        )
    """))
    await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_inventory_adjustments_product_id ON inventory_adjustments (product_id)"))

    await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS expense_categories (
            id INTEGER NOT NULL,
            name VARCHAR(100) NOT NULL,
            parent_id INTEGER,
            business_id INTEGER,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
            PRIMARY KEY (id),
            FOREIGN KEY(parent_id) REFERENCES expense_categories(id),
            UNIQUE(name, parent_id, business_id)
        )
    """))

    await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS purchase_prices (
            id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            purchase_id INTEGER,
            supplier_id INTEGER,
            unit_price FLOAT NOT NULL,
            quantity FLOAT NOT NULL,
            recorded_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
            PRIMARY KEY (id),
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(purchase_id) REFERENCES purchases(id),
            FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
        )
    """))
    await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_purchase_prices_product_id ON purchase_prices (product_id)"))

    # --- SQLite-only: create missing tables ---
    new_tables = {
        "purchases": """
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER NOT NULL, purchase_number VARCHAR(50) NOT NULL UNIQUE,
                supplier_id INTEGER, supplier_name VARCHAR(255) NOT NULL,
                items_count INTEGER DEFAULT 0, total_value FLOAT NOT NULL,
                payment_status VARCHAR(50) DEFAULT 'PENDIENTE',
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                PRIMARY KEY (id),
                FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
            )
        """,
        "manual_entries": """
            CREATE TABLE IF NOT EXISTS manual_entries (
                id INTEGER NOT NULL,
                account_type VARCHAR(20) NOT NULL,
                debtor_id INTEGER NOT NULL,
                debtor_name VARCHAR(255) NOT NULL,
                description VARCHAR(500) NOT NULL,
                amount FLOAT NOT NULL,
                pending_amount FLOAT NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDIENTE',
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                PRIMARY KEY (id)
            )
        """,
        "purchase_items": """
            CREATE TABLE IF NOT EXISTS purchase_items (
                id INTEGER NOT NULL, purchase_id INTEGER NOT NULL,
                product_id INTEGER, presentation VARCHAR(50) DEFAULT 'Unidad',
                quantity FLOAT NOT NULL, unit_price FLOAT NOT NULL, subtotal FLOAT NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY(purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
            )
        """,
        "categories": """
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                business_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                PRIMARY KEY (id)
            )
        """,
        "units": """
            CREATE TABLE IF NOT EXISTS units (
                id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                abbreviation VARCHAR(10) NOT NULL,
                business_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                PRIMARY KEY (id)
            )
        """,
        "payment_methods": """
            CREATE TABLE IF NOT EXISTS payment_methods (
                id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                business_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                PRIMARY KEY (id)
            )
        """,
        "tax_config": """
            CREATE TABLE IF NOT EXISTS tax_config (
                id INTEGER NOT NULL,
                is_enabled BOOLEAN DEFAULT 0,
                name VARCHAR(100) DEFAULT 'IVA',
                rate FLOAT DEFAULT 0.0,
                included_in_price BOOLEAN DEFAULT 1,
                business_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                PRIMARY KEY (id)
            )
        """,
        "invoice_prefs": """
            CREATE TABLE IF NOT EXISTS invoice_prefs (
                id INTEGER NOT NULL,
                footer_text VARCHAR(500) DEFAULT '',
                show_tax_breakdown BOOLEAN DEFAULT 1,
                default_payment_method_id INTEGER,
                business_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                PRIMARY KEY (id)
            )
        """,
    }
    for name, sql in new_tables.items():
        if name not in tables:
            await conn.execute(text(sql))

    # --- Ensure orders.client_id is nullable (safe ALTER for SQLite) ---
    if "orders" in tables:
        info = await conn.run_sync(lambda sync_conn:
            sync_conn.execute(text('PRAGMA table_info("orders")')).fetchall()
        )
        client_id_col = next((r for r in info if r[1] == "client_id"), None)
        # column[3] is the notnull flag — if it's 1 (NOT NULL), the old schema is in place
        if client_id_col and client_id_col[3]:
            try:
                # SQLite can't ALTER constraints, so recreate only if the schema is old
                await conn.execute(text("PRAGMA foreign_keys = OFF"))
                await conn.execute(text("""
                    CREATE TABLE orders_new (
                        id INTEGER NOT NULL, order_number VARCHAR(50) NOT NULL UNIQUE,
                        client_id INTEGER, client_name VARCHAR(255) NOT NULL,
                        delivery_date VARCHAR(100), items_count INTEGER DEFAULT 0,
                        status VARCHAR(50) DEFAULT 'PENDIENTE',
                        payment_method VARCHAR(50) DEFAULT 'Efectivo',
                        payment_status VARCHAR(50) DEFAULT 'PENDIENTE',
                        total_value FLOAT NOT NULL,
                        created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                        delivered_at DATETIME,
                        PRIMARY KEY (id),
                        FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE SET NULL
                    )
                """))
                await conn.execute(text("""
                    INSERT INTO orders_new SELECT * FROM orders
                """))
                await conn.execute(text("DROP TABLE orders"))
                await conn.execute(text("ALTER TABLE orders_new RENAME TO orders"))
                await conn.execute(text("PRAGMA foreign_keys = ON"))
            except Exception:
                await conn.execute(text("PRAGMA foreign_keys = ON"))

    # --- Ensure order_items.product_id is nullable (safe ALTER for SQLite) ---
    if "order_items" in tables:
        info = await conn.run_sync(lambda sync_conn:
            sync_conn.execute(text('PRAGMA table_info("order_items")')).fetchall()
        )
        product_id_col = next((r for r in info if r[1] == "product_id"), None)
        if product_id_col and product_id_col[3]:
            try:
                await conn.execute(text("PRAGMA foreign_keys = OFF"))
                await conn.execute(text("""
                    CREATE TABLE order_items_new (
                        id INTEGER NOT NULL, order_id INTEGER NOT NULL,
                        product_id INTEGER, presentation VARCHAR(50) DEFAULT 'Unidad',
                        quantity FLOAT NOT NULL, unit_price FLOAT NOT NULL, subtotal FLOAT NOT NULL,
                        PRIMARY KEY (id),
                        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
                        FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
                    )
                """))
                await conn.execute(text("""
                    INSERT INTO order_items_new SELECT * FROM order_items
                """))
                await conn.execute(text("DROP TABLE order_items"))
                await conn.execute(text("ALTER TABLE order_items_new RENAME TO order_items"))
                await conn.execute(text("PRAGMA foreign_keys = ON"))
            except Exception:
                await conn.execute(text("PRAGMA foreign_keys = ON"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with engine.begin() as conn:
        await migrate(conn)
    # Seed default expense categories if none exist
    from app.models.expense_category import ExpenseCategory
    from sqlalchemy import func, select
    from app.database import async_session
    async with engine.begin() as conn:
        result = await conn.execute(select(func.count(ExpenseCategory.id)))
        if result.scalar() == 0:
            from app.services.expense_category_service import seed_default_categories
            async with async_session() as session:
                await seed_default_categories(session, business_id=1)
                await session.commit()
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

@app.get("/health")
async def health():
    return {"status": "ok"}
