<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Signal } from '@repo/modules/signals'
import { useSignals } from '@repo/modules/signals'
import { useLayout, type Tag, useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { useRouter } from 'vue-router'
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import SignalList from '@/Signals/SignalsList.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const router = useRouter()
const { getSignals } = useSignals()
const { getDevices, getLayout } = useLayout()
const { plan } = useSubscription()
const devices = getDevices()
const layout = getLayout()
const signals = getSignals()

// 🔄 Loading state
const isLoaded = ref(false)
let loadingTimeout: ReturnType<typeof setTimeout> | undefined
onMounted(async () => {
  loadingTimeout = setTimeout(() => { isLoaded.value = true }, 3000)
  try {
    await (signals as any).promise
  } finally {
    clearTimeout(loadingTimeout)
    isLoaded.value = true
  }
})
onUnmounted(() => clearTimeout(loadingTimeout))

const isLoading = computed(() => !isLoaded.value)
const isFreePlan = computed(() => plan.value === 'hobbyist')

const signalsList = computed(() =>
  signals?.value ? signals.value.map((s) => ({ ...s, id: s.id })) : []
)

const hasItems = computed(() => isLoaded.value && signalsList.value.length > 0)

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

const controls = useListControls('cloud-signals', {
  list: signalsList,
  filters: filters.value,
  sortOptions,
})

function handleEdit(signal: Signal) {
  router.push({ name: 'Edit Signal', params: { signalId: signal.id } })
}

function handleAdd() {
  router.push({ name: 'Add Signal' })
}
</script>
<template>
  <!-- 🔄 Loading -->
  <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
    <v-skeleton-loader v-for="n in 6" :key="n" type="card" />
  </div>

  <!-- ✅ Has items -->
  <template v-else-if="hasItems">
    <PageHeader title="Signals" icon="mdi-traffic-light" color="emerald" subtitle="Manage signal aspects and track-side indicators.">
      <template #actions>
        <v-btn prepend-icon="mdi-plus" color="emerald" variant="flat" @click="handleAdd">
          New Signal
        </v-btn>
      </template>
      <template #controls>
        <ListControlBar
          :controls="controls"
          color="emerald"
          :sort-options="sortOptions"
          :filters="filters"
          :show-view="false"
          search-placeholder="Search signals..."
        />
      </template>
    </PageHeader>

    <SignalList :filtered-list="controls.filteredList.value" @edit="handleEdit" />
  </template>

  <!-- 📭 Empty -->
  <EmptyState
    v-else
    icon="mdi-traffic-light"
    color="emerald"
    title="No Signals Yet"
    :description="isFreePlan
      ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to add signals and manage block protection on your layout.`
      : 'Configure signal heads with red, yellow, and green aspects to manage block protection and interlocking on your layout.'"
    :use-cases="[
      { icon: 'mdi-shield-check', text: 'Block signal protection' },
      { icon: 'mdi-lock', text: 'Interlocking control' },
      { icon: 'mdi-lightbulb-on', text: 'Approach lighting' },
    ]"
    :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Add Your First Signal'"
    :action-to="isFreePlan ? '/upgrade' : '/signals/new'"
  />
</template>
