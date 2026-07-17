# Task 5 Fix Report: Loading state stuck when id is null

## What was fixed
In `web/src/hooks/useClient.ts:22`, when `id` was `null`, the `fetchClient` callback returned early without setting `loading` to `false`. Since `loading` initialized as `true`, the component displayed a loading indicator indefinitely.

**Fix applied:** When `id` is null, now explicitly set `setClient(null)` and `setLoading(false)` before returning early.

## Test results
- TypeScript compilation (`npx tsc --noEmit`): **Passed** — no errors.

## Files changed
- `web/src/hooks/useClient.ts` — Added `setClient(null)` and `setLoading(false)` in the early return guard.

## Commit
- `f5f2fb5` — `fix: clear loading state when client id is null`

## Issues or concerns
None. The fix is straightforward and aligns with the existing pattern used in the `finally` block.
