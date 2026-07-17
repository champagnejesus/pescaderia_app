# Task 14: Web — Products List + Product Detail

## Status: Complete

## Files Created
- `web/src/components/products/StockBadge.tsx` — colored badge for stock level (green/yellow/red)
- `web/src/components/products/CategoryFilter.tsx` — horizontal scrollable FilterChip row with "TODOS" first
- `web/src/components/products/ProductSearchBar.tsx` — SearchBar wrapper with 300ms debounce
- `web/src/components/products/ProductCard.tsx` — product row with image placeholder, stock badge, price
- `web/src/app/(dashboard)/products/page.tsx` — products list with search, filter, FAB
- `web/src/app/(dashboard)/products/[id]/page.tsx` — product detail with hero image, price/stock grid, recharts bar chart, stock adjustment

## Build Verification
- `npx next build` — compiled successfully, no errors
- Routes: `/products` (static), `/products/[id]` (dynamic)

## Commit
`979882c` — `feat(web): add products list and detail screens`

## Concerns
- None
