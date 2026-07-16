import pytest
from app.services.product_service import create_product, get_products, get_product, update_product, delete_product, adjust_stock, get_low_stock

@pytest.mark.asyncio
async def test_create_and_list_products(async_session):
    await create_product(async_session, {"name": "Test Fish", "category": "PESCADO BLANCO", "stock": 10.0, "price": 15.0})
    await async_session.commit()
    products = await get_products(async_session)
    assert len(products) == 1
    assert products[0].name == "Test Fish"

@pytest.mark.asyncio
async def test_get_product_by_id(async_session):
    p = await create_product(async_session, {"name": "Test", "category": "X", "stock": 5.0, "price": 10.0})
    pid = p.id
    await async_session.commit()
    found = await get_product(async_session, pid)
    assert found is not None and found.name == "Test"

@pytest.mark.asyncio
async def test_get_product_not_found(async_session):
    found = await get_product(async_session, 999)
    assert found is None

@pytest.mark.asyncio
async def test_update_product(async_session):
    p = await create_product(async_session, {"name": "Old", "category": "X", "stock": 5.0, "price": 10.0})
    pid = p.id
    await async_session.commit()
    updated = await update_product(async_session, pid, {"name": "New", "price": 20.0})
    assert updated is not None
    assert updated.name == "New"
    assert updated.price == 20.0

@pytest.mark.asyncio
async def test_update_product_clear_field(async_session):
    p = await create_product(async_session, {"name": "Test", "category": "X", "stock": 5.0, "price": 10.0, "description": "desc"})
    pid = p.id
    await async_session.commit()
    updated = await update_product(async_session, pid, {"description": None})
    assert updated is not None and updated.description is None

@pytest.mark.asyncio
async def test_update_product_not_found(async_session):
    result = await update_product(async_session, 999, {"name": "Nope"})
    assert result is None

@pytest.mark.asyncio
async def test_delete_product(async_session):
    p = await create_product(async_session, {"name": "Del", "category": "X", "stock": 5.0, "price": 10.0})
    pid = p.id
    await async_session.commit()
    assert await delete_product(async_session, pid) is True
    assert await get_product(async_session, pid) is None

@pytest.mark.asyncio
async def test_delete_product_not_found(async_session):
    assert await delete_product(async_session, 999) is False

@pytest.mark.asyncio
async def test_adjust_stock(async_session):
    p = await create_product(async_session, {"name": "StockTest", "category": "X", "stock": 5.0, "price": 10.0})
    pid = p.id
    await async_session.commit()
    adjusted = await adjust_stock(async_session, pid, 20.0)
    assert adjusted is not None and adjusted.stock == 20.0

@pytest.mark.asyncio
async def test_low_stock(async_session):
    await create_product(async_session, {"name": "Low", "category": "X", "stock": 2.0, "price": 10.0, "low_stock_threshold": 5.0})
    await create_product(async_session, {"name": "Ok", "category": "X", "stock": 10.0, "price": 10.0, "low_stock_threshold": 5.0})
    await async_session.commit()
    low = await get_low_stock(async_session)
    assert len(low) == 1
    assert low[0].name == "Low"
