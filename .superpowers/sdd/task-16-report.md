# Task 16: Web — Clients, Suppliers, Cash Register

## Status: Complete

## Commit
`a551363` - `feat(web): add clients, suppliers and cash register screens`

## Files Created (10)
| File | Purpose |
|------|---------|
| `web/src/components/clients/ClientCard.tsx` | Client row with initials circle, name, phone, color-coded balance |
| `web/src/components/clients/ClientStats.tsx` | 2-column stat grid (total clients / total balance) |
| `web/src/app/(dashboard)/clients/page.tsx` | Clients list page with SearchBar, FAB, add/detail dialogs |
| `web/src/components/suppliers/SupplierCard.tsx` | Supplier row with image/placeholder, category, payment, StatusBadge |
| `web/src/app/(dashboard)/suppliers/page.tsx` | Suppliers list page with SearchBar, FAB, add dialog |
| `web/src/components/cash-register/DaySummaryCard.tsx` | Prominent total-sales card (primary bg) |
| `web/src/components/cash-register/CashBentoGrid.tsx` | 2x2 grid: Efectivo, Tarjeta, Gastos, Balance Neto |
| `web/src/components/cash-register/TransactionRow.tsx` | Transaction row with income/expense icons and color coding |
| `web/src/components/cash-register/PinModal.tsx` | PIN entry dialog with masked dots + numpad |
| `web/src/app/(dashboard)/cash-register/page.tsx` | Cash register page with summary, grid, transactions, close-day flow |

## Build Verification
- `npx next build` passed successfully
- All 6 new routes compiled: `/clients`, `/suppliers`, `/cash-register`
- No TypeScript errors, no lint warnings

## Notes
- All components use existing Abyssal theme tokens (`bg-abyssal-surface`, `text-abyssal-primary`, `rounded-abyssal-sm`, etc.)
- Data fetching uses `api.get()` directly in `useEffect` + `useState` per brief instructions
- UI primitives reused: `Dialog`, `Button`, `Input`, `SearchBar`, `StatusBadge`
- `cn()` from `@/lib/utils` used where applicable
- All pages under `(dashboard)` layout (with `AuthGuard`, `BottomNav`)
