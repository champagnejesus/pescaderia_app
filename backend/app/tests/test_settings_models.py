import pytest
from sqlalchemy import select
from app.database import Base
from app.models.category import Category
from app.models.unit import Unit
from app.models.payment_method import PaymentMethod
from app.models.tax_config import TaxConfig
from app.models.invoice_pref import InvoicePref


@pytest.mark.asyncio
async def test_create_category(async_session):
    cat = Category(name="Pescado Blanco", business_id=1)
    async_session.add(cat)
    await async_session.commit()
    result = await async_session.execute(select(Category).where(Category.id == cat.id))
    assert result.scalar_one().name == "Pescado Blanco"


@pytest.mark.asyncio
async def test_create_unit(async_session):
    unit = Unit(name="Kilogramo", abbreviation="kg", business_id=1)
    async_session.add(unit)
    await async_session.commit()
    result = await async_session.execute(select(Unit).where(Unit.id == unit.id))
    assert result.scalar_one().abbreviation == "kg"


@pytest.mark.asyncio
async def test_create_payment_method(async_session):
    pm = PaymentMethod(name="Efectivo", is_active=True, sort_order=0, business_id=1)
    async_session.add(pm)
    await async_session.commit()
    result = await async_session.execute(select(PaymentMethod).where(PaymentMethod.id == pm.id))
    assert result.scalar_one().name == "Efectivo"


@pytest.mark.asyncio
async def test_create_tax_config(async_session):
    tc = TaxConfig(is_enabled=True, name="IVA", rate=13.0, included_in_price=True, business_id=1)
    async_session.add(tc)
    await async_session.commit()
    result = await async_session.execute(select(TaxConfig).where(TaxConfig.id == tc.id))
    assert result.scalar_one().rate == 13.0


@pytest.mark.asyncio
async def test_create_invoice_pref(async_session):
    ip = InvoicePref(footer_text="Gracias por su compra", show_tax_breakdown=True, business_id=1)
    async_session.add(ip)
    await async_session.commit()
    result = await async_session.execute(select(InvoicePref).where(InvoicePref.id == ip.id))
    assert result.scalar_one().footer_text == "Gracias por su compra"
