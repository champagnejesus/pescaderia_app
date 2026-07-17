# Diff for Task 2

## Commit list
- cd92727 feat: add get_client_orders service function

## Stat summary
 backend/app/services/client_service.py | 6 ++++++
 1 file changed, 6 insertions(+)

## Full diff
```diff
diff --git a/backend/app/services/client_service.py b/backend/app/services/client_service.py
index 812358b..31f9740 100644
--- a/backend/app/services/client_service.py
+++ b/backend/app/services/client_service.py
@@ -1,6 +1,7 @@
 from sqlalchemy.ext.asyncio import AsyncSession
 from sqlalchemy import select
 from app.models.client import Client
+from app.models.order import Order
 
 async def get_clients(db: AsyncSession, search: str = "", page: int = 1, limit: int = 50) -> list[Client]:
     query = select(Client)
@@ -40,3 +41,8 @@ async def adjust_balance(db: AsyncSession, client_id: int, new_balance: float) -
     client.outstanding_balance = new_balance
     await db.flush()
     return client
+
+async def get_client_orders(db: AsyncSession, client_id: int, limit: int = 5) -> list[Order]:
+    query = select(Order).where(Order.client_id == client_id).order_by(Order.created_at.desc()).limit(limit)
+    result = await db.execute(query)
+    return result.scalars().all()
```
