from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def clear_all_data(db: AsyncSession, business_id: int):
    """Delete transactional data strictly isolated to the logged-in business."""
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
            if table in ("order_items", "purchase_items"):
                parent_table = "orders" if table == "order_items" else "purchases"
                parent_id_col = "order_id" if table == "order_items" else "purchase_id"
                query = text(f"""
                    DELETE FROM "{table}" 
                    WHERE {parent_id_col} IN (
                        SELECT id FROM "{parent_table}" WHERE business_id = :bid
                    )
                """)
            else:
                query = text(f'DELETE FROM "{table}" WHERE business_id = :bid')
                
            await db.execute(query, {"bid": business_id})
        except Exception:
            pass  # table might not exist yet
    await db.flush()
