# Cloud Page Headers Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace flat ModuleTitle headers with gradient accent PageHeader component and make ListMenu responsive (inline on desktop, bottom sheet on mobile).

**Architecture:** New `PageHeader.vue` component in cloud app's Core/UI with static Tailwind class maps for gradient backgrounds. Modified `ListMenu.vue` in `@repo/ui` with conditional rendering based on `useDisplay()` breakpoint. All 20+ page components migrated from ModuleTitle to PageHeader.

**Tech Stack:** Vue 3 + `<script setup lang="ts">`, Vuetify 3 (`useDisplay`, `v-menu`, `v-chip`, `v-bottom-sheet`), Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-12-cloud-page-headers-redesign.md`

---

## Chunk 1: PageHeader Component + Export

### Task 1: Create PageHeader.vue

**Files:**
- Create: `apps/cloud/src/Core/UI/PageHeader.vue`

- [ ] **Step 1: Create PageHeader component**

```vue
<script setup lang="ts">
import { useMenu } from '@/Core/Menu/useMenu'

const props = defineProps({
  label: { type: String },
  icon: { type: String },
  color: { type: String },
  menu: { type: String },
  subtitle: { type: String },
})

const { getMenuItem } = useMenu()

const menuItem = props.menu ? getMenuItem(props.menu) : null
const { label, color, icon } = menuItem
  ?? { label: props.label, color: props.color, icon: props.icon }

const resolvedColor = color ?? 'sky'

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
  sky:     'bg-gradient-to-r from-sky-500/20 to-transparent',
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

const gradientClass = GRADIENT_CLASSES[resolvedColor] ?? GRADIENT_CLASSES.sky
const textClass = TEXT_CLASSES[resolvedColor] ?? TEXT_CLASSES.sky
</script>
<template>
  <div :class="[gradientClass, 'rounded-xl px-4 py-3 mb-6']">
    <div class="flex items-center">
      <h2 class="flex items-center" :class="textClass">
        <v-icon v-if="icon" size="32" :class="textClass" class="mr-2">{{ icon }}</v-icon>
        <span class="text-2xl">{{ label }}</span>
      </h2>
      <v-spacer></v-spacer>
      <div class="flex items-center gap-2">
        <slot></slot>
      </div>
    </div>
    <div v-if="subtitle || $slots.subtitle" class="text-sm text-slate-400 mt-1">
      <slot name="subtitle">{{ subtitle }}</slot>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify file was created correctly**

Run: `cat apps/cloud/src/Core/UI/PageHeader.vue | head -5`
Expected: `<script setup lang="ts">`

### Task 2: Export PageHeader from index.ts

**Files:**
- Modify: `apps/cloud/src/Core/UI/index.ts`

- [ ] **Step 1: Add PageHeader export**

Add this line after the existing ModuleTitle export (line 3):

```ts
export { default as PageHeader } from './PageHeader.vue'
```

The file should now have both exports:
```ts
export { default as ModuleTitle } from './ModuleTitle.vue'
export { default as PageHeader } from './PageHeader.vue'
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/Core/UI/PageHeader.vue apps/cloud/src/Core/UI/index.ts
git commit -m "feat(cloud): add PageHeader component with gradient accent strip"
```

---

## Chunk 2: Migrate Simple Pages (no ListMenu, no extra headers)

All these pages have the same pattern: replace `ModuleTitle` import and usage with `PageHeader`.

### Task 3: Migrate Roster page (fix menu key mismatch)

**Files:**
- Modify: `apps/cloud/src/Roster/Roster.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader**

Replace import:
```ts
// Old:
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
// New:
import PageHeader from '@/Core/UI/PageHeader.vue'
```

Replace template usage:
```vue
<!-- Old: -->
<ModuleTitle menu="Loco Roster" />
<!-- New (fix menu key to match useMenu label "Roster"): -->
<PageHeader menu="Roster" />
```

### Task 4: Migrate Routes page

**Files:**
- Modify: `apps/cloud/src/Routes/Routes.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader**

Replace import `ModuleTitle` → `PageHeader`. Replace template `<ModuleTitle menu="Routes" />` → `<PageHeader menu="Routes" />`.

### Task 5: Migrate Routes detail pages

**Files:**
- Modify: `apps/cloud/src/Routes/AddRoute.vue`
- Modify: `apps/cloud/src/Routes/EditRoute.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader in both files**

Same import and template swap as Task 4. Both use `menu="Routes"`.

### Task 6: Migrate Signals pages

**Files:**
- Modify: `apps/cloud/src/Signals/Signals.vue`
- Modify: `apps/cloud/src/Signals/AddSignal.vue`
- Modify: `apps/cloud/src/Signals/EditSignal.vue`
- Modify: `apps/cloud/src/Signals/SignalList.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader in all four files**

Same import and template swap. All use `menu="Signals"`.

Note: `EditSignal.vue` has `menu="Signals" color="cyan"` — drop the `color` override since the menu lookup will resolve the correct color ("emerald" from useMenu).

### Task 7: Migrate Sensors pages

**Files:**
- Modify: `apps/cloud/src/Sensors/Sensors.vue`
- Modify: `apps/cloud/src/Sensors/AddSensor.vue`
- Modify: `apps/cloud/src/Sensors/EditSensor.vue`
- Modify: `apps/cloud/src/Sensors/AutomationForm.vue`
- Modify: `apps/cloud/src/Sensors/Automations.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader in all five files**

Same import and template swap. All use `menu="Sensors"`.

Note: `EditSensor.vue` and `AutomationForm.vue` have `menu="Sensors" color="teal"` — drop the `color` override since the menu lookup resolves "teal" already.

### Task 8: Migrate Turnout detail pages

**Files:**
- Modify: `apps/cloud/src/Turnouts/AddTurnout.vue`
- Modify: `apps/cloud/src/Turnouts/EditTurnout.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader in both files**

Same import and template swap. Both use `menu="Turnouts"`.

### Task 9: Migrate DCC-EX page

**Files:**
- Modify: `apps/cloud/src/DCCEX/DCCEX.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader**

Replace import and template. Uses `menu="DCC-EX"`.

### Task 10: Migrate UserProfile page (manual props)

**Files:**
- Modify: `apps/cloud/src/User/Profile/UserProfile.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader**

Replace import. Replace template:
```vue
<!-- Old: -->
<ModuleTitle label="User Profile" color="red" icon="mdi-lightning-bolt" />
<!-- New: -->
<PageHeader label="User Profile" color="red" icon="mdi-lightning-bolt" />
```

This page uses manual props (no `menu`), which works via the fallback chain.

### Task 11: Migrate Settings page

**Files:**
- Modify: `apps/cloud/src/Settings/Settings.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader**

Replace import and template. Uses `menu="Settings"`.

- [ ] **Step 2: Commit all simple page migrations**

```bash
git add apps/cloud/src/Roster/ apps/cloud/src/Routes/ apps/cloud/src/Signals/ apps/cloud/src/Sensors/ apps/cloud/src/Turnouts/AddTurnout.vue apps/cloud/src/Turnouts/EditTurnout.vue apps/cloud/src/DCCEX/ apps/cloud/src/User/ apps/cloud/src/Settings/
git commit -m "refactor(cloud): migrate simple pages from ModuleTitle to PageHeader"
```

---

## Chunk 3: Migrate Pages with Extra Headers (Double Header Fix)

### Task 12: Fix Turnouts page (remove duplicate toolbar)

**Files:**
- Modify: `apps/cloud/src/Turnouts/Turnouts.vue`

The Turnouts page currently has:
1. `<ModuleTitle menu="Turnouts" />` (line 31)
2. A separate `<v-toolbar>` with title "Turnouts" and view/filter/sort buttons (lines 33-45)
3. A `<v-dialog>` for view options (lines 46-51)
4. A `<v-dialog>` for sorter (lines 53-55)
5. A `<v-divider>` (line 56)

- [ ] **Step 1: Replace with single PageHeader, keep view toggle + sorter in slot**

Replace the entire `<script setup>` and `<template>` with:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import type { Turnout } from '@repo/modules'
import PageHeader from '@/Core/UI/PageHeader.vue'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'
import TurnoutSorter from '@/Turnouts/TurnoutSorter.vue'
import Addtile from '@/Core/UI/AddTile.vue'

const VIEW_OPTIONS = [
  { title: 'Card', value: 'card' },
  { title: 'By Device', value: 'device' },
]
const showSorter = ref(false)
const showViewMenu = ref(false)
const viewAs = useStorage('@DEJA/prefs/turnoutsView', 'card')
const router = useRouter()

function handleEdit(turnout: Turnout) {
  router.push({ name: 'Edit Turnout', params: { turnoutId: turnout.id } })
}

function handleAdd() {
  router.push({ name: 'Add Turnout' })
}
</script>
<template>
  <PageHeader menu="Turnouts">
    <v-btn @click="showViewMenu = !showViewMenu" icon="mdi-eye" size="small" variant="text" />
    <v-btn @click="showSorter = !showSorter" icon="mdi-sort-variant" size="small" variant="text" />
  </PageHeader>

  <v-dialog v-model="showViewMenu" max-width="290">
    <v-card title="View As" color="purple-darken-4" variant="elevated">
      <v-list :items="VIEW_OPTIONS" v-model:selected="viewAs" select-strategy="single-independent" />
    </v-card>
  </v-dialog>

  <v-dialog v-model="showSorter" max-width="80vw">
    <TurnoutSorter @close="showSorter = false" />
  </v-dialog>

  <TurnoutsList @edit="handleEdit" :viewAs="viewAs">
    <template #prepend>
      <Addtile @click="handleAdd" color="yellow" />
    </template>
  </TurnoutsList>
</template>
```

This removes the duplicate toolbar and `<v-divider>`, keeping view toggle and sort in the PageHeader's default slot. The `showFilters` ref is removed (unused).

### Task 13: Fix Layout page (remove double header)

**Files:**
- Modify: `apps/cloud/src/Layout/Layout.vue`

The Layout page currently has:
1. `<ModuleTitle menu="Devices" />` (line 18)
2. A gradient `<div>` with layout name as `<h2>` (lines 20-24)
3. A `<h3>` "Devices" sub-header (lines 26-29)

- [ ] **Step 1: Replace with single PageHeader with subtitle**

Replace the template with:

```vue
<template>
  <div class="animate-fade-in-up space-y-6">
    <PageHeader menu="Devices" :subtitle="layout?.name" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DeviceListItem v-for="item in devices" :key="item.id" :device="item as Device" :ports="layout?.ports" />
      <AddTile v-if="!showAdd" color="cyan" @click="showAdd = !showAdd" />
    </div>
    <AddDeviceItem :show="showAdd" @close="showAdd = false" class="mt-4" />
  </div>
</template>
```

Update the import: replace `ModuleTitle` with `PageHeader`.

### Task 14: Fix Settings page extra headers

**Files:**
- Modify: `apps/cloud/src/Settings/Settings.vue`

The Settings page (already migrated to PageHeader in Task 11) also has:
1. A gradient `<div>` with layout name as `<h2>` (lines 135-140)
2. Multiple `<h3>` sub-headers for Tags and USB Ports (lines 142-151)

- [ ] **Step 1: Replace the entire template section**

Replace the full `<template>` block (lines 70-176) with:

```vue
<template>
  <div class="animate-fade-in-up space-y-6">
    <PageHeader menu="Settings" :subtitle="layout?.name" />

    <!-- Billing & Subscription -->
    <v-card class="mb-6">
      <v-card-title>Billing & Subscription</v-card-title>
      <v-divider class="my-2" />
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <span class="text-h5 font-weight-bold" style="color: rgb(var(--v-theme-primary));">
              {{ planName }}
            </span>
            <span class="text-body-2 text-medium-emphasis ml-2">{{ planPrice }}</span>
          </div>
          <v-chip :color="statusColor" size="small" variant="elevated">
            {{ status.toUpperCase() }}
          </v-chip>
        </div>

        <div v-if="nextDateLabel" class="text-body-2 text-medium-emphasis mb-4">
          {{ nextDateLabel }}
        </div>

        <div class="d-flex ga-3">
          <v-btn
            v-if="plan !== 'conductor'"
            variant="tonal"
            size="small"
            :to="{ name: 'settings' }"
          >
            Upgrade to {{ plan === 'hobbyist' ? 'Engineer' : 'Conductor' }}
          </v-btn>
          <v-btn
            v-if="subscription?.stripeCustomerId"
            variant="tonal"
            size="small"
            :loading="portalLoading"
            @click="openBillingPortal"
          >
            Manage in Stripe
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Background Settings -->
    <BackgroundSettings
      app-name="cloud"
      :pages="[
        { path: '/', label: 'Home', icon: 'mdi-home' },
        { path: '/locos', label: 'Roster', icon: 'mdi-train' },
        { path: '/effects', label: 'Effects', icon: 'mdi-auto-fix' },
        { path: '/routes', label: 'Routes', icon: 'mdi-map-marker-path' },
        { path: '/signals', label: 'Signals', icon: 'mdi-traffic-light' },
        { path: '/sensors', label: 'Sensors', icon: 'mdi-motion-sensor' },
        { path: '/turnouts', label: 'Turnouts', icon: 'mdi-directions-fork' },
        { path: '/dccex', label: 'DCC-EX', icon: 'mdi-console' },
        { path: '/layout', label: 'Layout', icon: 'mdi-floor-plan' },
      ]"
      class="mb-4"
    />

    <!-- Tags -->
    <v-card variant="tonal">
      <v-card-title class="text-brand-cyan">
        <v-icon icon="mdi-tag-multiple" class="mr-2"></v-icon>
        Tags
      </v-card-title>
      <v-card-text>
        <LayoutTags />
      </v-card-text>
    </v-card>

    <!-- USB Ports -->
    <v-card variant="tonal">
      <v-card-title class="text-brand-cyan">
        <v-icon icon="mdi-usb" class="mr-2"></v-icon>
        USB Ports
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortList :ports="layout?.ports || []" />

          <v-card
            class="mx-auto w-full h-full justify-between flex flex-col glass border border-white/10"
            prepend-icon="mdi-view-module"
            title="Modules"
            color="transparent"
            variant="flat"
            density="compact"
          >
            <v-card-text>
              <v-list lines="one" bg-color="transparent">
                <v-list-item
                  v-for="module in layout?.modules"
                  :key="module"
                  :title="module"
                  class="text-white/80"
                ></v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
```

Changes from the original:
- `ModuleTitle` → `PageHeader` with `:subtitle="layout?.name"` (layout name moves to subtitle)
- Removed the gradient `<div>` block (lines 135-140)
- Removed standalone `<h3>` Tags header (lines 142-145) — replaced with `<v-card>` + `<v-card-title>`
- Removed standalone `<h3>` USB Ports header (lines 148-151) — replaced with `<v-card>` + `<v-card-title>`
- All existing card content (billing, background, port list, modules) preserved exactly

- [ ] **Step 2: Commit double header fixes**

```bash
git add apps/cloud/src/Turnouts/Turnouts.vue apps/cloud/src/Layout/Layout.vue apps/cloud/src/Settings/Settings.vue
git commit -m "fix(cloud): remove duplicate headers from Turnouts, Layout, and Settings pages"
```

---

## Chunk 4: Migrate Effects Pages (ListMenu in slot)

### Task 15: Migrate Effects pages

**Files:**
- Modify: `apps/cloud/src/Effects/Effects.vue`
- Modify: `apps/cloud/src/Effects/AddEffect.vue`
- Modify: `apps/cloud/src/Effects/EditEffect.vue`

- [ ] **Step 1: Replace ModuleTitle with PageHeader in all three files**

The pattern is the same for all three — replace import and template:

```vue
<!-- Old: -->
<ModuleTitle menu="Effects">
  <ListMenu :disabledMenus="['view']" :module-name="'effects'" />
</ModuleTitle>
<!-- New: -->
<PageHeader menu="Effects">
  <ListMenu :disabledMenus="['view']" :module-name="'effects'" />
</PageHeader>
```

For `Effects.vue`, also keep the sort button in the slot:
```vue
<PageHeader menu="Effects">
  <ListMenu :disabledMenus="['view']" :module-name="'effects'" />
  <v-btn @click="showSorter = !showSorter" icon="mdi-sort-variant"></v-btn>
</PageHeader>
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/Effects/
git commit -m "refactor(cloud): migrate Effects pages to PageHeader with ListMenu slot"
```

---

## Chunk 5: ListMenu Inline Mode

### Task 16: Add inline rendering mode to ListMenu

**Files:**
- Modify: `packages/ui/src/ListMenu/ListMenu.vue`

- [ ] **Step 1: Add inline prop, computed import, and useDisplay import**

Update the import from `vue` (line 2) to include `computed`:
```ts
import { ref, watch, computed } from 'vue'
```

Add after the existing imports (after line 4):
```ts
import { useDisplay } from 'vuetify'
```

Update the `defineProps` block (lines 6-13) to add the `inline` prop:
```ts
const props = defineProps<{
  disabledMenus?: string[]
  filterOptions?: { title: string; value: string }[]
  inline?: boolean
  menuOptions?: { color: string; title: string; icon: string; value: string }[]
  moduleName: string,
  sortOptions?: { title: string; value: string }[]
  viewOptions?: { title: string; value: string }[]
}>()
```

Add after the `defineProps` block:
```ts
const { mdAndUp } = useDisplay()
const isInline = computed(() => props.inline ?? mdAndUp.value)
```

- [ ] **Step 2: Add inline template rendering**

Wrap the existing `<v-bottom-sheet>` in `<template v-if="!isInline">` and add a new `<template v-else>` block for the inline mode.

The inline mode renders each enabled menu option as a chip + v-menu dropdown:

```vue
<template v-if="isInline">
  <div class="flex items-center gap-2">
    <!-- View dropdown -->
    <v-menu v-if="!disabledMenus?.includes('view')">
      <template #activator="{ props: menuProps }">
        <v-chip
          v-bind="menuProps"
          size="small"
          color="purple"
          variant="elevated"
          prepend-icon="mdi-eye"
        >
          {{ getDisplayTitle('view', viewAs) }}
        </v-chip>
      </template>
      <v-list density="compact" :selected="[viewAs]" @click:select="({ id }) => viewAs = id as string">
        <v-list-item
          v-for="item in getOptions('view')"
          :key="item.value"
          :value="item.value"
          :title="item.title"
        />
      </v-list>
    </v-menu>

    <!-- Sort dropdown -->
    <v-menu v-if="!disabledMenus?.includes('sort')">
      <template #activator="{ props: menuProps }">
        <v-chip
          v-bind="menuProps"
          size="small"
          color="teal"
          variant="elevated"
          prepend-icon="mdi-sort"
        >
          {{ getDisplayTitle('sort', sortBy) }}
        </v-chip>
      </template>
      <v-list density="compact" :selected="[sortBy]" @click:select="({ id }) => sortBy = id as string">
        <v-list-item
          v-for="item in getOptions('sort')"
          :key="item.value"
          :value="item.value"
          :title="item.title"
        />
      </v-list>
    </v-menu>

    <!-- Filter dropdown (only visible when filters active or on hover) -->
    <v-menu v-if="!disabledMenus?.includes('filter')">
      <template #activator="{ props: menuProps }">
        <v-chip
          v-if="filterBy.length > 0"
          v-bind="menuProps"
          size="small"
          color="red"
          variant="elevated"
          prepend-icon="mdi-filter"
        >
          {{ filterBy.length }}
        </v-chip>
        <v-btn
          v-else
          v-bind="menuProps"
          icon="mdi-filter-outline"
          size="x-small"
          variant="text"
        />
      </template>
      <v-list density="compact" :selected="filterBy" select-strategy="classic" @click:select="handleFilterSelect">
        <v-list-item
          v-for="item in getOptions('filter')"
          :key="item.value"
          :value="item.value"
          :title="item.title"
        />
      </v-list>
    </v-menu>

    <!-- Active filter chips (removable) -->
    <v-chip
      v-for="filter in filterBy"
      :key="filter"
      size="small"
      color="red"
      variant="elevated"
      closable
      @click:close="removeFilter(filter)"
    >
      {{ filter }}
    </v-chip>
  </div>
</template>
```

- [ ] **Step 3: Add helper functions**

Add these functions to the script:

```ts
function getDisplayTitle(option: string, currentValue: string): string {
  const options = getOptions(option)
  const found = options.find(o => o.value === currentValue)
  return found?.title ?? (option === 'view' ? 'View' : 'Sort')
}

function removeFilter(filter: string) {
  filterBy.value = filterBy.value.filter(f => f !== filter)
}

function handleFilterSelect({ id }: { id: unknown }) {
  const value = id as string
  if (filterBy.value.includes(value)) {
    filterBy.value = filterBy.value.filter(f => f !== value)
  } else {
    filterBy.value = [...filterBy.value, value]
  }
}
```

- [ ] **Step 4: Fix existing filter clear-all bug in mobile mode**

In the existing bottom-sheet template, change the filter chip close handler from:
```vue
<v-icon icon="mdi-close-circle" @click="filterBy = []" />
```
to:
```vue
<v-icon icon="mdi-close-circle" @click="filterBy = filterBy.filter(f => f !== filter)" />
```

- [ ] **Step 5: Commit ListMenu changes**

```bash
git add packages/ui/src/ListMenu/ListMenu.vue
git commit -m "feat(ui): add inline responsive mode to ListMenu component"
```

---

## Chunk 6: Verify & Lint

### Task 17: Run lint and type-check

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: No new errors. Fix any lint issues introduced by the changes.

- [ ] **Step 2: Run type-check**

Run: `pnpm check-types`
Expected: No new type errors.

- [ ] **Step 3: Fix any issues found**

If lint or type-check fails, fix the issues and re-run.

- [ ] **Step 4: Commit fixes if any**

```bash
git add -A
git commit -m "fix(cloud): resolve lint and type-check issues from PageHeader migration"
```

### Task 18: Create changeset

- [ ] **Step 1: Create changeset file**

Run the `/changelog` skill to generate a changeset entry, or create one manually:

```bash
cat > .changeset/cloud-page-headers-redesign.md << 'EOF'
---
"deja-cloud": minor
"@repo/ui": patch
---

feat(cloud): redesign page headers with gradient accent strip and responsive ListMenu

- Replace ModuleTitle with new PageHeader component using gradient accent backgrounds
- Add inline rendering mode to ListMenu (desktop chips + dropdowns, mobile bottom sheet)
- Fix double headers on Turnouts, Layout, and Settings pages
- Fix ListMenu filter clear-all bug (now removes individual filters)
EOF
```

- [ ] **Step 2: Commit changeset**

```bash
git add .changeset/cloud-page-headers-redesign.md
git commit -m "docs: add changeset for cloud page headers redesign"
```

### Task 19: Visual spot-check

- [ ] **Step 1: Start the cloud app**

Run: `pnpm --filter=deja-cloud dev`

- [ ] **Step 2: Check key pages**

Open the cloud app in a browser and verify:
- Devices page: gradient accent with cyan, subtitle shows layout name, no double header
- Effects page: gradient accent with indigo, ListMenu chips visible on desktop
- Turnouts page: gradient accent with amber, no duplicate toolbar
- Settings page: gradient accent with blue, no duplicate header blocks
- Roster page: gradient accent with pink, correct "Roster" label
- Resize to mobile width: ListMenu switches to bottom sheet trigger

- [ ] **Step 3: Stop dev server**
