# Task 5 Report: Orders Pages Update

**Status:** DONE

## Changes Made

- `web/src/components/orders/OrderCard.tsx` — Rewritten: new card layout with order number, client, status badge, total, items count, proper abyssal tokens, hover states
- `web/src/app/(dashboard)/orders/page.tsx` — Rewritten: added SearchBar, skeleton loading states, client-side search filter, BottomNav, updated FAB position/styling
- `web/src/app/(dashboard)/orders/[id]/page.tsx` — Rewritten: uses `useOrder` hook, TopBar with back button, simplified order info card, proper action buttons with icons
- `web/src/hooks/useOrder.ts` — Created: new hook for fetching/updating a single order, exposes `updateStatus` helper

## Commit

`4d4f71a` — feat: update orders pages with Minimal Pro design

## Test Summary

TypeScript compilation passes for all modified files (one pre-existing error in `orders/new/page.tsx` is unrelated).

## Concerns

- Pre-existing TS error in `web/src/app/(dashboard)/orders/new/page.tsx:114` — `Property 'message' does not exist on type`. Not introduced by this task.
