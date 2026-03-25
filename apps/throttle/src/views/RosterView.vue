<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos, type Loco } from '@repo/modules/locos'
import List from '@repo/ui/src/ModuleList/List.vue'
import { LocoAvatar } from '@repo/ui'
import type { ListFilter } from '@repo/ui/src/ModuleList/types'

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
    <List
      module-name="locos"
      color="purple-darken-4"
      title="Loco Roster"
      icon="mdi-train"
      :list="locosList"
      :filters="filters"
      empty-icon="mdi-train"
      empty-title="No locomotives"
      empty-description="Add locomotives to your roster to get started"
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
        <div class="cursor-pointer" @click="handleLocoClick(item)">
          <LocoAvatar :loco="getLocoFromItem(item)" :size="48" />
        </div>
      </template>
    </List>
  </main>
</template>
