import pytest
from app.services.product_service import create_product, get_products, get_product

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
