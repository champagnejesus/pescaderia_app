# Task 6 Report: Update Products Pages

**Status:** DONE

## Changes Made

### Files Modified
1. `web/src/components/products/StockBadge.tsx`
   - Simplified to show "Stock Bajo" / "Normal" text instead of stock number
   - Removed "use client" directive (no longer needed)
   - Added optional `className` prop
   - Uses `rounded-abyssal-full` for pill shape with opacity-based colors

2. `web/src/components/products/ProductCard.tsx`
   - Simplified layout removing image/avatar section
   - Imports `Product` type from `@/hooks/useProducts`
   - Added border and shadow styling
   - Added `className` prop and optional `onPress`
   - Uses `transition-all duration-150` per requirements

3. `web/src/app/(dashboard)/products/page.tsx`
   - Replaced `ProductSearchBar` and `CategoryFilter` with `SearchBar` and `FilterChip`
   - Added `BottomNav` component
   - Improved loading skeleton with animated pulse placeholders
   - Updated FAB styling with scale animation and proper spacing

## Commit
```
ff0862f feat: update products page with Minimal Pro design
```

## Concerns
- None. All changes use abyssal-* tokens as required.
