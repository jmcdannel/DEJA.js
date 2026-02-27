<script setup lang="ts">
import { computed } from 'vue'
import { useLocos, type Loco } from '@repo/modules/locos'
import List from '../ModuleList/List.vue'
import LocoAvatar from '../LocoAvatar.vue'
import { type ListFilter } from '../ModuleList/types'

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

function getLocoFromItem(item: Record<string, unknown>): Loco {
  const loco = locos.value?.find((l) => l.id === item.id)
  return (loco || item) as Loco
}
</script>

<template>
  <List
    module-name="locos"
    color="purple-darken-4"
    title="Loco Roster"
    icon="mdi-train"
    :list="locosList"
    :filters="filters"
    :view-options="[
      { label: 'Avatar', value: 'avatar' },
      { label: 'Card', value: 'card' },
      { label: 'Table', value: 'table' },
      { label: 'Raw', value: 'raw' },
    ]"
    :sort-options="[
      { label: 'Default', value: 'order' },
      { label: 'Name', value: 'name' },
      { label: 'Address', value: 'address' },
    ]"
  >
    <template #item="{ item }">
      <LocoAvatar :loco="getLocoFromItem(item)" :size="48" />
    </template>
  </List>
</template>
