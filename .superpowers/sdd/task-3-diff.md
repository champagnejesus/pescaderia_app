# Diff for Task 3

## Commit list
- af0729a test: add tests for get_client_orders

## Stat summary
 backend/app/tests/test_clients.py | 39 ++++++++++++++++++++++++++++++++++++++-
 1 file changed, 38 insertions(+), 1 deletion(-)

## Full diff
```diff
diff --git a/backend/app/tests/test_clients.py b/backend/app/tests/test_clients.py
index c5034c2..3e96e06 100644
--- a/backend/app/tests/test_clients.py
+++ b/backend/app/tests/test_clients.py
@@ -1,5 +1,7 @@
 import pytest
-from app.services.client_service import create_client, get_clients, get_client, update_client, delete_client, adjust_balance
+from datetime import datetime, timedelta
+from app.services.client_service import create_client, get_clients, get_client, update_client, delete_client, adjust_balance, get_client_orders
+from app.models.order import Order
 
 @pytest.mark.asyncio
 async def test_create_and_list_clients(async_session):
@@ -41,3 +43,38 @@ async def test_not_found(async_session):
     assert await get_client(async_session, 999) is None
     assert await update_client(async_session, 999, {}) is None
     assert await delete_client(async_session, 999) is False
+
+
+@pytest.mark.asyncio
+async def test_get_client_orders(async_session):
+    client = await create_client(async_session, {"name": "Order Client", "phone": "789"})
+    cid = client.id
+    await async_session.flush()
+
+    older = Order(
+        order_number="ORD-001", client_id=cid, client_name=client.name,
+        items_count=3, status="ENTREGADO", total_value=100.0,
+        created_at=datetime(2025, 1, 1, 10, 0, 0),
+    )
+    newer = Order(
+        order_number="ORD-002", client_id=cid, client_name=client.name,
+        items_count=2, status="PENDIENTE", total_value=200.0,
+        created_at=datetime(2025, 1, 2, 10, 0, 0),
+    )
+    async_session.add_all([older, newer])
+    await async_session.commit()
+
+    orders = await get_client_orders(async_session, cid)
+    assert len(orders) == 2
+    assert orders[0].order_number == "ORD-002"
+    assert orders[1].order_number == "ORD-001"
+
+
+@pytest.mark.asyncio
+async def test_get_client_orders_empty(async_session):
+    client = await create_client(async_session, {"name": "No Orders", "phone": "000"})
+    cid = client.id
+    await async_session.commit()
+
+    orders = await get_client_orders(async_session, cid)
+    assert len(orders) == 0
```
