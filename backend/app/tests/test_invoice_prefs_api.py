import pytest
from app.services.invoice_pref_service import get_invoice_prefs, upsert_invoice_prefs

@pytest.mark.asyncio
async def test_get_invoice_prefs_none(async_session):
    ip = await get_invoice_prefs(async_session, 1)
    assert ip is None

@pytest.mark.asyncio
async def test_upsert_invoice_prefs(async_session):
    ip = await upsert_invoice_prefs(async_session, 1, {"footer_text": "Gracias", "show_tax_breakdown": True})
    await async_session.commit()
    assert ip.footer_text == "Gracias"

@pytest.mark.asyncio
async def test_upsert_invoice_prefs_update(async_session):
    await upsert_invoice_prefs(async_session, 1, {"footer_text": "Old", "show_tax_breakdown": True})
    await async_session.commit()
    updated = await upsert_invoice_prefs(async_session, 1, {"footer_text": "New"})
    await async_session.commit()
    assert updated.footer_text == "New"
