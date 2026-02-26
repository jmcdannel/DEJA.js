---
name: deja-tailwind
description: "DEJA.js project styling conventions for Tailwind CSS, Vuetify, and Vue components. Use this skill whenever writing or modifying Vue components, CSS, or any UI-related code in the DEJA.js monorepo. This includes adding new components, modifying existing ones, creating layouts, styling elements, working with dark mode, adding animations, or touching any file that contains Tailwind classes or Vuetify components. Even if the user just says 'make a card' or 'add a button', use this skill to ensure consistency with the project's design system."
---

# DEJA.js Styling Conventions

This project is a model railroad control system built as a Vue 3 + Vuetify + Tailwind CSS monorepo. Every app shares a dark-mode-first, glassmorphic design language with cyan/blue accents on dark navy backgrounds. Consistency across apps matters because users interact with multiple apps (Monitor, Throttle, Cloud, Tour) during the same session.

## Project Structure

```
apps/
  monitor/    — Dashboard for monitoring railroad systems (most distinctive theme)
  throttle/   — Train throttle controller
  cloud/      — Cloud management interface
  tour/       — Guided tour / educational app
  sound-api/  — Sound effects API
packages/
  ui/         — Shared component library (@repo/ui)
```

The shared `@repo/ui` package contains 50+ components. Always check if a component already exists there before creating a new one.

## Color Palette

The project uses a consistent dark palette across apps. When writing new components, use these values:

### Backgrounds
- Page background: `bg-[#020617]` (dark navy, slate-950)
- Surface/card: `bg-[#0f172a]` (slate-900) or `bg-gray-900` with opacity
- Elevated surface: `rgba(15, 23, 42, 0.55)` to `rgba(15, 23, 42, 0.75)`
- Header/overlay: `rgba(15, 23, 42, 0.75)` with `backdrop-blur-[20px]`

### Accent Colors
- Primary cyan: `text-sky-400` / `#38bdf8` / `rgba(56, 189, 248, ...)`
- Secondary teal: `text-teal-400` / `#22d3ee` / `rgba(20, 184, 166, ...)`
- Info blue: `text-sky-500` / `#0ea5e9`
- Success: `text-emerald-500` / `#10b981`
- Warning: `text-orange-500` / `#f97316`
- Error: `text-red-500` / `#ef4444`

### Text
- Primary text: `text-[#f8fafc]` (slate-50) or `text-[#e0f2fe]` (sky-100)
- Secondary text: `text-[#bae6fd]` (sky-200)
- Muted text: `text-slate-400` or `rgba(148, 163, 184, 0.7)`

### Borders
- Default: `border-[#1e293b]` (slate-800)
- Subtle: `rgba(148, 163, 184, 0.12)` to `rgba(148, 163, 184, 0.18)`
- Accent: `rgba(56, 189, 248, 0.25)` to `rgba(56, 189, 248, 0.35)`

### Status Indicators (Railroad-specific)
- Normal/green: `rgb(67, 242, 13)`
- Reverse/red: `rgb(242, 13, 13)`
- Neutral/gray: `rgb(200, 200, 200)`
- Route selected: `rgb(0, 255, 17)`
- Route available: `rgb(254, 217, 33)`
- Turnout hover: `rgb(253, 35, 253)`

## Card Pattern

Cards are the primary UI container. The Monitor app uses a custom `.monitor-card` class system. When building cards:

### Vuetify Cards (most apps)
```vue
<v-card
  class="m-1 shadow-xl"
  :color="item?.color || 'primary'"
  :disabled="isRunning"
  :loading="isRunning"
  variant="tonal"
>
```

### Monitor Cards (glassmorphic style)
Monitor cards use custom CSS with glassmorphism. The key properties:
- `backdrop-filter: blur(6px)`
- Semi-transparent background with cyan/blue tint
- `border: 1px solid rgba(148, 163, 184, 0.18)`
- Gradient accent line at top via `::after` pseudo-element
- Hover: slight lift (`translateY(-1px)`) + enhanced shadow

### Card Section Spacing
- Header padding: `0.75rem 1.25rem`
- Body padding: `1.25rem`
- Footer/actions padding: `0.85rem 1.25rem`
- Section separators: `border-bottom: 1px solid rgba(148, 163, 184, 0.12)`

## BEM-style Class Naming (Monitor)

The Monitor app uses a BEM-inspired naming convention for custom classes:
```
.monitor-card
.monitor-card__header
.monitor-card__title
.monitor-card__subtitle
.monitor-card__body
.monitor-card__footer
.monitor-card__actions
.monitor-card__toolbar
.monitor-card__icon-btn
.monitor-card__ghost-btn
.monitor-card__terminal
.monitor-card__terminal-line
.monitor-card__timestamp
.monitor-card__payload
.monitor-card__meta
.monitor-card__status-chip
.monitor-chip
```

When adding new monitor components, follow this pattern: `.monitor-card__[element-name]`.

## Layout Patterns

### Flexbox (primary)
```vue
<div class="flex flex-row items-center gap-4">
<div class="flex flex-wrap gap-2">
<div class="flex items-center justify-between">
<div class="space-y-3">
```

### Grid
```vue
<div class="grid grid-cols-2 gap-4">
<div class="grid grid-cols-1 lg:grid-cols-3">
```

### Standard Gaps
- Tight: `gap-2` (0.5rem)
- Normal: `gap-4` (1rem)
- Loose: `gap-8` (2rem)

### Standard Padding/Margin
- `m-1` on cards (Vuetify spacing)
- `p-2`, `p-4` for content areas
- `px-2`, `pr-8` for horizontal variants

## Button Patterns

### Vuetify Icon Buttons
```vue
<v-btn icon variant="text" size="small">
  <v-icon>mdi-cog</v-icon>
</v-btn>
```

### Monitor Icon Buttons (pill-shaped)
- `border-radius: 999px` / `rounded-full`
- Background: `rgba(15, 23, 42, 0.55)`
- Border: `1px solid rgba(56, 189, 248, 0.25)`
- Text: `#e0f2fe`
- Hover: background `rgba(56, 189, 248, 0.2)`, lighter border
- Transition: `120ms ease`

### Active State Toggle Pattern
The project uses a gradient-border pattern for active/running states:
```vue
<v-card class="shadow-xl p-[1px] rounded-full"
  :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900' : ''">
  <v-card-title class="rounded-full bg-gray-900"
    :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'">
```

## Chip/Tag Pattern

```vue
<v-chip class="ml-2 text-xs"
  prepend-icon="mdi-memory"
  variant="outlined">
```

Monitor chips: `rgba(56, 189, 248, 0.18)` background, `rgba(56, 189, 248, 0.35)` border, uppercase, `letter-spacing: 0.08em`.

## Typography

### Font Families
- Monitor: `'Roboto Mono', 'Roboto', 'Segoe UI', sans-serif`
- Throttle: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...`
- Terminal/code content: Always monospace

### Sizing
- Card titles: `text-md`
- Body text: `text-sm` (0.8125rem)
- Small labels/meta: `text-xs` (0.75rem)
- Terminal text: `0.7rem` to `0.75rem`

### Weights
- Headings: `font-bold` (700) or `font-semibold` (600)
- Labels: `font-medium` (500)
- Body: default (400)

### Uppercase Labels
Uppercase labels always pair with wider letter-spacing:
- Section headers: `uppercase tracking-[0.16em]` to `tracking-[0.2em]`
- Chip text: `uppercase tracking-[0.08em]`
- Meta text: `tracking-[0.12em]`

## Dark Mode

All apps default to dark mode. The implementation:
- Tailwind config: `darkMode: 'class'`
- Vuetify theme: `defaultTheme: 'monitorDark'` (or app-specific variant)
- Root: `color-scheme: dark`
- Use `dark:` variants only when supporting light mode toggle (Cloud, Tour apps)

When building new components, design for dark mode first. Light mode is secondary and only needed in Cloud and Tour apps.

## Animations & Transitions

### Timing
- Fast (hover/focus): `120ms ease` or `150ms ease`
- Standard (state changes): `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Smooth (color transitions): `0.5s`

### Common Effects
- Hover lift: `hover:-translate-y-0.5` or `hover:-translate-y-1`
- Active press: `active:translate-y-0`
- Status pulse: `animate-ping` with `opacity-75`
- Status bounce: `animate-bounce`

### Transition Properties
Always specify properties rather than `transition: all`:
```css
transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
```

## Glassmorphism Recipe

The Monitor app's signature look. When creating new glassmorphic elements:

```css
background: rgba(15, 23, 42, 0.55);          /* semi-transparent slate-900 */
backdrop-filter: blur(6px);                    /* or blur(8px) for heavier */
border: 1px solid rgba(148, 163, 184, 0.18);  /* subtle light border */
border-radius: 0.75rem;                        /* rounded-xl equivalent */
box-shadow: 0 28px 65px -40px rgba(56, 189, 248, 0.55);  /* cyan glow */
```

## Background Decorations

The project uses blurred gradient circles for ambient backgrounds:
```vue
<div class="absolute w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[80px]"></div>
<div class="absolute w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[70px]"></div>
<div class="absolute w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[60px]"></div>
```

## Shadows

- Card resting: `shadow-xl` or custom `0 28px 65px -40px rgba(56, 189, 248, 0.55)`
- Card hover: `0 32px 80px -36px rgba(34, 211, 238, 0.65)` (teal shift)
- Inner glow (active): `shadow-inner shadow-pink-500`
- Button inset: `inset 0 1px 0 rgba(255, 255, 255, 0.1)`

## Component Color Configuration

Components in `@repo/ui` accept a `color` prop that maps to Tailwind/Vuetify colors. The `useColors` composable provides the full palette (slate, zinc, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose) with `-500` base and `dark:-400` variants.

Always support the `color` prop pattern: `:color="item?.color || 'primary'"`.

## Responsive Design

- Mobile-first approach
- Hide secondary info on mobile: `hidden md:inline`
- Grid breakpoints: `grid-cols-1 lg:grid-cols-3`
- Vuetify density: `density="compact"` for data-heavy views

## Checklist for New Components

1. Check `packages/ui/` for existing components before creating new ones
2. Use the project's color palette (no arbitrary colors)
3. Dark mode first
4. Follow the card pattern for container elements
5. Use Vuetify components where they fit (v-card, v-btn, v-chip, v-icon with mdi-* icons)
6. Supplement with Tailwind utilities for layout and spacing
7. Monitor app: use `.monitor-card__*` BEM naming for custom classes
8. Support `color` prop for configurable accent colors
9. Transitions on interactive elements (120-150ms for hover, 300ms for state)
10. Keep text readable: `text-[#e0f2fe]` on dark backgrounds, adequate contrast
