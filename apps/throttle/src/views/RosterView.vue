<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos, ROADNAMES, type Loco } from '@repo/modules/locos'
import { LocoRoster, PageHeader, ListControlBar, useListControls } from '@repo/ui'
import RosterQuickAdd from '@/roster/RosterQuickAdd.vue'
import type { ListFilter } from '@repo/ui'

const router = useRouter()
const { getLocos } = useLocos()
const locos = getLocos()

const locosList = computed(() =>
  locos.value ? (locos.value as Loco[]).map((l) => ({
    ...l,
    id: String(l.address),
    roadname: l.meta?.roadname || '',
  })) : []
)

// 🔍 Filter & sort
const roadnameOptions = ROADNAMES.map((r) => ({ label: r.label, value: r.value }))

const filters = computed<ListFilter[]>(() => [
  { type: 'roadname', label: 'Road', options: roadnameOptions },
])

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'address', label: 'Address' },
]

const viewOptions = [
  { value: 'cab', icon: 'mdi-train', label: 'Cab' },
  { value: 'avatar', icon: 'mdi-circle-outline', label: 'Avatar' },
  { value: 'plate', icon: 'mdi-card-text-outline', label: 'Plate' },
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Card' },
  { value: 'table', icon: 'mdi-table', label: 'Table' },
  { value: 'raw', icon: 'mdi-code-json', label: 'Raw' },
]

const rosterControls = useListControls('throttle-roster', {
  list: locosList,
  filters: filters.value,
  sortOptions,
  viewOptions,
  defaultView: 'avatar',
})

function handleLocoSelect(loco: Loco) {
  if (loco.address) {
    router.push({ name: 'throttle', params: { address: loco.address } })
  }
}
</script>

<template>
  <main class="@container min-h-screen overflow-auto">
    <PageHeader title="Roster" icon="mdi-train" color="pink">
      <template #controls>
        <ListControlBar
          :controls="rosterControls"
          color="pink"
          :sort-options="sortOptions"
          :filters="filters"
          :show-view="true"
          :view-options="viewOptions"
          :show-search="false"
        />
      </template>
    </PageHeader>

    <RosterQuickAdd class="mx-4 mt-4" />

    <LocoRoster
      :locos="rosterControls.filteredList.value"
      default-view="avatar"
      module-name="throttle-roster"
      @select="handleLocoSelect"
    />
  </main>
</template>
