# Cloud App Page Headers Redesign

**Date:** 2026-03-12
**Status:** Approved
**Scope:** `apps/cloud/`, `packages/ui/src/ListMenu/`

---

## Problem

The cloud app's page headers have three issues:

1. **ModuleTitle is visually flat** — a plain `v-sheet` with an icon, label, and a hard `<hr class="border-sky-500">` divider. No background treatment, no visual weight.
2. **Inconsistent headers** — some pages (e.g., Layout) have double headers: a ModuleTitle plus additional styled `<h2>` / `<h3>` elements with their own gradient backgrounds.
3. **ListMenu is desktop-unfriendly** — it uses a `v-bottom-sheet` on all screen sizes, which is awkward on desktop where inline controls would be more natural.

## Design Decisions

- **Keep** existing colors and icons from `useMenu()` config (cyan for Devices, amber for Turnouts, etc.)
- **Replace** ModuleTitle with a new `PageHeader` component using a gradient accent strip background
- **Enforce** one header per page — no double headers
- **Make ListMenu responsive** — inline toolbar on desktop, bottom sheet on mobile

---

## Component: PageHeader

Replaces `ModuleTitle.vue` in `apps/cloud/src/Core/UI/`.

### Visual Design

```
┌─────────────────────────────────────────────────────────┐
│ [icon] Page Title          [inline controls]   [+ Add]  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← gradient accent
└─────────────────────────────────────────────────────────┘
```

### Styling

- Background: applied via a static class map (see "Tailwind Safelist" below) — NOT dynamic template interpolation
  - Uses the module's accent color at 20% opacity (e.g., `from-cyan-500/20` for Devices, `from-amber-500/20` for Turnouts)
- Border-radius: `rounded-xl`
- Padding: `px-4 py-3`
- Bottom margin: `mb-6`
- No `<hr>` divider — the gradient fade provides visual separation
- Icon + title left-aligned in a flex row
- Actions slot right-aligned via `v-spacer`
- Title: `<h2>` element, `text-2xl` with color classes applied via the same static class map
- Icon: `size="32"` with matching color classes

### Tailwind Safelist / Static Class Map

**Critical:** Tailwind purges dynamically constructed class names like `` `from-${color}-500/20` ``. The component MUST use a static lookup map:

```ts
const GRADIENT_CLASSES: Record<string, string> = {
  cyan:    'bg-gradient-to-r from-cyan-500/20 to-transparent',
  lime:    'bg-gradient-to-r from-lime-500/20 to-transparent',
  pink:    'bg-gradient-to-r from-pink-500/20 to-transparent',
  indigo:  'bg-gradient-to-r from-indigo-500/20 to-transparent',
  amber:   'bg-gradient-to-r from-amber-500/20 to-transparent',
  purple:  'bg-gradient-to-r from-purple-500/20 to-transparent',
  emerald: 'bg-gradient-to-r from-emerald-500/20 to-transparent',
  teal:    'bg-gradient-to-r from-teal-500/20 to-transparent',
  rose:    'bg-gradient-to-r from-rose-500/20 to-transparent',
  blue:    'bg-gradient-to-r from-blue-500/20 to-transparent',
  sky:     'bg-gradient-to-r from-sky-500/20 to-transparent',    // default fallback
  red:     'bg-gradient-to-r from-red-500/20 to-transparent',
}

const TEXT_CLASSES: Record<string, string> = {
  cyan:    'text-cyan-500 dark:text-cyan-400',
  lime:    'text-lime-500 dark:text-lime-400',
  pink:    'text-pink-500 dark:text-pink-400',
  indigo:  'text-indigo-500 dark:text-indigo-400',
  amber:   'text-amber-500 dark:text-amber-400',
  purple:  'text-purple-500 dark:text-purple-400',
  emerald: 'text-emerald-500 dark:text-emerald-400',
  teal:    'text-teal-500 dark:text-teal-400',
  rose:    'text-rose-500 dark:text-rose-400',
  blue:    'text-blue-500 dark:text-blue-400',
  sky:     'text-sky-500 dark:text-sky-400',
  red:     'text-red-500 dark:text-red-400',
}
```

This map covers all colors used in `useMenu()`. The component resolves `GRADIENT_CLASSES[color] ?? GRADIENT_CLASSES.sky`.

### Props

```ts
interface PageHeaderProps {
  menu?: string        // Menu key from useMenu() — auto-resolves icon, color, label
  label?: string       // Manual label (fallback when menu not provided or not found)
  icon?: string        // Manual icon (fallback when menu not provided or not found)
  color?: string       // Manual color (default: "sky")
  subtitle?: string    // Optional secondary text line (e.g., layout name)
}
```

### Prop Resolution / Fallback Chain

The component resolves display values in this order:
1. If `menu` is provided, call `getMenuItem(menu)` from `useMenu()`
2. If the lookup returns a match, use its `label`, `icon`, `color`
3. If the lookup returns `undefined` (no match), fall back to the explicit `label`, `icon`, `color` props
4. If neither `menu` nor explicit props are provided, use defaults: label = `""`, icon = `""`, color = `"sky"`

This matches the existing ModuleTitle fallback pattern (`menuItem ?? { label: props.label, ... }`).

**Special cases:**
- `Roster.vue` uses `menu="Loco Roster"` but useMenu has `label: "Roster"`. The menu lookup key must be updated to `menu="Roster"` in the page component.
- `UserProfile.vue` uses manual props (`label="User Profile"`, `color="red"`, `icon="mdi-lightning-bolt"`) — no `menu` prop. This continues to work via the fallback chain.

### Slots

- `default` — right-side actions area (ListMenu, buttons, etc.)
- `subtitle` — override for subtitle content

### Subtitle

When `subtitle` prop or slot is provided, render a smaller secondary text line below the title:
- `text-sm text-slate-400`
- Inside the same gradient container, below the title row

### Usage Examples

Simple page:
```vue
<PageHeader menu="Signals" />
```

Page with ListMenu + extra button:
```vue
<PageHeader menu="Effects">
  <ListMenu :disabled-menus="['view']" module-name="effects" />
  <v-btn icon="mdi-sort-variant" @click="showSorter = !showSorter" />
</PageHeader>
```

Layout page with subtitle:
```vue
<PageHeader menu="Devices" :subtitle="layout?.name" />
```

---

## Component: ListMenu (Modified)

Located at `packages/ui/src/ListMenu/ListMenu.vue`.

### New Prop

```ts
inline?: boolean  // When true, renders v-menu dropdowns instead of v-bottom-sheet
```

If `inline` is not explicitly set, the component uses `useDisplay()` from Vuetify and defaults to `mdAndUp` (inline on desktop, bottom sheet on mobile).

### Desktop Mode (inline = true)

Each enabled menu option (View, Sort, Filter) renders as a **chip-triggered `v-menu` dropdown**:

- **Trigger:** A `v-chip` showing the current selection with the option's icon and color
  - View: `mdi-eye` purple chip showing e.g., "Switch"
  - Sort: `mdi-sort` teal chip showing e.g., "Device"
  - Filter: `mdi-filter` red chip (only visible when filters are active, showing count)
- **Dropdown:** A `v-menu` anchored to the chip containing a `v-list` of selectable options
  - Single-select for View and Sort
  - Multi-select for Filter
- Active filters render as additional removable `v-chip` elements inline, placed after the trigger chips in the same flex row
- Clicking the "X" on a filter chip removes **that individual filter** only (fix the existing bug where `filterBy = []` clears all filters)

### Default/Empty State (Inline Chips)

- View chip: always visible, shows current value or `"View"` as fallback text
- Sort chip: always visible, shows current value or `"Sort"` as fallback text
- Filter chip: **hidden** when no filters are active. When active, shows `mdi-filter` with count badge (e.g., "2")

### Mobile Mode (inline = false)

Behavior unchanged from current implementation:
- Single `v-btn` icon (`mdi-tune`) as the trigger
- Opens a `v-bottom-sheet` with `v-card` sections for View, Sort, Filter
- Chip groups for selection within each section
- Current selections shown as summary chips at the bottom

---

## Pages Affected

### List Pages with ListMenu

| Page | File | Changes |
|------|------|---------|
| Effects | `Effects/Effects.vue` | ModuleTitle → PageHeader, ListMenu in default slot |
| Effects Add | `Effects/AddEffect.vue` | ModuleTitle → PageHeader, ListMenu in default slot |
| Effects Edit | `Effects/EditEffect.vue` | ModuleTitle → PageHeader, ListMenu in default slot |

### List Pages without ListMenu

| Page | File | Changes |
|------|------|---------|
| Roster | `Roster/Roster.vue` | ModuleTitle → PageHeader |
| Routes | `Routes/Routes.vue` | ModuleTitle → PageHeader |
| Signals | `Signals/Signals.vue` | ModuleTitle → PageHeader |
| Sensors | `Sensors/Sensors.vue` | ModuleTitle → PageHeader |
| Turnouts | `Turnouts/Turnouts.vue` | ModuleTitle → PageHeader |

### Detail/Edit Pages

| Page | File | Changes |
|------|------|---------|
| Edit Turnout | `Turnouts/EditTurnout.vue` | ModuleTitle → PageHeader |
| Add Turnout | `Turnouts/AddTurnout.vue` | ModuleTitle → PageHeader |
| Edit Route | `Routes/EditRoute.vue` | ModuleTitle → PageHeader |
| Add Route | `Routes/AddRoute.vue` | ModuleTitle → PageHeader |
| Edit Signal | `Signals/EditSignal.vue` | ModuleTitle → PageHeader |
| Add Signal | `Signals/AddSignal.vue` | ModuleTitle → PageHeader |
| Signal List | `Signals/SignalList.vue` | ModuleTitle → PageHeader |
| Edit Sensor | `Sensors/EditSensor.vue` | ModuleTitle → PageHeader |
| Add Sensor | `Sensors/AddSensor.vue` | ModuleTitle → PageHeader |
| Automation Form | `Sensors/AutomationForm.vue` | ModuleTitle → PageHeader |
| Automations | `Sensors/Automations.vue` | ModuleTitle → PageHeader |

### Standalone Pages

| Page | File | Changes |
|------|------|---------|
| DCC-EX | `DCCEX/DCCEX.vue` | ModuleTitle → PageHeader |
| Settings | `Settings/Settings.vue` | ModuleTitle → PageHeader |
| User Profile | `User/Profile/UserProfile.vue` | ModuleTitle → PageHeader |

### Special: Layout Page (Double Header Fix)

| Page | File | Changes |
|------|------|---------|
| Layout | `Layout/Layout.vue` | ModuleTitle → PageHeader with `subtitle` prop for layout name. Remove the extra gradient `<div>` with `<h2>` layout name. Remove the `<h3>` "Devices" sub-header. Device grid remains as content below the single PageHeader. |

---

## Styling Reference (DEJA Conventions)

Per the project's Tailwind conventions:

- Dark-mode-first design
- Gradient uses module accent color at 20% opacity: `from-{color}-500/20`
- Text colors: `text-{color}-500 dark:text-{color}-400`
- Rounded containers: `rounded-xl`
- Transitions on interactive elements: `transition-all duration-150 ease`
- Chips follow existing Vuetify patterns with `variant="elevated"` and `size="small"`

---

## Files Changed Summary

| Action | File |
|--------|------|
| **Create** | `apps/cloud/src/Core/UI/PageHeader.vue` |
| **Modify** | `packages/ui/src/ListMenu/ListMenu.vue` (add inline mode) |
| **Modify** | ~20 page components (swap ModuleTitle → PageHeader) |
| **Modify** | `apps/cloud/src/Core/UI/index.ts` (add PageHeader export, keep ModuleTitle export for backward compat) |
| **Keep** | `ModuleTitle.vue` (unused but not deleted — keep both file and export for backward compat) |

---

## Notes

- **ListMenu is self-contained** — it manages its own state via `useStorage()` and does not emit events or expose v-model bindings. PageHeader and ListMenu have no data contract between them; ListMenu just renders in PageHeader's default slot.
- **No animation on mode switch** — when the browser resizes across the md breakpoint, ListMenu simply re-renders in the new mode (no transition animation needed).
- **Semantic HTML** — PageHeader should use a `<div>` wrapper (not `<header>`, since the AppBar is the semantic page header). The title should remain `<h2>` to match the current heading level hierarchy.

---

## Out of Scope

- AppHeader (top navigation bar) — not changing
- Navigation drawer (Menu component) — not changing
- Other apps (throttle, monitor, tour) — cloud app only
- Adding ListMenu to pages that don't currently have it (can be done later)
