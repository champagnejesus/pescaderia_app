from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def clear_all_data(db: AsyncSession):
    """Delete all transactional data but keep business profile and config."""
    tables_in_order = [
        "order_items", "orders",
        "purchase_items", "purchases",
        "transactions",
        "manual_entries",
        "products",
        "clients",
        "suppliers",
    ]
    for table in tables_in_order:
        try:
            await db.execute(text(f'DELETE FROM "{table}"'))
        except Exception:
            pass  # table might not exist yet
    await db.flush()
