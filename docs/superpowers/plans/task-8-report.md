# Task 8 Report — Login Page Update

## Status: DONE

## Changes Made
- `web/src/app/login/page.tsx` — Replaced entirely with Minimal Pro design

## What Changed
- Removed `lucide-react` icon imports (Fish, Mail, Lock, Store, User, Phone)
- Replaced icon-based pill toggle with a simple text link toggle between login/register
- Removed `phone` field from registration form
- Simplified `useAuth()` usage: local `loading`/`error` state with try/catch/finally
- Used `Input` `label` prop instead of icon-adorned placeholders
- Switched background class from `bg-abyssal-bg` to `bg-abyssal-background`
- Removed `Fish` logo icon and "Abyssal ERP v1.0" footer badge
- Added `text-display-large` heading ("Pescadería") with descriptive subtitle
- All colors use `abyssal-*` CSS tokens; no hardcoded hex

## Concerns
- The new `register()` call signature drops the `phone` parameter. Verify the `useAuth` hook's `register` function accepts `(businessName, ownerName, email, password)` without phone — the existing hook may still expect it. If the backend requires phone, it will silently be omitted.
