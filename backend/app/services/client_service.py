from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.client import Client

async def get_clients(db: AsyncSession, search: str = "", page: int = 1, limit: int = 50) -> list[Client]:
    query = select(Client)
    if search:
        query = query.where(Client.name.ilike(f"%{search}%"))
    query = query.order_by(Client.name.asc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_client(db: AsyncSession, client_id: int) -> Client | None:
    return await db.get(Client, client_id)

async def create_client(db: AsyncSession, data: dict) -> Client:
    client = Client(**data)
    db.add(client)
    await db.flush()
    return client

async def update_client(db: AsyncSession, client_id: int, data: dict) -> Client | None:
    client = await db.get(Client, client_id)
    if not client: return None
    for key, value in data.items():
        setattr(client, key, value)
    await db.flush()
    return client

async def delete_client(db: AsyncSession, client_id: int) -> bool:
    client = await db.get(Client, client_id)
    if not client: return False
    await db.delete(client)
    await db.flush()
    return True

async def adjust_balance(db: AsyncSession, client_id: int, new_balance: float) -> Client | None:
    client = await db.get(Client, client_id)
    if not client: return None
    client.outstanding_balance = new_balance
    await db.flush()
    return client
