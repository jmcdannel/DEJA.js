<script setup lang="ts">
import { computed } from 'vue'
import { useLocos, type Loco } from '@repo/modules/locos'
import List from '../ModuleList/List.vue'
import PageHeader from '../PageHeader/PageHeader.vue'
import ListControlBar from '../ListControls/ListControlBar.vue'
import { useListControls } from '../composables/useListControls'
import type { ListFilter } from '../ListControls/types'
import LocoAvatar from '../LocoAvatar.vue'

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

const controls = useListControls('roster', {
  list: locosList,
  filters: filters.value,
  viewOptions,
  sortOptions,
  defaultView: 'avatar',
})

function getLocoFromItem(item: Record<string, unknown>): Loco {
  const loco = locos.value?.find((l) => l.id === item.id)
  return (loco || item) as Loco
}
</script>

<template>
  <PageHeader title="Roster" icon="mdi-train" color="pink">
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="pink"
        :view-options="viewOptions"
        :sort-options="sortOptions"
        :filters="filters"
        search-placeholder="Search roster..."
      />
    </template>
  </PageHeader>
  <List
    :list="controls.filteredList.value"
    :view-as="controls.viewAs.value"
    empty-icon="mdi-train"
    empty-title="No locomotives"
    empty-description="Add locomotives to your roster to get started"
  >
    <template #item="{ item }">
      <LocoAvatar :loco="getLocoFromItem(item)" :size="48" />
    </template>
  </List>
</template>
