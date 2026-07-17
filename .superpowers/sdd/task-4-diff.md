# Diff for Task 4

## Commit list
- 9c7fcf3 feat: add GET /clients/{id}/orders endpoint

## Stat summary
 backend/app/routers/clients.py | 7 ++++++-
 1 file changed, 6 insertions(+), 1 deletion(-)

## Full diff
```diff
diff --git a/backend/app/routers/clients.py b/backend/app/routers/clients.py
index bc8dc76..a9d630c 100644
--- a/backend/app/routers/clients.py
+++ b/backend/app/routers/clients.py
@@ -2,7 +2,7 @@ from fastapi import APIRouter, Depends, HTTPException, Query
 from sqlalchemy.ext.asyncio import AsyncSession
 from app.database import get_db
 from app.dependencies import get_current_user
-from app.schemas.client import ClientCreate, ClientUpdate, BalanceAdjust, ClientResponse
+from app.schemas.client import ClientCreate, ClientUpdate, BalanceAdjust, ClientResponse, ClientOrdersResponse
 from app.services import client_service
 
 router = APIRouter(dependencies=[Depends(get_current_user)])
@@ -37,3 +37,8 @@ async def adjust_client_balance(client_id: int, data: BalanceAdjust, db: AsyncSe
     client = await client_service.adjust_balance(db, client_id, data.new_balance)
     if not client: raise HTTPException(status_code=404, detail="Client not found")
     return client
+
+@router.get("/{client_id}/orders", response_model=ClientOrdersResponse)
+async def get_client_orders_endpoint(client_id: int, limit: int = Query(5), db: AsyncSession = Depends(get_db)):
+    orders = await client_service.get_client_orders(db, client_id, limit)
+    return ClientOrdersResponse(orders=orders, total=len(orders))
```
