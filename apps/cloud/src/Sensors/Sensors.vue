<script setup lang="ts">
import { computed } from 'vue'
import type { Sensor } from '@repo/modules/sensors'
import { useSensors } from '@repo/modules/sensors'
import { useLayout, type Tag } from '@repo/modules'
import { useRouter } from 'vue-router'
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import SensorList from '@/Sensors/SensorList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()
const { getSensors } = useSensors()
const { getDevices, getLayout } = useLayout()
const devices = getDevices()
const layout = getLayout()
const sensors = getSensors()

const sensorsList = computed(() =>
  sensors?.value ? sensors.value.map((s) => ({ ...s, id: s.id })) : []
)

const deviceOptions = computed(() =>
  devices?.value ? devices.value.map((d) => ({ label: d.id, value: d.id })) : []
)
const tagOptions = computed(() =>
  layout?.value?.tags
    ? layout.value.tags.map((tag: Tag) => ({ label: tag.name, value: tag.id }))
    : []
)

const filters = computed<ListFilter[]>(() => [
  { type: 'device', label: 'Device', options: deviceOptions.value },
  { type: 'tags', label: 'Tags', options: tagOptions.value },
])

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'device', label: 'Device' },
]

const controls = useListControls('cloud-sensors', {
  list: sensorsList,
  filters: filters.value,
  sortOptions,
})

function handleEdit(sensor: Sensor) {
  router.push({ name: 'Edit Sensor', params: { sensorId: sensor.id } })
}

function handleAdd() {
  router.push({ name: 'Add Sensor' })
}
</script>
<template>
  <PageHeader title="Sensors" icon="mdi-access-point" color="teal">
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
  </PageHeader>
  <SensorList :filtered-list="controls.filteredList.value" @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="teal" />
    </template>
  </SensorList>
</template>
