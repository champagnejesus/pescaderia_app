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
        dialect = engine.url.get_backend_name()
        if dialect == "sqlite":
            try:
                await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))
            except Exception:
                pass  # Column already exists in SQLite
        else:
            await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {definition}"))
