# List Menu Redesign — Design Spec

> Redesign all list headers across the cloud and throttle apps with a unified, composable component system in `@repo/ui`.

## Goals

- Replace the inconsistent list header patterns (cloud's `PageHeader.vue`, throttle's `ModuleList/List.vue` toolbar, cloud's `ListMenu.vue`) with a unified set of composable components in `@repo/ui`
- Match the reference UI aesthetic: dark, structured toolbar with labeled sections and icon toggles
- Keep existing colors and titles as-is
- Each feature (search, filter, view, sort) is independently toggleable per view
- Responsive: inline controls on desktop, icon buttons + bottom sheets on mobile

## Decisions

| Decision | Choice |
|----------|--------|
| Mobile bottom sheets | Three separate sheets: filter, view, sort |
| Desktop view switcher | Icon-only segmented toggle group |
| Desktop search | Collapsible (icon → expands on click) |
| Mobile search | Always visible, full width |
| Controls placement | Integrated into PageHeader via `#controls` slot |
| Component scope | One unified PageHeader in `@repo/ui` for both apps |
| List.vue responsibility | Pure list renderer (loses toolbar) |
| Filter chip strategy | Fixed common filters (device, type, tags) + "more" overflow |
| Architecture | Composable sub-components with shared `useListControls` composable |
| Mobile control buttons | Three separate icon buttons: view, sort, filter (outside search bar) |

## Component Architecture

### New Components (`packages/ui/src/`)

```
packages/ui/src/
├── PageHeader/
│   └── PageHeader.vue          ← title + gradient + icon + #actions/#controls slots
├── ListControls/
│   ├── ListSearch.vue           ← collapsible on desktop, full-width on mobile
│   ├── ListViewToggle.vue       ← icon-only segmented toggle (desktop)
│   ├── ListSort.vue             ← sort dropdown chip (desktop)
│   ├── ListFilters.vue          ← device/type/tags chips + "more" overflow (desktop)
│   ├── ListViewSheet.vue        ← mobile bottom sheet for view options
│   ├── ListSortSheet.vue        ← mobile bottom sheet for sort options
│   ├── ListFilterSheet.vue      ← mobile bottom sheet for filter options
│   └── ListControlBar.vue       ← convenience wrapper: assembles all controls
└── composables/
    └── useListControls.ts       ← state management + localStorage persistence
```

### Removed / Replaced

| Old Component | Replaced By |
|---------------|-------------|
| `apps/cloud/src/Core/UI/PageHeader.vue` | `@repo/ui` `PageHeader` |
| `packages/ui/src/ListMenu/ListMenu.vue` | Individual `ListControls/*` components |
| Toolbar in `packages/ui/src/ModuleList/List.vue` | `PageHeader` with `#controls` slot |
| Custom view dialog in cloud Turnouts | `ListViewSheet` / `ListViewToggle` |

## Component Specifications

### PageHeader

The unified page header for all list views in both apps.

**Props:**
- `title: string` — page title text
- `icon: string` — MDI icon name (e.g., `mdi-rocket-launch`)
- `color: string` — accent color key (indigo, amber, pink, emerald, etc.)
- `subtitle?: string` — optional description below title
- `menu?: string` — optional menu key (cloud app uses `useMenu()` to resolve label/icon/color)

**Slots:**
- `#actions` — right side of title row (custom buttons, sync actions, etc.)
- `#controls` — controls row below title (filter, view, sort, search components)
- `#subtitle` — custom subtitle content

**Behavior:**
- Title row: colored gradient background (from `color` prop), icon + title left, `#actions` slot right
- Controls row: dark background strip below title, renders `#controls` slot content
- Controls row only renders if `#controls` slot has content
- Gradient colors use existing `GRADIENT_CLASSES` and `TEXT_CLASSES` maps from current cloud PageHeader

### ListSearch

Collapsible search field on desktop, always visible on mobile.

**Props:**
- `modelValue: string` — v-model for search query
- `placeholder?: string` — placeholder text (default: `"Search..."`)
- `collapsible?: boolean` — whether to collapse to icon on desktop (default: `true`)

**Behavior:**
- **Desktop (collapsible):** renders as a search icon button; on click, expands to a `v-text-field` with focus. Collapses back when cleared/blurred and empty.
- **Desktop (not collapsible):** always shows the text field
- **Mobile:** always full-width `v-text-field`
- Uses `v-text-field` with `variant="outlined"`, `density="compact"`, `prepend-inner-icon="mdi-magnify"`, `clearable`

### ListViewToggle

Icon-only segmented toggle for view mode selection on desktop.

**Props:**
- `modelValue: string` — v-model for current view
- `options: Array<{ value: string; icon: string; label: string }>` — view options with icons

**Behavior:**
- Renders as a `v-btn-toggle` with `density="compact"`, `variant="outlined"`
- Each option is an icon-only `v-btn` with a tooltip showing the label
- Active option gets module accent color background
- Common options: `{ value: 'card', icon: 'mdi-view-grid-outline' }`, `{ value: 'list', icon: 'mdi-view-list-outline' }`, `{ value: 'table', icon: 'mdi-table' }`
- Module-specific options supported (e.g., turnouts add `{ value: 'switch', icon: 'mdi-toggle-switch-outline' }`, `{ value: 'ctc', icon: 'mdi-view-dashboard-outline' }`)
- Hidden on mobile (replaced by `ListViewSheet`)

### ListSort

Sort dropdown chip for desktop.

**Props:**
- `modelValue: string` — v-model for current sort
- `options: Array<{ value: string; label: string }>` — sort options

**Behavior:**
- Renders a `SORT:` label + dropdown chip showing current sort selection
- Chip opens a `v-menu` with `v-list` of sort options (single select)
- Default options: Default, Device, Name, Type
- Hidden on mobile (replaced by `ListSortSheet`)

### ListFilters

Filter dropdown chips for desktop.

**Props:**
- `modelValue: Record<string, string[]>` — v-model for active filters (keyed by filter type)
- `filters: Array<{ type: string; label: string; options: Array<{ value: string; label: string }> }>` — filter configuration

**Behavior:**
- Renders a `FILTER:` label followed by chip dropdowns for each filter type
- Fixed common filters: device, type, tags
- Additional filters go into a "More" overflow dropdown
- Each chip shows "All {Type}" when no selection, or "{Type}: {value}" / "{Type}: N selected" when active
- Chips open `v-menu` with `v-list` (multi-select via `select-strategy="classic"`)
- Active filter chips are removable (closable)
- Hidden on mobile (replaced by `ListFilterSheet`)

### ListViewSheet

Mobile bottom sheet for view selection.

**Props:**
- `modelValue: boolean` — v-model for sheet open/closed
- `viewAs: string` — v-model for current view selection
- `options: Array<{ value: string; icon: string; label: string }>` — view options

**Behavior:**
- `v-bottom-sheet` with drag handle
- Header: "LAYOUT VIEW" title + close ✕ button
- Segmented toggle: icon + label for each option (like reference UI)
- Active option gets module accent background + border
- Auto-closes on selection

### ListSortSheet

Mobile bottom sheet for sort selection.

**Props:**
- `modelValue: boolean` — v-model for sheet open/closed
- `sortBy: string` — v-model for current sort selection
- `options: Array<{ value: string; label: string }>` — sort options

**Behavior:**
- `v-bottom-sheet` with drag handle
- Header: "SORT BY" title + close ✕ button
- Radio-style list: each option is a card-like row with label left, radio indicator right
- Active option gets accent background + border + bold label
- Auto-closes on selection

### ListFilterSheet

Mobile bottom sheet for filter selection.

**Props:**
- `modelValue: boolean` — v-model for sheet open/closed
- `filters: Array<{ type: string; label: string; options: Array<{ value: string; label: string }> }>` — filter configuration
- `activeFilters: Record<string, string[]>` — v-model for active filter selections

**Behavior:**
- `v-bottom-sheet` with drag handle
- Header: "FILTER" title + "CLEAR ALL" action
- Sections for each filter type (Device, Type, Tags) with uppercase label
- Multi-select chip toggles within each section
- Selected chips get accent background + border + checkmark
- "Apply Filters" button at bottom (accent color), closes sheet
- Does NOT auto-close on individual selection (user picks multiple, then applies)

### ListControlBar

Convenience wrapper that assembles all controls and handles responsive behavior.

**State ownership:** `ListControlBar` does NOT own state. The parent view calls `useListControls()` and passes the composable's return value into `ListControlBar` via the `controls` prop. This avoids dual instantiation and keeps the parent as the single source of truth for `filteredList`.

**Props:**
- `controls: ReturnType<typeof useListControls>` — **required** — the composable instance from the parent
- `color?: string` — accent color for active states
- `showSearch?: boolean` — show search (default: `true`)
- `showFilters?: boolean` — show filter controls (default: `true`)
- `showView?: boolean` — show view toggle (default: `true`)
- `showSort?: boolean` — show sort controls (default: `true`)
- `searchPlaceholder?: string` — custom search placeholder
- `viewOptions?: Array<{ value: string; icon: string; label: string }>` — custom view options
- `sortOptions?: Array<{ value: string; label: string }>` — custom sort options
- `filters?: Array<{ type: string; label: string; options: Array<{ value: string; label: string }> }>` — filter config

**Behavior:**
- **Desktop (md and up):** renders inline — `ListFilters` + `ListViewToggle` + spacer + `ListSort` + `ListSearch`
- **Mobile (below md):** renders search bar + three icon buttons (view, sort, filter) + active filter chips below
- Icon buttons: `mdi-view-grid-outline` (view), `mdi-sort-variant` (sort), `mdi-filter-variant` (filter)
- Icon active states: accent color border/background when non-default selection active
- Filter icon gets red badge with count when filters are applied
- Sort icon gets accent highlight when sort is non-default
- Each icon button opens its respective bottom sheet
- Binds `controls.searchQuery`, `controls.viewAs`, `controls.sortBy`, `controls.activeFilters` to sub-components via v-model
- Reads `controls.hasActiveFilters`, `controls.activeFilterCount`, `controls.isNonDefaultSort` for active state indicators

### useListControls Composable

Central state management for all list control state.

```typescript
function useListControls(
  moduleName: string,
  options: {
    list: Ref<DocumentData[]> | ComputedRef<DocumentData[]>
    filters?: ListFilter[]
    viewOptions?: ViewOption[]
    sortOptions?: SortOption[]
    defaultView?: string
    defaultSort?: string
  }
): {
  // State (persisted to localStorage via useStorage)
  searchQuery: Ref<string>
  viewAs: Ref<string>
  sortBy: Ref<string>
  activeFilters: Ref<Record<string, string[]>>

  // Computed
  filteredList: ComputedRef<DocumentData[]>
  hasActiveFilters: ComputedRef<boolean>
  activeFilterCount: ComputedRef<number>
  isNonDefaultSort: ComputedRef<boolean>

  // Actions
  clearFilters: () => void
  clearAll: () => void
  setFilter: (type: string, values: string[]) => void
  removeFilter: (type: string, value: string) => void
}
```

**Storage keys:** `@DEJA/prefs/{moduleName}/View`, `@DEJA/prefs/{moduleName}/Sort`, `@DEJA/prefs/{moduleName}/Filter`, `@DEJA/prefs/{moduleName}/Search` (same keys as existing code — preferences migrate automatically)

**Naming convention:** All option shapes use `{ value, label }` (not `{ value, title }` from old `ListMenu.vue`). The old `ListMenu` used `title`; new components standardize on `label`.

**Filtering logic:** applies search query (matches against `name` field, case-insensitive) + active filters (AND across filter types, OR within a type). Same logic as current `ModuleList/List.vue`.

**Sorting logic:** sorts `filteredList` based on `sortBy` value. Supports: `order` (original), `device`, `name`, `type`.

## Desktop Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 🚀 Effects                              [#actions slot]     │ ← title row (gradient bg)
│ Manage lighting, sound, and special effects                 │ ← subtitle (optional)
├─────────────────────────────────────────────────────────────┤
│ FILTER: [All Devices▾] [All Types▾] [Tags▾]                │ ← ListFilters
│ VIEW: [▦][☰][▤]                    SORT: [Default▾]  [🔍] │ ← ListViewToggle, ListSort, ListSearch
└─────────────────────────────────────────────────────────────┘
```

- Controls row has dark semi-transparent background with top border
- `FILTER:`, `VIEW:`, `SORT:` labels are uppercase, muted color, letter-spaced
- Filter chips: dark background, subtle border, rounded pill
- View toggle: segmented icon group, active gets accent color
- Sort: dropdown chip
- Search: collapsible, expands from icon on click

## Mobile Layout

```
┌───────────────────────────────┐
│ 🚀 Effects                    │ ← title row (gradient bg)
├───────────────────────────────┤
│ [🔍 Search effects...] [▦][☰][▽] │ ← search + 3 icon buttons
│ [Device: Arduino-1 ✕]         │ ← active filter chips (when applied)
└───────────────────────────────┘
```

- Search bar: full width, always visible
- Three icon buttons beside search: view (`mdi-view-grid-outline`), sort (`mdi-sort-variant`), filter (`mdi-filter-variant`)
- Each icon button opens its own `v-bottom-sheet`
- Active filter chips shown below when filters are applied (removable)
- Filter icon: gets accent color + red badge count when filters active
- Sort icon: gets accent highlight when non-default sort

## Views to Update

### Cloud App (13 views)

| View | Search | Filter | View | Sort | Notes |
|------|--------|--------|------|------|-------|
| Effects | ✅ | ✅ device, type | ✅ card/list/table | ✅ | Primary example |
| Sounds | ✅ | ❌ | ❌ | ❌ | Search only |
| Routes | ✅ | ❌ | ❌ | ❌ | Has custom map tabs in `#actions` |
| Turnouts | ✅ | ✅ device | ✅ card/switch/ctc/table | ✅ | Module-specific views |
| Signals | ✅ | ✅ device | ✅ card/list | ✅ | |
| Roster | ✅ | ❌ | ✅ avatar/card/table | ✅ | Has sync buttons in `#actions` |
| Sensors | ✅ | ✅ device | ✅ card/switch/table | ✅ | |
| Layout (Devices) | ✅ | ❌ | ❌ | ❌ | Has drag-and-drop, custom content |
| Dashboard | ❌ | ❌ | ❌ | ❌ | Title only, no list controls |
| Port List | ✅ | ❌ | ❌ | ❌ | Has refresh button in `#actions` |
| Sound Files | ✅ | ❌ | ❌ | ❌ | Search only |
| Tags | ❌ | ❌ | ❌ | ❌ | Simple list |
| Automations | ✅ | ❌ | ❌ | ❌ | Not yet a full view |

### Throttle App (7 views)

| View | Search | Filter | View | Sort | Notes |
|------|--------|--------|------|------|-------|
| ThrottleList | ✅ | ❌ | ❌ | ❌ | Has custom throttle content |
| Roster | ✅ | ❌ | ✅ avatar/card/table | ✅ | Uses `LocoList` from `@repo/ui` |
| Turnouts | ✅ | ✅ device | ✅ card/switch/ctc/table | ✅ | Uses `TurnoutList` from `@repo/ui` |
| Effects | ✅ | ✅ device, type | ✅ card/switch/table | ✅ | Uses `EffectList` from `@repo/ui` |
| Signals | ✅ | ✅ device | ✅ card/list | ✅ | Uses `SignalList` from `@repo/ui` |
| Routes | ✅ | ❌ | ❌ | ❌ | Custom map/list toggle |
| Conductor | ❌ | ❌ | ❌ | ❌ | Custom layout, no list |

## Usage Examples

### Full controls (Effects)

```vue
<script setup lang="ts">
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'

const filters = [
  { type: 'device', label: 'Device', options: deviceOptions },
  { type: 'type', label: 'Type', options: typeOptions },
  { type: 'tags', label: 'Tags', options: tagOptions },
]
const viewOptions = [
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Grid' },
  { value: 'list', icon: 'mdi-view-list-outline', label: 'List' },
  { value: 'table', icon: 'mdi-table', label: 'Table' },
]
const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'device', label: 'Device' },
  { value: 'type', label: 'Type' },
]

// Parent owns state — single source of truth
const controls = useListControls('effects', {
  list: effectsList,
  filters,
  viewOptions,
  sortOptions,
})
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
  <ModuleList :list="controls.filteredList.value" :view-as="controls.viewAs.value" />
</template>
```

### Search only (Sounds)

```vue
<script setup lang="ts">
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'

const controls = useListControls('sounds', { list: soundsList })
</script>

<template>
  <PageHeader title="Sounds" icon="mdi-volume-high" color="sky">
    <template #controls>
      <ListControlBar
        :controls="controls"
        :show-filters="false"
        :show-view="false"
        :show-sort="false"
        search-placeholder="Search sounds..."
      />
    </template>
  </PageHeader>
</template>
```

### Title only (Dashboard)

```vue
<template>
  <PageHeader title="Dashboard" icon="mdi-view-dashboard" color="cyan" />
</template>
```

### Custom actions (Roster)

```vue
<script setup lang="ts">
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'

const controls = useListControls('roster', { list: rosterList })
</script>

<template>
  <PageHeader title="Roster" icon="mdi-train" color="pink">
    <template #actions>
      <v-btn prepend-icon="mdi-sync" @click="syncToCS">Sync to DCC-EX</v-btn>
      <v-btn prepend-icon="mdi-download" @click="importFromCS">Import</v-btn>
    </template>
    <template #controls>
      <ListControlBar
        :controls="controls"
        :show-filters="false"
        :show-view="true"
        :show-sort="true"
        search-placeholder="Search roster..."
      />
    </template>
  </PageHeader>
</template>
```

## Styling Notes

- All components use Vuetify 3 components (`v-btn`, `v-chip`, `v-menu`, `v-list`, `v-bottom-sheet`, `v-text-field`, `v-btn-toggle`)
- Tailwind CSS for layout utilities (flex, gap, padding)
- Dark theme: backgrounds use `bg-slate-900`, `bg-slate-800`; borders use `border-slate-700`
- Accent colors use existing gradient/text class maps from current `PageHeader.vue`
- Labels (FILTER:, VIEW:, SORT:) are uppercase, `text-xs`, `tracking-wider`, `text-slate-500`
- Filter/sort chips: `bg-slate-800`, `border-slate-700`, rounded pill
- Mobile icon buttons: 42×42px, `bg-slate-800`, `border-slate-700`, rounded-lg
- Active state: module accent color on background/border, icon color changes to accent
- Filter badge: red circle with count, positioned top-right of icon button

## Migration Strategy

1. Build all new components in `@repo/ui` first (no breaking changes)
2. Update `ModuleList/List.vue` to remove its toolbar, keep only the list rendering
3. Update cloud app views one at a time to use new `PageHeader` + `ListControlBar`
4. Update throttle app views to use new `PageHeader` + `ListControlBar`
5. Remove old `ListMenu.vue` and cloud's local `PageHeader.vue`
6. Clean up unused code
