<script setup lang="ts">
import { computed } from 'vue'
import { useSensors, sensorTypes, sensorInputTypes, type Sensor } from '@repo/modules/sensors'
import { useLayout, type Tag } from '@repo/modules'
import List from '../ModuleList/List.vue'
import PageHeader from '../PageHeader/PageHeader.vue'
import ListControlBar from '../ListControls/ListControlBar.vue'
import { useListControls } from '../composables/useListControls'
import type { ListFilter } from '../ListControls/types'

const { getSensors } = useSensors()
const { getDevices, getLayout } = useLayout()
const sensors = getSensors()
const devices = getDevices()
const layout = getLayout()

const sensorsList = computed(() =>
  sensors?.value
    ? sensors.value.map((sensor) => ({
        ...sensor,
        id: sensor.id,
        icon: sensorTypes.find((t) => t.value === sensor.type)?.icon || 'mdi-access-point',
      }))
    : []
)

const deviceOptions = computed(() =>
  devices?.value ? devices.value.map((device) => ({ label: device.id, value: device.id })) : []
)
const tagOptions = computed(() =>
  layout?.value?.tags
    ? layout.value.tags.map((tag: Tag) => ({ label: tag.name, value: tag.id }))
    : []
)
const typeOptions = [...sensorTypes.map((type) => ({ label: type.label, value: type.value }))]
const inputTypeOptions = [...sensorInputTypes.map((type) => ({ label: type.label, value: type.value }))]

const filters = computed<ListFilter[]>(() => [
  { type: 'device', label: 'Device', options: deviceOptions.value },
  { type: 'type', label: 'Type', options: typeOptions },
  { type: 'inputType', label: 'Input', options: inputTypeOptions },
  { type: 'tags', label: 'Tags', options: tagOptions.value },
])

const viewOptions = [
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Card' },
  { value: 'switch', icon: 'mdi-toggle-switch-outline', label: 'Switch' },
  { value: 'table', icon: 'mdi-table', label: 'Table' },
]

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'device', label: 'Device' },
  { value: 'type', label: 'Type' },
]

const controls = useListControls('sensors', {
  list: sensorsList,
  filters: filters.value,
  viewOptions,
  sortOptions,
})
</script>

<template>
  <PageHeader title="Sensors" icon="mdi-access-point" color="teal">
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="teal"
        :view-options="viewOptions"
        :sort-options="sortOptions"
        :filters="filters"
        search-placeholder="Search sensors..."
      />
    </template>
  </PageHeader>
  <List
    :list="controls.filteredList.value"
    :view-as="controls.viewAs.value"
    empty-icon="mdi-access-point"
    empty-title="No sensors"
    empty-description="Add sensors to detect train positions"
  />
</template>
