# Cloud App Left Nav Redesign

**Date:** 2026-03-16
**Status:** Approved
**Scope:** `apps/cloud` + `packages/ui`

---

## Goal

Redesign the left navigation sidebar in the Cloud app to improve organization and visual clarity. Inspired by Vercel's minimal sidebar style — grouped sections with muted headers, neutral active state, and per-item colored icons.

---

## Current State

The nav is a flat `v-list` of 11 items with no grouping. Each item has a unique bright color applied to both the icon and the active highlight. There are no section headers. A second list at the bottom contains links to other DEJA suite apps (Cloud, Throttle, Monitor, Tour, dejajs.com) as full list items.

**Files involved:**
- `packages/ui/src/Menu/Menu.vue` — renders the `v-navigation-drawer` and item list
- `packages/ui/src/Menu/types.ts` — `MenuItem` interface
- `apps/cloud/src/Core/Menu/useMenu.ts` — menu item definitions

---

## Design

### Section Structure

Three labeled sections, no collapsing:

| Section | Items |
|---|---|
| **Modules** | Roster, Turnouts, Routes, Effects, Signals, Sounds |
| **Hardware** | Sensors, Devices, DCC-EX |
| **System** | Settings, Emulator |

### Section Headers

- Small uppercase muted text: `text-xs tracking-wider opacity-50`
- No icon, no expand/collapse arrow
- Purely organizational — not interactive

### Item Style

- Left-aligned colored icon (per-item color, unchanged from current) + label text
- Comfortable padding: `px-3 py-2`
- No colored background or border in default state

### Active State

- Neutral semi-transparent background: `bg-white/10` (dark mode)
- Icon retains its per-item color — the icon color does all visual work
- Label text at full opacity (`text-white`)
- No colored tint on background (Vercel-style: neutral highlight only)

### Hover State

- Lighter neutral background: `bg-white/5`
- Smooth CSS transition

### App Switcher Footer

- Pinned to the bottom of the drawer, separated by a thin `v-divider`
- Icon-only row: Cloud, Throttle, Monitor, Tour
- Each icon wrapped in a `v-tooltip` showing the app name on hover
- External links (`target="_blank"`)
- Replaces the current full list-item approach for suite apps

---

## Component Changes

### `packages/ui/src/Menu/types.ts`

Add a `section` field to `MenuItem`:

```typescript
export interface MenuItem {
  color: string;
  icon: string;
  label: string;
  name: string;
  section: 'modules' | 'hardware' | 'system';
  isFavorite?: boolean;
}
```

Add a constant for the suite app switcher:

```typescript
export interface SuiteApp {
  label: string;
  icon: string;
  href: string;
}
```

### `apps/cloud/src/Core/Menu/useMenu.ts`

Update all 11 menu items to include `section`:

```typescript
// Modules
{ label: 'Roster',   section: 'modules',  color: 'pink',   icon: 'mdi-train',          name: 'roster' },
{ label: 'Turnouts', section: 'modules',  color: 'amber',  icon: 'mdi-call-split',     name: 'turnouts' },
{ label: 'Routes',   section: 'modules',  color: 'purple', icon: 'mdi-map',            name: 'routes' },
{ label: 'Effects',  section: 'modules',  color: 'indigo', icon: 'mdi-rocket-launch',  name: 'effects' },
{ label: 'Signals',  section: 'modules',  color: 'emerald',icon: 'mdi-traffic-light',  name: 'signals' },
{ label: 'Sounds',   section: 'modules',  color: 'sky',    icon: 'mdi-volume-high',    name: 'sounds' },

// Hardware
{ label: 'Sensors',  section: 'hardware', color: 'teal',   icon: 'mdi-access-point',   name: 'sensors' },
{ label: 'Devices',  section: 'hardware', color: 'cyan',   icon: 'mdi-developer-board',name: 'devices' },
{ label: 'DCC-EX',   section: 'hardware', color: 'lime',   icon: 'mdi-cpu-64-bit',     name: 'dcc-ex' },

// System
{ label: 'Settings', section: 'system',   color: 'blue',   icon: 'mdi-cog',            name: 'settings' },
{ label: 'Emulator', section: 'system',   color: 'rose',   icon: 'mdi-console',        name: 'emulator' },
```

### `packages/ui/src/Menu/Menu.vue`

Refactor to render grouped sections:

1. Compute items grouped by `section` (modules → hardware → system)
2. Render each group with a section header `<div>` above the items
3. Section header: `text-xs uppercase tracking-wider opacity-50 px-3 pt-4 pb-1`
4. Replace hardcoded `DEJA_SUITE_MENU` full list items with icon-only footer row
5. Update active state binding:
   - Remove `:color="item.color"` from `v-list-item` (eliminates colored active backgrounds)
   - Add manual active class: `bg-white/10` when route matches
   - Keep icon color via `:class="\`text-${item.color}-500\`"` on `v-icon`

---

## What Does Not Change

- `v-navigation-drawer` wrapper (mobile/desktop behavior, `temporary` prop)
- `MenuItem` `color`, `icon`, `label`, `name` fields — only `section` is added
- Route names and navigation logic (`handleMenu`)
- AppHeader and layout structure in `App.vue`
- All 11 existing route definitions

---

## Out of Scope

- Dashboard route (currently commented out — leave as-is)
- Adding new routes or features
- Changing the header (`AppHeader`)
- Mobile-specific nav changes beyond what already exists
