# UI Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incrementally improve the UI of Abyssal ERP with smooth transitions, skeleton loaders, visual enhancements, and polished interactions across all pages.

**Architecture:** Enhance existing components in-place, add CSS animation utilities, create a reusable Skeleton component, and apply visual improvements to each page. No new dependencies required.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS 3.4, TypeScript, Lucide React, CVA (class-variance-authority)

## Global Constraints

- Maintain existing dark theme (abyssal color system)
- No new npm dependencies
- All animations respect `prefers-reduced-motion`
- Touch targets minimum 44x44px
- Mobile-first (480px max-width)
- Spanish language for UI text

---

## File Structure

### Files to Create
- `web/src/components/ui/skeleton.tsx` - Reusable skeleton loader component

### Files to Modify
- `web/src/styles/globals.css` - Add animation keyframes and reduced-motion support
- `web/src/styles/abyssal-theme.css` - Add gradient and shadow tokens
- `web/tailwind.config.ts` - Add animation utilities and shadow tokens
- `web/src/components/ui/button.tsx` - Add transitions, shadows, loading state
- `web/src/components/ui/card.tsx` - Add shadow, border, hover effects
- `web/src/components/ui/input.tsx` - Add focus ring, error state
- `web/src/components/ui/dialog.tsx` - Add animations, backdrop blur
- `web/src/components/shared/StatusBadge.tsx` - Add subtle animation
- `web/src/components/shared/FilterChip.tsx` - Add hover effect, shadow on selected
- `web/src/app/login/page.tsx` - Gradient background, animations
- `web/src/app/(dashboard)/dashboard/page.tsx` - Stagger animations, gradients
- `web/src/app/(dashboard)/dashboard/page.tsx` (via BentoGrid) - Stagger animations
- `web/src/app/(dashboard)/orders/page.tsx` - Skeleton loader, empty state
- `web/src/app/(dashboard)/orders/[id]/page.tsx` - Sections, loading states
- `web/src/app/(dashboard)/products/page.tsx` - Image hover, empty state
- `web/src/app/(dashboard)/clients/page.tsx` - Avatar animation, empty state
- `web/src/app/(dashboard)/cash-register/page.tsx` - Gradient, loading state

---

### Task 1: CSS Animation Foundation

**Files:**
- Modify: `web/src/styles/globals.css`
- Modify: `web/src/styles/abyssal-theme.css`
- Modify: `web/tailwind.config.ts`

**Interfaces:**
- Consumes: Existing abyssal theme CSS variables
- Produces: Animation keyframes, shadow tokens, reduced-motion support

- [ ] **Step 1: Add animation keyframes and reduced-motion to globals.css**

```css
@tailwind base; @tailwind components; @tailwind utilities;

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Stagger in */
@keyframes staggerIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-stagger-in {
  animation: staggerIn 0.3s ease-out forwards;
  opacity: 0;
}

/* Subtle pulse */
@keyframes subtlePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-subtle-pulse {
  animation: subtlePulse 2s ease-in-out infinite;
}

/* Spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
```

- [ ] **Step 2: Add gradient and shadow tokens to abyssal-theme.css**

Add to `:root` section:
```css
:root {
  /* ... existing variables ... */
  --abyssal-gradient-primary: linear-gradient(135deg, #5E5CE6 0%, #7B7AF7 100%);
  --abyssal-gradient-surface: linear-gradient(180deg, #1C1C1E 0%, #27272A 100%);
  --abyssal-shadow-primary: 0 4px 12px rgba(94, 92, 230, 0.15);
  --abyssal-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --abyssal-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --abyssal-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

Add to `.dark` section:
```css
.dark {
  /* ... existing variables ... */
  --abyssal-gradient-primary: linear-gradient(135deg, #5E5CE6 0%, #7B7AF7 100%);
  --abyssal-gradient-surface: linear-gradient(180deg, #1C1C1E 0%, #27272A 100%);
  --abyssal-shadow-primary: 0 4px 12px rgba(94, 92, 230, 0.2);
  --abyssal-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --abyssal-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --abyssal-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
}
```

- [ ] **Step 3: Add animation utilities to tailwind.config.ts**

```ts
import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        abyssal: {
          // ... existing colors ...
        },
      },
      borderRadius: { "abyssal-sm": "12px", "abyssal-md": "16px", "abyssal-lg": "20px", "abyssal-xl": "24px", "abyssal-full": "9999px" },
      fontSize: {
        // ... existing font sizes ...
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'stagger-in': 'staggerIn 0.3s ease-out forwards',
        'subtle-pulse': 'subtlePulse 2s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
      },
      boxShadow: {
        'abyssal-sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'abyssal-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'abyssal-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Verify CSS loads correctly**

Run: `cd web && npm run build`
Expected: Build completes without CSS errors

- [ ] **Step 5: Commit**

```bash
git add web/src/styles/globals.css web/src/styles/abyssal-theme.css web/tailwind.config.ts
git commit -m "feat: add animation keyframes and shadow tokens"
```

---

### Task 2: Skeleton Component

**Files:**
- Create: `web/src/components/ui/skeleton.tsx`

**Interfaces:**
- Consumes: `cn` utility from `@/lib/utils`
- Produces: `Skeleton` component with `className`, `variant`, `width`, `height` props

- [ ] **Step 1: Create Skeleton component**

```tsx
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = "rectangular", width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-abyssal-surface-high rounded-abyssal-sm",
        variant === "circular" && "rounded-full",
        className
      )}
      style={{ width, height }}
    />
  )
}
```

- [ ] **Step 2: Verify component exports correctly**

Run: `cd web && npx tsc --noEmit src/components/ui/skeleton.tsx`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui/skeleton.tsx
git commit -m "feat: add Skeleton loader component"
```

---

### Task 3: Button Component Enhancement

**Files:**
- Modify: `web/src/components/ui/button.tsx`

**Interfaces:**
- Consumes: `cn` utility, `cva` from class-variance-authority
- Produces: Enhanced `Button` with `loading` prop, improved transitions

- [ ] **Step 1: Update button variants with transitions and shadows**

```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-abyssal-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-abyssal-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-abyssal-primary text-abyssal-on-primary hover:opacity-90 hover:shadow-md",
        secondary: "bg-abyssal-surface-high text-abyssal-text-primary hover:bg-abyssal-surface-highest hover:shadow-sm",
        ghost: "bg-transparent text-abyssal-text-primary hover:bg-abyssal-surface-high",
      },
      size: {
        sm: "h-8 px-3 text-body-medium",
        md: "h-10 px-4 text-body-large",
        lg: "h-12 px-6 text-title-medium",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }), loading && "relative pointer-events-none")}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui/button.tsx
git commit -m "feat: enhance Button with transitions, shadows, and loading state"
```

---

### Task 4: Card Component Enhancement

**Files:**
- Modify: `web/src/components/ui/card.tsx`

**Interfaces:**
- Consumes: `cn` utility
- Produces: Enhanced `Card` with shadow, border, hover effects

- [ ] **Step 1: Update Card component with shadow and border**

```tsx
import { type HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-abyssal-surface rounded-abyssal-md p-4 shadow-sm border border-abyssal-outline/50 transition-shadow duration-200 hover:shadow-md",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-3", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-title-medium text-abyssal-text-primary", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-body-medium text-abyssal-text-secondary", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-4 flex items-center gap-2", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardContent, CardFooter }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui/card.tsx
git commit -m "feat: enhance Card with shadow, border, and hover effects"
```

---

### Task 5: Input Component Enhancement

**Files:**
- Modify: `web/src/components/ui/input.tsx`

**Interfaces:**
- Consumes: `cn` utility
- Produces: Enhanced `Input` with focus ring and error state

- [ ] **Step 1: Update Input with focus ring and error state**

```tsx
import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <div className="w-full">
    <input
      ref={ref}
      className={cn(
        "bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 text-abyssal-text-primary w-full outline-none border border-abyssal-outline focus:border-abyssal-primary focus:ring-2 focus:ring-abyssal-primary/20 placeholder:text-abyssal-text-secondary transition-all duration-200",
        error && "border-abyssal-red focus:border-abyssal-red focus:ring-abyssal-red/20",
        className
      )}
      {...props}
    />
    {error && (
      <p className="mt-1 text-label-small text-abyssal-red">{error}</p>
    )}
  </div>
))
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui/input.tsx
git commit -m "feat: enhance Input with focus ring and error state"
```

---

### Task 6: Dialog Component Enhancement

**Files:**
- Modify: `web/src/components/ui/dialog.tsx`

**Interfaces:**
- Consumes: `cn` utility
- Produces: Enhanced `Dialog` with animations and backdrop blur

- [ ] **Step 1: Update Dialog with animations and backdrop blur**

```tsx
"use client"

import { useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn(
        "relative bg-abyssal-surface rounded-abyssal-md p-6 z-10 mx-4 w-full max-w-md shadow-lg animate-fade-in",
        className
      )}>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui/dialog.tsx
git commit -m "feat: enhance Dialog with animations and backdrop blur"
```

---

### Task 7: Shared Components Enhancement

**Files:**
- Modify: `web/src/components/shared/StatusBadge.tsx`
- Modify: `web/src/components/shared/FilterChip.tsx`

**Interfaces:**
- Consumes: `cn` utility
- Produces: Enhanced `StatusBadge` with pulse animation, `FilterChip` with hover effects

- [ ] **Step 1: Update StatusBadge with subtle animation**

```tsx
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  PENDIENTE: "bg-abyssal-yellow-bg text-abyssal-yellow animate-subtle-pulse",
  ENTREGADO: "bg-abyssal-green-bg text-abyssal-green",
  PAGADO: "bg-abyssal-green-bg text-abyssal-green",
  ANULADO: "bg-abyssal-red-bg text-abyssal-red",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status.toUpperCase()] || "bg-abyssal-surface-high text-abyssal-text-secondary"
  return (
    <span
      className={cn(
        "inline-block rounded-abyssal-sm px-3 py-1 text-label-small uppercase",
        style,
        className
      )}
    >
      {status}
    </span>
  )
}
```

- [ ] **Step 2: Update FilterChip with hover effects**

```tsx
import { cn } from "@/lib/utils"

interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function FilterChip({ label, selected, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-abyssal-full px-3 py-1 text-body-medium transition-all duration-200",
        selected
          ? "bg-abyssal-primary text-abyssal-on-primary shadow-sm"
          : "bg-abyssal-surface-high text-abyssal-text-secondary hover:bg-abyssal-surface-highest"
      )}
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add web/src/components/shared/StatusBadge.tsx web/src/components/shared/FilterChip.tsx
git commit -m "feat: enhance StatusBadge and FilterChip with animations"
```

---

### Task 8: Login Page Enhancement

**Files:**
- Modify: `web/src/app/login/page.tsx`

**Interfaces:**
- Consumes: Enhanced `Button`, `Input` components
- Produces: Improved login page with gradient, animations, elevated form

- [ ] **Step 1: Update Login page with gradient and animations**

```tsx
"use client"
import { useState } from "react"
import { Fish, Mail, Lock, Store, User, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [phone, setPhone] = useState("")
  const { loading, error, login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isRegister) {
      await register(businessName, ownerName, email, password, phone || undefined)
    } else {
      await login(email, password)
    }
  }

  return (
    <div className="min-h-screen bg-abyssal-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-abyssal-primary/5 via-transparent to-abyssal-primary/10" />

      <div className="w-full max-w-sm flex flex-col items-center gap-4 relative z-10">
        <Fish size={64} className="text-abyssal-primary animate-fade-in" />

        <div className="text-center animate-fade-in">
          <h1 className="text-headline-medium text-abyssal-text-primary">Bienvenido</h1>
          <p className="text-body-medium text-abyssal-text-secondary">Inicia sesión o regístrate</p>
        </div>

        <div className="flex items-center gap-1 bg-abyssal-surface-high rounded-abyssal-full p-1 animate-fade-in">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`px-4 py-2 rounded-abyssal-full text-body-medium transition-all duration-200 ${
              !isRegister ? "bg-abyssal-primary text-abyssal-on-primary shadow-sm" : "text-abyssal-text-secondary hover:text-abyssal-text-primary"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`px-4 py-2 rounded-abyssal-full text-body-medium transition-all duration-200 ${
              isRegister ? "bg-abyssal-primary text-abyssal-on-primary shadow-sm" : "text-abyssal-text-secondary hover:text-abyssal-text-primary"
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 animate-fade-in">
          {isRegister && (
            <>
              <div className="relative">
                <Store size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
                <Input
                  placeholder="Nombre del negocio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
                <Input
                  placeholder="Nombre del propietario"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
                <Input
                  placeholder="Teléfono (opcional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          {error && <p className="text-body-medium text-abyssal-red text-center">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full rounded-abyssal-sm"
          >
            {loading ? "" : isRegister ? "Registrarse" : "Ingresar"}
          </Button>
        </form>

        <p className="text-body-medium text-abyssal-text-secondary text-center mt-8 bg-abyssal-surface-high rounded-abyssal-full px-4 py-1.5">
          Abyssal ERP v1.0
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/app/login/page.tsx
git commit -m "feat: enhance Login page with gradient and animations"
```

---

### Task 9: Dashboard Page Enhancement

**Files:**
- Modify: `web/src/app/(dashboard)/dashboard/page.tsx`
- Modify: `web/src/components/dashboard/BentoGrid.tsx`

**Interfaces:**
- Consumes: Enhanced `Card`, `Button`, `Skeleton` components
- Produces: Dashboard with stagger animations, gradients, skeleton loaders

- [ ] **Step 1: Update Dashboard page with stagger animations and skeleton**

```tsx
"use client"
import { TrendingUp, Plus, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SparklineChart } from "@/components/dashboard/SparklineChart"
import { BentoGrid } from "@/components/dashboard/BentoGrid"
import { RecentOrdersList } from "@/components/dashboard/RecentOrdersList"
import { useProducts } from "@/hooks/useProducts"
import { useOrders } from "@/hooks/useOrders"
import { useTransactions } from "@/hooks/useTransactions"
import { TopBar } from "@/components/layout/TopBar"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const { lowStockCount, loading: productsLoading } = useProducts()
  const { data: orders, loading: ordersLoading } = useOrders()
  const { data: summary, loading: txsLoading } = useTransactions()

  const loading = productsLoading || ordersLoading || txsLoading

  const dashboardData = {
    gross_profit: summary?.net_total ?? 0,
    sales_total: summary?.total_sales ?? 0,
    purchases_total: summary?.total_expenses ?? 0,
    cash_total: summary?.cash_total ?? 0,
    transfer_total: summary?.card_total ?? 0,
    pending_orders: orders.filter((o) => o.status === "PENDIENTE").length,
    low_stock_count: lowStockCount,
    total_clients: 0,
    total_suppliers: 0,
  }

  const grossProfitHistory = Array.from({ length: 7 }, (_, i) => ({
    value: Math.max(0, dashboardData.gross_profit * (0.8 + Math.random() * 0.4)),
  }))

  return (
    <>
      <TopBar title="Resumen" />
      <div className="p-4 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-48" />
          </>
        ) : (
          <>
            <Card className="p-4 bg-gradient-to-br from-abyssal-primary/10 to-abyssal-surface border-abyssal-primary/20 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-label-medium text-abyssal-text-secondary">Ganancia Bruta</p>
                  <p className="text-headline-medium text-abyssal-text-primary font-bold">
                    ${(dashboardData.gross_profit ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-abyssal-primary/10 flex items-center justify-center text-abyssal-primary">
                  <TrendingUp size={20} />
                </div>
              </div>
              <SparklineChart data={grossProfitHistory} color="#30D158" />
            </Card>

            <BentoGrid data={dashboardData} />

            <RecentOrdersList orders={orders} onPress={(id) => router.push(`/orders/${id}`)} />

            <div className="flex gap-3">
              <Link href="/orders/new" className="flex-1">
                <Button variant="primary" size="lg" className="w-full gap-2">
                  <Plus size={18} />
                  Nuevo Pedido
                </Button>
              </Link>
              <Link href="/cash-register" className="flex-1">
                <Button variant="secondary" size="lg" className="w-full gap-2">
                  <ShoppingCart size={18} />
                  Nueva Venta
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Update BentoGrid with stagger animations**

```tsx
"use client"
import { TrendingUp, ShoppingCart, Package, DollarSign, Repeat, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatsCard } from "./StatsCard"

interface DashboardData {
  gross_profit: number
  sales_total: number
  purchases_total: number
  cash_total: number
  transfer_total: number
  pending_orders: number
  low_stock_count: number
  total_clients: number
  total_suppliers: number
}

interface BentoGridProps {
  data: DashboardData
}

export function BentoGrid({ data }: BentoGridProps) {
  const formatCurrency = (n: number) =>
    `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`

  const items = [
    { icon: <TrendingUp size={18} />, label: "Ganancia Bruta", value: formatCurrency(data.gross_profit) },
    { icon: <ShoppingCart size={18} />, label: "Ventas", value: formatCurrency(data.sales_total) },
    { icon: <Package size={18} />, label: "Compras", value: formatCurrency(data.purchases_total) },
    { icon: <DollarSign size={18} />, label: "Efectivo", value: formatCurrency(data.cash_total) },
    { icon: <Repeat size={18} />, label: "Transferencias", value: formatCurrency(data.transfer_total) },
    { icon: <AlertTriangle size={18} />, label: "Pendientes / Stock Bajo", value: `${data.pending_orders} / ${data.low_stock_count}` },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div key={i} className="animate-stagger-in" style={{ animationDelay: `${i * 50}ms` }}>
          <StatsCard icon={item.icon} label={item.label} value={item.value} />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(dashboard\)/dashboard/page.tsx web/src/components/dashboard/BentoGrid.tsx
git commit -m "feat: enhance Dashboard with stagger animations and skeleton loaders"
```

---

### Task 10: Orders List Page Enhancement

**Files:**
- Modify: `web/src/app/(dashboard)/orders/page.tsx`

**Interfaces:**
- Consumes: Enhanced `Button`, `Skeleton`, `FilterChip` components
- Produces: Orders page with skeleton loader, improved empty state, FAB animation

- [ ] **Step 1: Update Orders page with skeleton and empty state**

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ClipboardList } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderFilters } from "@/components/orders/OrderFilters"
import { OrderCard } from "@/components/orders/OrderCard"
import { useOrders } from "@/hooks/useOrders"

export default function OrdersPage() {
  const [filter, setFilter] = useState("Todos")
  const router = useRouter()

  const statusMap: Record<string, string | undefined> = {
    Todos: undefined,
    Pendientes: "PENDIENTE",
    Entregados: "ENTREGADO",
    Anulados: "ANULADO",
  }

  const apiStatus = statusMap[filter]
  const { data: orders, loading, error } = useOrders(apiStatus)

  return (
    <>
      <TopBar title="Pedidos" />
      <div className="p-4 space-y-3">
        <OrderFilters selected={filter} onSelect={setFilter} />
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-body-medium text-abyssal-red py-8">{error}</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList size={48} className="text-abyssal-text-secondary mb-4" />
            <p className="text-title-medium text-abyssal-text-primary mb-2">No hay pedidos</p>
            <p className="text-body-medium text-abyssal-text-secondary mb-4">Crea tu primer pedido para comenzar</p>
            <Link href="/orders/new">
              <Button variant="primary">Crear Pedido</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={(id) => router.push(`/orders/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <Link
        href="/orders/new"
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(dashboard\)/orders/page.tsx
git commit -m "feat: enhance Orders page with skeleton loader and empty state"
```

---

### Task 11: Order Detail Page Enhancement

**Files:**
- Modify: `web/src/app/(dashboard)/orders/[id]/page.tsx`

**Interfaces:**
- Consumes: Enhanced `Button`, `Skeleton`, `StatusBadge` components
- Produces: Order detail with skeleton loader, improved sections, loading states

- [ ] **Step 1: Update Order Detail page with skeleton and sections**

```tsx
"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Phone, MessageCircle, ShoppingCart } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TopBar } from "@/components/layout/TopBar"
import { BottomNav } from "@/components/layout/BottomNav"

interface OrderItem {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface OrderDetail {
  id: number
  order_number: string
  client_id: number
  client_name: string
  delivery_date: string
  payment_method: string
  status: string
  total_value: number
  items_count: number
  items: OrderItem[]
  created_at: string
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  } catch {
    return dateStr
  }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get<OrderDetail>(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Error al cargar pedido"))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(newStatus: string) {
    setSubmitting(true)
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status: newStatus })
      setOrder(data)
    } catch {
      alert("Error al actualizar el estado")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Detalle del Pedido" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <TopBar title="Detalle del Pedido" />
        <div className="p-4">
          <p className="text-center text-body-medium text-abyssal-red py-8">{error || "Pedido no encontrado"}</p>
        </div>
      </>
    )
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const tax = subtotal * 0.10

  return (
    <>
      <TopBar
        title={`Pedido #${order.order_number}`}
        rightAction={
          <button
            onClick={() => router.back()}
            className="p-2 rounded-abyssal-full hover:bg-abyssal-surface-high transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
          </button>
        }
      />

      <div className="p-4 space-y-4 pb-24">
        {/* Estado y Acciones Rápidas */}
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-outline/50 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-label-medium text-abyssal-text-secondary">Estado</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-label-medium text-abyssal-text-secondary">Cliente</p>
            <p className="text-body-medium text-abyssal-text-primary font-semibold">{order.client_name}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-label-medium text-abyssal-text-secondary">Pago</p>
            <p className="text-body-medium text-abyssal-text-primary">{order.payment_method}</p>
          </div>
        </div>

        {/* Fechas */}
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-outline/50 shadow-sm animate-fade-in" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-label-small text-abyssal-text-secondary">Creado</p>
              <p className="text-body-medium text-abyssal-text-primary">{formatDateTime(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-label-small text-abyssal-text-secondary">Entrega</p>
              <p className="text-body-medium text-abyssal-text-primary">{formatDate(order.delivery_date)}</p>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-outline/50 shadow-sm animate-fade-in" style={{ animationDelay: "100ms" }}>
          <p className="text-title-medium text-abyssal-text-primary mb-3">Productos ({order.items_count})</p>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-body-medium text-abyssal-text-primary truncate">{item.product_name}</p>
                  <p className="text-label-small text-abyssal-text-secondary">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <p className="text-body-medium text-abyssal-text-primary font-semibold shrink-0 ml-2">
                  {formatCurrency(item.subtotal || item.quantity * item.unit_price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-outline/50 shadow-sm space-y-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <div className="flex justify-between text-body-medium">
            <span className="text-abyssal-text-secondary">Subtotal</span>
            <span className="text-abyssal-text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-body-medium">
            <span className="text-abyssal-text-secondary">IVA (10%)</span>
            <span className="text-abyssal-text-primary">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-title-medium pt-2 border-t border-abyssal-border">
            <span className="text-abyssal-text-primary">Total</span>
            <span className="text-abyssal-text-primary font-bold">{formatCurrency(order.total_value)}</span>
          </div>
        </div>

        {/* Acciones de Estado */}
        {order.status === "PENDIENTE" && (
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => handleStatusChange("ENTREGADO")}
              loading={submitting}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Entregar
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleStatusChange("ANULADO")}
              disabled={submitting}
            >
              Anular
            </Button>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(dashboard\)/orders/\[id\]/page.tsx
git commit -m "feat: enhance Order Detail with skeleton loader and loading states"
```

---

### Task 12: Products Page Enhancement

**Files:**
- Modify: `web/src/app/(dashboard)/products/page.tsx`

**Interfaces:**
- Consumes: Enhanced `Skeleton`, `FilterChip` components
- Produces: Products page with skeleton loader, improved empty state, image hover

- [ ] **Step 1: Update Products page with skeleton and empty state**

```tsx
"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Package } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductSearchBar } from "@/components/products/ProductSearchBar"
import { CategoryFilter } from "@/components/products/CategoryFilter"
import { ProductCard } from "@/components/products/ProductCard"
import { useProducts } from "@/hooks/useProducts"

export default function ProductsPage() {
  const { data: products, loading, categories } = useProducts()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("TODOS")
  const router = useRouter()

  const filtered = useMemo(() => {
    let result = products
    if (category !== "TODOS") result = result.filter((p) => p.category === category)
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    return result
  }, [products, category, search])

  return (
    <>
      <TopBar title="Productos" />
      <div className="p-4 space-y-3">
        <ProductSearchBar value={search} onChange={setSearch} />
        <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package size={48} className="text-abyssal-text-secondary mb-4" />
            <p className="text-title-medium text-abyssal-text-primary mb-2">No se encontraron productos</p>
            <p className="text-body-medium text-abyssal-text-secondary mb-4">Agrega tu primer producto para comenzar</p>
            <Link href="/products/new">
              <Button variant="primary">Agregar Producto</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={(id) => router.push(`/products/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <Link
        href="/products/new"
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(dashboard\)/products/page.tsx
git commit -m "feat: enhance Products page with skeleton loader and empty state"
```

---

### Task 13: Clients Page Enhancement

**Files:**
- Modify: `web/src/app/(dashboard)/clients/page.tsx`

**Interfaces:**
- Consumes: Enhanced `Skeleton` component
- Produces: Clients page with skeleton loader, improved empty state

- [ ] **Step 1: Update Clients page with skeleton and empty state**

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Users } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientCard } from "@/components/clients/ClientCard"
import { useClients } from "@/hooks/useClients"

export default function ClientsPage() {
  const { data: clients, loading } = useClients()
  const [search, setSearch] = useState("")
  const router = useRouter()

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <TopBar title="Clientes" />
      <div className="p-4 space-y-3">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 text-abyssal-text-primary w-full outline-none border border-abyssal-outline focus:border-abyssal-primary focus:ring-2 focus:ring-abyssal-primary/20 placeholder:text-abyssal-text-secondary transition-all duration-200"
        />
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users size={48} className="text-abyssal-text-secondary mb-4" />
            <p className="text-title-medium text-abyssal-text-primary mb-2">No hay clientes</p>
            <p className="text-body-medium text-abyssal-text-secondary mb-4">Agrega tu primer cliente para comenzar</p>
            <Link href="/clients/new">
              <Button variant="primary">Agregar Cliente</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onPress={(id) => router.push(`/clients/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <Link
        href="/clients/new"
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(dashboard\)/clients/page.tsx
git commit -m "feat: enhance Clients page with skeleton loader and empty state"
```

---

### Task 14: Cash Register Page Enhancement

**Files:**
- Modify: `web/src/app/(dashboard)/cash-register/page.tsx`

**Interfaces:**
- Consumes: Enhanced `Skeleton` component
- Produces: Cash register with skeleton loader, gradient summary, loading state

- [ ] **Step 1: Update Cash Register page with skeleton and gradient**

```tsx
"use client"
import { useState, useEffect, useCallback } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { Skeleton } from "@/components/ui/skeleton"
import { DaySummaryCard } from "@/components/cash-register/DaySummaryCard"
import { CashBentoGrid } from "@/components/cash-register/CashBentoGrid"
import { TransactionRow } from "@/components/cash-register/TransactionRow"
import { PinModal } from "@/components/cash-register/PinModal"
import api from "@/lib/api"

interface DailySummaryResponse {
  total_sales: number
  total_expenses: number
  net_total: number
  cash_total: number
  card_total: number
  transaction_count: number
}

interface Transaction {
  id: number
  title: string
  time: string
  type: string
  amount: number
  status: string
}

export default function CashRegisterPage() {
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [pinOpen, setPinOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, txRes] = await Promise.all([
        api.get<DailySummaryResponse>("/transactions/daily-summary"),
        api.get<Transaction[]>("/transactions", { params: { limit: 50 } }),
      ])
      setSummary(summaryRes.data)
      setTransactions(txRes.data)
    } catch (err) {
      console.error("Error fetching cash register data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function handlePinConfirm(pin: string) {
    setClosing(true)
    try {
      await api.post("/transactions/close-day", { pin })
    } catch (err) {
      console.error("Error closing day:", err)
    } finally {
      setClosing(false)
      setPinOpen(false)
      fetch()
    }
  }

  return (
    <>
      <TopBar title="Cierre de Caja" />
      <div className="p-4 space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-48" />
          </>
        ) : (
          <>
            {summary && (
              <>
                <div className="bg-gradient-to-br from-abyssal-primary/10 to-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-primary/20 animate-fade-in">
                  <DaySummaryCard totalSales={summary.total_sales} />
                </div>
                <CashBentoGrid data={summary} />
              </>
            )}
            <div className="space-y-2">
              <p className="text-title-medium text-abyssal-text-primary">Transacciones de Hoy</p>
              {transactions.length === 0 ? (
                <p className="text-center text-body-medium text-abyssal-text-secondary py-4">
                  No hay transacciones hoy
                </p>
              ) : (
                transactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))
              )}
            </div>
            <button
              onClick={() => setPinOpen(true)}
              disabled={closing}
              className="w-full bg-abyssal-primary text-abyssal-on-primary rounded-abyssal-md py-3 text-body-medium font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {closing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cerrando...
                </span>
              ) : "Cerrar Día"}
            </button>
          </>
        )}
      </div>

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} onConfirm={handlePinConfirm} />
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(dashboard\)/cash-register/page.tsx
git commit -m "feat: enhance Cash Register with skeleton loader and gradient summary"
```

---

### Task 15: Final Build Verification

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All modified files
- Produces: Verified build

- [ ] **Step 1: Run full TypeScript check**

Run: `cd web && npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 2: Run build**

Run: `cd web && npm run build`
Expected: Build completes successfully

- [ ] **Step 3: Final commit with all changes**

```bash
git add -A
git commit -m "feat: complete UI improvement with animations, skeleton loaders, and visual enhancements"
```

---

## Success Criteria

1. All components have smooth transitions (200-300ms)
2. Loading states use skeleton loaders instead of text
3. Interactive elements have hover and press feedback
4. Visual hierarchy is clear with shadows and spacing
5. Animations are smooth and don't cause jank
6. Accessibility is maintained (focus indicators, reduced motion support)
7. Dark mode contrast ratios remain WCAG compliant
8. Build completes without errors

---

## Out of Scope

- Major structural changes to component architecture
- New pages or features
- Backend changes
- Mobile app (Android) changes
- New dependencies (keeping existing stack)
