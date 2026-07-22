from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.database import engine, Base
from app.routers import auth, products, clients, suppliers, orders, transactions, reports, sync, purchases, inventory, accounts
from app.config import settings
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
        ("orders", "payment_status", "VARCHAR(50) DEFAULT 'PENDIENTE'"),
        ("orders", "payment_method", "VARCHAR(50) DEFAULT 'Efectivo'"),
        ("order_items", "presentation", "VARCHAR(50) DEFAULT 'Unidad'"),
        ("clients", "initials", "VARCHAR(10) DEFAULT ''"),
        ("clients", "credit_limit", "FLOAT DEFAULT 1500.0"),
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
    }
    for name, sql in new_tables.items():
        if name not in tables:
            await conn.execute(text(sql))

    # --- Recreate orders if client_id has wrong NOT NULL ---
    if "orders" in tables:
        info = await conn.run_sync(lambda sync_conn:
            sync_conn.execute(text('PRAGMA table_info("orders")')).fetchall()
        )
        client_id_col = next((r for r in info if r[1] == "client_id"), None)
        if client_id_col and client_id_col[3]:
            await conn.execute(text("PRAGMA foreign_keys = OFF"))
            await conn.execute(text("DROP TABLE IF EXISTS orders"))
            await conn.execute(text("""
                CREATE TABLE orders (
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
            await conn.execute(text("PRAGMA foreign_keys = ON"))

    # --- Recreate order_items if product_id has wrong NOT NULL ---
    if "order_items" in tables:
        info = await conn.run_sync(lambda sync_conn:
            sync_conn.execute(text('PRAGMA table_info("order_items")')).fetchall()
        )
        product_id_col = next((r for r in info if r[1] == "product_id"), None)
        if product_id_col and product_id_col[3]:
            await conn.execute(text("PRAGMA foreign_keys = OFF"))
            await conn.execute(text("DROP TABLE IF EXISTS order_items"))
            await conn.execute(text("""
                CREATE TABLE order_items (
                    id INTEGER NOT NULL, order_id INTEGER NOT NULL,
                    product_id INTEGER, presentation VARCHAR(50) DEFAULT 'Unidad',
                    quantity FLOAT NOT NULL, unit_price FLOAT NOT NULL, subtotal FLOAT NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
                    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
                )
            """))
            await conn.execute(text("PRAGMA foreign_keys = ON"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with engine.begin() as conn:
        await migrate(conn)
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
