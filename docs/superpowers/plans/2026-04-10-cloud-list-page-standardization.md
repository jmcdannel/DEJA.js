# Cloud List Page Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify every list page in `apps/cloud/` behind a single `<ListPage>` wrapper so titles, Add buttons, controls, margins, loading skeletons, and empty states look and behave identically.

**Architecture:** Introduce one cloud-app-specific component `apps/cloud/src/Core/UI/ListPage.vue` that composes `@repo/ui/PageHeader` plus the existing local `@/Core/UI/EmptyState.vue`. It owns the three page states (loading / empty / has-items) that every list page currently hand-rolls. Each list page becomes a thin template wrapping `<ListPage>` with its page-specific data, controls, body, and empty-state content. No existing shared packages are touched.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Vuetify 3, `@repo/ui` (PageHeader, ListControlBar, useListControls), `@vueuse/core`, vue-router.

**Reference spec:** `docs/superpowers/specs/2026-04-10-cloud-list-page-standardization-design.md`

---

## File structure

**New file (1):**
- `apps/cloud/src/Core/UI/ListPage.vue` — the wrapper component.

**Modified files (12):**
- `apps/cloud/src/Roster/Roster.vue`
- `apps/cloud/src/Sounds/Sounds.vue`
- `apps/cloud/src/Effects/Effects.vue`
- `apps/cloud/src/Routes/Routes.vue`
- `apps/cloud/src/Signals/Signals.vue`
- `apps/cloud/src/Sensors/Sensors.vue`
- `apps/cloud/src/Sensors/Automations.vue`
- `apps/cloud/src/Turnouts/Turnouts.vue`
- `apps/cloud/src/TrackDiagram/TrackDiagram.vue`
- `apps/cloud/src/Layout/Layout.vue`
- `apps/cloud/src/PowerDistricts/PowerDistricts.vue`

**Not modified:**
- `apps/cloud/src/Turnouts/TurnoutLabels.vue` — print-friendly page, excluded from scope.
- `apps/cloud/src/Core/UI/ModuleTitle.vue`, `EmptyState.vue`, `AddTile.vue` — stay on disk, see spec.
- Any form page (Add/Edit *).
- `@repo/ui/PageHeader` or any other shared package.

---

## Task 1: Build `<ListPage>` component

**Files:**
- Create: `apps/cloud/src/Core/UI/ListPage.vue`

- [ ] **Step 1: Create the component file**

Create `apps/cloud/src/Core/UI/ListPage.vue` with exactly this content:

```vue
<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { PageHeader } from '@repo/ui'

defineProps<{
  title: string
  icon?: string
  color?: string
  subtitle?: string
  addTo?: RouteLocationRaw
  addLabel?: string
  loading?: boolean
  empty?: boolean
}>()
</script>

<template>
  <!-- 🔄 Loading -->
  <div
    v-if="loading"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4"
  >
    <v-skeleton-loader v-for="n in 6" :key="n" type="card" />
  </div>

  <!-- 📭 Empty -->
  <template v-else-if="empty">
    <slot name="empty-state" />
  </template>

  <!-- ✅ Has items -->
  <template v-else>
    <PageHeader
      :title="title"
      :icon="icon"
      :color="color"
      :subtitle="subtitle"
    >
      <template v-if="$slots.subtitle" #subtitle>
        <slot name="subtitle" />
      </template>
      <template v-if="$slots.controls" #controls>
        <slot name="controls" />
      </template>
      <template v-if="$slots.actions || addTo" #actions>
        <slot name="actions" />
        <v-btn
          v-if="addTo"
          prepend-icon="mdi-plus"
          :color="color"
          variant="flat"
          size="small"
          :to="addTo"
        >
          {{ addLabel ?? 'New' }}
        </v-btn>
      </template>
    </PageHeader>

    <slot />
  </template>
</template>
```

**Notes:**
- The `addTo` button is rendered *after* the `actions` slot so extra actions (Roster's Sync/Import) sit to the left of the "New X" button.
- The `color` on the Add button matches the page's accent color automatically.
- The skeleton grid uses three columns at `lg` — matches the current hand-written skeletons on every page except Routes. Routes had `grid-cols-1` with 4 items; that page loses a specific skeleton layout, which is acceptable given the spec's goal of uniformity.
- No `pa-*` or `ma-*` on the root — page margins come from `App.vue`.
- `<ListPage>` has no script logic beyond `defineProps` — it's pure template.

- [ ] **Step 2: Type-check and build**

Run: `pnpm --filter=deja-cloud check-types`
Expected: PASS with no new errors.

Run: `pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Core/UI/ListPage.vue
git commit -m "feat(cloud): 🧩 add ListPage wrapper for unified list page layout

Composes @repo/ui/PageHeader + local EmptyState so every list page
can share the same three-state (loading/empty/has-items) skeleton.
No callers yet."
```

---

## Task 2: Migrate Effects (simple-case template)

**Files:**
- Modify: `apps/cloud/src/Effects/Effects.vue`

**Why first:** Effects is the cleanest "simple list page" (one Add button, controls, rich empty state). Getting it right validates the `<ListPage>` API before touching anything harder.

- [ ] **Step 1: Replace the template block**

In `apps/cloud/src/Effects/Effects.vue`, replace the entire `<template>` block (currently lines 82–133) with:

```vue
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
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to create lighting, sound, and animation effects for your layout.`
          : 'Create lighting, sound, and animation effects to bring your layout to life with immersive scenery and interactive elements.'"
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

- [ ] **Step 2: Add the `ListPage` import**

In the `<script setup>` block of `apps/cloud/src/Effects/Effects.vue`, add this import line next to the existing imports (e.g., right after the `EffectsList` import):

```ts
import ListPage from '@/Core/UI/ListPage.vue'
```

Keep the existing `EmptyState` import (`import EmptyState from '@/Core/UI/EmptyState.vue'`) — it's still used inside the `empty-state` slot. Keep the `PageHeader`, `ListControlBar`, `useListControls` imports from `@repo/ui`; `PageHeader` is no longer referenced in this file and can be removed from the destructured import:

Change:
```ts
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
```
to:
```ts
import { ListControlBar, useListControls } from '@repo/ui'
```

- [ ] **Step 3: Remove the `handleAdd` function**

`handleAdd` is no longer called from the template (the Add button uses `:add-to` / router `:to` directly). Delete the function from the `<script setup>` block:

```ts
function handleAdd() {
  router.push({ name: 'Add Effect' })
}
```

Also remove the now-unused `router` reference if it's not used elsewhere in the file. Check: `handleEdit` still uses `router.push`, so keep `const router = useRouter()` and the import.

- [ ] **Step 4: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types`
Expected: PASS.

Run: `pnpm --filter=deja-cloud lint`
Expected: PASS (auto-fix if any trailing whitespace etc.).

Run: `pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 5: Visual check**

Start the dev server and open `/effects`. Confirm:
- Header renders with "Effects" title, rocket-launch icon, indigo accent, subtitle.
- Controls row shows sort/filter/search.
- "New Effect" button appears at the top-right, navigates to `/effects/new`.
- With no effects, the empty state fills the page (no header).
- Loading skeleton appears briefly on hard reload.

- [ ] **Step 6: Commit**

```bash
git add apps/cloud/src/Effects/Effects.vue
git commit -m "refactor(cloud): 🧩 migrate Effects page to ListPage wrapper"
```

---

## Task 3: Migrate Roster (multi-action template)

**Files:**
- Modify: `apps/cloud/src/Roster/Roster.vue`

**Why now:** Roster has three `#actions` buttons — New Loco, Sync to DCC-EX, Import from DCC-EX. It validates that `<ListPage>`'s `actions` slot + auto Add button composes correctly.

- [ ] **Step 1: Replace the template block**

In `apps/cloud/src/Roster/Roster.vue`, replace the entire `<template>` block (currently lines 149–252) with:

```vue
<template>
  <ListPage
    title="Roster"
    icon="mdi-train"
    color="pink"
    :add-to="{ name: 'Add Loco' }"
    add-label="New Loco"
    :loading="isLoading"
    :empty="isLoaded && rosterList.length === 0"
  >
    <template #subtitle>
      <span class="hidden sm:inline">Manage your locomotive fleet and decoder configurations.</span>
    </template>

    <template #controls>
      <ListControlBar
        :controls="rosterControls"
        color="pink"
        :sort-options="sortOptions"
        :filters="filters"
        :show-view="true"
        :show-search="false"
        :view-options="[
          { value: 'cab', icon: 'mdi-train', label: 'Cab' },
          { value: 'avatar', icon: 'mdi-circle-outline', label: 'Avatar' },
          { value: 'plate', icon: 'mdi-card-text-outline', label: 'Plate' },
          { value: 'card', icon: 'mdi-view-grid-outline', label: 'Card' },
          { value: 'table', icon: 'mdi-table', label: 'Table' },
          { value: 'raw', icon: 'mdi-code-json', label: 'Raw' },
        ]"
      />
    </template>

    <template #actions>
      <v-btn
        :loading="rosterSyncStatus?.status === 'syncing'"
        :disabled="isSyncing || isDisconnected"
        prepend-icon="mdi-sync"
        variant="tonal"
        color="pink"
        size="small"
        @click="syncToCS"
      >
        Sync to DCC-EX
      </v-btn>
      <v-btn
        :loading="rosterSyncStatus?.status === 'importing'"
        :disabled="isSyncing || isDisconnected"
        prepend-icon="mdi-download"
        variant="tonal"
        color="pink"
        size="small"
        @click="importFromCS"
      >
        Import from DCC-EX
      </v-btn>
    </template>

    <LocoRoster
      :locos="rosterControls.filteredList.value"
      default-view="card"
      module-name="cloud-roster"
      @select="handleEditLoco"
    />

    <v-card variant="outlined" class="d-flex flex-column align-center justify-center pa-4 text-center mt-4" min-height="120">
      <ThrottleLaunchQR :size="100" label="Open Throttle on phone" />
    </v-card>

    <template #empty-state>
      <EmptyState
        icon="mdi-train"
        color="pink"
        title="No Locomotives Yet"
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to unlock the full roster experience with up to 25 locomotives and advanced features.`
          : 'Build your digital roster by adding locomotives with their DCC addresses, decoder functions, and custom configurations.'"
        :use-cases="[
          { icon: 'mdi-memory', text: 'Program DCC decoders' },
          { icon: 'mdi-tune', text: 'Configure functions & lights' },
          { icon: 'mdi-train-car', text: 'Build consists' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Add Your First Loco'"
        :action-to="isFreePlan ? '/upgrade' : '/locos/new'"
      />
    </template>
  </ListPage>

  <v-snackbar
    v-model="snackbarOpen"
    :color="snackbarColor"
    :timeout="snackbarTimeout"
    location="bottom right"
  >
    {{ rosterSyncStatus?.message }}
    <template #actions>
      <v-btn variant="text" @click="snackbarOpen = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>
```

**Notes:**
- The Sync and Import buttons live in the `actions` slot. `<ListPage>` appends the auto-generated "New Loco" button after them, so the final left-to-right order is `Sync to DCC-EX, Import from DCC-EX, New Loco`. The original page had `New Loco, Sync, Import`. This reordering is intentional — every other list page puts the primary Add action on the right, and the user's goal is uniformity.
- The outer `<div class="flex flex-wrap items-center justify-end gap-2 w-full">` wrapper from the original `#actions` content is dropped; `PageHeader`'s `#actions` already provides `flex items-center gap-2`.
- The `v-snackbar` stays outside `<ListPage>` — it's an overlay, not part of the page layout.

- [ ] **Step 2: Update script imports**

In the `<script setup>` block, update imports:

Change:
```ts
import { PageHeader, ListControlBar, useListControls, LocoRoster, ThrottleLaunchQR } from '@repo/ui'
```
to:
```ts
import { ListControlBar, useListControls, LocoRoster, ThrottleLaunchQR } from '@repo/ui'
import ListPage from '@/Core/UI/ListPage.vue'
```

Keep the `EmptyState` import (`import EmptyState from '@/Core/UI/EmptyState.vue'`) — still used in the `empty-state` slot.

- [ ] **Step 3: Remove the `handleAddLoco` function**

Delete from the `<script setup>` block:

```ts
function handleAddLoco() {
  router.push({ name: 'Add Loco' })
}
```

Keep `handleEditLoco`, `syncToCS`, and `importFromCS` — they're still used.

- [ ] **Step 4: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types`
Expected: PASS.

Run: `pnpm --filter=deja-cloud lint`
Expected: PASS.

Run: `pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 5: Visual check**

Open `/locos`. Confirm:
- Header renders with "Roster" title, train icon, pink accent, hidden-on-mobile subtitle.
- View toggle (Cab/Avatar/Plate/Card/Table/Raw) renders in the controls row.
- Three buttons appear in the actions area: Sync to DCC-EX (tonal), Import from DCC-EX (tonal), New Loco (flat, pink) — in that order, Add button at the far right.
- With no locos, the empty state fills the page.
- Snackbar still appears for sync events.

- [ ] **Step 6: Commit**

```bash
git add apps/cloud/src/Roster/Roster.vue
git commit -m "refactor(cloud): 🧩 migrate Roster page to ListPage wrapper"
```

---

## Task 4: Migrate Sounds

**Files:**
- Modify: `apps/cloud/src/Sounds/Sounds.vue`

- [ ] **Step 1: Replace the template block**

Replace the entire `<template>` block (currently lines 35–72) with:

```vue
<template>
  <ListPage
    title="Sounds"
    icon="mdi-volume-high"
    color="sky"
    subtitle="Upload and manage audio files for layout effects."
    :add-to="{ name: 'Add Sound' }"
    add-label="New Sound"
    :loading="isLoading"
    :empty="isLoaded && soundFiles.length === 0"
  >
    <SoundList :initial-sounds="soundFiles" />

    <template #empty-state>
      <EmptyState
        icon="mdi-volume-high"
        color="sky"
        title="No Sounds Yet"
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to upload sounds and create immersive audio effects for your layout.`
          : 'Upload audio files to build your sound library. Sounds can be used in effects to trigger audio playback on your layout.'"
        :use-cases="[
          { icon: 'mdi-train', text: 'Train whistles' },
          { icon: 'mdi-bullhorn', text: 'Station announcements' },
          { icon: 'mdi-nature', text: 'Ambient sounds' },
          { icon: 'mdi-cog', text: 'Mechanical effects' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Upload Your First Sound'"
        :action-to="isFreePlan ? '/upgrade' : '/sounds/new'"
      />
    </template>
  </ListPage>
</template>
```

- [ ] **Step 2: Update script imports**

Change:
```ts
import { PageHeader } from '@repo/ui'
```
to:
```ts
import ListPage from '@/Core/UI/ListPage.vue'
```

Keep the `EmptyState` import.

- [ ] **Step 3: Remove the `handleAdd` function and unused `router`**

Delete:
```ts
function handleAdd() {
  router.push({ name: 'Add Sound' })
}
```

If `router` is no longer referenced anywhere else in the file, also delete `const router = useRouter()` and the `import { useRouter } from 'vue-router'` line. Verify with `grep -n router apps/cloud/src/Sounds/Sounds.vue` before deleting.

- [ ] **Step 4: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types && pnpm --filter=deja-cloud lint && pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/Sounds/Sounds.vue
git commit -m "refactor(cloud): 🧩 migrate Sounds page to ListPage wrapper"
```

---

## Task 5: Migrate Routes

**Files:**
- Modify: `apps/cloud/src/Routes/Routes.vue`

- [ ] **Step 1: Replace the template block**

Replace the entire `<template>` block (currently lines 71–117) with:

```vue
<template>
  <ListPage
    title="Routes"
    icon="mdi-map"
    color="purple"
    subtitle="Automated multi-turnout paths for your layout."
    :add-to="{ name: 'Add Route' }"
    add-label="New Route"
    :loading="isLoading"
    :empty="isLoaded && routesList.length === 0"
  >
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="purple"
        :sort-options="sortOptions"
        :filters="filters"
        :show-view="false"
        search-placeholder="Search routes..."
      />
    </template>

    <RoutesList :filtered-list="controls.filteredList.value" @edit="handleEdit" />

    <template #empty-state>
      <EmptyState
        icon="mdi-map"
        color="purple"
        title="No Routes Yet"
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to create automated routes that throw multiple turnouts in sequence.`
          : 'Create automated paths that throw multiple turnouts in sequence, making complex track arrangements a single-click operation.'"
        :use-cases="[
          { icon: 'mdi-arrow-decision', text: 'Yard entry paths' },
          { icon: 'mdi-highway', text: 'Mainline bypass' },
          { icon: 'mdi-format-list-group', text: 'Multi-turnout sequences' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Create Your First Route'"
        :action-to="isFreePlan ? '/upgrade' : '/routes/new'"
      />
    </template>
  </ListPage>
</template>
```

- [ ] **Step 2: Update script imports**

Change:
```ts
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
```
to:
```ts
import { ListControlBar, useListControls } from '@repo/ui'
import ListPage from '@/Core/UI/ListPage.vue'
```

- [ ] **Step 3: Remove `handleAdd`**

Delete:
```ts
function handleAdd() {
  router.push({ name: 'Add Route' })
}
```

Keep `router` (used by `handleEdit`).

- [ ] **Step 4: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types && pnpm --filter=deja-cloud lint && pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/Routes/Routes.vue
git commit -m "refactor(cloud): 🧩 migrate Routes page to ListPage wrapper"
```

---

## Task 6: Migrate Signals

**Files:**
- Modify: `apps/cloud/src/Signals/Signals.vue`

- [ ] **Step 1: Replace the template block**

Replace the entire `<template>` block (currently lines 77–123) with:

```vue
<template>
  <ListPage
    title="Signals"
    icon="mdi-traffic-light"
    color="emerald"
    subtitle="Manage signal aspects and track-side indicators."
    :add-to="{ name: 'Add Signal' }"
    add-label="New Signal"
    :loading="isLoading"
    :empty="isLoaded && signalsList.length === 0"
  >
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="emerald"
        :sort-options="sortOptions"
        :filters="filters"
        :show-view="false"
        search-placeholder="Search signals..."
      />
    </template>

    <SignalList :filtered-list="controls.filteredList.value" @edit="handleEdit" />

    <template #empty-state>
      <EmptyState
        icon="mdi-traffic-light"
        color="emerald"
        title="No Signals Yet"
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to add signals and manage block protection on your layout.`
          : 'Configure signal heads with red, yellow, and green aspects to manage block protection and interlocking on your layout.'"
        :use-cases="[
          { icon: 'mdi-shield-check', text: 'Block signal protection' },
          { icon: 'mdi-lock', text: 'Interlocking control' },
          { icon: 'mdi-lightbulb-on', text: 'Approach lighting' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Add Your First Signal'"
        :action-to="isFreePlan ? '/upgrade' : '/signals/new'"
      />
    </template>
  </ListPage>
</template>
```

- [ ] **Step 2: Update script imports**

Change:
```ts
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
```
to:
```ts
import { ListControlBar, useListControls } from '@repo/ui'
import ListPage from '@/Core/UI/ListPage.vue'
```

- [ ] **Step 3: Remove `handleAdd`**

Delete:
```ts
function handleAdd() {
  router.push({ name: 'Add Signal' })
}
```

- [ ] **Step 4: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types && pnpm --filter=deja-cloud lint && pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/Signals/Signals.vue
git commit -m "refactor(cloud): 🧩 migrate Signals page to ListPage wrapper"
```

---

## Task 7: Migrate Sensors

**Files:**
- Modify: `apps/cloud/src/Sensors/Sensors.vue`

- [ ] **Step 1: Replace the template block**

Replace the entire `<template>` block (currently lines 77–123) with:

```vue
<template>
  <ListPage
    title="Sensors"
    icon="mdi-access-point"
    color="teal"
    subtitle="Monitor track occupancy and feedback sensors."
    :add-to="{ name: 'Add Sensor' }"
    add-label="New Sensor"
    :loading="isLoading"
    :empty="isLoaded && sensorsList.length === 0"
  >
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="teal"
        :sort-options="sortOptions"
        :filters="filters"
        :show-view="false"
        search-placeholder="Search sensors..."
      />
    </template>

    <SensorList :filtered-list="controls.filteredList.value" @edit="handleEdit" />

    <template #empty-state>
      <EmptyState
        icon="mdi-access-point"
        color="teal"
        title="No Sensors Yet"
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to add sensors and monitor track occupancy across your layout.`
          : 'Configure track occupancy detectors and feedback sensors to monitor train positions and enable block signaling.'"
        :use-cases="[
          { icon: 'mdi-radar', text: 'Block occupancy detection' },
          { icon: 'mdi-train', text: 'Train position tracking' },
          { icon: 'mdi-shield-check', text: 'Automated block signals' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Add Your First Sensor'"
        :action-to="isFreePlan ? '/upgrade' : '/sensors/new'"
      />
    </template>
  </ListPage>
</template>
```

- [ ] **Step 2: Update script imports**

Change:
```ts
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
```
to:
```ts
import { ListControlBar, useListControls } from '@repo/ui'
import ListPage from '@/Core/UI/ListPage.vue'
```

- [ ] **Step 3: Remove `handleAdd`**

Delete:
```ts
function handleAdd() {
  router.push({ name: 'Add Sensor' })
}
```

- [ ] **Step 4: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types && pnpm --filter=deja-cloud lint && pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/Sensors/Sensors.vue
git commit -m "refactor(cloud): 🧩 migrate Sensors page to ListPage wrapper"
```

---

## Task 8: Migrate Turnouts

**Files:**
- Modify: `apps/cloud/src/Turnouts/Turnouts.vue`

- [ ] **Step 1: Replace the template block**

Replace the entire `<template>` block (currently lines 76–122) with:

```vue
<template>
  <ListPage
    title="Turnouts"
    icon="mdi-call-split"
    color="amber"
    subtitle="Configure and control track switches across your layout."
    :add-to="{ name: 'Add Turnout' }"
    add-label="New Turnout"
    :loading="isLoading"
    :empty="isLoaded && turnoutsList.length === 0"
  >
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="amber"
        :sort-options="sortOptions"
        :filters="filters"
        :show-view="false"
        search-placeholder="Search turnouts..."
      />
    </template>

    <TurnoutsList
      :filtered-list="controls.filteredList.value"
      :view-as="controls.viewAs.value"
      @edit="handleEdit"
    />

    <template #empty-state>
      <EmptyState
        icon="mdi-call-split"
        color="amber"
        title="No Turnouts Yet"
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to add turnouts and manage track switches across your layout.`
          : 'Define your track switches and control them remotely. Map each turnout to its DCC address for seamless operation.'"
        :use-cases="[
          { icon: 'mdi-swap-horizontal', text: 'Yard switching' },
          { icon: 'mdi-source-fork', text: 'Mainline junctions' },
          { icon: 'mdi-warehouse', text: 'Staging areas' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Add Your First Turnout'"
        :action-to="isFreePlan ? '/upgrade' : '/turnouts/new'"
      />
    </template>
  </ListPage>
</template>
```

**Note:** The original template used `:viewAs` (camelCase) as the prop name. Keep whichever form the existing `TurnoutsList.vue` component declares — do not rename. If the existing code works, leave the casing as-is. Verify by opening `apps/cloud/src/Turnouts/TurnoutsList.vue` and checking the `defineProps` declaration. If it's `viewAs`, use `:view-as` (Vue auto-converts kebab-case to camelCase).

- [ ] **Step 2: Update script imports**

Change:
```ts
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
```
to:
```ts
import { ListControlBar, useListControls } from '@repo/ui'
import ListPage from '@/Core/UI/ListPage.vue'
```

- [ ] **Step 3: Remove `handleAdd`**

Delete:
```ts
function handleAdd() {
  router.push({ name: 'Add Turnout' })
}
```

- [ ] **Step 4: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types && pnpm --filter=deja-cloud lint && pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/Turnouts/Turnouts.vue
git commit -m "refactor(cloud): 🧩 migrate Turnouts page to ListPage wrapper"
```

---

## Task 9: Migrate Sensors/Automations (AddTile removal)

**Files:**
- Modify: `apps/cloud/src/Sensors/Automations.vue`

- [ ] **Step 1: Replace the template block**

Replace the entire `<template>` block (currently lines 19–26) with:

```vue
<template>
  <ListPage
    title="Automations"
    icon="mdi-access-point"
    color="teal"
    :add-to="{ name: 'Add Automation' }"
    add-label="New Automation"
  >
    <AutomationList @edit="handleEdit" />
  </ListPage>
</template>
```

**Notes:**
- The original page title was `"Sensors"` which was misleading — this is the Automations page. Renaming to `"Automations"` is in-scope: pages should be self-describing after standardization. If this rename is undesirable, revert to `"Sensors"` — but confirm with whoever maintains the copy.
- The `AutomationList`'s `#prepend` slot (which hosted `AddTile`) is simply not used. The `AutomationList` component is unchanged; it still supports the slot for any other caller.
- No `loading` / `empty` state here — the original page had neither. Keep parity; a follow-up can add proper loading/empty handling.

- [ ] **Step 2: Update script imports**

Change:
```ts
import { PageHeader } from '@repo/ui'
import AutomationList from '@/Sensors/AutomationList.vue'
import AddTile from '@/Core/UI/AddTile.vue'
```
to:
```ts
import AutomationList from '@/Sensors/AutomationList.vue'
import ListPage from '@/Core/UI/ListPage.vue'
```

- [ ] **Step 3: Remove `handleAdd` and unused `router`**

Delete:
```ts
function handleAdd() {
  router.push({ name: 'Add Automation' })
}
```

`router` is only used by `handleEdit`, so keep it.

- [ ] **Step 4: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types && pnpm --filter=deja-cloud lint && pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/Sensors/Automations.vue
git commit -m "refactor(cloud): 🧩 migrate Automations page to ListPage wrapper"
```

---

## Task 10: Migrate TrackDiagram

**Files:**
- Modify: `apps/cloud/src/TrackDiagram/TrackDiagram.vue`

- [ ] **Step 1: Replace the entire file**

Overwrite `apps/cloud/src/TrackDiagram/TrackDiagram.vue` with:

```vue
<script setup lang="ts">
import type { TrackDiagram } from '@repo/modules'
import { useRouter } from 'vue-router'
import ListPage from '@/Core/UI/ListPage.vue'
import TrackDiagramList from '@/TrackDiagram/TrackDiagramList.vue'

const router = useRouter()

function handleEdit(diagram: TrackDiagram) {
  router.push({ name: 'Edit Track Diagram', params: { diagramId: diagram.id } })
}
</script>

<template>
  <ListPage
    title="Track Diagrams"
    icon="mdi-vector-polyline"
    color="indigo"
    :add-to="{ name: 'Add Track Diagram' }"
    add-label="New Track Diagram"
  >
    <TrackDiagramList @edit="handleEdit" />
  </ListPage>
</template>
```

**Notes:**
- The original `<ModuleTitle menu="Track Diagrams" />` read its title/icon/color from `useMenu().getMenuItem('Track Diagrams')`. Replacing it with explicit props means the values are duplicated here. If the menu entry changes, this file will not auto-follow.
- `ModuleTitle.vue` is NOT deleted — `AddTrackDiagram.vue` and `EditTrackDiagram.vue` still import it.
- The `AddTile` + `TrackDiagramList #prepend` slot is gone. `TrackDiagramList` can keep its slot; it's just not used here.
- The icon `mdi-vector-polyline` is a guess based on the TrackDiagram domain. Before committing, verify by running `grep -n "Track Diagrams" apps/cloud/src/Core/Menu/` to see what the menu definition uses and match it. If the menu uses a different icon or color, use those instead.

- [ ] **Step 2: Verify menu-derived values**

Run: `grep -rn "Track Diagrams" apps/cloud/src/Core/Menu/`
Read whatever file defines the menu entry (`useMenu` composable / menu data file).
Confirm the icon and color used by `ModuleTitle` when `menu="Track Diagrams"`. Update the `icon` and `color` props in Step 1 to match the authoritative values.

- [ ] **Step 3: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types && pnpm --filter=deja-cloud lint && pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 4: Visual check**

Open `/track-diagrams`. Confirm:
- Header renders with Track Diagrams title, correct icon/color.
- "New Track Diagram" button appears at top-right.
- Diagram grid renders without the dashed-border AddTile card at the start.

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/TrackDiagram/TrackDiagram.vue
git commit -m "refactor(cloud): 🧩 migrate TrackDiagram page to ListPage, drop AddTile"
```

---

## Task 11: Migrate Devices (Layout.vue)

**Files:**
- Modify: `apps/cloud/src/Layout/Layout.vue`

- [ ] **Step 1: Replace the entire file**

Overwrite `apps/cloud/src/Layout/Layout.vue` with:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { useLayout, type Device } from '@repo/modules'
import { useSortableList } from '@/Core/composables/useSortableList'
import ListPage from '@/Core/UI/ListPage.vue'
import DeviceListItem from '@/Layout/Devices/DeviceListItem.vue'
import AddDeviceItem from '@/Layout/Devices/AddDeviceItem.vue'
import PortList from '@/Layout/PortList.vue'

const { getLayout, getDevices, updateDevice } = useLayout()

const layout = getLayout()
const rawDevices = getDevices()
const { list: devices, onDragStart, onDragEnd } = useSortableList<Device>(
  rawDevices as any,
  (id, data) => updateDevice(id, data),
)

const showAdd = ref(false)
</script>

<template>
  <ListPage
    title="Devices"
    icon="mdi-developer-board"
    color="cyan"
    :subtitle="layout?.name"
  >
    <template #actions>
      <v-btn
        prepend-icon="mdi-plus"
        color="cyan"
        variant="flat"
        size="small"
        @click="showAdd = true"
      >
        Add Device
      </v-btn>
    </template>

    <draggable
      :list="devices"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div>
          <DeviceListItem :device="element as Device" :ports="layout?.ports" />
        </div>
      </template>
    </draggable>

    <AddDeviceItem :show="showAdd" class="mt-4" @close="showAdd = false" />

    <PortList v-if="layout?.ports?.length" :ports="layout.ports" class="mt-6" />
  </ListPage>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>
```

**Notes:**
- **The Add button is in the `actions` slot (not `addTo`)** because clicking it toggles `showAdd`, not navigates.
- **The `draggable`'s `#footer` slot is removed** — it previously contained the `AddTile`. This preserves drag reordering of existing devices but removes any drag-drop targeting of the AddTile. Per the spec, the drag feature is unused by the user.
- **The outer `<div class="animate-fade-in-up space-y-4">` wrapper is removed.** `<ListPage>` owns the root element. If the fade-in animation is load-bearing, it can be re-added via a wrapper inside the `default` slot — but per the spec's uniformity goal, all list pages should share the same (no) entry animation.
- The `AddTile` import is removed.

- [ ] **Step 2: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types && pnpm --filter=deja-cloud lint && pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 3: Visual check**

Open `/devices`. Confirm:
- Header renders with "Devices" title, developer-board icon, cyan accent, layout name as subtitle.
- "Add Device" button appears at top-right.
- Existing devices render in the grid and can still be drag-reordered.
- Clicking "Add Device" opens `AddDeviceItem` below the grid.
- `AddDeviceItem`'s close event hides it.

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/Layout/Layout.vue
git commit -m "refactor(cloud): 🧩 migrate Devices page to ListPage, drop AddTile"
```

---

## Task 12: Migrate PowerDistricts

**Files:**
- Modify: `apps/cloud/src/PowerDistricts/PowerDistricts.vue`

- [ ] **Step 1: Replace the template block**

In `apps/cloud/src/PowerDistricts/PowerDistricts.vue`, replace the entire `<template>` block (currently lines 84–200) with:

```vue
<template>
  <ListPage
    title="Power Districts"
    icon="mdi-lightning-bolt"
    color="violet"
    :empty="!!districts && districts.length === 0 && !showAddForm"
  >
    <template #actions>
      <v-btn
        color="violet"
        variant="flat"
        size="small"
        prepend-icon="mdi-plus"
        @click="showAddForm = !showAddForm"
      >
        Add District
      </v-btn>
    </template>

    <!-- Add District Form -->
    <v-expand-transition>
      <v-card v-if="showAddForm" variant="outlined" class="mb-4 pa-4">
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="newName"
              label="District Name"
              placeholder="e.g., Mainline"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="newDeviceId"
              :items="dccExDevices"
              item-title="name"
              item-value="id"
              label="Device"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-select
              v-model="newOutput"
              :items="getAvailableOutputs(newDeviceId)"
              label="Output"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="1">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :color="newColor"
                  icon
                  size="small"
                  variant="flat"
                  title="Pick color"
                >
                  <v-icon>mdi-palette</v-icon>
                </v-btn>
              </template>
              <v-card class="pa-2">
                <div class="d-flex flex-wrap gap-1" style="max-width: 160px">
                  <v-btn
                    v-for="c in districtColors"
                    :key="c"
                    :color="c"
                    icon
                    size="x-small"
                    variant="flat"
                    @click="newColor = c"
                  />
                </div>
              </v-card>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="2" class="d-flex align-center">
            <v-btn
              color="violet"
              variant="flat"
              size="small"
              :disabled="!newName || !newDeviceId || !newOutput"
              @click="handleAddDistrict"
            >
              Create
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-expand-transition>

    <!-- District list -->
    <div v-if="districts && districts.length > 0">
      <PowerDistrictCard
        v-for="district in districts"
        :key="district.id"
        :district="district"
        :device-name="getDevice(district.deviceId)?.name || district.deviceId"
        :track-output="getTrackOutput(district.deviceId, district.output)"
        @toggle-power="handleTogglePower"
        @delete="handleDeleteDistrict"
      />
    </div>

    <template #empty-state>
      <EmptyState
        icon="mdi-lightning-bolt"
        color="violet"
        title="No Power Districts Yet"
        description="Power districts let you name and control individual track outputs across your command stations."
        :use-cases="[
          { icon: 'mdi-format-list-bulleted', text: 'Name individual track outputs' },
          { icon: 'mdi-toggle-switch', text: 'Toggle power per district' },
          { icon: 'mdi-palette', text: 'Color-code your layout' },
        ]"
        action-label="Add Your First District"
        @action="showAddForm = true"
      />
    </template>
  </ListPage>
</template>
```

**Notes:**
- **The `<div class="pa-4">` wrapper is removed** — it was double-padding the globally-applied `pa-6 pa-md-12` from `App.vue`.
- **The `mb-4 d-flex` wrapper around the original Add button is gone.** The button moves into `<ListPage>`'s `actions` slot and gets the standard header placement.
- **Accent color changed from `primary` to `violet`.** `PageHeader`'s `color` prop expects a tailwind palette name, not the Vuetify theme token `primary`. Pick `violet` since it's close to the original `#7C3AED` district color.
- **`empty` is only `true` when there are zero districts AND the add form is not open.** This keeps the form visible when the user is mid-creation of their first district.
- **`EmptyState` uses an `@action` event** (per the `EmptyState` component's API — see `apps/cloud/src/Core/UI/EmptyState.vue` lines 17, 60–72). Clicking the empty-state CTA opens the add form. Verify the `@action` emit name matches the component (the component defines `defineEmits(['action'])`).
- `EmptyState` does NOT take `actionTo` here — clicking triggers the inline form, not a route.

- [ ] **Step 2: Update script imports**

At the top of `<script setup>` in `apps/cloud/src/PowerDistricts/PowerDistricts.vue`:

Change:
```ts
import { PowerDistrictCard, PageHeader } from '@repo/ui'
import { useNotification } from '@repo/ui'
```
to:
```ts
import { PowerDistrictCard } from '@repo/ui'
import { useNotification } from '@repo/ui'
import ListPage from '@/Core/UI/ListPage.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'
```

Also remove the now-unused import:
```ts
import { useCollection } from 'vuefire'
```
only if `useCollection` is not referenced anywhere else in the file. Verify with grep before removing.

And remove:
```ts
import { useStorage } from '@vueuse/core'
```
only if `layoutId` / `useStorage` is not referenced anywhere else. Verify with grep before removing. (Looking at the original file, `layoutId` is declared but appears unused — safe to remove if grep confirms.)

- [ ] **Step 3: Type-check, lint, build**

Run: `pnpm --filter=deja-cloud check-types && pnpm --filter=deja-cloud lint && pnpm --filter=deja-cloud build`
Expected: PASS.

- [ ] **Step 4: Visual check**

Open `/power-districts`. Confirm:
- Header renders with "Power Districts" title, lightning-bolt icon, violet accent.
- "Add District" button sits at the top-right in the header.
- Clicking it expands the inline add form.
- With no districts, the empty state fills the page and its CTA opens the add form.
- Existing districts render as before.

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/PowerDistricts/PowerDistricts.vue
git commit -m "refactor(cloud): 🧩 migrate PowerDistricts page to ListPage wrapper"
```

---

## Task 13: Final verification

**Files:** none modified.

- [ ] **Step 1: Run the full verification loop**

From the repo root (or the worktree root):

Run: `/verify-changes cloud`

If the slash command is not available, run the equivalent manually:

```bash
pnpm --filter=deja-cloud lint
pnpm --filter=deja-cloud check-types
pnpm --filter=deja-cloud build
```

Expected: all PASS.

- [ ] **Step 2: Capture screenshots (optional but recommended)**

Run: `/capture-screenshots cloud`

This captures every migrated page so you can drop before/after images in the PR description.

- [ ] **Step 3: Manual click-through**

Start the dev server:

```bash
pnpm --filter=deja-cloud dev
```

Click through each migrated page and confirm:
1. Title, icon, color, subtitle render correctly.
2. Controls bar renders where applicable.
3. Add button works (route or toggle).
4. Empty states render the rich `EmptyState` with no header above.
5. Loading skeleton appears briefly on hard reload.
6. No layout shifts, no doubled padding, no missing actions.

Pages to check: `/locos`, `/sounds`, `/effects`, `/routes`, `/signals`, `/sensors`, `/sensors/automations`, `/turnouts`, `/track-diagrams`, `/devices`, `/power-districts`.

- [ ] **Step 4: Spot-check excluded pages**

Confirm these pages are UNCHANGED:
- `/turnouts/labels` (print page)
- `/settings`
- `/` (dashboard)
- `/locos/new`, `/effects/new`, etc. (form pages)

- [ ] **Step 5: No final commit**

No commit in this task — all changes are already committed per-task. The only work here is verification.

---

## Self-review checklist (for plan author)

**Spec coverage:**

- [x] `<ListPage>` component built — Task 1
- [x] Roster, Sounds, Effects, Routes, Signals, Sensors, Turnouts migrated — Tasks 2–8
- [x] Sensors/Automations AddTile removed — Task 9
- [x] TrackDiagram ModuleTitle + AddTile removed — Task 10
- [x] Devices AddTile removed, inline form preserved — Task 11
- [x] PowerDistricts inline empty-state + double padding fixed — Task 12
- [x] No files deleted (per corrected spec)
- [x] TurnoutLabels excluded
- [x] Verification loop — Task 13

**Placeholder scan:** No TBDs, TODOs, "similar to", or "add error handling" in task bodies. Every step has a concrete command, file path, or code block.

**Type consistency:** Prop names `addTo`, `addLabel`, `loading`, `empty`, `icon`, `color`, `title`, `subtitle` are consistent across Task 1 (definition) and Tasks 2–12 (usage). Slot names `controls`, `actions`, `subtitle`, `empty-state`, default are consistent.

**Known risks flagged inline:**
- Roster's action button order changes (Sync/Import/New → Sync/Import/New is the same, actually; New moves to the end).
- TrackDiagram's icon/color is menu-derived; Task 10 Step 2 instructs to verify.
- Devices loses the fade-in animation; acceptable per the uniformity goal.
- PowerDistricts' accent color changes from Vuetify `primary` to tailwind `violet` to match `PageHeader`'s color API.
