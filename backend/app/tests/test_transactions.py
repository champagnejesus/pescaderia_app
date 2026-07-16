import pytest
from app.models.transaction import Transaction

@pytest.mark.asyncio
async def test_create_transaction(async_session):
    tx = Transaction(title="Sale", time="10:00", type="Efectivo", amount=100.0)
    async_session.add(tx)
    await async_session.flush()
    assert tx.id is not None

@pytest.mark.asyncio
async def test_list_transactions(async_session):
    from app.routers.transactions import list_transactions
    async_session.add_all([Transaction(title="S1", time="10:00", type="Efectivo", amount=50.0), Transaction(title="S2", time="11:00", type="Tarjeta", amount=75.0)])
    await async_session.flush(); await async_session.commit()
    txs = await list_transactions(type="", page=1, limit=50, db=async_session)
    assert len(txs) == 2
