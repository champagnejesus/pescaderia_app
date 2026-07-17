# Diff for Task 6

## Commit list
- 65fe916 feat: add useClientOrders hook for client orders

## Stat summary
 web/src/hooks/useClientOrders.ts | 43 ++++++++++++++++++++++++++++++++++++++++
 1 file changed, 43 insertions(+)

## Full diff
```diff
diff --git a/web/src/hooks/useClientOrders.ts b/web/src/hooks/useClientOrders.ts
new file mode 100644
index 0000000..d34647b
--- /dev/null
+++ b/web/src/hooks/useClientOrders.ts
@@ -0,0 +1,43 @@
+"use client"
+import { useState, useEffect, useCallback } from "react"
+import api from "@/lib/api"
+
+export interface ClientOrder {
+  id: number
+  order_number: string
+  delivery_date: string | null
+  items_count: number
+  status: string
+  total_value: number
+  created_at: string | null
+}
+
+export function useClientOrders(clientId: string | null, limit: number = 5) {
+  const [orders, setOrders] = useState<ClientOrder[]>([])
+  const [loading, setLoading] = useState(true)
+  const [error, setError] = useState("")
+
+  const fetchOrders = useCallback(async () => {
+    if (!clientId) {
+      setLoading(false)
+      return
+    }
+    setLoading(true)
+    setError("")
+    try {
+      const { data } = await api.get<{ orders: ClientOrder[]; count: number }>(
+        `/clients/${clientId}/orders`,
+        { params: { limit } }
+      )
+      setOrders(data.orders)
+    } catch {
+      setError("Error al cargar pedidos")
+    } finally {
+      setLoading(false)
+    }
+  }, [clientId, limit])
+
+  useEffect(() => { fetchOrders() }, [fetchOrders])
+
+  return { orders, loading, error, refetch: fetchOrders }
+}
```
