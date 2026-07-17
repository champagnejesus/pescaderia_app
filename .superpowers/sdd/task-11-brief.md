### Task 11: Web — Shared UI Components + Layout

**Files to create:**
- `web/src/components/ui/button.tsx`
- `web/src/components/ui/card.tsx`
- `web/src/components/ui/input.tsx`
- `web/src/components/ui/dialog.tsx`
- `web/src/components/shared/StatusBadge.tsx`
- `web/src/components/shared/SearchBar.tsx`
- `web/src/components/shared/FilterChip.tsx`
- `web/src/components/layout/BottomNav.tsx`
- `web/src/components/layout/TopBar.tsx`
- `web/src/components/layout/ThemeToggle.tsx`
- `web/src/components/layout/AuthGuard.tsx`
- `web/src/app/(dashboard)/layout.tsx`

Design guide for all components:
- Use the Abyssal Slate theme via Tailwind classes: `bg-abyssal-surface`, `text-abyssal-text-primary`, `rounded-abyssal-sm/md/lg`, `bg-abyssal-primary`, etc.
- The theme tokens are already defined in `tailwind.config.ts` and `abyssal-theme.css`

---

Create `web/src/components/ui/button.tsx`:
- A `<button>` with variants: "primary" (bg-abyssal-primary text-abyssal-on-primary), "secondary" (bg-abyssal-surface-high), "ghost" (transparent)
- Sizes: "sm" (h-8 px-3), "md" (h-10 px-4), "lg" (h-12 px-6)
- Use `cn()` from `@/lib/utils` for className merging
- All rounded with `rounded-abyssal-sm`
- React.forwardRef

Create `web/src/components/ui/card.tsx`:
- A `<div>` with `bg-abyssal-surface rounded-abyssal-md p-4`
- Subcomponents: CardHeader, CardTitle, CardContent, CardFooter (all simple divs with cn tailwind)

Create `web/src/components/ui/input.tsx`:
- A styled `<input>` with: `bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 text-abyssal-text-primary w-full outline-none border border-abyssal-outline focus:border-abyssal-primary`
- Placeholder color: `placeholder:text-abyssal-text-secondary`
- Forward ref

Create `web/src/components/ui/dialog.tsx`:
- An overlay (`fixed inset-0 bg-black/50`) + centered modal (`bg-abyssal-surface rounded-abyssal-md p-6`)
- Props: `open: boolean`, `onClose: () => void`, `children: React.ReactNode`
- Use useEffect for escape key handling

Create `web/src/components/shared/StatusBadge.tsx`:
- A badge showing order/product status
- Colors: "PENDIENTE" -> bg-abyssal-yellow-bg text-abyssal-yellow, "ENTREGADO"/"PAGADO" -> bg-abyssal-green-bg text-abyssal-green, "ANULADO" -> bg-abyssal-red-bg text-abyssal-red
- `rounded-abyssal-sm px-3 py-1 text-label-small uppercase`
- Props: `status: string`

Create `web/src/components/shared/SearchBar.tsx`:
- A search input with search icon (lucide-react Search icon)
- `bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 pl-10 w-full`
- Props: `value: string`, `onChange: (v: string) => void`, `placeholder?: string`

Create `web/src/components/shared/FilterChip.tsx`:
- A small chip/tag button
- Selected: `bg-abyssal-primary text-abyssal-on-primary`, unselected: `bg-abyssal-surface-high text-abyssal-text-secondary`
- `rounded-abyssal-full px-3 py-1 text-body-medium`
- Props: `label: string`, `selected: boolean`, `onClick: () => void`

Create `web/src/components/layout/BottomNav.tsx`:
- A fixed bottom navigation bar with 6 tabs: Dashboard (LayoutDashboard), Products (Fish), Orders (ClipboardList), Clients (Users), Suppliers (Truck), Cash Register (DollarSign)
- Icons from lucide-react
- Selected tab: `text-abyssal-primary`, unselected: `text-abyssal-text-secondary`
- Uses Next.js `usePathname()` to determine active tab
- `bg-abyssal-surface border-t border-abyssal-outline`
- Tab labels in Spanish

Create `web/src/components/layout/TopBar.tsx`:
- A top bar with title on left, notification bell icon and ThemeToggle on right
- `bg-abyssal-surface px-4 py-3 flex items-center justify-between`
- Props: `title: string`

Create `web/src/components/layout/ThemeToggle.tsx`:
- A button toggling between Sun (light) and Moon (dark) icons from lucide-react
- Uses `useThemeStore` to toggle
- `text-abyssal-text-secondary`

Create `web/src/components/layout/AuthGuard.tsx`:
- A client component that checks `localStorage.getItem("abyssal-token")`
- If no token, redirects to `/login` using `useRouter`
- Wraps `{children}` when authenticated
- Use useEffect + useState to avoid hydration mismatch

Create `web/src/app/(dashboard)/layout.tsx`:
- Wraps children with AuthGuard, TopBar (title based on route or "Abyssal ERP"), BottomNav
- Max width `max-w-[480px] mx-auto` (mobile-first design)
- Padding top for TopBar, bottom for BottomNav
- `min-h-screen bg-abyssal-bg`

Commit:
```bash
git add web/src/components/ web/src/app/\(dashboard\)/layout.tsx
git commit -m "feat(web): add shared UI components and dashboard layout"
```
