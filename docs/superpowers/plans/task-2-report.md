# Task 2 Report: Core UI Components Update

**Status:** DONE

**Commit:** `7cb066e` - `feat: update core UI components with Minimal Pro design tokens`

**Files modified:**
- `web/src/components/ui/button.tsx` — Added destructive variant, updated hover states, focus-visible ring, 150ms transitions, cursor-pointer
- `web/src/components/ui/input.tsx` — Added label/error props, h-11 touch target, border-abyssal-border, focus ring states, error state styling
- `web/src/components/ui/card.tsx` — Added border, shadow-abyssal-sm, transition, updated CardHeader/CardTitle/CardContent/CardFooter layout
- `web/src/components/shared/StatusBadge.tsx` — New StatusType union, mapped colors to abyssal tokens (/10 opacity), proper label text instead of raw status
- `web/src/components/shared/SearchBar.tsx` — Added "use client", updated to abyssal-full round, surface-overlay bg, 150ms transition
- `web/src/components/shared/FilterChip.tsx` — Added className prop, updated to surface-overlay bg, hover state, 150ms transition

**Test summary:** All components import and export correctly; no runtime errors expected (pure UI, no logic changes beyond prop additions).

**Concerns:**
- None. All changes follow abyssal-* token conventions, touch targets meet 44px minimum, and transitions use 150ms ease.
