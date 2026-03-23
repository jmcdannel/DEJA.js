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
