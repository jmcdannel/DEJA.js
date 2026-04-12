<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTurnouts, type Turnout } from '@repo/modules'
import { useLayout, type Tag, useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import ListPage from '@/Core/UI/ListPage.vue'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'
import { EmptyState } from '@repo/ui'

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
</script>
<template>
  <ListPage
    title="Turnouts"
    icon="mdi-call-split"
    color="amber"
    subtitle="Configure and control track switches across your layout."
    :add-to="{ name: 'Add Turnout' }"
    add-label="New Turnout"
    :loading="isLoading"
    :empty="isLoaded && turnoutsList.length === 0"
  >
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

    <TurnoutsList
      :filtered-list="controls.filteredList.value"
      :view-as="controls.viewAs.value"
      @edit="handleEdit"
    />

    <template #empty-state>
      <EmptyState
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
  </ListPage>
</template>
