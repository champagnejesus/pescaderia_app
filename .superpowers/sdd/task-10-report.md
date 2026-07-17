# Task 10: Web Project Scaffold + Theme System

## What was created

All 13 files specified in the task brief under `web/`:

| File | Purpose |
|------|---------|
| `web/package.json` | Project manifest with Next.js 14, React 18, zustand, axios, recharts, tailwind-merge, cva |
| `web/next.config.mjs` | Next.js config (converted from `.ts` to `.mjs` — Next 14 doesn't support `next.config.ts`) |
| `web/tailwind.config.ts` | Tailwind config with Abyssal design tokens under `abyssal-*` color names and custom font/border scales |
| `web/tsconfig.json` | TypeScript config with `@/*` path alias, bundler module resolution |
| `web/postcss.config.js` | PostCSS with tailwindcss + autoprefixer |
| `web/src/styles/globals.css` | Tailwind directives |
| `web/src/styles/abyssal-theme.css` | CSS custom properties for light/dark themes |
| `web/src/store/themeStore.ts` | Zustand store for theme toggle (persisted to localStorage) |
| `web/src/providers/ThemeProvider.tsx` | Client component that hydrates theme from localStorage and applies `.dark` class |
| `web/src/lib/api.ts` | Axios instance with JWT interceptor + 401 redirect |
| `web/src/lib/utils.ts` | `cn()` helper combining clsx + tailwind-merge |
| `web/src/app/layout.tsx` | Root layout with dark mode default, imports globals + theme CSS |
| `web/src/app/page.tsx` | Home page that redirects to `/login` |

## Verification

### npm install
- 170 packages installed successfully

### next build
- Compiled successfully, TypeScript types valid
- Routes: `/` (static), `/_not-found` (static)
- First Load JS: 87.4 kB shared

### Files changed
- `.gitignore` — added `web/node_modules/` and `web/.next/` entries
- 16 new files (13 source, 3 generated: `next-env.d.ts`, `package-lock.json`, `.gitignore`)

## Issues

- **`next.config.ts` not supported**: Next.js 14 does not support TypeScript config files. Converted to `next.config.mjs`. This is a known limitation of Next 14 (`.ts` config was added in Next 15).
- **`node_modules` tracked initially**: The `git add web/` command staged `node_modules/` and `.next/`. Used `git rm --cached` to unstage them, then updated `.gitignore`.
