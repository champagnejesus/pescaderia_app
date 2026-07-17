## Task 6: Crear hook useClientOrders para frontend

**Status:** DONE

### What I implemented
Created `web/src/hooks/useClientOrders.ts` — a React hook that fetches orders for a specific client from the backend API. Follows the same pattern as `useClient.ts` and `useOrders.ts`:
- Accepts `clientId` (string | null) and optional `limit` (default 5)
- Returns `{ orders, loading, error, refetch }`
- Uses `count` (not `total`) in the API response type per Task 4 fix
- Early-returns when `clientId` is null
- Handles loading/error states and provides refetch capability

### What I tested
- `npx tsc --noEmit` — **0 errors** (full project TypeScript check passes)

### Files changed
- Created: `web/src/hooks/useClientOrders.ts`

### Commit
- `65fe916` — `feat: add useClientOrders hook for client orders`

### Self-review findings
- Hook closely follows `useClient.ts` pattern (null guard, loading state, try/catch/finally, refetch)
- Interface `ClientOrder` matches the fields returned by the `/clients/{id}/orders` endpoint
- No overengineering — just the hook as specified

### Concerns
None.
