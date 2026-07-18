from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
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
        except Exception:
            await session.rollback()
            raise
        else:
            try:
                await session.commit()
            except Exception:
                await session.rollback()
                raise

async def migrate_add_column(table: str, column: str, definition: str):
    async with engine.begin() as conn:
        dialect = engine.dialect.name
        if dialect == "sqlite":
            try:
                await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))
            except Exception as e:
                print(f"ℹ SQLite migration skipped for {table}.{column}: {e}")
        else:
            await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {definition}"))

async def migrate_client_fk():
    async with engine.begin() as conn:
        dialect = engine.dialect.name
        if dialect != "sqlite":
            try:
                await conn.execute(text("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey"))
                await conn.execute(text("ALTER TABLE orders ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL"))
                print("✓ orders client_id FK migrated to ON DELETE SET NULL")
            except Exception as e:
                print(f"⚠ FK migration skipped: {e}")

async def migrate_product_fk():
    async with engine.begin() as conn:
        dialect = engine.dialect.name
        if dialect != "sqlite":
            try:
                await conn.execute(text("ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey"))
                await conn.execute(text("ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL"))
                print("✓ order_items product_id FK migrated to ON DELETE SET NULL")
            except Exception as e:
                print(f"⚠ product FK migration skipped: {e}")
