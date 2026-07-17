### Task 15: Web — Orders List + New Order

**Files:**
- `web/src/components/orders/OrderCard.tsx`
- `web/src/components/orders/OrderFilters.tsx`
- `web/src/components/orders/ClientSelector.tsx`
- `web/src/components/orders/ProductPicker.tsx`
- `web/src/components/orders/PaymentMethodSelector.tsx`
- `web/src/components/orders/CheckoutSummary.tsx`
- `web/src/components/orders/SuccessOverlay.tsx`
- `web/src/app/(dashboard)/orders/page.tsx`
- `web/src/app/(dashboard)/orders/new/page.tsx`

**Design guide — all components use Abyssal theme tokens:**

`OrderCard.tsx`:
- Order row: order number, client name, status badge, total, date
- `bg-abyssal-surface rounded-abyssal-sm p-3 flex items-center justify-between`
- Props: `order: { id, order_number, client_name, status, total_value, created_at }`, `onPress: (id) => void`

`OrderFilters.tsx`:
- Horizontal row of FilterChip: "Todos", "Pendientes", "Entregados", "Anulados"
- Props: `selected: string`, `onSelect: (s: string) => void`

`ClientSelector.tsx`:
- Search input to filter clients + scrollable list
- Each client shown as circle with initials + name
- Selected client highlighted with `border-abyssal-primary`
- Props: `clients: any[]`, `selectedId: number | null`, `onSelect: (client: any) => void`, `onSearch: (q: string) => void`

`ProductPicker.tsx`:
- Search bar + list of products with add button
- Each product row: name, stock, price, `+` button
- Selected products shown below with quantity controls (+/-)
- Props: `products: any[]`, `selected: any[]`, `onAdd: (product: any) => void`, `onUpdateQty: (productId: number, qty: number) => void`, `onSearch: (q: string) => void`

`PaymentMethodSelector.tsx`:
- Two toggle buttons: "Efectivo" and "Tarjeta"
- Selected: `bg-abyssal-primary text-abyssal-on-primary`
- Unselected: `bg-abyssal-surface-high text-abyssal-text-secondary`
- Props: `value: string`, `onChange: (v: string) => void`

`CheckoutSummary.tsx`:
- Shows subtotal (sum of items), 10% tax, total
- Items list with product name, qty, unit price, subtotal
- Bottom section: Payment method badge, "Realizar Pedido" button
- Props: `items: any[]`, `paymentMethod: string`, `onSubmit: () => void`, `loading: boolean`

`SuccessOverlay.tsx`:
- Full screen overlay with checkmark animation
- "¡Pedido Creado!" title
- Order number displayed
- "Ver Pedido" and "Volver" buttons
- Props: `open: boolean`, `order: { order_number: string } | null`, `onView: () => void`, `onClose: () => void`

**Orders List Page (`orders/page.tsx`)**:
- "use client"
- TopBar "Pedidos"
- OrderFilters
- List of OrderCards
- FAB button to create new order (navigates to `/orders/new`)

**New Order Page (`orders/new/page.tsx`)**:
- "use client"
- Multi-step / single-page form:
  1. ClientSelector (fetch clients from `/clients`)
  2. ProductPicker (fetch products from `/products`)
  3. PaymentMethodSelector
  4. Delivery date input
  5. CheckoutSummary
- On submit: POST `/orders` with order data
- On success: show SuccessOverlay
- Back button via router

Commit:
```bash
git add web/src/components/orders/ web/src/app/\(dashboard\)/orders/
git commit -m "feat(web): add orders list and new order screens"
```
