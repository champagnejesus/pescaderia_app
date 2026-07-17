# Task 13: Web — Dashboard Screen

**Status:** ✅ Complete

## Files Created
- `web/src/hooks/useProducts.ts` — fetches `/products`, returns data, categories, lowStockCount, loading, error, refetch
- `web/src/hooks/useOrders.ts` — fetches `/orders` with optional status filter, returns data, loading, error, refetch
- `web/src/hooks/useTransactions.ts` — fetches `/transactions/daily-summary`, returns DailySummary | null, loading, error, refetch
- `web/src/hooks/useTheme.ts` — re-exports `useThemeStore` as `useTheme`
- `web/src/components/dashboard/SparklineChart.tsx` — recharts sparkline (verbatim from brief)
- `web/src/components/dashboard/StatsCard.tsx` — icon, label, value, optional sparkline
- `web/src/components/dashboard/BentoGrid.tsx` — 2x2 grid (6 stats cards) using DashboardResponse
- `web/src/components/dashboard/RecentOrdersList.tsx` — last 5 orders with StatusBadge, total, date
- `web/src/app/(dashboard)/dashboard/page.tsx` — main dashboard: TopBar("Resumen"), gross profit sparkline card, BentoGrid, RecentOrdersList, action buttons

## Build Verification
- `npx next build` — ✅ Compiled successfully, all pages generated

## Commits
- `7ff7c27` — `feat(web): add dashboard screen with stats and charts`

## Concerns
- `transfer_total` in BentoGrid uses `summary.card_total` from daily-summary (only card data available) — the backend reports endpoint has a proper `transfer_total` but the dashboard page uses the daily-summary endpoint. Matches the spec as written.
- No sparkline data from API — used generated mock data for the gross profit sparkline chart.
