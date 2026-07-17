# Task 11 Report: Web — Shared UI Components + Layout

## Status: Complete

## Commits
- `6e3b761` — `feat(web): add shared UI components and dashboard layout`

## Build Verification
- `npx next build` — Compiled successfully, all pages generated (4/4 static pages)
- No TypeScript errors, no linting warnings

## Files Created (12)
| Component | Path |
|-----------|------|
| Button | `web/src/components/ui/button.tsx` |
| Card | `web/src/components/ui/card.tsx` |
| Input | `web/src/components/ui/input.tsx` |
| Dialog | `web/src/components/ui/dialog.tsx` |
| StatusBadge | `web/src/components/shared/StatusBadge.tsx` |
| SearchBar | `web/src/components/shared/SearchBar.tsx` |
| FilterChip | `web/src/components/shared/FilterChip.tsx` |
| BottomNav | `web/src/components/layout/BottomNav.tsx` |
| TopBar | `web/src/components/layout/TopBar.tsx` |
| ThemeToggle | `web/src/components/layout/ThemeToggle.tsx` |
| AuthGuard | `web/src/components/layout/AuthGuard.tsx` |
| Dashboard Layout | `web/src/app/(dashboard)/layout.tsx` |

## Concerns
- `AuthGuard` reads from `localStorage` and redirects to `/login` — the `/login` route must be created in a later task
- BottomNav tabs link to routes that don't exist yet (dashboard, productos, pedidos, clientes, proveedores, caja)
- The `(dashboard)/layout.tsx` uses Abyssal ERP as a static title; Task 12 may want dynamic titles per route
