<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useLayout } from '@repo/modules'

const props = defineProps<{
  disabledMenus?: string[]
  filterOptions?: { title: string; value: string }[]
  menuOptions?: { color: string; title: string; icon: string; value: string }[]
  moduleName: string,
  sortOptions?: { title: string; value: string }[]
  viewOptions?: { title: string; value: string }[]
}>()

const viewAsPref = useStorage<string[]>(`@DEJA/prefs/${props.moduleName}/View`, ['switch'])
const sortByPref = useStorage<string[]>(`@DEJA/prefs/${props.moduleName}/Sort`, ['device'])
const filterByPref = useStorage<string[]>(`@DEJA/prefs/${props.moduleName}/Filter`, [])

const viewAs = ref(viewAsPref.value[0])
const sortBy = ref(sortByPref.value[0])
const filterBy = ref(filterByPref.value)

watch(viewAs, (newValue) => {
  viewAsPref.value = [newValue]
})

watch(sortBy, (newValue) => {
  sortByPref.value = [newValue]
})

watch(filterBy, (newValue) => {
  filterByPref.value = newValue
})

const { getDevices } = useLayout()
const devices = getDevices()

const DEFAULT_VIEW_OPTIONS = [
  { title: 'Button', value: 'button' },
  { title: 'Card', value: 'card' },
  { title: 'Switch', value: 'switch' },
  { title: 'Table', value: 'table' },
  { title: 'Raw', value: 'raw' },
  ...(props.moduleName === 'turnouts' ? [{ title: 'CTC Switch', value: 'ctc' }] : [])
]
const DEFAULT_SORT_OPTIONS = [
  { title: 'Default', value: 'order' },
  { title: 'Device', value: 'device' },
  { title: 'Name', value: 'name' },
  { title: 'Type', value: 'type' },
]

const DEFAULT_MENU_OPTIONS = [
  { color: 'purple', title: 'View', icon: 'mdi-eye', value: 'view', ref: 'viewAs' },
  { color: 'teal', title: 'Sort', icon: 'mdi-sort', value: 'sort', ref: 'sortBy' },
  { color: 'red', title: 'Filter', icon: 'mdi-filter', value: 'filter' , ref: 'filterBy'}
]

function getOptions(option: string) {
  switch(option) {
    case 'view':
      return props.viewOptions || DEFAULT_VIEW_OPTIONS
    case 'sort':
      return props.sortOptions || DEFAULT_SORT_OPTIONS
    case 'filter':
      return props.filterOptions || [
        ...devices.value.map(device => ({ title: device.id, value: `device:${device.id}` }))
      ]
    default:
      return []
  }
}

function getRef(option: string) {
  switch(option) {
    case 'view':
      return viewAs
    case 'sort':
      return sortBy
    case 'filter':
      return filterBy
    default:
      return ref([])
  }
}

// Create a map for refs to use valid member expressions in v-model
const refsMap: Record<string, any> = {
  view: viewAs,
  sort: sortBy,
  filter: filterBy
}

</script>
<template>
    <v-bottom-sheet>
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn  v-bind="activatorProps" icon="mdi-cogs" variant="flat" color="purple-darken-2"></v-btn>
    </template>
    <template #default>
    <v-list >
      <template v-for="option in (menuOptions || DEFAULT_MENU_OPTIONS)" :key="option.value">
        <v-card v-if="!disabledMenus?.includes(option.value)" :color="option.color" :title="option.title" :prepend-icon="option.icon">
          <v-chip-group
            class="gap-4 px-4"
            :value="getRef(option.value)"
            :multiple="option.value === 'filter'"
            v-model="refsMap[option.value]"
          >
            <v-chip v-for="item in getOptions(option.value)" :key="item.value" :value="item.value" >
              {{ item.title }}
            </v-chip>
          </v-chip-group>
        </v-card>
      </template>
    </v-list>
  <v-sheet class="p-2 gap-2 flex flex-row flex-wrap">
    <v-chip v-for="filter in filterBy" 
      :key="filter" 
      :text="filter" 
      color="red" 
      prepend-icon="mdi-memory" 
      size="small"
      variant="elevated" 
    >
    <template #append>
      <v-icon icon="mdi-close-circle" @click="filterBy = []" />
    </template>
  </v-chip>
    <v-spacer></v-spacer>
    <v-chip
      :text="viewAs || 'View as...'"
      color="purple"
      prepend-icon="mdi-eye"
      size="small"
      variant="elevated"
    />
    <v-chip
      :text="sortBy || 'Sort by...'"
      color="teal"
      prepend-icon="mdi-sort"
      size="small"
      variant="elevated"
    />
  </v-sheet>
    <!-- <nav class=" md:flex gap-4">
      <v-menu v-model="showViewMenu" offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-eye" variant="outlined"></v-btn>
        </template>
        <v-list 
          :items="viewOptions || DEFAULT_VIEW_OPTIONS" 
          v-model:selected="viewAs" 
          select-strategy="single-independent"
        >
        </v-list>
      </v-menu>
      <v-menu v-model="showSortMenu" offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-sort" variant="outlined"></v-btn>
        </template>
        <v-list 
          :items="sortOptions || DEFAULT_SORT_OPTIONS" 
          v-model:selected="sortBy" 
          select-strategy="single-independent"
        >
        </v-list>
      </v-menu>
      <v-menu v-model="showFilterMenu" offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-filter" variant="outlined"></v-btn>
        </template>
        <v-list 
          :items="filterBy || DEFAULT_FILTER_OPTIONS" 
          v-model:selected="filterBy" 
          select-strategy="single-independent"
        >
        </v-list>
      </v-menu>
    </nav> -->
    </template>
  </v-bottom-sheet> 
</template>
