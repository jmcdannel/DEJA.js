<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Route } from '@repo/modules'
import { useRoutes } from '@repo/modules/routes/useRoutes'
import { useLayout, type Tag, useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { useRouter } from 'vue-router'
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import RoutesList from '@/Routes/RoutesList.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const router = useRouter()
const { getRoutes } = useRoutes()
const { getLayout } = useLayout()
const { plan } = useSubscription()
const layout = getLayout()
const routes = getRoutes()

// 🔄 Loading state
const isLoaded = ref(false)
let loadingTimeout: ReturnType<typeof setTimeout> | undefined
onMounted(async () => {
  loadingTimeout = setTimeout(() => { isLoaded.value = true }, 3000)
  try {
    await (routes as any).promise
  } finally {
    clearTimeout(loadingTimeout)
    isLoaded.value = true
  }
})
onUnmounted(() => clearTimeout(loadingTimeout))

const isLoading = computed(() => !isLoaded.value)
const isFreePlan = computed(() => plan.value === 'hobbyist')

const routesList = computed(() =>
  routes?.value ? routes.value.map((r) => ({ ...r, id: r.id })) : []
)

const hasItems = computed(() => isLoaded.value && routesList.value.length > 0)

const tagOptions = computed(() =>
  layout?.value?.tags
    ? layout.value.tags.map((tag: Tag) => ({ label: tag.name, value: tag.id }))
    : []
)

const filters = computed<ListFilter[]>(() => [
  ...(tagOptions.value.length ? [{ type: 'tags', label: 'Tags', options: tagOptions.value }] : []),
])

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
]

const controls = useListControls('cloud-routes', {
  list: routesList,
  filters: filters.value,
  sortOptions,
})

function handleEdit(route: Route) {
  router.push({ name: 'Edit Route', params: { routeId: route.id } })
}

function handleAdd() {
  router.push({ name: 'Add Route' })
}
</script>
<template>
  <!-- 🔄 Loading -->
  <div v-if="isLoading" class="grid grid-cols-1 gap-3 p-4">
    <v-skeleton-loader v-for="n in 4" :key="n" type="card" />
  </div>

  <!-- ✅ Has items -->
  <template v-else-if="hasItems">
    <PageHeader title="Routes" icon="mdi-map" color="purple" subtitle="Automated multi-turnout paths for your layout.">
      <template #actions>
        <v-btn prepend-icon="mdi-plus" color="purple" variant="flat" @click="handleAdd">
          New Route
        </v-btn>
      </template>
      <template #controls>
        <ListControlBar
          :controls="controls"
          color="purple"
          :sort-options="sortOptions"
          :filters="filters"
          :show-view="false"
          search-placeholder="Search routes..."
        />
      </template>
    </PageHeader>

    <RoutesList :filtered-list="controls.filteredList.value" @edit="handleEdit" />
  </template>

  <!-- 📭 Empty -->
  <EmptyState
    v-else
    icon="mdi-map"
    color="purple"
    title="No Routes Yet"
    :description="isFreePlan
      ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to create automated routes that throw multiple turnouts in sequence.`
      : 'Create automated paths that throw multiple turnouts in sequence, making complex track arrangements a single-click operation.'"
    :use-cases="[
      { icon: 'mdi-arrow-decision', text: 'Yard entry paths' },
      { icon: 'mdi-highway', text: 'Mainline bypass' },
      { icon: 'mdi-format-list-group', text: 'Multi-turnout sequences' },
    ]"
    :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Create Your First Route'"
    :action-to="isFreePlan ? '/upgrade' : '/routes/new'"
  />
</template>
