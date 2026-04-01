<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Sensor } from '@repo/modules/sensors'
import { useSensors } from '@repo/modules/sensors'
import { useLayout, type Tag, useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { useRouter } from 'vue-router'
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import SensorList from '@/Sensors/SensorList.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const router = useRouter()
const { getSensors } = useSensors()
const { getDevices, getLayout } = useLayout()
const { plan } = useSubscription()
const devices = getDevices()
const layout = getLayout()
const sensors = getSensors()

// 🔄 Loading state
const isLoaded = ref(false)
let loadingTimeout: ReturnType<typeof setTimeout> | undefined
onMounted(async () => {
  loadingTimeout = setTimeout(() => { isLoaded.value = true }, 3000)
  try {
    await (sensors as any).promise
  } finally {
    clearTimeout(loadingTimeout)
    isLoaded.value = true
  }
})
onUnmounted(() => clearTimeout(loadingTimeout))

const isLoading = computed(() => !isLoaded.value)
const isFreePlan = computed(() => plan.value === 'hobbyist')

const sensorsList = computed(() =>
  sensors?.value ? sensors.value.map((s) => ({ ...s, id: s.id })) : []
)

const hasItems = computed(() => isLoaded.value && sensorsList.value.length > 0)

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
  <!-- 🔄 Loading -->
  <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
    <v-skeleton-loader v-for="n in 6" :key="n" type="card" />
  </div>

  <!-- ✅ Has items -->
  <template v-else-if="hasItems">
    <PageHeader title="Sensors" icon="mdi-access-point" color="teal" subtitle="Monitor track occupancy and feedback sensors.">
      <template #actions>
        <v-btn prepend-icon="mdi-plus" color="teal" variant="flat" @click="handleAdd">
          New Sensor
        </v-btn>
      </template>
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

    <SensorList :filtered-list="controls.filteredList.value" @edit="handleEdit" />
  </template>

  <!-- 📭 Empty -->
  <EmptyState
    v-else
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
