---
name: Abyssal ERP
description: Sistema de gestión para pescaderías — el mostrador digital que cabe en tu bolsillo
colors:
  primary: "#5E5CE6"
  primary-light: "#7B7AF7"
  primary-light-dark: "#C2C1FF"
  green: "#30D158"
  yellow: "#FFD60A"
  red: "#FF453A"
  dark-bg: "#121212"
  dark-surface: "#1C1C1E"
  dark-surface-high: "#27272A"
  dark-surface-highest: "#34343D"
  dark-outline: "#333336"
  dark-outline-variant: "#464554"
  dark-text-primary: "#E4E1ED"
  dark-text-secondary: "#8E8E93"
  dark-text-secondary-variant: "#C7C4D7"
  light-bg: "#F5F5F7"
  light-surface: "#FFFFFF"
  light-surface-high: "#E8E8ED"
  light-surface-highest: "#D1D1D6"
  light-outline: "#D1D1D6"
  light-outline-variant: "#C7C4D7"
  light-text-primary: "#1C1C1E"
  light-text-secondary: "#8E8E93"
  light-text-secondary-variant: "#636366"
  on-primary: "#FFFFFF"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "41px"
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "30px"
    letterSpacing: "-0.2px"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "25px"
  title-medium:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "22px"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "20px"
  body-medium:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "13px"
    letterSpacing: "0.5px"
rounded:
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    opacity: 0.9
  button-secondary:
    backgroundColor: "{colors.dark-surface-high}"
    textColor: "{colors.dark-text-primary}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.dark-text-primary}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.dark-surface-high}"
    textColor: "{colors.dark-text-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.dark-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  chip-inactive:
    backgroundColor: "{colors.dark-surface-high}"
    textColor: "{colors.dark-text-secondary}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Design System: Abyssal ERP

## 1. Overview

**Creative North Star: "The Digital Counter"**

El mostrador de la pescadería, pero en tu bolsillo. La interfaz debe sentirse como lo que el dueño ya conoce: superficies limpias, información al frente, sin vueltas. No es un dashboard corporativo ni una landing page — es la herramienta que usas entre pedidos, con una mano, mirando rápido.

El sistema rechaza activamente el look "Dashboard SaaS AI" — fondos cream, cards genéricas con iconos, gradientes pastel. También rechaza el ERP corporativo frío y saturado de menús. La identidad vive en la zona intermedia: una app nativa moderna que se siente como Square o SumUp, pero hablando el idioma del mercado.

**Key Characteristics:**
- Dark-first con alternancia clara/oscura
- Paleta reducida: un acento indigo-violeta + neutros grises + semáforo (verde/amarillo/rojo)
- Tipografía Inter en escala compacta, optimizada para pantallas pequeñas
- Radios grandes (12-16px) que dan calidez sin ser redondos
- Sombras sutiles solo en estado hover/focus — plano por defecto
- Mobile-first con max-width 480px, optimizado para uso con una mano

## 2. Colors

Paleta funcional con un único acento y neutros oscuros. El color existe para comunicar estado, no para decorar.

### Primary
- **Abyssal Indigo** (#5E5CE6): El único color de marca. Botones primarios, links activos, tab activa en BottomNav, badges de estado pendiente. Se usa con moderación — su rareza es la fuerza.

### Semantic
- **Market Green** (#30D158): Estados positivos — entregado, pagado, stock suficiente. Siempre con fondo semitransparente (`rgba(48,209,88,0.15)`).
- **Caution Yellow** (#FFD60A): Estados pendientes — pedido por entregar, stock bajo. Fondo semitransparente (`rgba(255,214,10,0.15)`).
- **Alert Red** (#FF453A): Estados negativos — anulado, saldo vencido, errores. Fondo semitransparente (`rgba(255,69,58,0.15)`).

### Neutral (Dark Mode)
- **Void** (#121212): Fondo de página. El más oscuro, solo para el body.
- **Surface** (#1C1C1E): Superficies elevadas — cards, modales, inputs.
- **Surface High** (#27272A): Elementos interactivos — fondos de inputs, chips inactivos, skeleton loaders.
- **Surface Highest** (#34343D): Hover states, chips alternativos.
- **Outline** (#333336): Bordes sutiles en cards y separadores.
- **Outline Variant** (#464554): Bordes de menor énfasis.

### Neutral (Light Mode)
- **Cloud** (#F5F5F7): Fondo de página.
- **Surface** (#FFFFFF): Superficies elevadas.
- **Surface High** (#E8E8ED): Elementos interactivos.
- **Surface Highest** (#D1D1D6): Hover states.

### Named Rules

**The One Accent Rule.** Abyssal Indigo es el único color de marca en cualquier pantalla. Su presencia está limitada a ~10% de superficie: botones primarios, tab activa, badges. Todo lo demás son neutros o semánticos.

**The Semaphore Rule.** Verde/amarillo/rojo solo comunican estado, nunca decoración. Siempre aparecen con fondo semitransparente del mismo tono, nunca como color de texto sobre fondo neutro sin transparencia.

## 3. Typography

**Display/Body Font:** Inter (system-ui fallback)

**Character:** Geométrica, limpia, profesional sin ser fría. Optimizada para legibilidad en pantallas pequeñas con alta densidad de información.

### Hierarchy
- **Display** (700, 34px/41px, -0.5px): Títulos de página. Solo en login y dashboard hero.
- **Headline** (600, 24px/30px, -0.2px): Títulos de sección principales.
- **Title** (600, 20px/25px): Navegación, títulos de cards.
- **Title Medium** (600, 17px/22px): Títulos de subsección, diálogos.
- **Body** (400, 15px/20px): Texto de contenido principal.
- **Body Medium** (400, 13px/18px): Texto secundario, descripciones, labels de chips.
- **Label** (700, 11px/13px, 0.5px, UPPERCASE): Badges de estado, metadata, timestamps.

### Named Rules

**The Compact Scale Rule.** Esta app vive en 480px. No hay espacio para tipografía generosa. Display (34px) solo aparece una vez por sesión (login). Todo lo demás escala hacia abajo.

**The Weight Hierarchy Rule.** La jerarquía se comunica con weight, no con size. Body text es 400. Titles son 600. Labels son 700. Si necesitas más énfasis, sube el weight, no el tamaño.

## 4. Elevation

Híbrido sutil. Superficies planas por defecto con sombras que aparecen solo como respuesta a estado (hover, focus, elevación). La profundidad se comunica más por tono (superficies con colores más claros = más elevadas) que por sombra.

### Shadow Vocabulary
- **Rest** (none): Superficies planas. Sin sombra. La norma.
- **Subtle** (`0 1px 3px rgba(0,0,0,0.1)` light / `0 1px 3px rgba(0,0,0,0.3)` dark): Cards en reposo, inputs. Suficiente para separar del fondo sin notarse conscientemente.
- **Interactive** (`0 4px 6px rgba(0,0,0,0.1)` light / `0 4px 6px rgba(0,0,0,0.3)` dark): Hover en cards, botones activos. Señal de interactividad.
- **Elevated** (`0 10px 15px rgba(0,0,0,0.1)` light / `0 10px 15px rgba(0,0,0,0.3)` dark): Modales, FABs, elementos flotantes.
- **Brand** (`0 4px 12px rgba(94,92,230,0.15)` light / `0 4px 12px rgba(94,92,230,0.2)` dark): Sombras con tinte del primary. Solo para elementos primarios elevados.

### Named Rules

**The Flat-By-Default Rule.** Las superficies están planas en reposo. Las sombras aparecen solo como respuesta a estado (hover, elevación, focus). Si una card tiene sombra sin estar en hover, la sombra es demasiado fuerte.

## 5. Components

### Buttons
- **Shape:** Gently curved (12px radius)
- **Primary:** Abyssal Indigo background, white text, `h-10` (40px) medium / `h-12` (48px) large. `active:scale-[0.98]` press feedback. Hover: opacity 90% + shadow-md.
- **Secondary:** Surface High background, primary text. Hover: Surface Highest + shadow-sm.
- **Ghost:** Transparent background, primary text. Hover: Surface High.
- **Loading:** Spinner SVG inline, pointer-events-none, opacity 50%.

### Cards / Containers
- **Corner Style:** Gently curved (16px radius)
- **Background:** Surface color (varies by theme)
- **Shadow Strategy:** Subtle shadow at rest, interactive shadow on hover. See Elevation section.
- **Border:** Outline at 50% opacity — structural, not decorative.
- **Internal Padding:** 16px (lg)

### Inputs / Fields
- **Style:** Surface High background, outline border, 12px radius, 12px 16px padding.
- **Focus:** Abyssal Primary border + ring at 20% opacity. Smooth 200ms transition.
- **Error:** Red border + ring, error message below in label typography.
- **Placeholder:** Text-secondary color.

### Chips / Filter Chips
- **Selected:** Abyssal Primary background, On Primary text, subtle shadow.
- **Unselected:** Surface High background, Text Secondary text. Hover: Surface Highest.
- **Shape:** Fully rounded (9999px radius). Pill shape.

### Navigation (BottomNav)
- **Style:** 64px height, fixed bottom, Surface background.
- **Active tab:** Abyssal Primary text color, icon + label in column.
- **Inactive tab:** Text Secondary color.
- **Content offset:** `pb-24` (96px) on page content to prevent overlap.

### Status Badges
- **Shape:** Gently curved (12px radius), uppercase label typography.
- **PENDIENTE:** Yellow background (15% opacity), yellow text, subtle pulse animation.
- **ENTREGADO/PAGADO:** Green background (15% opacity), green text.
- **ANULADO:** Red background (15% opacity), red text.

### Dialogs / Modals
- **Overlay:** Black at 50% opacity + backdrop blur (4px).
- **Content:** Surface background, 16px radius, shadow-lg, fade-in animation.
- **Dismiss:** Escape key or overlay tap.

### Skeleton Loaders
- **Style:** Surface High background, pulse animation, 12px radius.
- **Usage:** Replace "Cargando..." text in all loading states. Match the shape of the content being loaded.

## 6. Do's and Don'ts

### Do:
- **Do** keep the single accent (Abyssal Indigo) under 10% of any screen. Its rarity creates hierarchy.
- **Do** use the Semaphore Rule: green/yellow/red for status only, always with transparent backgrounds.
- **Do** use skeleton loaders instead of "Cargando..." text for all loading states.
- **Do** provide `active:scale-[0.98]` press feedback on all interactive elements.
- **Do** maintain 44px minimum touch targets for all interactive elements.
- **Do** use `prefers-reduced-motion` to disable all animations for accessibility.
- **Do** use Inter as the single font family. No font pairing — one family, multiple weights.
- **Do** communicate hierarchy through font weight (400 → 600 → 700), not size inflation.

### Don't:
- **Don't** use the "Dashboard SaaS AI" look: cream/sand backgrounds, generic icon cards, pastel gradients, decorative sparklines. This is a tool, not a marketing surface.
- **Don't** use the "ERP corporativo" look: cold, complex, menu-saturated, data-dense without hierarchy. This should feel like an app, not software.
- **Don't** add gradients to text (`background-clip: text`). Use solid colors. Emphasis through weight or size.
- **Don't** use glassmorphism (blurs, glass cards) as a default pattern. Backdrop blur on modals only.
- **Don't** use side-stripe borders (`border-left` > 1px) as colored accents on cards or list items.
- **Don't** use identical card grids with icon + heading + text repeated endlessly.
- **Don't** add decorative gradients to hero cards or summary sections. A subtle tint (`from-primary/10`) is the maximum.
- **Don't** use shadows darker than the specified shadow vocabulary. On dark mode, shadows use rgba(0,0,0,0.3) max. On light mode, rgba(0,0,0,0.1) max.
- **Don't** use font sizes larger than 34px. The app lives in 480px — display text should appear once per session, not on every page.
