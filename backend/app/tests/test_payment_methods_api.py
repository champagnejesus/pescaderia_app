import pytest
from app.services.payment_method_service import list_payment_methods, toggle_payment_method, reorder_payment_methods
from app.models.payment_method import PaymentMethod

@pytest.mark.asyncio
async def test_list_payment_methods(async_session):
    async_session.add(PaymentMethod(name="Efectivo", is_active=True, sort_order=0, business_id=1))
    async_session.add(PaymentMethod(name="Tarjeta", is_active=True, sort_order=1, business_id=1))
    await async_session.commit()
    methods = await list_payment_methods(async_session, 1)
    assert len(methods) == 2

@pytest.mark.asyncio
async def test_toggle_payment_method(async_session):
    pm = PaymentMethod(name="Test", is_active=True, sort_order=0, business_id=1)
    async_session.add(pm)
    await async_session.commit()
    assert await toggle_payment_method(async_session, pm.id, 1, False) is True
    methods = await list_payment_methods(async_session, 1)
    assert methods[0].is_active is False

@pytest.mark.asyncio
async def test_toggle_not_found(async_session):
    assert await toggle_payment_method(async_session, 999, 1, False) is False

@pytest.mark.asyncio
async def test_reorder(async_session):
    async_session.add(PaymentMethod(name="A", is_active=True, sort_order=0, business_id=1))
    async_session.add(PaymentMethod(name="B", is_active=True, sort_order=1, business_id=1))
    await async_session.commit()
    await reorder_payment_methods(async_session, 1, [2, 1])
    methods = await list_payment_methods(async_session, 1)
    assert methods[0].id == 2
    assert methods[1].id == 1
