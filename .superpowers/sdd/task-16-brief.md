### Task 16: Web — Clients, Suppliers, Cash Register

**Files:**
- `web/src/components/clients/ClientCard.tsx`
- `web/src/components/clients/ClientStats.tsx`
- `web/src/app/(dashboard)/clients/page.tsx`
- `web/src/components/suppliers/SupplierCard.tsx`
- `web/src/app/(dashboard)/suppliers/page.tsx`
- `web/src/components/cash-register/DaySummaryCard.tsx`
- `web/src/components/cash-register/CashBentoGrid.tsx`
- `web/src/components/cash-register/TransactionRow.tsx`
- `web/src/components/cash-register/PinModal.tsx`
- `web/src/app/(dashboard)/cash-register/page.tsx`

**All components use Abyssal theme tokens.**

**Clients:**

`ClientCard.tsx`:
- Client row: circle with initials, name, phone, outstanding balance
- `flex items-center gap-3 p-3 bg-abyssal-surface rounded-abyssal-sm`
- Outstanding balance in red if > 0, green if 0
- Props: `client: { id, name, initials, phone, email, outstanding_balance, credit_limit }`, `onPress: (id: number) => void`

`ClientStats.tsx`:
- Two stat cards: total clients and total outstanding balance
- Props: `totalClients: number`, `totalBalance: number`

`clients/page.tsx`:
- "use client"
- TopBar "Clientes"
- ClientStats at top
- SearchBar for filtering
- Scrollable list of ClientCards
- FAB with Plus icon to add client
- Add client dialog (Dialog with name, phone, email fields + save button that POSTs to `/clients`)
- Tap card: show dialog with full client info + adjust balance option

**Suppliers:**

`SupplierCard.tsx`:
- Supplier row: image/placeholder, name, category, pending payment, status badge
- Props: `supplier: { id, name, category, pending_payment, status, image_url }`, `onPress: (id) => void`

`suppliers/page.tsx`:
- "use client"
- TopBar "Proveedores"
- SearchBar
- List of SupplierCards
- FAB to add supplier (Dialog with name, category fields + POST to `/suppliers`)

**Cash Register (Cierre de Caja):**

`DaySummaryCard.tsx`:
- A prominent card showing total sales for today
- `bg-abyssal-primary text-abyssal-on-primary rounded-abyssal-md p-6 text-center`
- Large number for total, smaller label "Total del Día"
- Props: `totalSales: number`

`CashBentoGrid.tsx`:
- 2x2 grid showing: Efectivo, Tarjeta, Gastos, Balance Neto
- Each cell with icon, label, amount
- Props: `data: DailySummaryResponse`

`TransactionRow.tsx`:
- A single transaction row: title, time, type icon, amount
- Income (amount > 0): green text, expense (amount < 0): red text
- Props: `transaction: { id, title, time, type, amount, status }`

`PinModal.tsx`:
- Dialog overlay with PIN input (4 digits, masked)
- Number pad (1-9, 0, delete) grid
- Title: "Ingrese PIN de Seguridad"
- Props: `open: boolean`, `onClose: () => void`, `onConfirm: (pin: string) => void`

`cash-register/page.tsx`:
- "use client"
- TopBar "Cierre de Caja"
- DaySummaryCard at top
- CashBentoGrid
- List of today's TransactionRows
- "Cerrar Día" button: opens PinModal
- On PIN confirm: POST to close day (or just show closing animation)
- Fetches data from `/transactions/daily-summary` and `/transactions`

Commit:
```bash
git add web/src/components/clients/ web/src/components/suppliers/ web/src/components/cash-register/ web/src/app/\(dashboard\)/clients/ web/src/app/\(dashboard\)/suppliers/ web/src/app/\(dashboard\)/cash-register/
git commit -m "feat(web): add clients, suppliers and cash register screens"
```
