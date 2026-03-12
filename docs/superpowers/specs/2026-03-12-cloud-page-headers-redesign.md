# Cloud App Page Headers Redesign

**Date:** 2026-03-12
**Status:** Approved
**Scope:** `apps/cloud/`, `packages/ui/src/ListMenu/`

---

## Problem

The cloud app's page headers have two issues:

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

- Background: `bg-gradient-to-r from-{color}-500/20 to-transparent`
  - Uses the module's accent color (e.g., `from-cyan-500/20` for Devices, `from-amber-500/20` for Turnouts)
- Border-radius: `rounded-xl`
- Padding: `px-4 py-3`
- Bottom margin: `mb-6`
- No `<hr>` divider — the gradient fade provides visual separation
- Icon + title left-aligned in a flex row
- Actions slot right-aligned via `v-spacer`
- Title: `text-2xl` with `text-{color}-500 dark:text-{color}-400`
- Icon: `size="32"` with matching color classes

### Props

```ts
interface PageHeaderProps {
  menu?: string        // Menu key from useMenu() — auto-resolves icon, color, label
  label?: string       // Manual label (fallback when menu not provided)
  icon?: string        // Manual icon (fallback when menu not provided)
  color?: string       // Manual color (default: "sky")
  subtitle?: string    // Optional secondary text line (e.g., layout name)
}
```

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
- Active filters render as additional removable `v-chip` elements inline

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
| **Modify** | `apps/cloud/src/Core/UI/index.ts` (export PageHeader) |
| **Keep** | `ModuleTitle.vue` (unused but not deleted, avoids breaking anything) |

---

## Out of Scope

- AppHeader (top navigation bar) — not changing
- Navigation drawer (Menu component) — not changing
- Other apps (throttle, monitor, tour) — cloud app only
- Adding ListMenu to pages that don't currently have it (can be done later)
