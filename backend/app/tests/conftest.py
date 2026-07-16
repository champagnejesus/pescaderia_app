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
    await engine.dispose()
