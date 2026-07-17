# Web App Audit & Fixes

## Issues Found and Fixed

### 1. Duplicate TopBar in Dashboard Layout
- **File**: `web/src/app/(dashboard)/layout.tsx`
- **Issue**: Layout rendered `<TopBar>` AND every child page also rendered its own `<TopBar>`, creating two stacked headers.
- **Fix**: Removed `<TopBar>` from layout. Also removed duplicate horizontal padding (`px-4 pt-4`) since each page already has `p-4`.

### 2. Missing Route: `orders/[id]/page.tsx`
- **Files**: `web/src/app/(dashboard)/orders/page.tsx` (line 45), `web/src/app/(dashboard)/orders/new/page.tsx` (line 125)
- **Issue**: Clicking an order card or viewing a newly created order navigated to `/orders/:id` which did not exist.
- **Fix**: Created `web/src/app/(dashboard)/orders/[id]/page.tsx` — a full order detail page showing order info, items, totals, payment method, and status change actions (mark as delivered/cancel).

### 3. New Order Navigation Used `order_number` Instead of Numeric `id`
- **File**: `web/src/app/(dashboard)/orders/new/page.tsx` (line 112-125)
- **Issue**: After creating an order, the success overlay navigated to `/orders/${successOrder.order_number}` (string like "ORD-001") instead of using the numeric `id`. The `successOrder` state only captured `order_number`.
- **Fix**: Updated `successOrder` type to include `id: number`, captured `data.id` from the API response, and changed navigation to use `successOrder.id`.

### 4. Empty Catch Blocks Silently Swallowed Errors
- **File**: `web/src/app/(dashboard)/products/[id]/page.tsx` (lines 32, 131)
- **Issue**: The product fetch `useEffect` had `catch(() => {})` and the stock adjustment button had `catch {}` — both silently swallowed errors.
- **Fix**: Changed product fetch catch to `setProduct(null)` (triggers "Producto no encontrado" UI), and stock adjustment catch to `alert("Error al actualizar stock")`.

### 5. Recent Orders Not Clickable
- **File**: `web/src/components/dashboard/RecentOrdersList.tsx` (line 39-62), `web/src/app/(dashboard)/dashboard/page.tsx` (line 58)
- **Issue**: Recent orders on the dashboard were rendered as `<div>` elements with no click handler, making it impossible to navigate to order details.
- **Fix**: Added optional `onPress` prop to `RecentOrdersList`, changed items to `<button>` elements with `onClick={() => onPress?.(order.id)}`, and passed the handler from `DashboardPage` via `router.push`.

## Files Modified
1. `web/src/app/(dashboard)/layout.tsx` — Removed duplicate TopBar, fixed padding
2. `web/src/app/(dashboard)/products/[id]/page.tsx` — Fixed error handling, removed special chars
3. `web/src/app/(dashboard)/orders/new/page.tsx` — Fixed navigation to use numeric ID
4. `web/src/app/(dashboard)/dashboard/page.tsx` — Added useRouter + pass onPress to RecentOrdersList
5. `web/src/components/dashboard/RecentOrdersList.tsx` — Made items clickable with navigation
6. `web/src/app/(dashboard)/orders/[id]/page.tsx` — **NEW** Order detail page

## Verification
- `npm run build` — **PASSES** with no errors or warnings
- All 13 routes compile successfully
- Route list: `/`, `/login`, `/dashboard`, `/products`, `/products/[id]`, `/products/[id]/edit`, `/products/new`, `/orders`, `/orders/[id]`, `/orders/new`, `/clients`, `/suppliers`, `/cash-register`
