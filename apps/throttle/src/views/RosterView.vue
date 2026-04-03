<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos, type Loco } from '@repo/modules/locos'
import List from '@repo/ui/src/ModuleList/List.vue'
import ListControlBar from '@repo/ui/src/ListControls/ListControlBar.vue'
import { useListControls } from '@repo/ui/src/composables/useListControls'
import { LocoAvatar, LocoFront } from '@repo/ui'
import type { ListFilter } from '@repo/ui/src/ListControls/types'

const router = useRouter()
const { getLocos } = useLocos()
const locos = getLocos()

const locosList = computed(() =>
  locos.value
    ? locos.value.map((loco) => ({
        ...loco,
        icon: 'mdi-train',
        hasSound: String(loco.hasSound ?? false),
      }))
    : []
)

const filters = computed<ListFilter[]>(() => [
  {
    type: 'hasSound',
    label: 'Sound',
    options: [
      { label: 'Sound', value: 'true' },
      { label: 'No Sound', value: 'false' },
    ],
  },
])

const viewOptions = [
  { value: 'cab', icon: 'mdi-train', label: 'Cab' },
  { value: 'avatar', icon: 'mdi-account-circle-outline', label: 'Avatar' },
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Card' },
  { value: 'table', icon: 'mdi-table', label: 'Table' },
  { value: 'raw', icon: 'mdi-code-json', label: 'Raw' },
]

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'address', label: 'Address' },
]

const controls = useListControls('locos', {
  list: locosList,
  filters: filters.value,
  viewOptions,
  sortOptions,
  defaultView: 'cab',
})

function getLocoFromItem(item: Record<string, unknown>): Loco {
  const loco = locos.value?.find((l) => l.id === item.id)
  return (loco || item) as Loco
}

function handleLocoClick(item: Record<string, unknown>) {
  const loco = getLocoFromItem(item)
  if (loco.address) {
    router.push({ name: 'throttle', params: { address: loco.address } })
  }
}
</script>

<template>
  <main class="@container min-h-screen overflow-auto p-2 md:p-4">
    <ListControlBar
      :controls="controls"
      color="purple-darken-4"
      :view-options="viewOptions"
      :sort-options="sortOptions"
      :filters="filters"
      search-placeholder="Search roster..."
    />
    <List
      :list="controls.filteredList.value"
      :view-as="controls.viewAs.value"
      empty-icon="mdi-train"
      empty-title="No locomotives"
      empty-description="Add locomotives to your roster to get started"
    >
      <template #item="{ item }">
        <div class="cursor-pointer" @click="handleLocoClick(item)">
          <template v-for="loco in [getLocoFromItem(item)]" :key="loco.id">
            <LocoFront
              v-if="controls.viewAs.value === 'cab'"
              :roadname="loco.meta?.roadname"
              :road-number="loco.address"
              :size="200"
            />
            <LocoAvatar v-else :loco="loco" :size="48" />
          </template>
        </div>
      </template>
    </List>
  </main>
</template>
