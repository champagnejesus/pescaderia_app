# UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Pescaderia ERP frontend with a Minimal Pro aesthetic — gray neutral + electric blue, ultra-modern, minimal, tech-focused.

**Architecture:** Update design tokens in CSS + Tailwind config, refactor core components to use new tokens, then update all pages. Fix the critical client detail page inconsistency.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS 3.4, TypeScript, Lucide React icons, Recharts

## Global Constraints

- All colors must use `abyssal-*` CSS tokens (no hardcoded hex)
- Typography must use Geist font family
- All interactive elements need hover/focus states
- Touch targets ≥44px
- Transitions: 150ms ease
- Dark mode support required
- Max-width: 480px (mobile-first)

---

## Task 1: Update Design System Tokens

**Files:**
- Modify: `web/src/styles/abyssal-theme.css`
- Modify: `web/tailwind.config.ts`
- Modify: `web/src/app/layout.tsx` (add Geist font import)

**Interfaces:**
- Consumes: None (foundational task)
- Produces: Updated CSS custom properties and Tailwind config for all subsequent tasks

- [ ] **Step 1: Update abyssal-theme.css with Minimal Pro colors**

Replace the contents of `web/src/styles/abyssal-theme.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');

:root {
  /* Primary */
  --abyssal-primary: #2563EB;
  --abyssal-primary-hover: #1D4ED8;
  --abyssal-on-primary: #FFFFFF;

  /* Surfaces */
  --abyssal-surface: #FFFFFF;
  --abyssal-surface-high: #F8FAFC;
  --abyssal-surface-overlay: #F1F5F9;

  /* Background */
  --abyssal-background: #F8FAFC;

  /* Border */
  --abyssal-border: #E2E8F0;

  /* Text */
  --abyssal-text-primary: #0F172A;
  --abyssal-text-secondary: #64748B;
  --abyssal-text-muted: #94A3B8;

  /* Semantic */
  --abyssal-green: #10B981;
  --abyssal-yellow: #F59E0B;
  --abyssal-red: #EF4444;
}

.dark {
  /* Primary */
  --abyssal-primary: #3B82F6;
  --abyssal-primary-hover: #2563EB;
  --abyssal-on-primary: #FFFFFF;

  /* Surfaces */
  --abyssal-surface: #0F172A;
  --abyssal-surface-high: #1E293B;
  --abyssal-surface-overlay: #334155;

  /* Background */
  --abyssal-background: #020617;

  /* Border */
  --abyssal-border: #334155;

  /* Text */
  --abyssal-text-primary: #F8FAFC;
  --abyssal-text-secondary: #94A3B8;
  --abyssal-text-muted: #64748B;

  /* Semantic */
  --abyssal-green: #34D399;
  --abyssal-yellow: #FBBF24;
  --abyssal-red: #F87171;
}
```

- [ ] **Step 2: Update tailwind.config.ts with new tokens**

Replace the contents of `web/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        abyssal: {
          primary: "var(--abyssal-primary)",
          "primary-hover": "var(--abyssal-primary-hover)",
          "on-primary": "var(--abyssal-on-primary)",
          surface: "var(--abyssal-surface)",
          "surface-high": "var(--abyssal-surface-high)",
          "surface-overlay": "var(--abyssal-surface-overlay)",
          background: "var(--abyssal-background)",
          border: "var(--abyssal-border)",
          "text-primary": "var(--abyssal-text-primary)",
          "text-secondary": "var(--abyssal-text-secondary)",
          "text-muted": "var(--abyssal-text-muted)",
          green: "var(--abyssal-green)",
          yellow: "var(--abyssal-yellow)",
          red: "var(--abyssal-red)",
        },
      },
      borderRadius: {
        "abyssal-sm": "8px",
        "abyssal-md": "12px",
        "abyssal-lg": "16px",
        "abyssal-xl": "24px",
        "abyssal-full": "9999px",
      },
      fontSize: {
        "display-large": ["30px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-medium": ["22px", { lineHeight: "1.3", fontWeight: "600" }],
        "title-large": ["17px", { lineHeight: "1.4", fontWeight: "600" }],
        "title-medium": ["15px", { lineHeight: "1.4", fontWeight: "500" }],
        "body-large": ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-medium": ["13px", { lineHeight: "1.4", fontWeight: "400" }],
        "label-small": ["11px", { lineHeight: "1.3", fontWeight: "500" }],
      },
      boxShadow: {
        "abyssal-sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
        "abyssal-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        "abyssal-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
      },
      transitionDuration: {
        "150": "150ms",
      },
      transitionTimingFunction: {
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 3: Add Geist font to layout.tsx**

In `web/src/app/layout.tsx`, add the font import at the top (before the existing imports):

```typescript
import "geist/font/sans.css"
```

Or add a `<link>` tag in the `<head>` if the CSS import doesn't work:

```tsx
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@latest/dist/fonts/geist-sans/style.css" />
</head>
```

- [ ] **Step 4: Verify design system loads correctly**

Run: `cd web && npm run dev`
Open browser to localhost:3000
Verify: Colors render correctly in both light and dark mode

- [ ] **Step 5: Commit**

```bash
git add web/src/styles/abyssal-theme.css web/tailwind.config.ts web/src/app/layout.tsx
git commit -m "feat: update design system tokens to Minimal Pro theme"
```

---

## Task 2: Update Core UI Components

**Files:**
- Modify: `web/src/components/ui/button.tsx`
- Modify: `web/src/components/ui/input.tsx`
- Modify: `web/src/components/ui/card.tsx`
- Modify: `web/src/components/shared/StatusBadge.tsx`
- Modify: `web/src/components/shared/SearchBar.tsx`
- Modify: `web/src/components/shared/FilterChip.tsx`

**Interfaces:**
- Consumes: Design tokens from Task 1
- Produces: Updated component library for all pages

- [ ] **Step 1: Update Button component**

Replace `web/src/components/ui/button.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-abyssal-primary/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-abyssal-primary text-abyssal-on-primary hover:bg-abyssal-primary-hover",
        secondary: "bg-abyssal-surface-overlay text-abyssal-primary hover:bg-abyssal-surface-high",
        ghost: "text-abyssal-primary hover:bg-abyssal-surface-overlay",
        destructive: "bg-abyssal-red text-white hover:opacity-90",
      },
      size: {
        sm: "h-9 px-4 text-body-medium rounded-abyssal-sm",
        md: "h-11 px-5 text-body-large rounded-abyssal-sm",
        lg: "h-12 px-6 text-body-large rounded-abyssal-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

- [ ] **Step 2: Update Input component**

Replace `web/src/components/ui/input.tsx`:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-label-small font-medium text-abyssal-text-secondary">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-abyssal-sm border border-abyssal-border bg-abyssal-surface px-4 py-3 text-body-large text-abyssal-text-primary placeholder:text-abyssal-text-muted focus:outline-none focus:ring-2 focus:ring-abyssal-primary/20 focus:border-abyssal-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
            error && "border-abyssal-red focus:ring-abyssal-red/20 focus:border-abyssal-red",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-label-small text-abyssal-red">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 3: Update Card component**

Replace `web/src/components/ui/card.tsx`:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-abyssal-md border border-abyssal-border bg-abyssal-surface shadow-abyssal-sm transition-all duration-150",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-title-large font-semibold text-abyssal-text-primary leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardContent }
```

- [ ] **Step 4: Update StatusBadge component**

Replace `web/src/components/shared/StatusBadge.tsx`:

```tsx
import { cn } from "@/lib/utils"

type StatusType = "PENDIENTE" | "ENTREGADO" | "ANULADO" | "PAGADO"

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-abyssal-yellow/10 text-abyssal-yellow",
  },
  ENTREGADO: {
    label: "Entregado",
    className: "bg-abyssal-green/10 text-abyssal-green",
  },
  ANULADO: {
    label: "Anulado",
    className: "bg-abyssal-red/10 text-abyssal-red",
  },
  PAGADO: {
    label: "Pagado",
    className: "bg-abyssal-primary/10 text-abyssal-primary",
  },
}

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || {
    label: status,
    className: "bg-abyssal-surface-overlay text-abyssal-text-secondary",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-abyssal-full px-2.5 py-1 text-label-small font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
```

- [ ] **Step 5: Update SearchBar component**

Replace `web/src/components/shared/SearchBar.tsx`:

```tsx
"use client"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = "Buscar...", className }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-abyssal-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 rounded-abyssal-full bg-abyssal-surface-overlay text-body-large text-abyssal-text-primary placeholder:text-abyssal-text-muted focus:outline-none focus:ring-2 focus:ring-abyssal-primary/20 transition-all duration-150"
      />
    </div>
  )
}
```

- [ ] **Step 6: Update FilterChip component**

Replace `web/src/components/shared/FilterChip.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
  className?: string
}

export function FilterChip({ label, selected, onClick, className }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-abyssal-full text-body-large font-medium transition-all duration-150 whitespace-nowrap cursor-pointer",
        selected
          ? "bg-abyssal-primary text-abyssal-on-primary"
          : "bg-abyssal-surface-overlay text-abyssal-text-secondary hover:bg-abyssal-surface-high",
        className
      )}
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 7: Verify components render correctly**

Run: `cd web && npm run dev`
Check: All components use new tokens, no hardcoded colors

- [ ] **Step 8: Commit**

```bash
git add web/src/components/ui/button.tsx web/src/components/ui/input.tsx web/src/components/ui/card.tsx web/src/components/shared/StatusBadge.tsx web/src/components/shared/SearchBar.tsx web/src/components/shared/FilterChip.tsx
git commit -m "feat: update core UI components with Minimal Pro design tokens"
```

---

## Task 3: Update Layout Components

**Files:**
- Modify: `web/src/components/layout/TopBar.tsx`
- Modify: `web/src/components/layout/BottomNav.tsx`

**Interfaces:**
- Consumes: Design tokens from Task 1, Button from Task 2
- Produces: Updated layout for all pages

- [ ] **Step 1: Update TopBar component**

Replace `web/src/components/layout/TopBar.tsx`:

```tsx
"use client"
import { Bell } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

interface TopBarProps {
  title: string
  rightAction?: React.ReactNode
}

export function TopBar({ title, rightAction }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-abyssal-surface border-b border-abyssal-border">
      <h1 className="text-headline-medium font-semibold text-abyssal-text-primary">
        {title}
      </h1>
      <div className="flex items-center gap-2">
        {rightAction}
        <button className="p-2 rounded-abyssal-full hover:bg-abyssal-surface-overlay transition-colors duration-150 cursor-pointer">
          <Bell className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Update BottomNav component**

Replace `web/src/components/layout/BottomNav.tsx`:

```tsx
"use client"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Inicio", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Pedidos", icon: ShoppingCart, href: "/orders" },
  { label: "Productos", icon: Package, href: "/products" },
  { label: "Clientes", icon: Users, href: "/clients" },
  { label: "Cajón", icon: Wallet, href: "/cash-register" },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 flex items-center justify-around bg-abyssal-surface border-t border-abyssal-border pb-safe">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors duration-150 cursor-pointer",
              isActive ? "text-abyssal-primary" : "text-abyssal-text-muted"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-label-small font-medium">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Verify layout renders correctly**

Run: `cd web && npm run dev`
Check: TopBar and BottomNav use new tokens

- [ ] **Step 4: Commit**

```bash
git add web/src/components/layout/TopBar.tsx web/src/components/layout/BottomNav.tsx
git commit -m "feat: update layout components with Minimal Pro design"
```

---

## Task 4: Update Dashboard Page

**Files:**
- Modify: `web/src/app/(dashboard)/dashboard/page.tsx`
- Modify: `web/src/components/dashboard/BentoGrid.tsx`
- Modify: `web/src/components/dashboard/StatsCard.tsx`
- Modify: `web/src/components/dashboard/RecentOrdersList.tsx`

**Interfaces:**
- Consumes: Card, StatusBadge from Task 2, TopBar from Task 3
- Produces: Updated dashboard layout

- [ ] **Step 1: Update StatsCard component**

Replace `web/src/components/dashboard/StatsCard.tsx`:

```tsx
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string
  change?: string
  changeType?: "positive" | "negative"
  className?: string
}

export function StatsCard({ icon: Icon, label, value, change, changeType, className }: StatsCardProps) {
  return (
    <div className={cn(
      "rounded-abyssal-md border border-abyssal-border bg-abyssal-surface p-4 shadow-abyssal-sm transition-all duration-150 hover:shadow-abyssal-md",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-abyssal-sm bg-abyssal-primary/10">
          <Icon className="w-5 h-5 text-abyssal-primary" />
        </div>
        {change && (
          <span className={cn(
            "text-label-small font-medium",
            changeType === "positive" ? "text-abyssal-green" : "text-abyssal-red"
          )}>
            {change}
          </span>
        )}
      </div>
      <p className="text-display-large font-bold text-abyssal-text-primary">{value}</p>
      <p className="text-caption text-abyssal-text-secondary mt-1">{label}</p>
    </div>
  )
}
```

- [ ] **Step 2: Update BentoGrid component**

Replace `web/src/components/dashboard/BentoGrid.tsx`:

```tsx
import { DollarSign, TrendingUp, ShoppingCart, Wallet, ArrowRightLeft, AlertTriangle } from "lucide-react"
import { StatsCard } from "./StatsCard"
import { useTransactions } from "@/hooks/useTransactions"

export function BentoGrid() {
  const { data } = useTransactions()
  const summary = data?.summary

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatsCard
        icon={DollarSign}
        label="Ventas Hoy"
        value={summary ? `$${summary.cash_total.toLocaleString()}` : "$0"}
      />
      <StatsCard
        icon={TrendingUp}
        label="Transferencias"
        value={summary ? `$${summary.transfer_total.toLocaleString()}` : "$0"}
      />
      <StatsCard
        icon={ShoppingCart}
        label="Pedidos Pendientes"
        value={summary?.pending_orders?.toString() || "0"}
      />
      <StatsCard
        icon={Wallet}
        label="Caja"
        value={summary ? `$${(summary.cash_total + summary.transfer_total).toLocaleString()}` : "$0"}
      />
    </div>
  )
}
```

- [ ] **Step 3: Update RecentOrdersList component**

Replace `web/src/components/dashboard/RecentOrdersList.tsx`:

```tsx
"use client"
import { useOrders } from "@/hooks/useOrders"
import { StatusBadge } from "@/components/shared/StatusBadge"

export function RecentOrdersList() {
  const { data: orders, loading } = useOrders()

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
        ))}
      </div>
    )
  }

  const recentOrders = orders.slice(0, 5)

  if (recentOrders.length === 0) {
    return (
      <p className="text-center text-body-medium text-abyssal-text-secondary py-8">
        No hay pedidos recientes
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {recentOrders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between p-3 rounded-abyssal-md bg-abyssal-surface border border-abyssal-border hover:bg-abyssal-surface-high transition-colors duration-150 cursor-pointer"
        >
          <div className="flex-1 min-w-0">
            <p className="text-title-medium font-medium text-abyssal-text-primary truncate">
              {order.order_number}
            </p>
            <p className="text-caption text-abyssal-text-secondary">
              {order.client_name} · ${order.total_value.toLocaleString()}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Update Dashboard page**

Replace `web/src/app/(dashboard)/dashboard/page.tsx`:

```tsx
"use client"
import { useAuth } from "@/hooks/useAuth"
import { TopBar } from "@/components/layout/TopBar"
import { BottomNav } from "@/components/layout/BottomNav"
import { BentoGrid } from "@/components/dashboard/BentoGrid"
import { RecentOrdersList } from "@/components/dashboard/RecentOrdersList"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-headline-medium font-semibold text-abyssal-text-primary">
            Hola, {user?.business_name || "Usuario"}
          </h2>
          <p className="text-body-medium text-abyssal-text-secondary">
            Resumen de hoy
          </p>
        </div>

        <BentoGrid />

        <div>
          <h3 className="text-title-large font-semibold text-abyssal-text-primary mb-3">
            Pedidos Recientes
          </h3>
          <RecentOrdersList />
        </div>
      </div>
      <BottomNav />
    </>
  )
}
```

- [ ] **Step 5: Verify dashboard renders correctly**

Run: `cd web && npm run dev`
Check: Dashboard uses new tokens, stats cards render, recent orders display

- [ ] **Step 6: Commit**

```bash
git add web/src/components/dashboard/ web/src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: update dashboard page with Minimal Pro design"
```

---

## Task 5: Update Orders Pages

**Files:**
- Modify: `web/src/app/(dashboard)/orders/page.tsx`
- Modify: `web/src/components/orders/OrderCard.tsx`
- Modify: `web/src/app/(dashboard)/orders/[id]/page.tsx`

**Interfaces:**
- Consumes: Card, StatusBadge, SearchBar, FilterChip from Task 2, TopBar, BottomNav from Task 3
- Produces: Updated orders list and detail pages

- [ ] **Step 1: Update OrderCard component**

Replace `web/src/components/orders/OrderCard.tsx`:

```tsx
"use client"
import { Order } from "@/hooks/useOrders"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"

interface OrderCardProps {
  order: Order
  onPress?: (id: number) => void
  className?: string
}

export function OrderCard({ order, onPress, className }: OrderCardProps) {
  return (
    <div
      onClick={() => onPress?.(order.id)}
      className={cn(
        "p-4 rounded-abyssal-md bg-abyssal-surface border border-abyssal-border hover:bg-abyssal-surface-high transition-all duration-150 cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-title-medium font-semibold text-abyssal-text-primary">
            {order.order_number}
          </p>
          <p className="text-body-medium text-abyssal-text-secondary">
            {order.client_name}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-body-large font-medium text-abyssal-text-primary">
          ${order.total_value.toLocaleString()}
        </p>
        <p className="text-caption text-abyssal-text-secondary">
          {order.items_count} {order.items_count === 1 ? "item" : "items"}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update Orders list page**

Replace `web/src/app/(dashboard)/orders/page.tsx`:

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { BottomNav } from "@/components/layout/BottomNav"
import { OrderFilters } from "@/components/orders/OrderFilters"
import { OrderCard } from "@/components/orders/OrderCard"
import { SearchBar } from "@/components/shared/SearchBar"
import { useOrders } from "@/hooks/useOrders"

export default function OrdersPage() {
  const [filter, setFilter] = useState("Todos")
  const [search, setSearch] = useState("")
  const router = useRouter()

  const statusMap: Record<string, string | undefined> = {
    Todos: undefined,
    Pendientes: "PENDIENTE",
    Entregados: "ENTREGADO",
    Anulados: "ANULADO",
  }

  const apiStatus = statusMap[filter]
  const { data: orders, loading, error } = useOrders(apiStatus)

  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(search.toLowerCase()) ||
    order.client_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <TopBar title="Pedidos" />
      <div className="p-4 space-y-4">
        <OrderFilters selected={filter} onSelect={setFilter} />
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar pedido..." />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-body-medium text-abyssal-red py-8">{error}</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-body-medium text-abyssal-text-secondary py-8">
            No hay pedidos
          </p>
        ) : (
          <div className="space-y-2">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={(id) => router.push(`/orders/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => router.push("/orders/new")}
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-24 right-4 text-abyssal-on-primary shadow-abyssal-lg hover:shadow-abyssal-xl hover:scale-105 transition-all duration-150 z-30 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>
      <BottomNav />
    </>
  )
}
```

- [ ] **Step 3: Update Order detail page**

Replace `web/src/app/(dashboard)/orders/[id]/page.tsx`:

```tsx
"use client"
import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, X } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { useOrder } from "@/hooks/useOrder"

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { order, loading, error, updateStatus } = useOrder(id)

  if (loading) {
    return (
      <>
        <TopBar title="Detalle del Pedido" />
        <div className="p-4 space-y-4">
          <div className="h-40 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
          <div className="h-32 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <TopBar title="Detalle del Pedido" />
        <div className="p-4">
          <p className="text-center text-body-medium text-abyssal-red py-8">
            {error || "Pedido no encontrado"}
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar
        title="Detalle del Pedido"
        rightAction={
          <button
            onClick={() => router.back()}
            className="p-2 rounded-abyssal-full hover:bg-abyssal-surface-overlay transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
          </button>
        }
      />
      <div className="p-4 space-y-4">
        {/* Order Info */}
        <div className="p-4 rounded-abyssal-md bg-abyssal-surface border border-abyssal-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline-medium font-semibold text-abyssal-text-primary">
              {order.order_number}
            </h2>
            <StatusBadge status={order.status} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-body-medium text-abyssal-text-secondary">Cliente</span>
              <span className="text-body-medium font-medium text-abyssal-text-primary">{order.client_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-medium text-abyssal-text-secondary">Total</span>
              <span className="text-body-large font-semibold text-abyssal-text-primary">${order.total_value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-medium text-abyssal-text-secondary">Items</span>
              <span className="text-body-medium text-abyssal-text-primary">{order.items_count}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.status === "PENDIENTE" && (
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => updateStatus("ENTREGADO")}
            >
              <Check className="w-4 h-4 mr-2" />
              Entregar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => updateStatus("ANULADO")}
            >
              <X className="w-4 h-4 mr-2" />
              Anular
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 4: Verify orders pages render correctly**

Run: `cd web && npm run dev`
Check: Orders list shows search, filters, cards. Detail page shows order info and actions.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/\(dashboard\)/orders/ web/src/components/orders/OrderCard.tsx
git commit -m "feat: update orders pages with Minimal Pro design"
```

---

## Task 6: Update Products Pages

**Files:**
- Modify: `web/src/app/(dashboard)/products/page.tsx`
- Modify: `web/src/components/products/ProductCard.tsx`
- Modify: `web/src/components/products/StockBadge.tsx`
- Modify: `web/src/components/products/CategoryFilter.tsx`

**Interfaces:**
- Consumes: Card, SearchBar, FilterChip from Task 2, TopBar, BottomNav from Task 3
- Produces: Updated products list page

- [ ] **Step 1: Update StockBadge component**

Replace `web/src/components/products/StockBadge.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface StockBadgeProps {
  stock: number
  threshold: number
  className?: string
}

export function StockBadge({ stock, threshold, className }: StockBadgeProps) {
  const isLow = stock <= threshold

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-abyssal-full px-2.5 py-1 text-label-small font-medium",
        isLow
          ? "bg-abyssal-yellow/10 text-abyssal-yellow"
          : "bg-abyssal-green/10 text-abyssal-green",
        className
      )}
    >
      {isLow ? "Stock Bajo" : "Normal"}
    </span>
  )
}
```

- [ ] **Step 2: Update ProductCard component**

Replace `web/src/components/products/ProductCard.tsx`:

```tsx
"use client"
import { Product } from "@/hooks/useProducts"
import { StockBadge } from "./StockBadge"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onPress?: (id: number) => void
  className?: string
}

export function ProductCard({ product, onPress, className }: ProductCardProps) {
  return (
    <div
      onClick={() => onPress?.(product.id)}
      className={cn(
        "p-4 rounded-abyssal-md bg-abyssal-surface border border-abyssal-border hover:bg-abyssal-surface-high transition-all duration-150 cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-title-medium font-semibold text-abyssal-text-primary truncate">
            {product.name}
          </p>
          <p className="text-body-large font-medium text-abyssal-text-primary">
            ${product.price.toLocaleString()}/{product.unit}
          </p>
        </div>
        <StockBadge stock={product.stock} threshold={product.low_stock_threshold} />
      </div>
      <p className="text-caption text-abyssal-text-secondary">
        Stock: {product.stock} {product.unit}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Update Products list page**

Replace `web/src/app/(dashboard)/products/page.tsx`:

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { BottomNav } from "@/components/layout/BottomNav"
import { ProductCard } from "@/components/products/ProductCard"
import { SearchBar } from "@/components/shared/SearchBar"
import { FilterChip } from "@/components/shared/FilterChip"
import { useProducts } from "@/hooks/useProducts"

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todos")
  const router = useRouter()
  const { data: products, loading, categories } = useProducts()

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "Todos" || product.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <TopBar title="Productos" />
      <div className="p-4 space-y-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." />

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <FilterChip
            label="Todos"
            selected={category === "Todos"}
            onClick={() => setCategory("Todos")}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              selected={category === cat}
              onClick={() => setCategory(cat)}
            />
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-body-medium text-abyssal-text-secondary py-8">
            No hay productos
          </p>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={(id) => router.push(`/products/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => router.push("/products/new")}
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-24 right-4 text-abyssal-on-primary shadow-abyssal-lg hover:shadow-abyssal-xl hover:scale-105 transition-all duration-150 z-30 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>
      <BottomNav />
    </>
  )
}
```

- [ ] **Step 4: Verify products page renders correctly**

Run: `cd web && npm run dev`
Check: Products list shows search, category filter, cards with stock badges

- [ ] **Step 5: Commit**

```bash
git add web/src/app/\(dashboard\)/products/ web/src/components/products/
git commit -m "feat: update products page with Minimal Pro design"
```

---

## Task 7: Update Clients Pages (Fix Critical Inconsistency)

**Files:**
- Modify: `web/src/app/(dashboard)/clients/page.tsx`
- Modify: `web/src/components/clients/ClientCard.tsx`
- Modify: `web/src/app/(dashboard)/clients/[id]/page.tsx` (MAJOR FIX)

**Interfaces:**
- Consumes: Card, SearchBar from Task 2, TopBar, BottomNav from Task 3
- Produces: Consistent clients pages with fixed detail page

- [ ] **Step 1: Update ClientCard component**

Replace `web/src/components/clients/ClientCard.tsx`:

```tsx
"use client"
import { cn } from "@/lib/utils"

interface ClientCardProps {
  client: {
    id: number
    name: string
    balance: number
    order_count?: number
  }
  onPress?: (id: number) => void
  className?: string
}

export function ClientCard({ client, onPress, className }: ClientCardProps) {
  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      onClick={() => onPress?.(client.id)}
      className={cn(
        "flex items-center gap-4 p-4 rounded-abyssal-md bg-abyssal-surface border border-abyssal-border hover:bg-abyssal-surface-high transition-all duration-150 cursor-pointer",
        className
      )}
    >
      <div className="w-10 h-10 rounded-abyssal-full bg-abyssal-primary/10 flex items-center justify-center">
        <span className="text-title-medium font-semibold text-abyssal-primary">
          {initials}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-title-medium font-semibold text-abyssal-text-primary truncate">
          {client.name}
        </p>
        <p className="text-caption text-abyssal-text-secondary">
          ${client.balance.toLocaleString()} saldo
          {client.order_count !== undefined && ` · ${client.order_count} pedidos`}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update Clients list page**

Replace `web/src/app/(dashboard)/clients/page.tsx`:

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { BottomNav } from "@/components/layout/BottomNav"
import { ClientCard } from "@/components/clients/ClientCard"
import { SearchBar } from "@/components/shared/SearchBar"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useClients } from "@/hooks/useClients"

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const router = useRouter()
  const { data: clients, loading, addClient } = useClients()

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <TopBar title="Clientes" />
      <div className="p-4 space-y-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar cliente..." />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <p className="text-center text-body-medium text-abyssal-text-secondary py-8">
            No hay clientes
          </p>
        ) : (
          <div className="space-y-2">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onPress={(id) => router.push(`/clients/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => setShowAddDialog(true)}
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-24 right-4 text-abyssal-on-primary shadow-abyssal-lg hover:shadow-abyssal-xl hover:scale-105 transition-all duration-150 z-30 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>
      <BottomNav />

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <div className="p-6 space-y-4">
          <h2 className="text-headline-medium font-semibold text-abyssal-text-primary">
            Nuevo Cliente
          </h2>
          <Input label="Nombre" placeholder="Nombre del cliente" />
          <Input label="Teléfono" placeholder="Teléfono" type="tel" />
          <Input label="Email" placeholder="Email" type="email" />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1">
              Guardar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 3: Update Client detail page (MAJOR FIX)**

Replace `web/src/app/(dashboard)/clients/[id]/page.tsx`:

```tsx
"use client"
import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, DollarSign, ShoppingCart } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { BottomNav } from "@/components/layout/BottomNav"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { useClient } from "@/hooks/useClient"

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { client, loading, error, orders } = useClient(id)

  if (loading) {
    return (
      <>
        <TopBar title="Detalle del Cliente" />
        <div className="p-4 space-y-4">
          <div className="h-32 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
          <div className="h-48 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
        </div>
      </>
    )
  }

  if (error || !client) {
    return (
      <>
        <TopBar title="Detalle del Cliente" />
        <div className="p-4">
          <p className="text-center text-body-medium text-abyssal-red py-8">
            {error || "Cliente no encontrado"}
          </p>
        </div>
      </>
    )
  }

  const initials = client.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <TopBar
        title="Detalle del Cliente"
        rightAction={
          <button
            onClick={() => router.back()}
            className="p-2 rounded-abyssal-full hover:bg-abyssal-surface-overlay transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
          </button>
        }
      />
      <div className="p-4 space-y-4">
        {/* Client Info */}
        <div className="p-4 rounded-abyssal-md bg-abyssal-surface border border-abyssal-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-abyssal-full bg-abyssal-primary/10 flex items-center justify-center">
              <span className="text-title-large font-semibold text-abyssal-primary">
                {initials}
              </span>
            </div>
            <div>
              <h2 className="text-headline-medium font-semibold text-abyssal-text-primary">
                {client.name}
              </h2>
              <p className="text-body-medium text-abyssal-text-secondary">
                {client.email || "Sin email"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-abyssal-sm bg-abyssal-surface-overlay">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-abyssal-primary" />
                <span className="text-caption text-abyssal-text-secondary">Saldo</span>
              </div>
              <p className="text-title-large font-semibold text-abyssal-text-primary">
                ${client.balance.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-abyssal-sm bg-abyssal-surface-overlay">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="w-4 h-4 text-abyssal-primary" />
                <span className="text-caption text-abyssal-text-secondary">Pedidos</span>
              </div>
              <p className="text-title-large font-semibold text-abyssal-text-primary">
                {orders?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <h3 className="text-title-large font-semibold text-abyssal-text-primary mb-3">
            Pedidos Recientes
          </h3>
          {orders && orders.length > 0 ? (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-abyssal-md bg-abyssal-surface border border-abyssal-border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-title-medium font-medium text-abyssal-text-primary">
                        {order.order_number}
                      </p>
                      <p className="text-caption text-abyssal-text-secondary">
                        ${order.total_value.toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-body-medium text-abyssal-text-secondary py-8">
              No hay pedidos
            </p>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  )
}
```

- [ ] **Step 4: Verify clients pages render correctly**

Run: `cd web && npm run dev`
Check: Clients list shows avatars, detail page uses abyssal tokens (not hardcoded colors)

- [ ] **Step 5: Commit**

```bash
git add web/src/app/\(dashboard\)/clients/ web/src/components/clients/
git commit -m "feat: update clients pages and fix critical design inconsistency"
```

---

## Task 8: Update Login Page

**Files:**
- Modify: `web/src/app/login/page.tsx`

**Interfaces:**
- Consumes: Input, Button from Task 2
- Produces: Updated login page

- [ ] **Step 1: Update Login page**

Replace `web/src/app/login/page.tsx`:

```tsx
"use client"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(businessName, ownerName, email, password)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-abyssal-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-display-large font-bold text-abyssal-text-primary">
            Pescadería
          </h1>
          <p className="text-body-medium text-abyssal-text-secondary mt-2">
            {isLogin ? "Inicia sesión en tu cuenta" : "Crea tu cuenta"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <Input
                label="Nombre del Negocio"
                placeholder="Mi Pescadería"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
              <Input
                label="Tu Nombre"
                placeholder="Juan Pérez"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
            </>
          )}
          <Input
            label="Email"
            placeholder="correo@ejemplo.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-body-medium text-abyssal-red text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </Button>
        </form>

        <p className="text-center text-body-medium text-abyssal-text-secondary">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-abyssal-primary font-medium hover:underline cursor-pointer"
          >
            {isLogin ? "Regístrate" : "Inicia Sesión"}
          </button>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify login page renders correctly**

Run: `cd web && npm run dev`
Check: Login form uses new tokens, toggle between login/register works

- [ ] **Step 3: Commit**

```bash
git add web/src/app/login/page.tsx
git commit -m "feat: update login page with Minimal Pro design"
```

---

## Task 9: Final Verification

**Files:** None (verification only)

**Interfaces:**
- Consumes: All tasks above
- Produces: Verified, working application

- [ ] **Step 1: Run build to check for errors**

Run: `cd web && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Test all pages in browser**

Navigate to each page and verify:
- [ ] Dashboard: Stats render, recent orders show
- [ ] Orders: List loads, search works, filters work, detail page works
- [ ] Products: List loads, search works, category filter works
- [ ] Clients: List loads with avatars, detail page uses tokens (not hardcoded colors)
- [ ] Login: Form works, toggle between login/register works

- [ ] **Step 3: Test dark mode**

Click ThemeToggle and verify all pages render correctly in dark mode

- [ ] **Step 4: Test responsive layout**

Resize browser to 375px, 768px, 1024px and verify layout adapts

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete UI/UX redesign to Minimal Pro theme"
```

---

**Plan Version:** 1.0
**Date:** 2026-07-17
**Estimated Tasks:** 9
**Dependencies:** Task 1 → Task 2 → Task 3 → Tasks 4-8 (parallel) → Task 9
