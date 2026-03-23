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

const showViewSheet = ref(false)
const showSortSheet = ref(false)
const showFilterSheet = ref(false)
</script>

<template>
  <!-- Desktop: inline controls bar -->
  <div v-if="mdAndUp">
    <div class="lcb-bar">
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

      <div class="flex-grow" />

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

    <!-- Active filter chips (desktop) -->
    <div v-if="controls.hasActiveFilters.value || controls.searchQuery.value" class="lcb-active-filters">
      <template v-for="filter in filters" :key="filter.type">
        <button
          v-for="val in (controls.activeFilters.value[filter.type] ?? [])"
          :key="val"
          class="lcb-active-chip"
          @click="controls.removeFilter(filter.type, val)"
        >
          <span class="opacity-50 text-[10px] uppercase mr-1">{{ filter.label }}:</span>
          {{ filter.options.find(o => o.value === val)?.label ?? val }}
          <v-icon icon="mdi-close" size="12" class="ml-1 opacity-50" />
        </button>
      </template>
      <button
        v-if="controls.searchQuery.value"
        class="lcb-active-chip"
        @click="controls.searchQuery.value = ''"
      >
        <span class="opacity-50 text-[10px] uppercase mr-1">Search:</span>
        "{{ controls.searchQuery.value }}"
        <v-icon icon="mdi-close" size="12" class="ml-1 opacity-50" />
      </button>
      <button
        v-if="controls.activeFilterCount.value > 1"
        class="lcb-clear-all"
        @click="controls.clearFilters()"
      >
        Clear all
      </button>
    </div>
  </div>

  <!-- Mobile: search bar + icon buttons -->
  <div v-else class="px-2 py-2">
    <div class="flex items-center gap-2">
      <ListSearch
        v-if="showSearch"
        :model-value="controls.searchQuery.value"
        @update:model-value="controls.searchQuery.value = $event"
        :placeholder="searchPlaceholder"
        :collapsible="false"
      />

      <v-btn
        v-if="showView && viewOptions.length"
        icon="mdi-view-grid-outline"
        size="small"
        variant="flat"
        class="lcb-mobile-btn"
        @click="showViewSheet = true"
      />

      <v-btn
        v-if="showSort && sortOptions.length"
        icon="mdi-sort-variant"
        size="small"
        variant="flat"
        class="lcb-mobile-btn"
        :class="{ 'lcb-mobile-btn--active': controls.isNonDefaultSort.value }"
        @click="showSortSheet = true"
      />

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
          class="lcb-mobile-btn"
          :class="{ 'lcb-mobile-btn--active': controls.hasActiveFilters.value }"
          @click="showFilterSheet = true"
        />
      </v-badge>
    </div>

    <!-- Active filter chips -->
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

<style>
/* ─── Shared control bar styles ─── */

.lcb-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 20px;
  border-top: 1px solid rgb(30 41 59);
  border-bottom: 1px solid rgb(30 41 59);
  background: rgb(15 23 42 / 0.6);
}

/* Section labels: FILTER: VIEW: SORT: */
.lcb-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgb(100 116 139);
  font-weight: 500;
  white-space: nowrap;
}

/* Filter dropdown chips */
.lcb-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  background: rgb(30 41 59);
  border: 1px solid rgb(51 65 85);
  border-radius: 6px;
  color: rgb(203 213 225);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, background 0.15s;
  line-height: 1.4;
}
.lcb-chip:hover {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59 / 0.9);
}

/* Sort button (text + chevron, no bg) */
.lcb-sort-btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 0;
  background: none;
  border: none;
  color: rgb(203 213 225);
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s;
}
.lcb-sort-btn:hover {
  color: rgb(226 232 240);
}

/* View toggle group */
.lcb-view-group {
  display: inline-flex;
  border: 1px solid rgb(51 65 85);
  border-radius: 6px;
  overflow: hidden;
  background: rgb(15 23 42);
}
.lcb-view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 32px;
  background: transparent;
  border: none;
  color: rgb(100 116 139);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.lcb-view-btn:not(:last-child) {
  border-right: 1px solid rgb(51 65 85);
}
.lcb-view-btn:hover {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}
.lcb-view-btn--active {
  background: rgb(51 65 85);
  color: rgb(226 232 240);
}

/* Desktop search field */
.lcb-search-desktop {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgb(30 41 59);
  border: 1px solid rgb(51 65 85);
  border-radius: 20px;
  min-width: 200px;
  max-width: 280px;
  transition: border-color 0.15s;
}
.lcb-search-desktop:focus-within {
  border-color: rgb(71 85 105);
}
.lcb-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: rgb(203 213 225);
  font-size: 13px;
}
.lcb-search-input::placeholder {
  color: rgb(71 85 105);
}
.lcb-search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 32px;
  background: rgb(30 41 59);
  border: 1px solid rgb(51 65 85);
  border-radius: 20px;
  color: rgb(100 116 139);
  cursor: pointer;
  transition: border-color 0.15s;
}
.lcb-search-icon:hover {
  border-color: rgb(71 85 105);
}

/* Mobile icon buttons */
.lcb-mobile-btn {
  background: rgb(30 41 59) !important;
  border: 1px solid rgb(51 65 85) !important;
  border-radius: 8px !important;
}
.lcb-mobile-btn--active {
  border-color: rgb(99 102 241) !important;
  background: rgb(99 102 241 / 0.15) !important;
}

/* Active filter chips row */
.lcb-active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 20px;
  border-bottom: 1px solid rgb(30 41 59);
  background: rgb(15 23 42 / 0.4);
}
.lcb-active-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: rgb(30 41 59);
  border: 1px solid rgb(51 65 85);
  border-radius: 12px;
  color: rgb(148 163 184);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  white-space: nowrap;
}
.lcb-active-chip:hover {
  border-color: rgb(239 68 68 / 0.5);
  background: rgb(239 68 68 / 0.1);
  color: rgb(252 165 165);
}
.lcb-clear-all {
  padding: 3px 10px;
  background: none;
  border: none;
  color: rgb(100 116 139);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: color 0.15s;
}
.lcb-clear-all:hover {
  color: rgb(239 68 68);
}
</style>
