<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTurnouts, type Turnout } from '@repo/modules'
import { useLayout, type Tag, useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const router = useRouter()
const { getTurnouts } = useTurnouts()
const { getDevices, getLayout } = useLayout()
const { plan } = useSubscription()
const devices = getDevices()
const layout = getLayout()
const turnouts = getTurnouts()

// 🔄 Loading state
const isLoaded = ref(false)
let loadingTimeout: ReturnType<typeof setTimeout> | undefined
onMounted(async () => {
  loadingTimeout = setTimeout(() => { isLoaded.value = true }, 3000)
  try {
    await (turnouts as any).promise
  } finally {
    clearTimeout(loadingTimeout)
    isLoaded.value = true
  }
})
onUnmounted(() => clearTimeout(loadingTimeout))

const isLoading = computed(() => !isLoaded.value)
const isFreePlan = computed(() => plan.value === 'hobbyist')

const turnoutsList = computed(() =>
  turnouts?.value ? (turnouts.value as Turnout[]).map((t) => ({ ...t, id: t.id })) : []
)

const hasItems = computed(() => isLoaded.value && turnoutsList.value.length > 0)

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

const controls = useListControls('cloud-turnouts', {
  list: turnoutsList,
  filters: filters.value,
  sortOptions,
})

function handleEdit(turnout: Turnout) {
  router.push({ name: 'Edit Turnout', params: { turnoutId: turnout.id } })
}

function handleAdd() {
  router.push({ name: 'Add Turnout' })
}
</script>
<template>
  <!-- 🔄 Loading -->
  <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
    <v-skeleton-loader v-for="n in 6" :key="n" type="card" />
  </div>

  <!-- ✅ Has items -->
  <template v-else-if="hasItems">
    <PageHeader title="Turnouts" icon="mdi-call-split" color="amber" subtitle="Configure and control track switches across your layout.">
      <template #actions>
        <v-btn prepend-icon="mdi-plus" color="amber" variant="flat" @click="handleAdd">
          New Turnout
        </v-btn>
      </template>
      <template #controls>
        <ListControlBar
          :controls="controls"
          color="amber"
          :sort-options="sortOptions"
          :filters="filters"
          :show-view="false"
          search-placeholder="Search turnouts..."
        />
      </template>
    </PageHeader>

    <TurnoutsList :filtered-list="controls.filteredList.value" :viewAs="controls.viewAs.value" @edit="handleEdit" />
  </template>

  <!-- 📭 Empty -->
  <EmptyState
    v-else
    icon="mdi-call-split"
    color="amber"
    title="No Turnouts Yet"
    :description="isFreePlan
      ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to add turnouts and manage track switches across your layout.`
      : 'Define your track switches and control them remotely. Map each turnout to its DCC address for seamless operation.'"
    :use-cases="[
      { icon: 'mdi-swap-horizontal', text: 'Yard switching' },
      { icon: 'mdi-source-fork', text: 'Mainline junctions' },
      { icon: 'mdi-warehouse', text: 'Staging areas' },
    ]"
    :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Add Your First Turnout'"
    :action-to="isFreePlan ? '/upgrade' : '/turnouts/new'"
  />
</template>
