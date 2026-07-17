### Task 13: Web — Dashboard Screen

**Files to create:**
- `web/src/hooks/useProducts.ts`
- `web/src/hooks/useOrders.ts`
- `web/src/hooks/useTransactions.ts`
- `web/src/hooks/useTheme.ts`
- `web/src/components/dashboard/SparklineChart.tsx`
- `web/src/components/dashboard/StatsCard.tsx`
- `web/src/components/dashboard/BentoGrid.tsx`
- `web/src/components/dashboard/RecentOrdersList.tsx`
- `web/src/app/(dashboard)/dashboard/page.tsx`

**Context:** Use the Abyssal theme tokens, existing UI components (Card, Button), and layout. API client at `@/lib/api`.

**Data hooks** — Each hook fetches data from API and returns `{ data, loading, error, refetch }`:
- `useProducts()`: GET `/products` → returns product list, categories, low stock count
- `useOrders()`: GET `/orders` → returns order list with status filtering
- `useTransactions()`: GET `/transactions/daily-summary` → returns DailySummaryResponse
- `useTheme()`: simple re-export of `useThemeStore` for convenience

**Components:**

`SparklineChart.tsx`:
```tsx
"use client"
import { LineChart, Line, ResponsiveContainer } from "recharts"
interface Props { data: { value: number }[]; color?: string }
export function SparklineChart({ data, color = "#30D158" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

`StatsCard.tsx`:
- A Card component displaying: icon (left), label, value, optional sparkline
- `bg-abyssal-surface rounded-abyssal-md p-4 flex items-center gap-4`
- Icon in `text-abyssal-primary` circle bg
- Props: `icon: React.ReactNode`, `label: string`, `value: string | number`, `sparklineData?: { value: number }[]`

`BentoGrid.tsx`:
- A 2x2 or 3x2 grid of stats cards (gross profit, sales, purchases, cash, transfers, pending/low stock counts)
- Grid layout: `grid grid-cols-2 gap-3`
- Props: `data: DashboardResponse` from the API

`RecentOrdersList.tsx`:
- A list of recent orders (last 5) with client name, status badge, total, date
- Each row: `flex items-center justify-between p-3 border-b border-abyssal-outline`
- Uses StatusBadge component
- Props: `orders: any[]`

`dashboard/page.tsx`:
- "use client"
- Fetches data from all hooks on mount
- Shows TopBar with "Resumen" title
- SparklineCard with gross profit and sparkline at top
- BentoGrid with all stats
- RecentOrdersList
- Two action buttons at bottom: "Nuevo Pedido" link to /orders/new, "Nueva Venta" link to /cash-register
- Layout: `p-4 space-y-4`

Commit:
```bash
git add web/src/hooks/ web/src/components/dashboard/ web/src/app/\(dashboard\)/dashboard/
git commit -m "feat(web): add dashboard screen with stats and charts"
```
