import pytest
from app.services.category_service import list_categories, create_category, delete_category

@pytest.mark.asyncio
async def test_create_and_list_categories(async_session):
    cat = await create_category(async_session, 1, "Pescado Blanco")
    await async_session.commit()
    cats = await list_categories(async_session, 1)
    assert len(cats) == 1
    assert cats[0].name == "Pescado Blanco"

@pytest.mark.asyncio
async def test_delete_category(async_session):
    cat = await create_category(async_session, 1, "Mariscos")
    await async_session.commit()
    assert await delete_category(async_session, cat.id, 1) is True
    assert await list_categories(async_session, 1) == []

@pytest.mark.asyncio
async def test_delete_category_not_found(async_session):
    assert await delete_category(async_session, 999, 1) is False

@pytest.mark.asyncio
async def test_delete_category_wrong_business(async_session):
    cat = await create_category(async_session, 1, "Test")
    await async_session.commit()
    assert await delete_category(async_session, cat.id, 2) is False
