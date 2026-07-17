# Task 5 Report: Crear hook useClient para frontend

## What I Implemented
Created `web/src/hooks/useClient.ts` — a React hook that fetches client detail from the backend API using the existing axios client.

The hook:
- Uses `"use client"` directive (matches existing pattern in `useOrders.ts`)
- Exports `ClientDetail` interface with all specified fields
- `useClient(id)` accepts a string ID (or null) and returns `{ client, loading, error, refetch }`
- Follows identical pattern to `useOrders.ts` (useState/useCallback/useEffect)
- Gracefully handles null ID by returning early

## TypeScript Verification
- `npx tsc --noEmit` (full project): **passed, no errors**
- Single-file check (`tsc --noEmit src/hooks/useClient.ts`) fails on path alias — expected since path aliases require full tsconfig resolution

## Commit
- `58f9a10` — `feat: add useClient hook for client detail`

## Files Changed
- `web/src/hooks/useClient.ts` (created)

## Self-Review
- ✅ Follows established `useOrders.ts` pattern exactly
- ✅ Same naming conventions, same error handling style
- ✅ Interface fields match task brief exactly
- ✅ No overbuilding — matches spec precisely
- ✅ TypeScript compiles cleanly
