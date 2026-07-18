# UI/UX Redesign Design Spec — Pescaderia ERP

## Overview

Complete UI/UX redesign of the Pescaderia ERP application following the **Minimal Pro** design approach: gray neutral + electric blue, ultra-modern, minimal, tech-focused.

**Goal:** Deliver an impeccable, professional, competitive product in the fish market ERP space.

**Approach:** Full redesign — new design system tokens, component library, and page layouts.

---

## 1. Design System

### 1.1 Color Palette

#### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#2563EB` | Primary actions, CTA, active states |
| `primary-hover` | `#1D4ED8` | Hover states for primary elements |
| `surface` | `#FFFFFF` | Card backgrounds, modals |
| `surface-raised` | `#F8FAFC` | Elevated cards, hover states |
| `surface-overlay` | `#F1F5F9` | Input backgrounds, hover states |
| `background` | `#F8FAFC` | Page background |
| `border` | `#E2E8F0` | Subtle borders, dividers |
| `text-primary` | `#0F172A` | Primary text |
| `text-secondary` | `#64748B` | Secondary text, captions |
| `text-muted` | `#94A3B8` | Disabled, placeholder text |
| `success` | `#10B981` | Success, delivered status |
| `warning` | `#F59E0B` | Warning, pending status |
| `destructive` | `#EF4444` | Delete, cancel, error |

#### Dark Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#3B82F6` | Primary actions (lighter for dark bg) |
| `primary-hover` | `#2563EB` | Hover states |
| `surface` | `#0F172A` | Card backgrounds |
| `surface-raised` | `#1E293B` | Elevated cards |
| `surface-overlay` | `#334155` | Input backgrounds, hover |
| `background` | `#020617` | Page background |
| `border` | `#334155` | Borders, dividers |
| `text-primary` | `#F8FAFC` | Primary text |
| `text-secondary` | `#94A3B8` | Secondary text |
| `text-muted` | `#64748B` | Disabled text |
| `success` | `#34D399` | Success status |
| `warning` | `#FBBF24` | Warning status |
| `destructive` | `#F87171` | Delete, error |

### 1.2 Typography

**Font Family:** Geist (Google Fonts) — modern, clean, tech-focused

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 30px | 700 | 1.2 | Page titles |
| `headline` | 22px | 600 | 1.3 | Section headers |
| `title` | 17px | 600 | 1.4 | Card titles, subtitles |
| `body` | 15px | 400 | 1.5 | Body text |
| `caption` | 13px | 400 | 1.4 | Metadata, dates |
| `label` | 11px | 500 | 1.3 | Badges, labels |

### 1.3 Spacing Scale (8px grid)

```
space-1: 4px
space-2: 8px
space-3: 12px
space-4: 16px
space-5: 20px
space-6: 24px
space-8: 32px
space-10: 40px
space-12: 48px
space-16: 64px
```

### 1.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Badges, chips, small elements |
| `radius-md` | 12px | Cards, inputs |
| `radius-lg` | 16px | Modals, drawers |
| `radius-full` | 9999px | FAB, avatars, pills |

### 1.5 Shadows

```
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)
```

### 1.6 Transitions

- **Duration:** 150ms
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Apply to:** background-color, border-color, color, box-shadow, transform

---

## 2. Layout & Navigation

### 2.1 Screen Structure

```
┌─────────────────────────┐
│  TopBar (sticky, 56px)  │  ← Title + action icons
├─────────────────────────┤
│                         │
│  Content (scrollable)   │  ← Padding: 16px
│                         │
├─────────────────────────┤
│  BottomNav (fixed, 64px)│  ← 5 tabs max
└─────────────────────────┘
```

### 2.2 TopBar

- **Height:** 56px
- **Background:** `surface` with `border-b`
- **Content:** Title (headline, 600) left-aligned + action icons right
- **Shadow:** Subtle shadow on scroll
- **Position:** Sticky top-0

### 2.3 BottomNav

- **Tabs:** Dashboard, Pedidos, Productos, Clientes, Cajón
- **Icons:** Lucide (line-style, consistent)
- **Active:** `primary` color + label visible
- **Inactive:** `text-muted` color
- **Height:** 64px + safe area inset
- **Background:** `surface` with `border-t`
- **Position:** Fixed bottom-0

### 2.4 General Layout

- **Max-width:** 480px (mobile-first)
- **Horizontal padding:** 16px
- **Section gap:** 24px
- **Cards:** `surface` bg, `radius-md`, `shadow-sm`

---

## 3. Components

### 3.1 Cards

```
┌─────────────────────────┐
│  [Icon]  Title          │  ← title (600)
│          Value Large    │  ← display (700)
│          Label          │  ← caption (secondary)
│  [sparkline optional]   │
└─────────────────────────┘
```

- **Background:** `surface`
- **Border:** 1px `border`
- **Border Radius:** `radius-md` (12px)
- **Padding:** 16px
- **Hover:** `surface-raised` + `shadow-md`
- **Transition:** 150ms ease

### 3.2 Buttons

| Variant | Style |
|---------|-------|
| **Primary** | `bg-primary text-white` + hover `primary-hover` |
| **Secondary** | `bg-surface-overlay text-primary` + hover `surface-raised` |
| **Ghost** | `text-primary` + hover `surface-overlay` |
| **Destructive** | `bg-destructive text-white` |

- **Border Radius:** `radius-sm` (8px)
- **Padding:** 12px 20px
- **Font:** body (15px), weight 500
- **Hover:** 150ms transition
- **Disabled:** 50% opacity, no cursor pointer
- **Min height:** 44px (touch target)

### 3.3 Inputs

- **Background:** `surface`
- **Border:** 1px `border`
- **Focus:** `ring-2 ring-primary/20 border-primary`
- **Border Radius:** `radius-sm` (8px)
- **Padding:** 12px 16px
- **Label:** label (11px, 500, `text-secondary`)
- **Error:** `border-destructive` + `text-destructive` message below
- **Placeholder:** `text-muted`

### 3.4 Badges/Status

| Status | Text Color | Background |
|--------|------------|------------|
| PENDIENTE | `warning` | `warning/10` |
| ENTREGADO | `success` | `success/10` |
| ANULADO | `destructive` | `destructive/10` |
| PAGADO | `primary` | `primary/10` |

- **Border Radius:** `radius-full`
- **Padding:** 4px 10px
- **Font:** label (11px), weight 500
- **Display:** Inline-flex, items-center

### 3.5 Search Bar

- **Icon:** Lucide Search, `text-muted`, 18px
- **Input:** No border, `surface-overlay` bg
- **Border Radius:** `radius-full`
- **Padding:** 10px 16px
- **Placeholder:** "Buscar..."

### 3.6 Filter Chips

- **Selected:** `bg-primary text-white`
- **Unselected:** `bg-surface-overlay text-secondary`
- **Border Radius:** `radius-full`
- **Padding:** 8px 16px
- **Font:** body (15px), weight 500
- **Gap between chips:** 8px
- **Container:** Horizontal scroll, no scrollbar

### 3.7 FAB (Floating Action Button)

- **Position:** fixed, bottom 24px, right 16px (above BottomNav)
- **Size:** 56px
- **Background:** `primary`
- **Icon:** Plus, white, 24px
- **Shadow:** `shadow-lg`
- **Hover:** `shadow-xl` + scale 1.05
- **Border Radius:** `radius-full`

### 3.8 Avatars (for Clients)

- **Size:** 40px
- **Background:** `primary/10`
- **Text:** `primary`, title (600)
- **Border Radius:** `radius-full`
- **Show:** First letter of first + last name

---

## 4. Pages

### 4.1 Dashboard

```
┌─────────────────────────┐
│  Hola, [Nombre]         │  ← headline
│  Resumen de hoy         │  ← caption (secondary)
├─────────────────────────┤
│  ┌─────────┐ ┌─────────┐│
│  │ 💰 Ventas│ │ 📈 Gananc││  ← 2-col bento grid
│  │ $1.2M    │ │ $340K   ││
│  │ +12%     │ │ +8%     ││
│  └─────────┘ └─────────┘│
│  ┌─────────┐ ┌─────────┐│
│  │ 🏦 Caja  │ │ 🔄 Transf││
│  │ $890K    │ │ $120K   ││
│  └─────────┘ └─────────┘│
├─────────────────────────┤
│  Pedidos Recientes      │  ← headline
│  ┌─────────────────────┐│
│  │ ORD-1234  PENDIENTE ││  ← OrderCard
│  │ $45.000    hace 2h  ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ ORD-1233  ENTREGADO ││
│  │ $28.500    hace 4h  ││
│  └─────────────────────┘│
└─────────────────────────┘
```

**Changes from current:**
- Remove BentoGrid with 6 cards → simplify to 4 key metrics
- Add personalized greeting
- Improve visual hierarchy
- Better spacing and typography

### 4.2 Orders (List)

```
┌─────────────────────────┐
│  Pedidos          [Bell]│
├─────────────────────────┤
│ [Todos] [Pend] [Entreg] │  ← Filter chips (horizontal scroll)
├─────────────────────────┤
│  🔍 Buscar pedido...    │  ← Search bar
├─────────────────────────┤
│  ┌─────────────────────┐│
│  │ ORD-1234            ││  ← order_number (title)
│  │ Juan Pérez          ││  ← client_name (body)
│  │ $45.000 · 3 items   ││  ← total + count (caption)
│  │ [PENDIENTE]  hace 2h││  ← status badge + time
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ ORD-1233            ││
│  │ María García        ││
│  │ $28.500 · 1 item    ││
│  │ [ENTREGADO] hace 4h ││
│  └─────────────────────┘│
└────────────────────[+]─┘  ← FAB
```

**Changes from current:**
- Add search functionality
- Improve card layout with better typography hierarchy
- Add relative time ("hace 2h")
- Better status badge styling

### 4.3 Products (List)

```
┌─────────────────────────┐
│  Productos        [Bell]│
├─────────────────────────┤
│  🔍 Buscar producto...  │
├─────────────────────────┤
│ [Todos] [Pesc] [Marisc] │  ← Category filter chips
├─────────────────────────┤
│  ┌─────────────────────┐│
│  │ 🐟 Salmón Fresco    ││  ← product name (title)
│  │ $12.500/kg          ││  ← price (headline)
│  │ Stock: 45 kg [Normal]││  ← stock + badge
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 🦐 Camarón Jumbo    ││
│  │ $18.000/kg          ││
│  │ Stock: 8 kg [Bajo ⚠]││
│  └─────────────────────┘│
└────────────────────[+]─┘
```

**Changes from current:**
- Cleaner card layout
- Better stock visualization
- Category filter as horizontal scroll chips

### 4.4 Clients (List)

```
┌─────────────────────────┐
│  Clientes         [Bell]│
├─────────────────────────┤
│  🔍 Buscar cliente...   │
├─────────────────────────┤
│  ┌─────────────────────┐│
│  │ [JP] Juan Pérez     ││  ← Avatar + name
│  │      $125.000 saldo ││  ← balance
│  │      12 pedidos     ││  ← order count
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ [MG] María García   ││
│  │      $89.000 saldo  ││
│  │      8 pedidos      ││
│  └─────────────────────┘│
└────────────────────[+]─┘
```

**Changes from current:**
- Add avatar with initials
- Show balance and order count
- Consistent card styling (fix the current hardcoded colors)

### 4.5 New Order (Wizard)

**Step 1: Select Client**

```
┌─────────────────────────┐
│  ← Nuevo Pedido         │
├─────────────────────────┤
│  Seleccionar Cliente    │  ← headline
│  ┌─────┐ ┌─────┐ ┌────┐│
│  │ Juan │ │María│ │+   ││  ← Horizontal scroll
│  └─────┘ └─────┘ └────┘│
├─────────────────────────┤
│  Fecha de entrega       │  ← label
│  [📅 Seleccionar fecha] │
├─────────────────────────┤
│         Continuar →     │  ← Primary button
└─────────────────────────┘
```

**Step 2: Add Products**

```
┌─────────────────────────┐
│  ← Agregar Productos    │
├─────────────────────────┤
│  🔍 Buscar producto...  │
├─────────────────────────┤
│  Salmón Fresco          │  ← product name
│  $12.500/kg  [- 2 +]   │  ← price + quantity
│  Subtotal: $25.000      │
├─────────────────────────┤
│  Total: $25.000         │  ← headline
│  [Efectivo] [Transfer+] │  ← Payment chips
│         Crear Pedido →  │  ← Primary button
└─────────────────────────┘
```

---

## 5. Implementation Plan

### Phase 1: Design System Tokens (Priority: HIGH)

1. Update `abyssal-theme.css` with new Minimal Pro color tokens
2. Update `tailwind.config.ts` with new typography scale and spacing
3. Import Geist font family

### Phase 2: Core Components (Priority: HIGH)

1. Update `Button` component with new variants
2. Update `Input` component with new styling
3. Update `Card` component with new design
4. Update `StatusBadge` component
5. Update `SearchBar` component
6. Update `FilterChip` component
7. Update `TopBar` component
8. Update `BottomNav` component

### Phase 3: Page Updates (Priority: MEDIUM)

1. Update Dashboard page
2. Update Orders list page
3. Update Products list page
4. Update Clients list page (fix inconsistency)
5. Update Suppliers list page
6. Update Cash Register page
7. Update Login page

### Phase 4: Detail Pages (Priority: MEDIUM)

1. Update Order detail page
2. Update Product detail page
3. Update Client detail page (major fix)
4. Update New Order wizard

### Phase 5: Polish (Priority: LOW)

1. Add hover transitions to all interactive elements
2. Verify dark mode contrast
3. Test on 375px, 768px, 1024px
4. Verify touch targets ≥44px

---

## 6. Anti-Patterns to Avoid

- Don't use emojis as structural icons (use Lucide SVG)
- Don't hardcode hex colors (use abyssal-* tokens)
- Don't mix icon styles (keep Lucide consistent)
- Don't skip hover/focus states
- Don't use arbitrary z-index values (use scale: 10, 20, 30, 50)

---

## 7. Success Criteria

- [ ] All pages use consistent abyssal-* tokens
- [ ] No hardcoded hex colors
- [ ] All interactive elements have hover/focus states
- [ ] Touch targets ≥44px
- [ ] Dark mode works with proper contrast
- [ ] Transitions are smooth (150ms)
- [ ] Typography hierarchy is clear
- [ ] Client detail page is consistent with rest of app

---

**Spec Version:** 1.0
**Date:** 2026-07-17
**Approach:** Minimal Pro (Gray + Electric Blue)
