<script setup lang="ts">
import { computed, watch, ref, shallowRef, reactive, type PropType } from 'vue'
import { useStorage } from '@vueuse/core'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import Item from './Item.vue'
import Table from './Table.vue'
import { type ListFilter } from './types'
import { 
  DEFAULT_VIEW_OPTIONS,
  DEFAULT_VIEW_OPTION, 
  DEFAULT_SORT_OPTIONS, 
  DEFAULT_SORT_OPTION } from './constants'
import type { DocumentData } from 'firebase/firestore'


const cols = {
  xs: 12,
  sm: 6,
  md: 4,
  lg: 4,
  xl: 3,
  xxl: 2,
}

const emit = defineEmits(['update:state'])
const props = defineProps({
  icon: {
    type: String,
    default: 'mdi-lightning-bolt'
  },
  color: {
      type: String,
      default: 'amber-darken-4'
  },
  title: {
    type: String,
    default: 'Effects'
  },
  moduleName: {
    type: String,
    default: 'effects'
  },
  list: {
      type: Array as PropType<DocumentData[]>,
      default: () => []
  },
  filters: {
    type: Array as PropType<ListFilter[]>,
    default: () => []
  },
  viewOptions: {
    type: Array as PropType<{ label: string; value: string }[]>,
    default: () => DEFAULT_VIEW_OPTIONS
  },
  sortOptions: {
    type: Array as PropType<{ label: string; value: string }[]>,
    default: () => DEFAULT_SORT_OPTIONS
  },
})

const viewAs = useStorage<string[]>(`@DEJA/prefs/${props.moduleName}/View`, [DEFAULT_VIEW_OPTION.value])
const sortBy = useStorage<string[]>(`@DEJA/prefs/${props.moduleName}/Sort`, [DEFAULT_SORT_OPTION.value])
const filterBy = useStorage<Record<string, string[]>>(`@DEJA/prefs/${props.moduleName}/Filter`, {})
const searchQuery = useStorage<string>(`@DEJA/prefs/${props.moduleName}/Search`, '')

const viewOptionModel = shallowRef(viewAs.value || [DEFAULT_VIEW_OPTIONS[0]])
const viewOption = computed(() => props.viewOptions.find(option => option.value === viewOptionModel.value[0]) || props.viewOptions[0])

const sortOptionModel = shallowRef(sortBy.value || [DEFAULT_SORT_OPTIONS[0]])
const sortOption = computed(() => props.sortOptions.find(option => option.value === sortOptionModel.value[0]) || props.sortOptions[0])

const filterSelections = reactive<Record<string, string[]>>({ ...filterBy.value })

watch(viewOptionModel, (newValue) => {
  viewAs.value = newValue
})

watch(sortOptionModel, (newValue) => {
  sortBy.value = newValue
})

watch(
  () => props.filters,
  (newFilters) => {
    const currentFilters = newFilters || []

    currentFilters.forEach((filter) => {
      if (!Array.isArray(filterSelections[filter.type])) {
        filterSelections[filter.type] = [...(filterBy.value?.[filter.type] || [])]
      }

      if (Array.isArray(filter.options) && filter.options.length) {
        const validValues = filter.options.map((option) => option.value)
        filterSelections[filter.type] = (filterSelections[filter.type] || []).filter((value) => validValues.includes(value))
      }
    })

    Object.keys(filterSelections).forEach((filterKey) => {
      if (!currentFilters.find((filter) => filter.type === filterKey)) {
        delete filterSelections[filterKey]
      }
    })
  },
  { immediate: true, deep: true }
)

watch(
  filterSelections,
  (newSelections) => {
    filterBy.value = JSON.parse(JSON.stringify(newSelections))
  },
  { deep: true }
)

const filteredList = computed(() => {
  if (!Array.isArray(props.list)) {
    return []
  }

  const activeFilters = Object.entries(filterSelections).filter(([, values]) => Array.isArray(values) && values.length > 0)
  const query = searchQuery.value?.trim().toLowerCase()

  let result = props.list

  if (activeFilters.length) {
    result = result.filter((item) => {
      return activeFilters.every(([filterKey, selectedValues]) => {
        const itemValue = (item as Record<string, unknown>)[filterKey]

        if (itemValue == null) {
          return false
        }

        if (Array.isArray(itemValue)) {
          return selectedValues.some((selected) => itemValue.includes(selected))
        }

        return selectedValues.includes(String(itemValue))
      })
    })
  }

  if (query) {
    result = result.filter((item) => {
      const name = (item as Record<string, unknown>).name
      return typeof name === 'string' && name.toLowerCase().includes(query)
    })
  }

  return result
})

function getFilterChipLabel(filter: ListFilter) {
  const selections = filterSelections[filter.type] || []

  if (!selections.length) {
    return filter.label
  }

  const optionMap = new Map((filter.options || []).map((option) => [option.value, option.label]))
  const labels = selections
    .map((selection) => optionMap.get(selection) || selection)
    .filter(Boolean)

  if (labels.length === 1) {
    return `${filter.label}: ${labels[0]}`
  }

  return `${filter.label}: ${labels.length} selected`
}

function handleUpdateState(item: DocumentData, newState: boolean) {
  emit('update:state', item, newState)
}

</script>

<template>
  <v-toolbar :elevation="8" class="border-1 bg-slate-900 bg-opacity-70" density="compact" rounded="pill">
    <template #prepend>
      <v-icon :icon="icon"></v-icon>
    </template>
    <template #append>
      <div class="flex flex-row gap-2 items-center">
        <v-text-field
          v-model="searchQuery"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          placeholder="Search..."
          prepend-inner-icon="mdi-magnify"
          class="search-field"
          style="max-width: 180px;"
        />
        <template v-for="filter in filters" :key="filter.type">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-chip v-bind="props" color="green-darken-4" variant="flat" prepend-icon="mdi-filter">{{ getFilterChipLabel(filter) }}</v-chip>
            </template>
            <v-list
              v-if="filter.options"
              class="bg-green-darken-4"
              v-model:selected="filterSelections[filter.type]"
              select-strategy="single-independent"
            >
              <v-list-item
                v-for="option in filter.options"
                :key="option?.value || option?.label"
                :value="option?.value"
              >
                <v-list-item-title>{{ option?.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-chip v-bind="props" color="blue-darken-4" variant="flat" prepend-icon="mdi-eye">{{  viewOption.label }}</v-chip>
          </template>
          <v-list class="bg-blue-darken-4" v-model:selected="viewOptionModel" select-strategy="single-independent">
            <v-list-item
              v-for="item in viewOptions"
              :key="item?.value || item?.label"
              :value="item.value"
            >
              <v-list-item-title>{{ item.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>        
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-chip v-bind="props" color="teal-darken-4" variant="flat" prepend-icon="mdi-sort">{{ sortOption.label }}</v-chip>
          </template>
          <v-list class="bg-teal-darken-4" v-model:selected="sortOptionModel" select-strategy="single-independent">
            <v-list-item
              v-for="(item, index) in sortOptions"
              :key="item.value"
              :value="item.value"
            >
              <v-list-item-title>{{ item.label }}</v-list-item-title>
            </v-list-item>
          </v-list> 
        </v-menu>
        <v-btn
          icon="mdi-dots-vertical"
          size="small"
          variant="elevated"
        />
      </div>
    </template>
    <v-toolbar-title>
      {{ title}}
    </v-toolbar-title>
  </v-toolbar>
  <v-spacer class="my-4"></v-spacer>
  <div class="w-full p-4">
    <Table v-if="viewAs?.[0] === 'table'" 
      :list="filteredList" 
      :sort-by="sortBy?.[0]" 
      @update:state="handleUpdateState"
    />
    <v-row v-else-if="DEFAULT_VIEW_OPTIONS.some(option => option.value === viewAs?.[0])" v-auto-animate>
      <v-col :cols="cols.xs" :sm="cols.sm" :md="cols.md" :lg="cols.lg" :xl="cols.xl" :xxl="cols.xxl"
        v-for="item in filteredList"
        :key="item.id">
        <Item :item="item" :viewAs="viewOptionModel[0]" @update:state="handleUpdateState" />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="auto"
        v-for="item in filteredList"
        :key="item.id">
        <slot :item="item" name="item"></slot>
      </v-col>
    </v-row>
  </div>
</template>