# List Menu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace inconsistent list headers across cloud and throttle apps with a unified, composable component system in `@repo/ui`.

**Architecture:** Composable sub-components pattern — a `useListControls` composable owns state, individual UI components (`ListSearch`, `ListViewToggle`, `ListSort`, `ListFilters`, bottom sheets) render controls, and `ListControlBar` orchestrates responsive layout. `PageHeader` provides the title/gradient/slots wrapper. Parent views call `useListControls()` and pass the result into `ListControlBar`.

**Tech Stack:** Vue 3 (`<script setup lang="ts">`), Vuetify 3 (`v-btn-toggle`, `v-bottom-sheet`, `v-menu`, `v-chip`), Tailwind CSS, `@vueuse/core` (`useStorage`, `useDisplay`), TypeScript.

**Spec:** `docs/superpowers/specs/2026-03-22-list-menu-redesign.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `packages/ui/src/ListControls/types.ts` | Shared TypeScript interfaces for all list control components |
| `packages/ui/src/composables/useListControls.ts` | State management composable (search, filter, sort, view persistence) |
| `packages/ui/src/PageHeader/PageHeader.vue` | Unified page header: title row (gradient + icon) + controls slot |
| `packages/ui/src/ListControls/ListSearch.vue` | Collapsible search on desktop, full-width on mobile |
| `packages/ui/src/ListControls/ListViewToggle.vue` | Icon-only segmented `v-btn-toggle` for desktop view switching |
| `packages/ui/src/ListControls/ListSort.vue` | Sort dropdown chip for desktop |
| `packages/ui/src/ListControls/ListFilters.vue` | Filter dropdown chips for desktop (device/type/tags + overflow) |
| `packages/ui/src/ListControls/ListViewSheet.vue` | Mobile bottom sheet for view selection |
| `packages/ui/src/ListControls/ListSortSheet.vue` | Mobile bottom sheet for sort selection |
| `packages/ui/src/ListControls/ListFilterSheet.vue` | Mobile bottom sheet for filter selection |
| `packages/ui/src/ListControls/ListControlBar.vue` | Responsive wrapper: inline controls (desktop) or icon buttons + sheets (mobile) |

### Modified Files

| File | Change |
|------|--------|
| `packages/ui/src/index.ts` | Add exports for all new components + composable |
| `packages/ui/src/ModuleList/List.vue` | Remove toolbar, keep only list rendering (grid/table/empty state) |
| `packages/ui/src/Effects/EffectList.vue` | Add PageHeader + ListControlBar, pass controls to stripped List |
| `packages/ui/src/Turnouts/TurnoutList.vue` | Same pattern as EffectList |
| `packages/ui/src/Locos/LocoList.vue` | Same pattern |
| `packages/ui/src/SignalList.vue` | Same pattern |
| `packages/ui/src/Sensors/SensorList.vue` | Same pattern |
| `apps/cloud/src/Effects/Effects.vue` | Replace local PageHeader + ListMenu with new components |
| `apps/cloud/src/Turnouts/Turnouts.vue` | Replace local PageHeader + custom view dialog |
| `apps/cloud/src/Roster/Roster.vue` | Replace local PageHeader, move sync buttons to #actions |
| `apps/cloud/src/Signals/Signals.vue` | Replace local PageHeader |
| `apps/cloud/src/Sensors/Sensors.vue` | Replace local PageHeader |
| `apps/cloud/src/Routes/Routes.vue` | Replace local PageHeader |
| `apps/cloud/src/Sounds/Sounds.vue` | Replace local PageHeader |
| `apps/cloud/src/Layout/Layout.vue` | Replace local PageHeader |
| `apps/cloud/src/Dashboard/Dashboard.vue` | Replace local PageHeader (title only) |
| `apps/throttle/src/views/EffectsView.vue` | Wrap EffectList usage (already uses @repo/ui) |
| `apps/throttle/src/views/TurnoutsView.vue` | Same |
| `apps/throttle/src/views/RosterView.vue` | Same |
| `apps/throttle/src/views/SignalsView.vue` | Same |
| `apps/throttle/src/views/RoutesView.vue` | Add PageHeader |
| `apps/throttle/src/views/ThrottleListView.vue` | Add PageHeader |

### Removed Files (after migration)

| File | Reason |
|------|--------|
| `packages/ui/src/ListMenu/ListMenu.vue` | Replaced by ListControlBar + sub-components |
| `apps/cloud/src/Core/UI/PageHeader.vue` | Replaced by `@repo/ui` PageHeader |

---

## Task 1: Types and Composable

**Files:**
- Create: `packages/ui/src/ListControls/types.ts`
- Create: `packages/ui/src/composables/useListControls.ts`

- [ ] **Step 1: Create shared types**

Create `packages/ui/src/ListControls/types.ts`:

```typescript
import type { ComputedRef, Ref } from 'vue'
import type { DocumentData } from 'firebase/firestore'

export interface ViewOption {
  value: string
  icon: string
  label: string
}

export interface SortOption {
  value: string
  label: string
}

export interface FilterOption {
  value: string
  label: string
}

export interface ListFilter {
  type: string
  label: string
  options: FilterOption[]
}

export interface ListControlsOptions {
  list: Ref<DocumentData[]> | ComputedRef<DocumentData[]>
  filters?: ListFilter[]
  viewOptions?: ViewOption[]
  sortOptions?: SortOption[]
  defaultView?: string
  defaultSort?: string
}

export interface ListControlsReturn {
  searchQuery: Ref<string>
  viewAs: Ref<string>
  sortBy: Ref<string>
  activeFilters: Ref<Record<string, string[]>>
  filteredList: ComputedRef<DocumentData[]>
  hasActiveFilters: ComputedRef<boolean>
  activeFilterCount: ComputedRef<number>
  isNonDefaultSort: ComputedRef<boolean>
  clearFilters: () => void
  clearAll: () => void
  setFilter: (type: string, values: string[]) => void
  removeFilter: (type: string, value: string) => void
}
```

- [ ] **Step 2: Create useListControls composable**

Create `packages/ui/src/composables/useListControls.ts`. This extracts the filtering/sorting/search logic from the current `packages/ui/src/ModuleList/List.vue` (lines 78–167) into a standalone composable.

```typescript
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { useStorage } from '@vueuse/core'
import type { DocumentData } from 'firebase/firestore'
import type { ListControlsOptions, ListControlsReturn } from '../ListControls/types'

export function useListControls(
  moduleName: string,
  options: ListControlsOptions
): ListControlsReturn {
  const { list, defaultView = 'card', defaultSort = 'order' } = options

  // Persisted state — same localStorage keys as existing code for seamless migration.
  // Old code stored viewAs as string[] (e.g., ['card']). We read and unwrap if needed.
  const rawView = useStorage<string | string[]>(
    `@DEJA/prefs/${moduleName}/View`,
    defaultView
  )
  const viewAs = computed({
    get: () => Array.isArray(rawView.value) ? rawView.value[0] ?? defaultView : rawView.value,
    set: (val: string) => { rawView.value = val },
  }) as Ref<string>

  const rawSort = useStorage<string | string[]>(
    `@DEJA/prefs/${moduleName}/Sort`,
    defaultSort
  )
  const sortBy = computed({
    get: () => Array.isArray(rawSort.value) ? rawSort.value[0] ?? defaultSort : rawSort.value,
    set: (val: string) => { rawSort.value = val },
  }) as Ref<string>

  const activeFilters = useStorage<Record<string, string[]>>(
    `@DEJA/prefs/${moduleName}/Filter`,
    {}
  )
  const searchQuery = useStorage<string>(
    `@DEJA/prefs/${moduleName}/Search`,
    ''
  )

  // Computed
  const hasActiveFilters = computed(() =>
    Object.values(activeFilters.value).some(arr => arr.length > 0)
  )
  const activeFilterCount = computed(() =>
    Object.values(activeFilters.value).reduce((sum, arr) => sum + arr.length, 0)
  )
  const isNonDefaultSort = computed(() => sortBy.value !== defaultSort)

  // Filter + search + sort pipeline (same logic as ModuleList/List.vue lines 132–167)
  const filteredList = computed(() => {
    if (!Array.isArray(list.value)) return []

    let result = [...list.value]

    // Apply filters: AND across types, OR within a type
    const active = Object.entries(activeFilters.value)
      .filter(([, values]) => values.length > 0)
    if (active.length) {
      result = result.filter(item =>
        active.every(([key, selected]) => {
          const val = (item as Record<string, unknown>)[key]
          if (val == null) return false
          if (Array.isArray(val)) return selected.some(s => val.includes(s))
          return selected.includes(String(val))
        })
      )
    }

    // Apply search
    const query = searchQuery.value?.trim().toLowerCase()
    if (query) {
      result = result.filter(item => {
        const name = (item as Record<string, unknown>).name
        return typeof name === 'string' && name.toLowerCase().includes(query)
      })
    }

    // Apply sort
    if (sortBy.value && sortBy.value !== 'order') {
      result.sort((a, b) => {
        const aVal = String((a as Record<string, unknown>)[sortBy.value] ?? '')
        const bVal = String((b as Record<string, unknown>)[sortBy.value] ?? '')
        return aVal.localeCompare(bVal)
      })
    }

    return result
  })

  // Actions
  function clearFilters() {
    activeFilters.value = {}
  }

  function clearAll() {
    clearFilters()
    searchQuery.value = ''
    sortBy.value = defaultSort
    viewAs.value = defaultView
  }

  function setFilter(type: string, values: string[]) {
    activeFilters.value = { ...activeFilters.value, [type]: values }
  }

  function removeFilter(type: string, value: string) {
    const current = activeFilters.value[type] ?? []
    activeFilters.value = {
      ...activeFilters.value,
      [type]: current.filter(v => v !== value),
    }
  }

  return {
    searchQuery,
    viewAs,
    sortBy,
    activeFilters,
    filteredList,
    hasActiveFilters,
    activeFilterCount,
    isNonDefaultSort,
    clearFilters,
    clearAll,
    setFilter,
    removeFilter,
  }
}
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm --filter=@repo/ui exec tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/ListControls/types.ts packages/ui/src/composables/useListControls.ts
git commit -m "feat(ui): add useListControls composable and list control types"
```

---

## Task 2: PageHeader Component

**Files:**
- Create: `packages/ui/src/PageHeader/PageHeader.vue`

- [ ] **Step 1: Create PageHeader**

Create `packages/ui/src/PageHeader/PageHeader.vue`. Port the gradient/text class maps from `apps/cloud/src/Core/UI/PageHeader.vue` (lines 20–51) and add the `#controls` slot.

```vue
<script setup lang="ts">
import { useSlots } from 'vue'

const props = defineProps<{
  title: string
  icon?: string
  color?: string
  subtitle?: string
}>()

const slots = useSlots()
const hasControls = () => !!slots.controls

const resolvedColor = props.color ?? 'sky'

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
  violet:  'bg-gradient-to-r from-violet-500/20 to-transparent',
}

const TEXT_CLASSES: Record<string, string> = {
  cyan:    'text-cyan-400',
  lime:    'text-lime-400',
  pink:    'text-pink-400',
  indigo:  'text-indigo-400',
  amber:   'text-amber-400',
  purple:  'text-purple-400',
  emerald: 'text-emerald-400',
  teal:    'text-teal-400',
  rose:    'text-rose-400',
  blue:    'text-blue-400',
  sky:     'text-sky-400',
  red:     'text-red-400',
  violet:  'text-violet-400',
}

const gradientClass = GRADIENT_CLASSES[resolvedColor] ?? GRADIENT_CLASSES.sky
const textClass = TEXT_CLASSES[resolvedColor] ?? TEXT_CLASSES.sky
</script>

<template>
  <div class="mb-4">
    <!-- Title Row -->
    <div :class="[gradientClass, 'rounded-xl px-4 py-3']">
      <div class="flex items-center">
        <h2 class="flex items-center" :class="textClass">
          <v-icon v-if="icon" size="32" :class="textClass" class="mr-2">{{ icon }}</v-icon>
          <span class="text-2xl font-bold">{{ title }}</span>
        </h2>
        <v-spacer />
        <div class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
      <div v-if="subtitle || $slots.subtitle" class="text-sm text-slate-400 mt-1">
        <slot name="subtitle">{{ subtitle }}</slot>
      </div>
    </div>

    <!-- Controls Row -->
    <div
      v-if="hasControls()"
      class="bg-slate-900/70 border-t border-slate-800 px-4 py-2"
    >
      <slot name="controls" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify it renders**

Visually test by temporarily importing in a view file or running the dev server.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/PageHeader/PageHeader.vue
git commit -m "feat(ui): add PageHeader component with title, gradient, and control slots"
```

---

## Task 3: Desktop Control Components

**Files:**
- Create: `packages/ui/src/ListControls/ListSearch.vue`
- Create: `packages/ui/src/ListControls/ListViewToggle.vue`
- Create: `packages/ui/src/ListControls/ListSort.vue`
- Create: `packages/ui/src/ListControls/ListFilters.vue`

- [ ] **Step 1: Create ListSearch**

Create `packages/ui/src/ListControls/ListSearch.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  collapsible?: boolean
}>(), {
  placeholder: 'Search...',
  collapsible: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { mdAndUp } = useDisplay()
const expanded = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

function expand() {
  expanded.value = true
  setTimeout(() => searchInput.value?.focus(), 50)
}

function collapse() {
  if (!props.modelValue) {
    expanded.value = false
  }
}
</script>

<template>
  <!-- Mobile: always full width -->
  <v-text-field
    v-if="!mdAndUp"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :placeholder="placeholder"
    density="compact"
    variant="outlined"
    hide-details
    clearable
    prepend-inner-icon="mdi-magnify"
    class="flex-grow"
  />

  <!-- Desktop collapsible -->
  <template v-else>
    <v-text-field
      v-if="!collapsible || expanded || modelValue"
      ref="searchInput"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      :placeholder="placeholder"
      density="compact"
      variant="outlined"
      hide-details
      clearable
      prepend-inner-icon="mdi-magnify"
      style="max-width: 220px;"
      @blur="collapse"
      @click:clear="emit('update:modelValue', ''); collapse()"
    />
    <v-btn
      v-else
      icon="mdi-magnify"
      size="small"
      variant="text"
      @click="expand"
    />
  </template>
</template>
```

- [ ] **Step 2: Create ListViewToggle**

Create `packages/ui/src/ListControls/ListViewToggle.vue`:

```vue
<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { ViewOption } from './types'

defineProps<{
  modelValue: string
  options: ViewOption[]
  color?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { mdAndUp } = useDisplay()
</script>

<template>
  <div v-if="mdAndUp" class="flex items-center gap-2">
    <span class="text-xs tracking-wider text-slate-500 uppercase font-semibold">View:</span>
    <v-btn-toggle
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      density="compact"
      mandatory
      class="border border-slate-700 rounded-md"
    >
      <v-btn
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        :icon="opt.icon"
        size="small"
        variant="text"
      >
        <v-icon :icon="opt.icon" />
        <v-tooltip activator="parent" location="top">{{ opt.label }}</v-tooltip>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>
```

- [ ] **Step 3: Create ListSort**

Create `packages/ui/src/ListControls/ListSort.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { SortOption } from './types'

const props = defineProps<{
  modelValue: string
  options: SortOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { mdAndUp } = useDisplay()

const currentLabel = computed(() =>
  props.options.find(o => o.value === props.modelValue)?.label ?? 'Sort'
)
</script>

<template>
  <div v-if="mdAndUp" class="flex items-center gap-2">
    <span class="text-xs tracking-wider text-slate-500 uppercase font-semibold">Sort:</span>
    <v-menu>
      <template #activator="{ props: menuProps }">
        <v-chip
          v-bind="menuProps"
          size="small"
          variant="flat"
          class="bg-slate-800 border border-slate-700"
          append-icon="mdi-chevron-down"
        >
          {{ currentLabel }}
        </v-chip>
      </template>
      <v-list
        density="compact"
        :selected="[modelValue]"
        @click:select="({ id }) => emit('update:modelValue', id as string)"
      >
        <v-list-item
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :title="opt.label"
        />
      </v-list>
    </v-menu>
  </div>
</template>
```

- [ ] **Step 4: Create ListFilters**

Create `packages/ui/src/ListControls/ListFilters.vue`:

```vue
<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { ListFilter } from './types'

const MAX_VISIBLE_FILTERS = 3

const props = defineProps<{
  modelValue: Record<string, string[]>
  filters: ListFilter[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string[]>]
}>()

const { mdAndUp } = useDisplay()

function getChipLabel(filter: ListFilter): string {
  const selected = props.modelValue[filter.type] ?? []
  if (!selected.length) return `All ${filter.label}`
  if (selected.length === 1) {
    const opt = filter.options.find(o => o.value === selected[0])
    return opt?.label ?? selected[0]
  }
  return `${filter.label}: ${selected.length} selected`
}

function toggleFilterValue(filterType: string, value: string) {
  const current = props.modelValue[filterType] ?? []
  const updated = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
  emit('update:modelValue', { ...props.modelValue, [filterType]: updated })
}

function removeFilter(filterType: string, value: string) {
  const current = props.modelValue[filterType] ?? []
  emit('update:modelValue', {
    ...props.modelValue,
    [filterType]: current.filter(v => v !== value),
  })
}
</script>

<template>
  <div v-if="mdAndUp" class="flex items-center gap-2 flex-wrap">
    <span class="text-xs tracking-wider text-slate-500 uppercase font-semibold">Filter:</span>

    <template v-for="(filter, idx) in filters" :key="filter.type">
      <!-- Visible filters (first 3) -->
      <v-menu v-if="idx < MAX_VISIBLE_FILTERS">
        <template #activator="{ props: menuProps }">
          <v-chip
            v-bind="menuProps"
            size="small"
            variant="flat"
            class="bg-slate-800 border border-slate-700"
            append-icon="mdi-chevron-down"
          >
            {{ getChipLabel(filter) }}
          </v-chip>
        </template>
        <v-list
          density="compact"
          :selected="modelValue[filter.type] ?? []"
          select-strategy="classic"
          @click:select="({ id }) => toggleFilterValue(filter.type, id as string)"
        >
          <v-list-item
            v-for="opt in filter.options"
            :key="opt.value"
            :value="opt.value"
            :title="opt.label"
          />
        </v-list>
      </v-menu>
    </template>

    <!-- Overflow: "More" dropdown for filters beyond 3 -->
    <v-menu v-if="filters.length > MAX_VISIBLE_FILTERS">
      <template #activator="{ props: menuProps }">
        <v-chip
          v-bind="menuProps"
          size="small"
          variant="flat"
          class="bg-slate-800 border border-slate-700"
          prepend-icon="mdi-dots-horizontal"
        >
          More
        </v-chip>
      </template>
      <v-list density="compact">
        <template v-for="filter in filters.slice(MAX_VISIBLE_FILTERS)" :key="filter.type">
          <v-list-subheader>{{ filter.label }}</v-list-subheader>
          <v-list-item
            v-for="opt in filter.options"
            :key="opt.value"
            :value="opt.value"
            :title="opt.label"
            :active="(modelValue[filter.type] ?? []).includes(opt.value)"
            @click="toggleFilterValue(filter.type, opt.value)"
          />
        </template>
      </v-list>
    </v-menu>

    <!-- Active filter removal chips -->
    <template v-for="filter in filters" :key="`active-${filter.type}`">
      <v-chip
        v-for="val in (modelValue[filter.type] ?? [])"
        :key="val"
        size="small"
        variant="flat"
        closable
        class="bg-slate-700"
        @click:close="removeFilter(filter.type, val)"
      >
        {{ filter.options.find(o => o.value === val)?.label ?? val }}
      </v-chip>
    </template>
  </div>
</template>
```

- [ ] **Step 5: Verify types compile**

Run: `pnpm --filter=@repo/ui exec tsc --noEmit`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/ListControls/ListSearch.vue packages/ui/src/ListControls/ListViewToggle.vue packages/ui/src/ListControls/ListSort.vue packages/ui/src/ListControls/ListFilters.vue
git commit -m "feat(ui): add desktop list control components (search, view toggle, sort, filters)"
```

---

## Task 4: Mobile Bottom Sheet Components

**Files:**
- Create: `packages/ui/src/ListControls/ListViewSheet.vue`
- Create: `packages/ui/src/ListControls/ListSortSheet.vue`
- Create: `packages/ui/src/ListControls/ListFilterSheet.vue`

- [ ] **Step 1: Create ListViewSheet**

Create `packages/ui/src/ListControls/ListViewSheet.vue`:

```vue
<script setup lang="ts">
import type { ViewOption } from './types'

const props = defineProps<{
  modelValue: boolean
  viewAs: string
  options: ViewOption[]
  color?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:viewAs': [value: string]
}>()

function select(value: string) {
  emit('update:viewAs', value)
  emit('update:modelValue', false)
}
</script>

<template>
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <!-- Handle -->
      <div class="flex justify-center mb-3">
        <div class="w-10 h-1 bg-slate-600 rounded-full" />
      </div>

      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <span class="text-lg font-bold uppercase tracking-wider">Layout View</span>
        <v-btn icon="mdi-close" size="small" variant="text" @click="emit('update:modelValue', false)" />
      </div>

      <!-- Segmented toggle -->
      <div class="flex border border-slate-700 rounded-lg overflow-hidden">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="flex-1 flex flex-col items-center py-4 transition-colors"
          :class="viewAs === opt.value
            ? 'bg-indigo-500/20 border border-indigo-500 rounded-lg'
            : 'hover:bg-slate-800'"
          @click="select(opt.value)"
        >
          <v-icon :icon="opt.icon" size="24" :class="viewAs === opt.value ? 'text-indigo-400' : 'text-slate-500'" />
          <span class="text-xs uppercase mt-1 font-semibold" :class="viewAs === opt.value ? 'text-indigo-400' : 'text-slate-500'">
            {{ opt.label }}
          </span>
        </button>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>
```

- [ ] **Step 2: Create ListSortSheet**

Create `packages/ui/src/ListControls/ListSortSheet.vue`:

```vue
<script setup lang="ts">
import type { SortOption } from './types'

const props = defineProps<{
  modelValue: boolean
  sortBy: string
  options: SortOption[]
  color?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:sortBy': [value: string]
}>()

function select(value: string) {
  emit('update:sortBy', value)
  emit('update:modelValue', false)
}
</script>

<template>
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <div class="flex justify-center mb-3">
        <div class="w-10 h-1 bg-slate-600 rounded-full" />
      </div>

      <div class="flex justify-between items-center mb-4">
        <span class="text-lg font-bold uppercase tracking-wider">Sort By</span>
        <v-btn icon="mdi-close" size="small" variant="text" @click="emit('update:modelValue', false)" />
      </div>

      <div class="flex flex-col gap-2">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="flex justify-between items-center p-4 rounded-lg border transition-colors"
          :class="sortBy === opt.value
            ? 'bg-indigo-500/15 border-indigo-500'
            : 'bg-slate-800 border-slate-700 hover:bg-slate-700'"
          @click="select(opt.value)"
        >
          <span
            class="text-sm uppercase tracking-wide"
            :class="sortBy === opt.value ? 'text-indigo-400 font-semibold' : 'text-slate-400'"
          >
            {{ opt.label }}
          </span>
          <v-icon
            :icon="sortBy === opt.value ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
            :color="sortBy === opt.value ? 'indigo' : 'grey'"
            size="20"
          />
        </button>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>
```

- [ ] **Step 3: Create ListFilterSheet**

Create `packages/ui/src/ListControls/ListFilterSheet.vue`:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ListFilter } from './types'

const props = defineProps<{
  modelValue: boolean
  filters: ListFilter[]
  activeFilters: Record<string, string[]>
  color?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:activeFilters': [value: Record<string, string[]>]
}>()

// Local draft state so changes only apply on "Apply"
const draft = ref<Record<string, string[]>>({})

watch(() => props.modelValue, (open) => {
  if (open) {
    draft.value = JSON.parse(JSON.stringify(props.activeFilters))
  }
})

function isSelected(filterType: string, value: string): boolean {
  return (draft.value[filterType] ?? []).includes(value)
}

function toggleValue(filterType: string, value: string) {
  const current = draft.value[filterType] ?? []
  draft.value = {
    ...draft.value,
    [filterType]: current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value],
  }
}

function clearAll() {
  draft.value = {}
}

function apply() {
  emit('update:activeFilters', { ...draft.value })
  emit('update:modelValue', false)
}
</script>

<template>
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <div class="flex justify-center mb-3">
        <div class="w-10 h-1 bg-slate-600 rounded-full" />
      </div>

      <div class="flex justify-between items-center mb-4">
        <span class="text-lg font-bold uppercase tracking-wider">Filter</span>
        <v-btn variant="text" size="small" class="text-slate-400 uppercase tracking-wider" @click="clearAll">
          Clear All
        </v-btn>
      </div>

      <div v-for="filter in filters" :key="filter.type" class="mb-4">
        <div class="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-2">
          {{ filter.label }}
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in filter.options"
            :key="opt.value"
            class="px-5 py-2.5 rounded-lg text-sm border transition-colors"
            :class="isSelected(filter.type, opt.value)
              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'"
            @click="toggleValue(filter.type, opt.value)"
          >
            <v-icon
              v-if="isSelected(filter.type, opt.value)"
              icon="mdi-checkbox-marked"
              size="16"
              class="mr-1"
            />
            {{ opt.label }}
          </button>
        </div>
      </div>

      <v-btn
        block
        size="large"
        color="indigo"
        class="mt-4 font-bold uppercase tracking-wider"
        @click="apply"
      >
        Apply Filters
      </v-btn>
    </v-card>
  </v-bottom-sheet>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/ListControls/ListViewSheet.vue packages/ui/src/ListControls/ListSortSheet.vue packages/ui/src/ListControls/ListFilterSheet.vue
git commit -m "feat(ui): add mobile bottom sheet components (view, sort, filter)"
```

---

## Task 5: ListControlBar and Exports

**Files:**
- Create: `packages/ui/src/ListControls/ListControlBar.vue`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Create ListControlBar**

Create `packages/ui/src/ListControls/ListControlBar.vue` — the responsive wrapper that shows inline controls on desktop and icon buttons + bottom sheets on mobile:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import type { ListControlsReturn, ViewOption, SortOption, ListFilter } from './types'
import ListSearch from './ListSearch.vue'
import ListViewToggle from './ListViewToggle.vue'
import ListSort from './ListSort.vue'
import ListFilters from './ListFilters.vue'
import ListViewSheet from './ListViewSheet.vue'
import ListSortSheet from './ListSortSheet.vue'
import ListFilterSheet from './ListFilterSheet.vue'

const props = withDefaults(defineProps<{
  controls: ListControlsReturn
  color?: string
  showSearch?: boolean
  showFilters?: boolean
  showView?: boolean
  showSort?: boolean
  searchPlaceholder?: string
  viewOptions?: ViewOption[]
  sortOptions?: SortOption[]
  filters?: ListFilter[]
}>(), {
  color: 'indigo',
  showSearch: true,
  showFilters: true,
  showView: true,
  showSort: true,
  searchPlaceholder: 'Search...',
  viewOptions: () => [],
  sortOptions: () => [],
  filters: () => [],
})

const { mdAndUp } = useDisplay()

// Mobile sheet state
const showViewSheet = ref(false)
const showSortSheet = ref(false)
const showFilterSheet = ref(false)
</script>

<template>
  <!-- Desktop: inline controls -->
  <div v-if="mdAndUp" class="flex items-center gap-4 w-full">
    <ListFilters
      v-if="showFilters && filters.length"
      :model-value="controls.activeFilters.value"
      @update:model-value="controls.activeFilters.value = $event"
      :filters="filters"
    />

    <ListViewToggle
      v-if="showView && viewOptions.length"
      :model-value="controls.viewAs.value"
      @update:model-value="controls.viewAs.value = $event"
      :options="viewOptions"
      :color="color"
    />

    <v-spacer />

    <ListSort
      v-if="showSort && sortOptions.length"
      :model-value="controls.sortBy.value"
      @update:model-value="controls.sortBy.value = $event"
      :options="sortOptions"
    />

    <ListSearch
      v-if="showSearch"
      :model-value="controls.searchQuery.value"
      @update:model-value="controls.searchQuery.value = $event"
      :placeholder="searchPlaceholder"
      collapsible
    />
  </div>

  <!-- Mobile: search bar + icon buttons -->
  <div v-else>
    <div class="flex items-center gap-2">
      <ListSearch
        v-if="showSearch"
        :model-value="controls.searchQuery.value"
        @update:model-value="controls.searchQuery.value = $event"
        :placeholder="searchPlaceholder"
        :collapsible="false"
      />

      <!-- View icon button -->
      <v-btn
        v-if="showView && viewOptions.length"
        icon="mdi-view-grid-outline"
        size="small"
        variant="flat"
        class="bg-slate-800 border border-slate-700"
        @click="showViewSheet = true"
      />

      <!-- Sort icon button -->
      <v-btn
        v-if="showSort && sortOptions.length"
        icon="mdi-sort-variant"
        size="small"
        variant="flat"
        :class="controls.isNonDefaultSort.value
          ? `bg-${color}-500/20 border border-${color}-500`
          : 'bg-slate-800 border border-slate-700'"
        @click="showSortSheet = true"
      />

      <!-- Filter icon button -->
      <v-badge
        v-if="showFilters && filters.length"
        :content="controls.activeFilterCount.value"
        :model-value="controls.hasActiveFilters.value"
        color="error"
        floating
      >
        <v-btn
          icon="mdi-filter-variant"
          size="small"
          variant="flat"
          :class="controls.hasActiveFilters.value
            ? `bg-${color}-500/20 border border-${color}-500`
            : 'bg-slate-800 border border-slate-700'"
          @click="showFilterSheet = true"
        />
      </v-badge>
    </div>

    <!-- Active filter chips (below search bar) -->
    <div v-if="controls.hasActiveFilters.value" class="flex flex-wrap gap-1 mt-2">
      <template v-for="filter in filters" :key="filter.type">
        <v-chip
          v-for="val in (controls.activeFilters.value[filter.type] ?? [])"
          :key="val"
          size="x-small"
          variant="flat"
          closable
          class="bg-slate-700"
          @click:close="controls.removeFilter(filter.type, val)"
        >
          {{ filter.options.find(o => o.value === val)?.label ?? val }}
        </v-chip>
      </template>
    </div>

    <!-- Bottom Sheets -->
    <ListViewSheet
      v-if="showView && viewOptions.length"
      v-model="showViewSheet"
      :view-as="controls.viewAs.value"
      @update:view-as="controls.viewAs.value = $event"
      :options="viewOptions"
      :color="color"
    />
    <ListSortSheet
      v-if="showSort && sortOptions.length"
      v-model="showSortSheet"
      :sort-by="controls.sortBy.value"
      @update:sort-by="controls.sortBy.value = $event"
      :options="sortOptions"
      :color="color"
    />
    <ListFilterSheet
      v-if="showFilters && filters.length"
      v-model="showFilterSheet"
      :filters="filters"
      :active-filters="controls.activeFilters.value"
      @update:active-filters="controls.activeFilters.value = $event"
      :color="color"
    />
  </div>
</template>
```

- [ ] **Step 2: Add exports to index.ts**

Add to `packages/ui/src/index.ts`:

```typescript
// PageHeader
export { default as PageHeader } from './PageHeader/PageHeader.vue'

// List Controls
export { default as ListControlBar } from './ListControls/ListControlBar.vue'
export { default as ListSearch } from './ListControls/ListSearch.vue'
export { default as ListViewToggle } from './ListControls/ListViewToggle.vue'
export { default as ListSort } from './ListControls/ListSort.vue'
export { default as ListFilters } from './ListControls/ListFilters.vue'
export { default as ListViewSheet } from './ListControls/ListViewSheet.vue'
export { default as ListSortSheet } from './ListControls/ListSortSheet.vue'
export { default as ListFilterSheet } from './ListControls/ListFilterSheet.vue'
export type { ViewOption, SortOption, FilterOption, ListFilter, ListControlsReturn } from './ListControls/types'

// Composables
export { useListControls } from './composables/useListControls'
```

- [ ] **Step 3: Verify build**

Run: `pnpm --filter=@repo/ui exec tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/ListControls/ListControlBar.vue packages/ui/src/index.ts
git commit -m "feat(ui): add ListControlBar responsive wrapper and export all new components"
```

---

## Task 6: Strip Toolbar from ModuleList/List.vue

**Files:**
- Modify: `packages/ui/src/ModuleList/List.vue`

- [ ] **Step 1: Remove the toolbar from List.vue**

Edit `packages/ui/src/ModuleList/List.vue`. Remove:
- Lines 1–13: all imports related to filtering/searching/sorting (keep `vAutoAnimate`, `Item`, `Table`, `EmptyState`)
- Lines 17–87: all state management code (`useStorage`, `viewOptionModel`, `sortOptionModel`, `filterSelections`, watchers)
- Lines 132–192: `filteredList` computed, `getFilterChipLabel`, filter watchers
- Lines 196–272: the entire `<v-toolbar>` block
- Line 273: the `<v-spacer class="my-4">`

Replace with a simplified component that accepts `list`, `viewAs`, `sortBy` as props and renders the grid/table/empty state:

```vue
<script setup lang="ts">
import { type PropType } from 'vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import Item from './Item.vue'
import Table from './Table.vue'
import EmptyState from '../EmptyState/EmptyState.vue'
import type { DocumentData } from 'firebase/firestore'

const cols = {
  xs: 12, sm: 6, md: 4, lg: 4, xl: 3, xxl: 2,
}

const emit = defineEmits(['update:state'])

const props = defineProps({
  list: { type: Array as PropType<DocumentData[]>, default: () => [] },
  viewAs: { type: String, default: 'card' },
  loading: { type: Boolean, default: false },
  emptyIcon: { type: String, default: undefined },
  emptyTitle: { type: String, default: undefined },
  emptyDescription: { type: String, default: undefined },
})

function handleUpdateState(item: DocumentData, newState: boolean) {
  emit('update:state', item, newState)
}
</script>

<template>
  <div class="w-full p-4">
    <v-row v-if="loading">
      <v-col v-for="n in 6" :key="n" :cols="cols.xs" :sm="cols.sm" :md="cols.md" :lg="cols.lg" :xl="cols.xl" :xxl="cols.xxl">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>
    <EmptyState
      v-else-if="!list.length"
      :icon="emptyIcon"
      :title="emptyTitle"
      :description="emptyDescription"
    />
    <Table v-else-if="viewAs === 'table'"
      :list="list"
      @update:state="handleUpdateState"
    />
    <v-row v-else v-auto-animate>
      <v-col :cols="cols.xs" :sm="cols.sm" :md="cols.md" :lg="cols.lg" :xl="cols.xl" :xxl="cols.xxl"
        v-for="item in list"
        :key="item.id">
        <Item :item="item" :viewAs="viewAs" @update:state="handleUpdateState" />
      </v-col>
    </v-row>
    <v-row v-if="!loading && list.length > 0">
      <v-col cols="auto">
        <slot name="item" />
      </v-col>
    </v-row>
  </div>
</template>
```

**Key changes:**
- Removed: toolbar, search, filter chips, view/sort menus, all `useStorage` state, `filteredList` computed, `getFilterChipLabel`
- Kept: grid rendering, table rendering, skeleton loading, empty state, `v-auto-animate`
- New props: accepts `list` (pre-filtered), `viewAs` (string, not array)
- Removed props: `moduleName`, `title`, `icon`, `color`, `filters`, `viewOptions`, `sortOptions`

- [ ] **Step 2: Verify the existing *List consumers still compile**

Run: `pnpm --filter=@repo/ui exec tsc --noEmit`

This will likely show errors in `EffectList.vue`, `TurnoutList.vue`, etc., because they pass the old props. That's expected — we fix those in the next tasks.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/ModuleList/List.vue
git commit -m "refactor(ui): strip toolbar from ModuleList/List.vue, make it a pure list renderer"
```

---

## Task 7: Update @repo/ui List Components

Update the list components in `@repo/ui` that currently wrap `ModuleList/List.vue` — they need to use the new `PageHeader` + `ListControlBar` + stripped `List.vue`.

**Files:**
- Modify: `packages/ui/src/Effects/EffectList.vue`
- Modify: `packages/ui/src/Turnouts/TurnoutList.vue`
- Modify: `packages/ui/src/Locos/LocoList.vue`
- Modify: `packages/ui/src/SignalList.vue`
- Modify: `packages/ui/src/Sensors/SensorList.vue`

- [ ] **Step 1: Update EffectList.vue**

Rewrite `packages/ui/src/Effects/EffectList.vue` to use the new components:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { efxTypes, useEfx, type Effect } from '@repo/modules/effects'
import { useLayout, type Tag } from '@repo/modules'
import List from '../ModuleList/List.vue'
import PageHeader from '../PageHeader/PageHeader.vue'
import ListControlBar from '../ListControls/ListControlBar.vue'
import { useListControls } from '../composables/useListControls'
import type { ListFilter } from '../ListControls/types'

const { getEffects, runEffect } = useEfx()
const { getDevices, getLayout } = useLayout()
const devices = getDevices()
const layout = getLayout()
const effects = getEffects()

const effectsList = computed(() =>
  effects?.value
    ? effects.value.map((effect) => ({
        ...effect,
        id: effect.id,
        icon: efxTypes.find((type) => type.value === effect.type)?.icon || 'mdi-help',
      }))
    : []
)

const deviceOptions = computed(() =>
  devices?.value ? devices.value.map((d) => ({ label: d.id, value: d.id })) : []
)
const tagOptions = computed(() =>
  layout?.value?.tags
    ? layout.value.tags.map((tag: Tag) => ({ label: tag.name, value: tag.id }))
    : []
)
const typeOptions = [...new Set(efxTypes.map((type) => ({ label: type.label, value: type.value })))]

const filters = computed<ListFilter[]>(() => [
  { type: 'device', label: 'Device', options: deviceOptions.value },
  { type: 'type', label: 'Type', options: typeOptions },
  { type: 'tags', label: 'Tags', options: tagOptions.value },
])

const viewOptions = [
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Grid' },
  { value: 'switch', icon: 'mdi-toggle-switch-outline', label: 'Switch' },
  { value: 'table', icon: 'mdi-table', label: 'Table' },
]

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'device', label: 'Device' },
  { value: 'type', label: 'Type' },
]

const controls = useListControls('effects', {
  list: effectsList,
  filters: filters.value,
  viewOptions,
  sortOptions,
})

async function handleEffect(effect: Effect, newState: boolean) {
  await runEffect({ ...effect, state: newState })
}
</script>

<template>
  <PageHeader title="Effects" icon="mdi-rocket-launch" color="indigo">
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="indigo"
        :view-options="viewOptions"
        :sort-options="sortOptions"
        :filters="filters"
        search-placeholder="Search effects..."
      />
    </template>
  </PageHeader>
  <List
    :list="controls.filteredList.value"
    :view-as="controls.viewAs.value"
    empty-icon="mdi-auto-fix"
    empty-title="No effects"
    empty-description="Create effects to control lights and sounds"
    @update:state="handleEffect"
  />
</template>
```

- [ ] **Step 2: Update TurnoutList.vue**

Same pattern — replace `<List module-name="turnouts" ...>` with `PageHeader` + `ListControlBar` + stripped `List`. Refer to EffectList pattern. Keep the custom CTCSwitch slot via the `#item` slot on `List`.

- [ ] **Step 3: Update LocoList.vue, SignalList.vue, SensorList.vue**

Same pattern for each. Read each file first to understand its specific data fetching, then apply the same refactor:
- Import `PageHeader`, `ListControlBar`, `useListControls`
- Set up controls with module-specific filters/views/sorts
- Pass `controls.filteredList` and `controls.viewAs` to the stripped `List`

- [ ] **Step 4: Verify build**

Run: `pnpm --filter=@repo/ui exec tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/Effects/EffectList.vue packages/ui/src/Turnouts/TurnoutList.vue packages/ui/src/Locos/LocoList.vue packages/ui/src/SignalList.vue packages/ui/src/Sensors/SensorList.vue
git commit -m "refactor(ui): update list components to use PageHeader + ListControlBar"
```

---

## Task 8: Update Cloud App Views

**IMPORTANT:** ~26 files in the cloud app import the old `PageHeader` from `@/Core/UI/PageHeader.vue`. ALL must be migrated before removing the old file. This includes list views, edit/add forms, settings, and utility pages.

**Files (list views — need PageHeader + possibly ListControlBar):**
- Modify: `apps/cloud/src/Effects/Effects.vue`
- Modify: `apps/cloud/src/Turnouts/Turnouts.vue`
- Modify: `apps/cloud/src/Roster/Roster.vue`
- Modify: `apps/cloud/src/Signals/Signals.vue`
- Modify: `apps/cloud/src/Sensors/Sensors.vue`
- Modify: `apps/cloud/src/Routes/Routes.vue`
- Modify: `apps/cloud/src/Sounds/Sounds.vue`
- Modify: `apps/cloud/src/Layout/Layout.vue`
- Modify: `apps/cloud/src/Dashboard/Dashboard.vue`

**Files (edit/add forms and other pages — need PageHeader import swap only):**
- Modify: `apps/cloud/src/Effects/AddEffect.vue`
- Modify: `apps/cloud/src/Effects/EditEffect.vue`
- Modify: `apps/cloud/src/Turnouts/AddTurnout.vue`
- Modify: `apps/cloud/src/Turnouts/EditTurnout.vue`
- Modify: `apps/cloud/src/Routes/AddRoute.vue`
- Modify: `apps/cloud/src/Routes/EditRoute.vue`
- Modify: `apps/cloud/src/Signals/AddSignal.vue`
- Modify: `apps/cloud/src/Signals/EditSignal.vue`
- Modify: `apps/cloud/src/Sensors/AddSensor.vue`
- Modify: `apps/cloud/src/Sensors/EditSensor.vue`
- Modify: `apps/cloud/src/Sensors/AutomationForm.vue`
- Modify: `apps/cloud/src/Sensors/Automations.vue`
- Modify: `apps/cloud/src/Sounds/AddSound.vue`
- Modify: `apps/cloud/src/Signals/SignalList.vue` (cloud-local, not `@repo/ui`)
- Modify: `apps/cloud/src/DCCEX/DCCEX.vue`
- Modify: `apps/cloud/src/Settings/Settings.vue`
- Modify: `apps/cloud/src/Upgrade/Upgrade.vue`
- Modify: `apps/cloud/src/UserProfile/UserProfile.vue`
- Modify: Any other files found by `grep -r "from '@/Core/UI/PageHeader.vue'" apps/cloud/`

- [ ] **Step 1: Update Effects.vue**

Replace the local `PageHeader` import and `ListMenu` with the new shared components. Since `EffectList` from `@repo/ui` already includes the PageHeader + ListControlBar (from Task 7), the cloud Effects.vue just needs to use `EffectList` directly or keep its own wrapper.

The cloud app's Effects.vue currently adds `AddTile` and navigation. Update to use the `@repo/ui` PageHeader for the outer header while the `EffectsList` (cloud-local component) handles the list content:

```vue
<script setup lang="ts">
import type { Effect } from '@repo/modules'
import { useRouter } from 'vue-router'
import { PageHeader } from '@repo/ui'
import EffectsList from '@/Effects/EffectsList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEdit(effect: Effect) {
  router.push({ name: 'Edit Effect', params: { effectId: effect.id } })
}

function handleAdd() {
  router.push({ name: 'Add Effect' })
}
</script>

<template>
  <EffectsList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="purple" />
    </template>
  </EffectsList>
</template>
```

**Note:** Since `EffectList` (from `@repo/ui`) now contains the PageHeader, the cloud `Effects.vue` may need to either:
- Use `EffectList` directly (if cloud's `EffectsList` is just a wrapper) — read the cloud's `EffectsList.vue` to confirm
- Or keep the cloud's own `EffectsList.vue` and add `PageHeader` + `ListControlBar` there

Read `apps/cloud/src/Effects/EffectsList.vue` before implementing to decide which approach.

- [ ] **Step 2: Update Turnouts.vue**

Remove the custom view dialog and local PageHeader. Since `TurnoutList` from `@repo/ui` now includes PageHeader + ListControlBar, the cloud Turnouts view simplifies to:

```vue
<script setup lang="ts">
import type { Turnout } from '@repo/modules'
import { useRouter } from 'vue-router'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEdit(turnout: Turnout) {
  router.push({ name: 'Edit Turnout', params: { turnoutId: turnout.id } })
}

function handleAdd() {
  router.push({ name: 'Add Turnout' })
}
</script>

<template>
  <TurnoutsList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="yellow" />
    </template>
  </TurnoutsList>
</template>
```

**Note:** Same consideration as Effects — read the cloud's `TurnoutsList.vue` first.

- [ ] **Step 3: Update Roster.vue**

Replace local PageHeader import. Move sync buttons into `#actions` slot of the `@repo/ui` PageHeader. The roster uses a local `RosterList` component — add `PageHeader` above it:

```vue
<!-- Change import -->
import { PageHeader } from '@repo/ui'
<!-- Remove -->
import PageHeader from '@/Core/UI/PageHeader.vue'

<!-- In template, replace: -->
<PageHeader menu="Roster" />
<!-- With: -->
<PageHeader title="Roster" icon="mdi-train" color="pink">
  <template #actions>
    <v-btn :loading="..." :disabled="isSyncing" prepend-icon="mdi-sync" variant="tonal" color="primary" size="small" @click="syncToCS">
      Sync to DCC-EX
    </v-btn>
    <v-btn :loading="..." :disabled="isSyncing" prepend-icon="mdi-download" variant="tonal" color="secondary" size="small" @click="importFromCS">
      Import from DCC-EX
    </v-btn>
  </template>
</PageHeader>
```

Remove the separate `<div class="flex gap-2 px-4 mb-4">` button group since buttons are now in the slot.

- [ ] **Step 4: Update remaining cloud views**

For each remaining view (Signals, Sensors, Routes, Sounds, Layout, Dashboard):
- Replace `import PageHeader from '@/Core/UI/PageHeader.vue'` with `import { PageHeader } from '@repo/ui'`
- Replace `<PageHeader menu="X">` with `<PageHeader title="X" icon="mdi-..." color="...">`
  - Use the menu config from `useMenu.ts` to get the correct title/icon/color for each
- Remove `ListMenu` imports and usage
- Add `ListControlBar` where controls are needed (check the views-to-update table in spec)

Menu config reference (from `apps/cloud/src/Core/Menu/useMenu.ts`):
- Roster: pink, mdi-train
- Turnouts: amber, mdi-call-split
- Routes: purple, mdi-map
- Effects: indigo, mdi-rocket-launch
- Signals: emerald, mdi-traffic-light
- Sounds: sky, mdi-volume-high
- Sensors: teal, mdi-access-point
- Devices: cyan, mdi-developer-board
- Dashboard: (use violet or cyan, mdi-view-dashboard)

- [ ] **Step 5: Migrate ALL remaining old PageHeader imports**

Run this grep to find every remaining file:
```bash
grep -r "from '@/Core/UI/PageHeader.vue'" apps/cloud/src/ --files-with-matches
```

For each file found (edit/add forms, DCCEX, Settings, Upgrade, UserProfile, etc.):
- Replace `import PageHeader from '@/Core/UI/PageHeader.vue'` with `import { PageHeader } from '@repo/ui'`
- Replace `<PageHeader menu="X">` with `<PageHeader title="X" icon="mdi-..." color="...">`
- These files only need the import swap — they don't need ListControlBar

Also find and update any remaining `ListMenu` consumers:
```bash
grep -r "ListMenu" apps/cloud/src/ --files-with-matches
```

Menu config reference for ALL sections:
- Roster: pink, mdi-train
- Turnouts: amber, mdi-call-split
- Routes: purple, mdi-map
- Effects: indigo, mdi-rocket-launch
- Signals: emerald, mdi-traffic-light
- Sounds: sky, mdi-volume-high
- Sensors: teal, mdi-access-point
- Devices: cyan, mdi-developer-board
- DCC-EX: lime, mdi-cpu-64-bit
- Settings: blue, mdi-cog
- Emulator: rose, mdi-console
- Dashboard: violet, mdi-view-dashboard

- [ ] **Step 6: Verify cloud app builds**

Run: `pnpm --filter=deja-cloud build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add apps/cloud/src/
git commit -m "refactor(cloud): migrate all views to @repo/ui PageHeader + ListControlBar"
```

---

## Task 9: Update Throttle App Views

**Files:**
- Modify: `apps/throttle/src/views/EffectsView.vue`
- Modify: `apps/throttle/src/views/TurnoutsView.vue`
- Modify: `apps/throttle/src/views/RosterView.vue`
- Modify: `apps/throttle/src/views/SignalsView.vue`
- Modify: `apps/throttle/src/views/RoutesView.vue`
- Modify: `apps/throttle/src/views/ThrottleListView.vue`

- [ ] **Step 1: Update EffectsView, TurnoutsView, RosterView, SignalsView**

These views are thin wrappers around `@repo/ui` list components (e.g., `<EffectList />`). Since those list components now include their own PageHeader + ListControlBar (from Task 7), the throttle views need minimal changes — mainly just keeping the `<main>` wrapper:

```vue
<!-- EffectsView.vue — unchanged, EffectList now has its own header -->
<script setup lang="ts">
import { EffectList } from '@repo/ui'
</script>
<template>
  <main class="@container flex flex-col flex-grow p-2 md:p-4 w-full overflow-auto">
    <EffectList />
  </main>
</template>
```

Verify the same for TurnoutsView, RosterView, SignalsView — they should just work since the `@repo/ui` components handle everything now.

- [ ] **Step 2: Update RoutesView**

The Routes view has a custom map/list toggle. Add `PageHeader` from `@repo/ui` and move the map toggle buttons into the `#actions` slot:

Read `apps/throttle/src/views/RoutesView.vue` and `apps/throttle/src/routes/Routes.vue` first, then update the header.

- [ ] **Step 3: Update ThrottleListView**

Read the current file, then add a `PageHeader` if appropriate.

- [ ] **Step 4: Verify throttle app builds**

Run: `pnpm --filter=deja-throttle build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/
git commit -m "refactor(throttle): migrate views to use new PageHeader from @repo/ui"
```

---

## Task 10: Cleanup

**Files:**
- Remove: `packages/ui/src/ListMenu/` (entire directory — includes `ListMenu.vue` and any types/stories)
- Remove: `apps/cloud/src/Core/UI/PageHeader.vue`
- Modify: `packages/ui/src/index.ts` — remove old `ListMenu` export

- [ ] **Step 1: Search for remaining references to old components**

Search for ALL remaining references — these must be zero before removing files:

```bash
# Old PageHeader
grep -r "from '@/Core/UI/PageHeader.vue'" apps/cloud/src/ --files-with-matches
# Old ListMenu (in all apps)
grep -r "ListMenu" apps/ packages/ --include="*.vue" --include="*.ts" --files-with-matches
# Old ModuleList types that might still be imported
grep -r "from.*ModuleList/types" apps/ --files-with-matches
```

If any references remain, fix them before proceeding.

- [ ] **Step 2: Remove old files**

```bash
rm -rf packages/ui/src/ListMenu/
rm apps/cloud/src/Core/UI/PageHeader.vue
```

- [ ] **Step 3: Remove old export from index.ts**

In `packages/ui/src/index.ts`, remove:
```typescript
export { default as ListMenu } from './ListMenu/ListMenu.vue'
```

- [ ] **Step 4: Verify full monorepo build**

Run: `pnpm build`
Expected: All packages build successfully

- [ ] **Step 5: Run lint and type-check**

Run: `pnpm lint && pnpm check-types`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(ui): remove old ListMenu and cloud PageHeader after migration"
```

---

## Task 11: Visual Verification

- [ ] **Step 1: Start dev servers**

Run: `pnpm dev` to start all apps

- [ ] **Step 2: Verify cloud app**

Check each cloud view in the browser:
- Effects: PageHeader with indigo gradient, full controls (search, filter, view, sort)
- Turnouts: Amber gradient, device filter, view toggle with switch/ctc options
- Roster: Pink gradient, sync buttons in actions slot
- Signals, Sensors, Routes, Sounds, Dashboard: correct headers

- [ ] **Step 3: Verify throttle app**

Check each throttle view:
- Effects, Turnouts, Roster, Signals: should show PageHeader + controls
- Routes: custom map toggle in actions slot

- [ ] **Step 4: Verify mobile responsive**

Resize browser to mobile width (< 960px) and verify:
- Search bar is full width
- Three icon buttons appear (view, sort, filter)
- Tapping each opens correct bottom sheet
- Filter sheet has Apply button, doesn't auto-close
- View/Sort sheets auto-close on selection

- [ ] **Step 5: Commit any fixes**

If any visual issues are found, fix and commit:

```bash
git add -A
git commit -m "fix(ui): visual adjustments for list menu redesign"
```
