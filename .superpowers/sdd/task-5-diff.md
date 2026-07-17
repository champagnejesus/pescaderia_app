# Diff for Task 5

## Commit list
- 58f9a10 feat: add useClient hook for client detail

## Stat summary
 web/src/hooks/useClient.ts | 38 ++++++++++++++++++++++++++++++++++++++
 1 file changed, 38 insertions(+)

## Full diff
```diff
diff --git a/web/src/hooks/useClient.ts b/web/src/hooks/useClient.ts
new file mode 100644
index 0000000..482d6fd
--- /dev/null
+++ b/web/src/hooks/useClient.ts
@@ -0,0 +1,38 @@
+"use client"
+import { useState, useEffect, useCallback } from "react"
+import api from "@/lib/api"
+
+export interface ClientDetail {
+  id: number
+  name: string
+  phone: string
+  email: string
+  address: string
+  outstanding_balance: number
+  credit_limit: number
+  initials: string
+}
+
+export function useClient(id: string | null) {
+  const [client, setClient] = useState<ClientDetail | null>(null)
+  const [loading, setLoading] = useState(true)
+  const [error, setError] = useState("")
+
+  const fetchClient = useCallback(async () => {
+    if (!id) return
+    setLoading(true)
+    setError("")
+    try {
+      const { data } = await api.get<ClientDetail>(`/clients/${id}`)
+      setClient(data)
+    } catch {
+      setError("Error al cargar cliente")
+    } finally {
+      setLoading(false)
+    }
+  }, [id])
+
+  useEffect(() => { fetchClient() }, [fetchClient])
+
+  return { client, loading, error, refetch: fetchClient }
+}
```
