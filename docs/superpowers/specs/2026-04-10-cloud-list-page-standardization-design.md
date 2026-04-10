# Cloud App List Page Standardization — Design

**Date:** 2026-04-10
**Status:** Approved
**Scope:** `apps/cloud/src/` list pages only

## Goal

Make every list page in the cloud app share the same layout skeleton — title, optional controls, add button, body, empty state, and margins — so that pages feel like parts of the same product instead of individually-styled islands.

## Background

Most list pages in `apps/cloud/` already use `PageHeader` from `@repo/ui`, but a handful of pages drifted:

- **TrackDiagram** uses a local `ModuleTitle.vue` (an `h2` in a `v-sheet`) instead of `PageHeader`, and uses an inline `AddTile` instead of a header button.
- **Devices (`Layout.vue`)** uses `PageHeader` correctly but also renders an inline `AddTile` for the add action.
- **PowerDistricts** uses `PageHeader` minimally and rolls a custom inline `v-card` for its empty state instead of `EmptyState`.
- There are two duplicate components in `apps/cloud/src/Core/UI/`:
  - `ModuleTitle.vue` — a smaller/older title component, only used by TrackDiagram.
  - `EmptyState.vue` — a near-duplicate of `@repo/ui/EmptyState`.
- Loading skeletons use ad-hoc `gap-3 p-4` / `pa-4` classes instead of a shared skeleton.

Outer page margins are **already correct** — `App.vue` wraps every page in a `v-container` with `pa-6 pa-md-12 max-w-7xl mx-auto`. No global layout changes are needed.

## Non-goals

- **Settings page.** Keeps its custom two-column layout with sidebar nav.
- **Form pages** (Add/Edit Loco, Effect, Signal, etc.). Keep `FormPageHeader` with its gradient style.
- **Dashboard.** Not a list page, untouched.
- **`@repo/ui/PageHeader` itself.** Not modified. `ListPage` wraps it, does not replace it.
- **Global margins in `App.vue`.** Already correct.
- **New design tokens, colors, or Vuetify theme changes.**
- **Adding a "New Power District" route.** PowerDistricts renders without an add button; adding the route is a separate feature.

## Design

### The `<ListPage>` component

A new cloud-app-specific wrapper component at `apps/cloud/src/Core/UI/ListPage.vue` that encodes the approved layout and composes `@repo/ui/PageHeader` + `@repo/ui/EmptyState`.

**Why a component instead of a documented convention:** a single enforceable surface. New list pages become ~10 lines of template that are hard to get wrong, and any future list page that doesn't use `<ListPage>` stands out in review.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Passed to `PageHeader`. Required. |
| `icon` | `string?` | MDI icon, passed to `PageHeader`. |
| `color` | `string?` | Accent color, passed to `PageHeader`. |
| `subtitle` | `string?` | Passed to `PageHeader`. |
| `addTo` | `RouteLocationRaw?` | Router destination for the "Add" button. When omitted, no button is rendered (read-only / no-add pages like PowerDistricts). |
| `addLabel` | `string?` | Button label, e.g. `"New Loco"`. Defaults to `"New"`. |
| `empty` | `boolean?` | When `true`, renders the `empty-state` slot instead of `default`. |
| `loading` | `boolean?` | When `true`, renders a shared skeleton in place of the body. |

**Slots:**

- `controls` — forwarded to `PageHeader`'s `#controls` slot (for `ListControlBar`). Omit entirely when a page does not need controls; the visual rhythm stays consistent because `PageHeader`'s height is the same whether `#controls` is filled or not.
- `default` — the list body.
- `empty-state` — custom empty state. When omitted, `<ListPage>` falls back to a default `<EmptyState>` from `@repo/ui` using `title` and `icon`.

**What `<ListPage>` does NOT do:**

- No outer padding or `max-width`. `App.vue` already applies `pa-6 pa-md-12 max-w-7xl mx-auto` globally, so `<ListPage>` is transparent to page margins. No per-page `pa-*` or `ma-*` classes on the root.
- It does not render a `ListControlBar` automatically — that stays the page's responsibility, passed through the `controls` slot.

**Example usage:**

```vue
<script setup lang="ts">
import { mdiTrainCar } from '@mdi/js'
import ListPage from '@/Core/UI/ListPage.vue'
import ListControlBar from '@repo/ui/ListControlBar'
import RosterList from './RosterList.vue'
import { useLocos } from '@repo/modules'

const { locos, loading } = useLocos()
</script>

<template>
  <ListPage
    title="Roster"
    :icon="mdiTrainCar"
    color="pink"
    subtitle="Your locomotives"
    :add-to="{ name: 'Add Loco' }"
    add-label="New Loco"
    :loading="loading"
    :empty="!loading && locos.length === 0"
  >
    <template #controls>
      <ListControlBar ... />
    </template>
    <RosterList :locos="locos" />
  </ListPage>
</template>
```

### Agreed conventions (from brainstorming)

1. **Scope:** list pages only (Roster, Sounds, Effects, Routes, Signals, Sensors, Turnouts, TrackDiagram, PowerDistricts, Devices/Layout, and the Sensors/Automations + Turnouts/Labels secondary lists). Settings, forms, and Dashboard are untouched.
2. **Add button pattern:** one button in `PageHeader`'s `#actions` slot, rendered by `<ListPage>` from `addTo` / `addLabel`. No inline `AddTile`.
3. **ListControlBar:** optional but consistently positioned via the `#controls` slot. Pages that don't need sort/filter/search simply omit it.
4. **Empty state:** every list page uses `@repo/ui/EmptyState`, either via `<ListPage>`'s default or via the `empty-state` slot.
5. **Duplicate components deleted** after migration: `Core/UI/ModuleTitle.vue` and `Core/UI/EmptyState.vue`.

### Per-page migration

| Page | Changes |
|---|---|
| **Roster** | Swap `PageHeader` for `<ListPage>`. Keep `ListControlBar` in `#controls`. Move "New Loco" from `#actions` to `add-to` / `add-label`. Remove local `pa-4` on loading skeleton — use `ListPage`'s `loading` prop. |
| **Sounds** | Swap. No `ListControlBar` (stays that way). `add-to = { name: 'Add Sound' }`. |
| **Effects** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Effect' }`. |
| **Routes** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Route' }`. |
| **Signals** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Signal' }`. |
| **Sensors** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Sensor' }`. |
| **Sensors/Automations** | Secondary list page. Same pattern. `add-to = { name: 'Add Automation' }`. |
| **Turnouts** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Turnout' }`. |
| **Turnouts/Labels** | Secondary list page. Same pattern. |
| **TrackDiagram** | Replace `ModuleTitle` with `<ListPage>`. **Remove the inline `AddTile`** — replaced by the header "New Track Diagram" button. Body becomes the diagram grid. |
| **PowerDistricts** | Swap. No `ListControlBar`. **Replace the custom inline empty-state `v-card`** with `<EmptyState>` via the `empty` prop. **No `addTo` prop** — the route does not exist and is out of scope. |
| **Devices (`Layout.vue`)** | Swap. **Remove the inline `AddTile`** — replaced by header "Add Device" button. Draggable grid stays in the default slot. If drag-and-drop code depended on `AddTile` as a drop target, the dead drag code is removed too (drag feature is unused). |

### Files deleted after migration

- `apps/cloud/src/Core/UI/ModuleTitle.vue`
- `apps/cloud/src/Core/UI/EmptyState.vue`

Before deleting either, grep the full monorepo for imports to confirm no other callers. If any exist, migrate them first.

## Rollout order

1. Build `<ListPage>` in `apps/cloud/src/Core/UI/ListPage.vue`. No callers yet.
2. Migrate **Roster** as the template. Verify visually.
3. Migrate the straightforward pages (one commit each or one grouped commit, at the implementer's discretion): Sounds, Effects, Routes, Signals, Sensors, Sensors/Automations, Turnouts, Turnouts/Labels.
4. Migrate the outliers — one commit per page for easy bisecting: **TrackDiagram**, **Devices**, **PowerDistricts**.
5. Grep for imports of the duplicate files and delete them if unreferenced.
6. Run `/verify-changes` (lint + type-check + build).

## Testing

- **No unit tests** — `<ListPage>` is presentational and composes well-tested primitives.
- **Visual verification** via `/capture-screenshots cloud` before merging. Side-by-side before/after for the 10+ affected pages in the PR description.
- **Manual click-through** in dev mode to confirm every Add button navigates correctly.

## Risks & mitigations

- **TrackDiagram and Devices lose visual prominence for the "add" action** when `AddTile` goes away. Mitigated by the header button being clearly labeled. If the new UX feels wrong after we see it, a dedicated "empty grid" CTA can be added inside `EmptyState` without reverting the rest.
- **Deleting duplicate components could break an unknown caller.** Mitigated by grepping before deletion and by the per-commit rollout.
- **Devices drag-and-drop may depend on `AddTile`** as a drop target. Verified during TrackDiagram/Devices migration; if removing `AddTile` unravels the drag code, that code gets removed alongside since the drag feature is unused.
