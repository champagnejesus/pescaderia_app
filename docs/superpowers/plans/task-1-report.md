# Task 1 Report: Update Design System Tokens

**Status**: DONE_WITH_CONCERNS

## Changes Made
- `web/src/styles/abyssal-theme.css` — Replaced all CSS custom properties with new Abyssal design tokens (blue-based palette, Geist font import, light/dark variants)
- `web/tailwind.config.ts` — Updated color map to match new tokens, added boxShadow, fontFamily (Geist), transitionDuration, and transitionTimingFunction extensions; unified border-radius values
- `web/src/app/layout.tsx` — Changed `bg-abyssal-bg` to `bg-abyssal-background` to match new token name

## Build Result
**FAILED** — but with a pre-existing type error unrelated to this task:

```
./src/app/(dashboard)/orders/new/page.tsx:114:63
Type error: Property 'message' does not exist on type '{ response?: ... }'
```

This is a TypeScript error in the catch block of an order creation handler — inherited code, not caused by token changes.

## Concerns
1. **Pre-existing TS error** blocks production build. The error is in `orders/new/page.tsx:114` — `axiosErr.message` doesn't exist on the inline type used for the caught error.
2. **Old token references remain in 20+ component files** (`abyssal-bg`, `abyssal-outline`, `abyssal-primary-light`). These will need updating in subsequent tasks as those components are touched.
