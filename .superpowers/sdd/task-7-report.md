## Task 7: Convertir page.tsx a Client Component con datos reales

### What was implemented

Replaced the static Server Component in `web/src/app/(dashboard)/clients/[id]/page.tsx` with a dynamic Client Component that:

- Fetches client data via `useClient(id)` hook
- Fetches client orders via `useClientOrders(id)` hook
- Uses `useParams()` and `useRouter()` from Next.js navigation
- Displays dynamic: client name, balance, credit limit, phone, email, address
- Renders real orders with status badges (ENTREGADO, PENDIENTE, CANCELADO)
- Action buttons: Llamar (`tel:`), WhatsApp (`wa.me`), Pedido (navigation to `/orders/new`)
- Map link to Google Maps
- Loading states (spinner for client, skeleton for orders)
- Error state with link back to clients list
- Empty state when no orders exist

### What was tested

- TypeScript compilation: `npx tsc --noEmit` — no errors
- Dev server starts cleanly without errors

### Files changed

- `web/src/app/(dashboard)/clients/[id]/page.tsx` — 131 insertions, 67 deletions

### Self-review findings

No concerns. The implementation matches the task brief exactly, hooks are properly consumed, and all UI states (loading, error, empty, data) are handled correctly.

### Commits

- `379fb94` — feat: implement client detail page with real data
