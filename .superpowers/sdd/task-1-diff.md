# Diff for Task 1

## Commit list
- 117462a feat: add ClientOrderResponse and ClientOrdersResponse schemas

## Stat summary
 backend/app/schemas/client.py | 13 +++++++++++++
 1 file changed, 13 insertions(+)

## Full diff
```diff
diff --git a/backend/app/schemas/client.py b/backend/app/schemas/client.py
index f8af318..d007fb1 100644
--- a/backend/app/schemas/client.py
+++ b/backend/app/schemas/client.py
@@ -31,3 +31,16 @@ class ClientResponse(BaseModel):
     credit_limit: float
     created_at: datetime | None = None
     class Config: from_attributes = True
+
+class ClientOrderResponse(BaseModel):
+    id: int
+    order_number: str
+    delivery_date: str | None
+    items_count: int
+    status: str
+    total_value: float
+    created_at: datetime | None
+
+class ClientOrdersResponse(BaseModel):
+    orders: list[ClientOrderResponse]
+    total: int
```
