# 🚂 Roster UI Redesign — Design Spec

**Date:** 2026-04-03
**Branch:** `feature/roster-ui`
**Scope:** New shared roster view components for cloud and throttle apps

---

## Overview

Replace the existing roster UI (circular `LocoAvatar` buttons + `RosterItem` cards) with three distinct view modes built as shared components in `@repo/ui`. The centerpiece is a **locomotive number plate** component inspired by real cast-brass number boards found on diesel and steam locomotives.

---

## Components

### 1. `LocoNumberPlate.vue` (`@repo/ui`)

A fixed-width locomotive number plate component that displays the DCC address in the style of a cast-brass number board.

**Visual design:**
- Dark face (`#111`) with colored border and numbers matching the loco's roadname color
- Rounded rectangle with gradient border (roadname color)
- Inner border line matching the roadname color
- Rivet/fastener dots in corners (all sizes)
- **Font:** Roboto Condensed 700, sans-serif
- **Fixed width per size** — same plate width regardless of digit count (max 4 digits)

**Props:**
- `address: number` — DCC address (1–9999, displayed up to 4 digits)
- `color: string` — roadname color key (falls back to default)
- `size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'` — plate size (default: `'md'`)
- `showLabel: boolean` — show loco name below the plate (default: `false`)
- `label: string` — text to display below (typically loco name)

**Size specifications:**

| Size | Plate width | Plate height | Font size | Letter spacing | Rivets |
|------|-------------|--------------|-----------|----------------|--------|
| xs   | 52px        | 22px         | 14px      | 1.5px          | 2 (top corners) |
| sm   | 76px        | 30px         | 18px      | 2px            | 2 (top corners) |
| md   | 104px       | 40px         | 26px      | 3px            | 2 (top corners) |
| lg   | 136px       | 52px         | 34px      | 4px            | 4 (all corners) |
| xl   | 176px       | 66px         | 44px      | 5px            | 5 (corners + top center) |
| 2xl  | 220px       | 82px         | 56px      | 7px            | 6 (corners + top/bottom center) |

**Rivet detail:** Small circular dots with radial gradient (`#666` → `#333`) and inset shadow. Positioned in plate corners; larger sizes add center rivets.

**Replaces:** Existing `LocoAvatar.vue` (circular `v-btn` with address text). All existing usages of `LocoAvatar` should be migrated to `LocoNumberPlate`.

### 2. `LocoCard.vue` (`@repo/ui`)

Image-dominant card for the card view mode.

**Layout:**
- **Image area** (top, ~160px height): Displays `meta.imageUrl` if available. Fallback: roadname-colored gradient background with railroad logo SVG as a watermark
- **Number plate overlay:** `LocoNumberPlate` (sm size) positioned bottom-right of image area
- **Consist badge:** Pink pill badge top-right showing consist count (only when `consist.length > 0`)
- **Info strip** (bottom): Loco name (primary), roadname label + address (secondary, muted)

**Props:**
- `loco: Loco` — the locomotive data object

**Emits:**
- `click` — when card is clicked (cloud: navigate to edit, throttle: navigate to throttle)

### 3. `LocoListRow.vue` (`@repo/ui`)

Minimal table row for the list view mode.

**Columns:**
1. **Number plate** — `LocoNumberPlate` at sm size
2. **Logo** — tiny railroad logo image (from SVG assets, ~16–20px)
3. **Name** — loco name (primary text)
4. **Road** — roadname label, colored in roadname color
5. **Address** — DCC address number (muted)
6. **Consist** — consist count badge (pink pill) or dash when none

**Props:**
- `loco: Loco` — the locomotive data object

**Emits:**
- `click` — when row is clicked

### 4. `LocoRoster.vue` (`@repo/ui`)

Orchestrator component that wraps all three views with a view switcher.

**Props:**
- `locos: Loco[]` — filtered/sorted loco list
- `defaultView: 'avatar' | 'card' | 'list'` — initial view mode
- `moduleName: string` — localStorage key prefix for persisting view preference

**View options:**
- Avatar (icon: `mdi-view-module`) — grid of `LocoNumberPlate` components
- Card (icon: `mdi-view-grid-outline`) — grid of `LocoCard` components
- List (icon: `mdi-view-list`) — table of `LocoListRow` components

**Emits:**
- `select(loco: Loco)` — when a loco is clicked in any view

Uses existing `useListControls` composable for view state persistence.

---

## Data Model Changes

### `Loco.meta` — add `imageUrl`

```typescript
interface Loco {
  // ... existing fields
  meta?: {
    color?: string
    roadname?: string
    imageUrl?: string  // ✨ NEW — URL to a loco photo
  }
}
```

No migration needed — field is optional. Cards without `imageUrl` show a roadname-colored gradient fallback with the railroad logo as watermark.

### `RoadName` — add `logo`

```typescript
interface RoadName {
  value: string
  label: string
  color: string
  logo: string  // ✨ NEW — import path to SVG asset
}
```

---

## Asset Changes

### Railroad logos → `@repo/ui`

Move logo SVGs from `apps/throttle/src/assets/logos/` to `packages/ui/src/assets/logos/`:
- `amtrak.svg`, `bn.svg`, `bnsf.svg`, `cn.svg`, `csx.svg`, `gn.svg`, `mrl.svg`, `ns.svg`, `santefe.svg`, `up.svg`

Keep the PNGs (`bnsf.png`, `mrl.png`, `passenger.png`) in throttle if they're used elsewhere there, or move alongside.

Update `ROADNAMES` constant in `@repo/modules/locos/constants.ts` to reference logos.

### Google Font

Add `Roboto Condensed` (weight 700) to the apps that use roster components. Both cloud and throttle already load Roboto; only the Condensed variant needs adding.

---

## App Integration

### Cloud App (`apps/cloud/src/Roster/`)

- `Roster.vue`: Replace `RosterList` usage with `LocoRoster` (default view: `'card'`)
- `RosterItem.vue`: Remove — replaced by `LocoCard`
- `RosterList.vue`: Remove — replaced by `LocoRoster`
- Keep existing: page header, action buttons (New Loco, Sync, Import), empty state, snackbar
- `@click` handler: navigate to edit loco page

### Throttle App (`apps/throttle/src/views/`)

- `RosterView.vue`: Replace `List` + `LocoAvatar` usage with `LocoRoster` (default view: `'avatar'`)
- `@click` handler: navigate to throttle page for that address

---

## What's NOT in Scope

- Image upload functionality (users paste a URL, no file upload UX)
- Loco edit form changes (adding `imageUrl` field to the edit form is a separate task)
- Drag-to-reorder in the new views
- Sound badge display
- Function count display
