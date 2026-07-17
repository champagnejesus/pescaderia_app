### Task 5: Crear hook useClient para frontend

**Files:**
- Create: `web/src/hooks/useClient.ts`

**Interfaces:**
- Consumes: `api` from `@/lib/api`
- Produces: `useClient(id)` returns `{ client, loading, error, refetch }`

- [ ] **Step 1: Crear el archivo con el hook**

```typescript
// web/src/hooks/useClient.ts
"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

export interface ClientDetail {
  id: number
  name: string
  phone: string
  email: string
  address: string
  outstanding_balance: number
  credit_limit: number
  initials: string
}

export function useClient(id: string | null) {
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchClient = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get<ClientDetail>(`/clients/${id}`)
      setClient(data)
    } catch {
      setError("Error al cargar cliente")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchClient() }, [fetchClient])

  return { client, loading, error, refetch: fetchClient }
}
```

- [ ] **Step 2: Verificar que TypeScript compila**

Run: `cd web && npx tsc --noEmit src/hooks/useClient.ts`
Expected: Sin errores

- [ ] **Step 3: Commit**

```bash
git add web/src/hooks/useClient.ts
git commit -m "feat: add useClient hook for client detail"
```
