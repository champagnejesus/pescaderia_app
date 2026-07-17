### Task 10: Web Project Scaffold + Theme System

**Files:**
- Create: `web/package.json`
- Create: `web/next.config.ts`
- Create: `web/tailwind.config.ts`
- Create: `web/tsconfig.json`
- Create: `web/postcss.config.js`
- Create: `web/src/styles/globals.css`
- Create: `web/src/styles/abyssal-theme.css`
- Create: `web/src/store/themeStore.ts`
- Create: `web/src/providers/ThemeProvider.tsx`
- Create: `web/src/lib/api.ts`
- Create: `web/src/lib/utils.ts`
- Create: `web/src/app/layout.tsx`
- Create: `web/src/app/page.tsx`

- [ ] **Step 1: Create `web/package.json`**

```json
{
  "name": "abyssal-erp-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "axios": "^1.7.0",
    "zustand": "^4.5.0",
    "lucide-react": "^0.400.0",
    "recharts": "^2.12.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

- [ ] **Step 2: Create `web/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        abyssal: {
          bg: "var(--abyssal-bg)", surface: "var(--abyssal-surface)",
          "surface-high": "var(--abyssal-surface-high)", "surface-highest": "var(--abyssal-surface-highest)",
          outline: "var(--abyssal-outline)", "outline-variant": "var(--abyssal-outline-variant)",
          primary: "var(--abyssal-primary)", "primary-light": "var(--abyssal-primary-light)",
          "on-primary": "var(--abyssal-on-primary)",
          green: "var(--abyssal-green)", "green-bg": "var(--abyssal-green-bg)",
          yellow: "var(--abyssal-yellow)", "yellow-bg": "var(--abyssal-yellow-bg)",
          red: "var(--abyssal-red)", "red-bg": "var(--abyssal-red-bg)",
          "text-primary": "var(--abyssal-text-primary)", "text-secondary": "var(--abyssal-text-secondary)",
          "text-secondary-variant": "var(--abyssal-text-secondary-variant)",
        },
      },
      borderRadius: { "abyssal-sm": "12px", "abyssal-md": "16px", "abyssal-lg": "20px", "abyssal-xl": "24px", "abyssal-full": "9999px" },
      fontSize: {
        "display-large": ["34px", { lineHeight: "41px", fontWeight: "700", letterSpacing: "-0.5px" }],
        "headline-medium": ["24px", { lineHeight: "30px", fontWeight: "600", letterSpacing: "-0.2px" }],
        "title-large": ["20px", { lineHeight: "25px", fontWeight: "600" }],
        "title-medium": ["17px", { lineHeight: "22px", fontWeight: "600" }],
        "body-large": ["15px", { lineHeight: "20px", fontWeight: "400" }],
        "body-medium": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "label-small": ["11px", { lineHeight: "13px", fontWeight: "700", letterSpacing: "0.5px" }],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 3: Create `web/src/styles/abyssal-theme.css`**

```css
:root {
  --abyssal-bg: #F5F5F7; --abyssal-surface: #FFFFFF; --abyssal-surface-high: #E8E8ED;
  --abyssal-surface-highest: #D1D1D6; --abyssal-outline: #D1D1D6; --abyssal-outline-variant: #C7C4D7;
  --abyssal-primary: #5E5CE6; --abyssal-primary-light: #7B7AF7; --abyssal-on-primary: #FFFFFF;
  --abyssal-green: #30D158; --abyssal-green-bg: rgba(48,209,88,0.12);
  --abyssal-yellow: #FFD60A; --abyssal-yellow-bg: rgba(255,214,10,0.12);
  --abyssal-red: #FF453A; --abyssal-red-bg: rgba(255,69,58,0.12);
  --abyssal-text-primary: #1C1C1E; --abyssal-text-secondary: #8E8E93; --abyssal-text-secondary-variant: #636366;
}
.dark {
  --abyssal-bg: #121212; --abyssal-surface: #1C1C1E; --abyssal-surface-high: #27272A;
  --abyssal-surface-highest: #34343D; --abyssal-outline: #333336; --abyssal-outline-variant: #464554;
  --abyssal-primary: #5E5CE6; --abyssal-primary-light: #C2C1FF; --abyssal-on-primary: #FFFFFF;
  --abyssal-green: #30D158; --abyssal-green-bg: rgba(48,209,88,0.15);
  --abyssal-yellow: #FFD60A; --abyssal-yellow-bg: rgba(255,214,10,0.15);
  --abyssal-red: #FF453A; --abyssal-red-bg: rgba(255,69,58,0.15);
  --abyssal-text-primary: #E4E1ED; --abyssal-text-secondary: #8E8E93; --abyssal-text-secondary-variant: #C7C4D7;
}
```

- [ ] **Step 4: Create `web/src/store/themeStore.ts`**

```typescript
import { create } from "zustand"
type Theme = "dark" | "light"
interface ThemeStore { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }
export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "dark",
  toggle: () => set((s) => { const next = s.theme === "dark" ? "light" : "dark"; localStorage.setItem("abyssal-theme", next); return { theme: next } }),
  setTheme: (t) => { localStorage.setItem("abyssal-theme", t); set({ theme: t }) },
}))
```

- [ ] **Step 5: Create `web/src/providers/ThemeProvider.tsx`**

```tsx
"use client"
import { useEffect } from "react"
import { useThemeStore } from "@/store/themeStore"
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme); const setTheme = useThemeStore((s) => s.setTheme)
  useEffect(() => { const saved = localStorage.getItem("abyssal-theme") as "dark" | "light" | null; if (saved) setTheme(saved) }, [setTheme])
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark") }, [theme])
  return <>{children}</>
}
```

- [ ] **Step 6: Create `web/src/lib/api.ts`**

```typescript
import axios from "axios"
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1", headers: { "Content-Type": "application/json" } })
api.interceptors.request.use((config) => { const token = localStorage.getItem("abyssal-token"); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
api.interceptors.response.use((r) => r, (err) => { if (err.response?.status === 401) { localStorage.removeItem("abyssal-token"); window.location.href = "/login" }; return Promise.reject(err) })
export default api
```

- [ ] **Step 7: Create `web/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next"
import { ThemeProvider } from "@/providers/ThemeProvider"
import "@/styles/globals.css"; import "@/styles/abyssal-theme.css"
export const metadata: Metadata = { title: "Abyssal ERP", description: "Sistema de Gestión Logística" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" className="dark"><body className="bg-abyssal-bg text-abyssal-text-primary font-sans antialiased"><ThemeProvider>{children}</ThemeProvider></body></html>
}
```

- [ ] **Step 8: Create `web/next.config.ts`** (empty/minimal config)

```typescript
import type { NextConfig } from "next"
const nextConfig: NextConfig = {}
export default nextConfig
```

- [ ] **Step 9: Create `web/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 10: Create `web/postcss.config.js`**

```javascript
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

- [ ] **Step 11: Create `web/src/styles/globals.css`**

```css
@tailwind base; @tailwind components; @tailwind utilities;
```

- [ ] **Step 12: Create `web/src/lib/utils.ts`** (empty helper)

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

- [ ] **Step 13: Create `web/src/app/page.tsx`** (redirect to /login)

```tsx
import { redirect } from "next/navigation"
export default function Home() { redirect("/login") }
```

- [ ] **Step 14: Commit**

```bash
git add web/
git commit -m "feat(web): project scaffold with Next.js + Tailwind + theme system"
```
