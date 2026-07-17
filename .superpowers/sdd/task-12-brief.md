### Task 12: Web — Login Screen

**Files:**
- Create: `web/src/hooks/useAuth.ts`
- Create: `web/src/app/login/page.tsx`

Create `web/src/hooks/useAuth.ts`:
```typescript
"use client"
import { useState } from "react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthState { loading: boolean; error: string }

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: false, error: "" })
  const router = useRouter()

  const login = async (email: string, password: string) => {
    setState({ loading: true, error: "" })
    try {
      const { data } = await api.post("/auth/login", { email, password })
      localStorage.setItem("abyssal-token", data.access_token)
      localStorage.setItem("abyssal-business-name", data.business_name)
      localStorage.setItem("abyssal-owner-name", data.owner_name)
      router.push("/dashboard")
    } catch (err: any) {
      setState({ loading: false, error: err.response?.data?.detail || "Error al iniciar sesión" })
    }
  }

  const register = async (businessName: string, ownerName: string, email: string, password: string, phone?: string) => {
    setState({ loading: true, error: "" })
    try {
      const { data } = await api.post("/auth/register", { business_name: businessName, owner_name: ownerName, email, password, phone })
      localStorage.setItem("abyssal-token", data.access_token)
      localStorage.setItem("abyssal-business-name", data.business_name)
      localStorage.setItem("abyssal-owner-name", data.owner_name)
      router.push("/dashboard")
    } catch (err: any) {
      setState({ loading: false, error: err.response?.data?.detail || "Error al registrarse" })
    }
  }

  return { ...state, login, register }
}
```

Create `web/src/app/login/page.tsx`:
- "use client"
- Full-screen centered layout: `min-h-screen bg-abyssal-bg flex flex-col items-center justify-center p-6`
- Fish icon (Lucide Fish) at top, 64x64, `text-abyssal-primary`
- Title: "Bienvenido" using `text-headline-medium text-abyssal-text-primary`
- Subtitle: "Inicia sesión o regístrate" using `text-body-medium text-abyssal-text-secondary`
- Toggle between Login/Register mode with a simple state
- Email input with Mail icon, Password input with Lock icon
- In register mode: additional Business Name (Store icon), Owner Name (User icon), Phone (Phone icon) fields
- "Ingresar" / "Registrarse" button: `bg-abyssal-primary text-abyssal-on-primary w-full rounded-abyssal-sm py-3 text-title-medium`
- Footer: small capsule shape at bottom with "Abyssal ERP v1.0"
- Error display in red if present
- Loading state disables button
- Uses `useAuth()` hook

```bash
git add web/src/hooks/useAuth.ts web/src/app/login/
git commit -m "feat(web): add login screen with auth hook"
```
