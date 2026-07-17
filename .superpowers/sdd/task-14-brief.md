### Task 14: Web — Products List + Product Detail

**Files:**
- `web/src/components/products/ProductCard.tsx`
- `web/src/components/products/CategoryFilter.tsx`
- `web/src/components/products/ProductSearchBar.tsx`
- `web/src/components/products/StockBadge.tsx`
- `web/src/app/(dashboard)/products/page.tsx`
- `web/src/app/(dashboard)/products/[id]/page.tsx`

**Components:**

`ProductCard.tsx`:
- Shows product row: image (or placeholder circle with initial), name, category, stock+unit, price
- `flex items-center gap-3 p-3 bg-abyssal-surface rounded-abyssal-sm`
- Stock in color: green if > threshold, yellow if low, red if 0
- Props: `product: { id, name, category, stock, unit, price, image_url, low_stock_threshold, is_extra_quality }`, `onPress: (id: number) => void`

`CategoryFilter.tsx`:
- Horizontal scrollable row of FilterChip components
- Always includes "TODOS" as first option
- Props: `categories: string[]`, `selected: string`, `onSelect: (cat: string) => void`

`ProductSearchBar.tsx`:
- Wrapper around SearchBar component with a debounce (300ms)
- Props: `value: string`, `onChange: (v: string) => void`

`StockBadge.tsx`:
- Small colored badge showing stock level
- `bg-abyssal-green-bg text-abyssal-green` if stock > threshold
- `bg-abyssal-yellow-bg text-abyssal-yellow` if stock > 0 but <= threshold
- `bg-abyssal-red-bg text-abyssal-red` if stock === 0
- Props: `stock: number`, `threshold: number`

**Products List Page (`products/page.tsx`)**:
- "use client"
- TopBar "Productos"
- ProductSearchBar + CategoryFilter
- FlatList-style scrollable list of ProductCards
- Tap card navigates to `/products/{id}`
- FAB button (floating action button, `bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4`) with Plus icon to add product
- Uses `useProducts()` hook

**Product Detail Page (`products/[id]/page.tsx`)**:
- "use client"
- Gets `id` from `useParams()`
- Fetches single product via `api.get("/products/{id}")`
- Hero image area (placeholder with gradient if no image)
- Product name, category chip, extra quality badge, price, stock
- Stock/Price grid: two cards side by side
- Price trend bar chart (simple recharts BarChart showing 7 days of dummy data)
- Low stock threshold display
- Stock adjustment section with input + button
- Back button in TopBar
- Edit button (pencil icon) in TopBar

Commit:
```bash
git add web/src/components/products/ web/src/app/\(dashboard\)/products/
git commit -m "feat(web): add products list and detail screens"
```
