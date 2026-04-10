# Cloud App List Page Standardization — Design

**Date:** 2026-04-10
**Status:** Approved
**Scope:** `apps/cloud/src/` list pages only

## Goal

Make every list page in the cloud app share the same layout skeleton — title, optional controls, add button, body, empty state, and margins — so that pages feel like parts of the same product instead of individually-styled islands.

## Background

Most list pages in `apps/cloud/` already use `PageHeader` from `@repo/ui` plus the local `apps/cloud/src/Core/UI/EmptyState.vue` — a richer empty-state component with `color`, `useCases`, `actionLabel`, `actionTo`, and an animated glow treatment. But a handful of pages drifted:

- **TrackDiagram (`TrackDiagram.vue`)** uses the local `ModuleTitle.vue` (an `h2` in a `v-sheet`) instead of `PageHeader`, and uses an inline `AddTile` instead of a header button.
- **Devices (`Layout.vue`)** uses `PageHeader` correctly but also renders an inline `AddTile` for the add action.
- **Sensors/Automations (`Automations.vue`)** uses `AddTile` inline too.
- **PowerDistricts** uses `PageHeader` minimally and rolls a custom inline `v-card` for its empty state instead of the shared `EmptyState`.
- Loading skeletons use ad-hoc `grid ... gap-3 p-4` classes duplicated across every page.
- Every list page duplicates the same `v-if isLoading / v-else-if hasItems / v-else` template scaffold by hand.

Outer page margins are **already correct** — `App.vue` wraps every page in a `v-container` with `pa-6 pa-md-12 max-w-7xl mx-auto`. No global layout changes are needed.

**Not in scope, despite their names suggesting duplication:**

- `@repo/ui/EmptyState` is a 20-line stub with only `icon`/`title`/`description` — a different component with a different API from the local `Core/UI/EmptyState.vue`. It is not used by any cloud list page and is not being touched.
- `Core/UI/ModuleTitle.vue` is ALSO used by `AddTrackDiagram.vue` and `EditTrackDiagram.vue`, which are form pages and therefore out of scope. The file stays; only `TrackDiagram.vue` (the list page) migrates away from it.
- `Core/UI/index.ts` has a broken export for a non-existent `PageHeader.vue`. No callers use it; it is dead code and left alone.

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

A new cloud-app-specific wrapper component at `apps/cloud/src/Core/UI/ListPage.vue` that encodes the approved layout. It composes `@repo/ui/PageHeader` and the existing local `@/Core/UI/EmptyState.vue`.

**Why a component instead of a documented convention:** a single enforceable surface. New list pages become ~10 lines of template that are hard to get wrong, and any future list page that doesn't use `<ListPage>` stands out in review.

**The three states `<ListPage>` renders internally** (matches current per-page convention):

1. **`loading === true`** → a shared skeleton grid. Replaces every page's hand-written `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4"><v-skeleton-loader ... /></div>`.
2. **`empty === true`** → renders the `empty-state` slot **alone**, with no `PageHeader` above it. Matches today's behavior where the rich `EmptyState` takes the whole page when the list is empty.
3. **Otherwise** → renders `PageHeader` (with subtitle / controls / actions slots) followed by the `default` slot.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Passed to `PageHeader`. Required. |
| `icon` | `string?` | MDI icon, passed to `PageHeader`. |
| `color` | `string?` | Accent color, passed to `PageHeader`. |
| `subtitle` | `string?` | Passed to `PageHeader`. |
| `addTo` | `RouteLocationRaw?` | When set, `<ListPage>` renders an "Add" button as the last child of the actions slot. When omitted, no automatic Add button (e.g. PowerDistricts). |
| `addLabel` | `string?` | Button label. Defaults to `"New"`. |
| `loading` | `boolean?` | When `true`, renders a shared skeleton in place of everything. |
| `empty` | `boolean?` | When `true`, renders only the `empty-state` slot. |

**Slots:**

- `subtitle` — forwarded to `PageHeader`'s `#subtitle` slot (optional; also accepts the `subtitle` prop).
- `controls` — forwarded to `PageHeader`'s `#controls` slot (for `ListControlBar`). Omit entirely when a page does not need controls.
- `actions` — forwarded to `PageHeader`'s `#actions` slot. Rendered **before** the auto-generated Add button so extra actions (Roster's Sync/Import) sit next to it.
- `default` — the list body.
- `empty-state` — the full-page empty state. Required if `empty` can ever be `true`.

**What `<ListPage>` does NOT do:**

- No outer padding or `max-width`. `App.vue` already applies `pa-6 pa-md-12 max-w-7xl mx-auto` globally. No per-page `pa-*` or `ma-*` classes on the root.
- It does not render a `ListControlBar` automatically.
- It does not know about empty-state content — the page owns the slot so per-page copy, use cases, and action targets stay page-specific.

**Example usage (Effects, the simplest common case):**

```vue
<script setup lang="ts">
import ListPage from '@/Core/UI/ListPage.vue'
import { ListControlBar } from '@repo/ui'
import EmptyState from '@/Core/UI/EmptyState.vue'
import EffectsList from '@/Effects/EffectsList.vue'
// ... existing imports and setup ...
</script>

<template>
  <ListPage
    title="Effects"
    icon="mdi-rocket-launch"
    color="indigo"
    subtitle="Manage lighting, sound, and special effects for your layout."
    :add-to="{ name: 'Add Effect' }"
    add-label="New Effect"
    :loading="isLoading"
    :empty="isLoaded && effectsList.length === 0"
  >
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="indigo"
        :sort-options="sortOptions"
        :filters="filters"
        :show-view="false"
        search-placeholder="Search effects..."
      />
    </template>

    <EffectsList :filtered-list="controls.filteredList.value" @edit="handleEdit" />

    <template #empty-state>
      <EmptyState
        icon="mdi-rocket-launch"
        color="indigo"
        title="No Effects Yet"
        :description="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name} ...` : 'Create ...'"
        :use-cases="[
          { icon: 'mdi-volume-high', text: 'Ambient sounds & audio' },
          { icon: 'mdi-led-on', text: 'LED animations & lighting' },
          { icon: 'mdi-play-circle', text: 'Triggered sequences' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Create Your First Effect'"
        :action-to="isFreePlan ? '/upgrade' : '/effects/new'"
      />
    </template>
  </ListPage>
</template>
```

### Agreed conventions (from brainstorming)

1. **Scope:** list pages only (Roster, Sounds, Effects, Routes, Signals, Sensors, Turnouts, TrackDiagram, PowerDistricts, Devices/Layout, plus Sensors/Automations and Turnouts/Labels secondary lists). Settings, forms, and Dashboard are untouched.
2. **Add button pattern:** one button in `PageHeader`'s `#actions` slot, rendered by `<ListPage>` from `addTo` / `addLabel`. No inline `AddTile` on list pages.
3. **ListControlBar:** optional but consistently positioned via the `#controls` slot. Pages that don't need sort/filter/search simply omit it.
4. **Empty state:** every list page uses the existing local `@/Core/UI/EmptyState.vue`. No new empty-state component is introduced.
5. **No component deletions in this pass.** `ModuleTitle.vue`, `AddTile.vue`, and `EmptyState.vue` all stay on disk — they have legitimate out-of-scope callers or will simply become unused by list pages. A follow-up pass can clean them up after the form pages are also standardized.

### Per-page migration

Roster is the most complex migration (it has three `#actions` buttons: Sync, Import, and the new Add). All others are simpler.

| Page | Changes |
|---|---|
| **Roster** | Swap to `<ListPage>`. Keep `ListControlBar` in `#controls`. Move "New Loco" from `#actions` to `add-to` / `add-label`. Keep Sync/Import in the `actions` slot. Remove the hand-written loading grid — use `loading` prop. |
| **Sounds** | Swap. No `ListControlBar`. `add-to = { name: 'Add Sound' }`. |
| **Effects** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Effect' }`. |
| **Routes** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Route' }`. |
| **Signals** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Signal' }`. |
| **Sensors** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Sensor' }`. |
| **Sensors/Automations** | Swap. **Remove the inline `AddTile`** — replaced by header "New Automation" button. |
| **Turnouts** | Swap. `ListControlBar` → `#controls`. `add-to = { name: 'Add Turnout' }`. |
| **TrackDiagram** | Replace `ModuleTitle` with `<ListPage>`. **Remove the inline `AddTile`** from `TrackDiagramList`'s `#prepend` slot — replaced by the header "New Track Diagram" button (navigates to the existing `Add Track Diagram` route). Body is `TrackDiagramList`. `ModuleTitle.vue` stays on disk (used by Add/Edit form pages). |
| **Sensors/Automations** | Swap. No `ListControlBar`. **Remove `AddTile`** from `AutomationList`'s `#prepend` slot — replaced by header "New Automation" button via `add-to`. |
| **Devices (`Layout.vue`)** | Swap. **Remove the inline `AddTile`** from the draggable footer. Add a header "Add Device" button to the **`actions` slot** (not `addTo`) that toggles the existing `showAdd` ref — `AddDeviceItem` form stays unchanged. Remove the `<div class="animate-fade-in-up space-y-4">` wrapper; `<ListPage>` owns layout. Draggable grid stays in the default slot. |
| **PowerDistricts** | Swap. No `ListControlBar`. **Replace the custom inline empty-state `v-card`** with the local `EmptyState` via the `empty-state` slot. Remove the double-padding `<div class="pa-4">` wrapper. Keep the existing "Add District" button + inline form via the **`actions` slot** (not `addTo`, since it's a toggle not a route). |

**Excluded from migration:**

- **`Turnouts/TurnoutLabels.vue`** — a print-friendly page with a bare `<h1>` and browser-print instructions. Its minimal chrome is intentional. Not a list page in the UX sense.

### Files deleted after migration

**None.** All existing components stay on disk:

- `Core/UI/ModuleTitle.vue` — still used by `AddTrackDiagram.vue` / `EditTrackDiagram.vue` (form pages, out of scope).
- `Core/UI/AddTile.vue` — still exported from `Core/UI/index.ts`. Becomes unused by list pages but is not deleted in this pass.
- `Core/UI/EmptyState.vue` — the canonical local empty state. Actively used on every list page.

Cleanup of unused components (`AddTile`, dead barrel exports) can happen in a follow-up pass after the form-page standardization.

## Rollout order

1. Build `<ListPage>` in `apps/cloud/src/Core/UI/ListPage.vue`. No callers yet.
2. Migrate **Effects** first — it's the canonical "simple list page" and maps cleanly to the example in this spec. Verify visually.
3. Migrate **Roster** — the most complex `actions`-slot case. If Roster works, the rest are mechanical.
4. Migrate the remaining standard pages: Sounds, Routes, Signals, Sensors, Turnouts.
5. Migrate **Sensors/Automations** (AddTile removal).
6. Migrate the outliers — one commit per page: **TrackDiagram**, **Devices (Layout)**, **PowerDistricts**.
7. Run `/verify-changes` (lint + type-check + build).

## Testing

- **No unit tests** — `<ListPage>` is presentational and composes well-tested primitives.
- **Visual verification** via `/capture-screenshots cloud` before merging. Side-by-side before/after for the 10+ affected pages in the PR description.
- **Manual click-through** in dev mode to confirm every Add button navigates correctly.

## Risks & mitigations

- **TrackDiagram and Devices lose visual prominence for the "add" action** when `AddTile` goes away. Mitigated by the header button being clearly labeled. If the new UX feels wrong after we see it, a dedicated "empty grid" CTA can be added inside `EmptyState` without reverting the rest.
- **Deleting duplicate components could break an unknown caller.** Mitigated by grepping before deletion and by the per-commit rollout.
- **Devices drag-and-drop may depend on `AddTile`** as a drop target. Verified during TrackDiagram/Devices migration; if removing `AddTile` unravels the drag code, that code gets removed alongside since the drag feature is unused.
