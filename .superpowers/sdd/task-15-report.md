# Task 15: Web — Orders List + New Order

**Status:** ✅ Complete

**Files created (9):**
- `web/src/components/orders/OrderCard.tsx`
- `web/src/components/orders/OrderFilters.tsx`
- `web/src/components/orders/ClientSelector.tsx`
- `web/src/components/orders/ProductPicker.tsx`
- `web/src/components/orders/PaymentMethodSelector.tsx`
- `web/src/components/orders/CheckoutSummary.tsx`
- `web/src/components/orders/SuccessOverlay.tsx`
- `web/src/app/(dashboard)/orders/page.tsx`
- `web/src/app/(dashboard)/orders/new/page.tsx`

**Commit:** `de67124` — `feat(web): add orders list and new order screens`

**Build verification:** ✅ `npx next build` — compiled successfully, no errors

**Notes:**
- All components use Abyssal theme tokens and `cn()` utility
- Order list page: filter chips, order cards, FAB for new order
- New order page: ClientSelector (fetches `/clients`), ProductPicker (fetches `/products`), PaymentMethodSelector, delivery date input, CheckoutSummary with 10% IVA calculation, POST to `/orders`, SuccessOverlay
- No concerns
