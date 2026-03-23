<script setup lang="ts">
import { computed } from 'vue'
import type { Signal } from '@repo/modules/signals'
import { useSignals } from '@repo/modules/signals'
import { useLayout, type Tag } from '@repo/modules'
import { useRouter } from 'vue-router'
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import SignalList from '@/Signals/SignalsList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()
const { getSignals } = useSignals()
const { getDevices, getLayout } = useLayout()
const devices = getDevices()
const layout = getLayout()
const signals = getSignals()

const signalsList = computed(() =>
  signals?.value ? signals.value.map((s) => ({ ...s, id: s.id })) : []
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
  <PageHeader title="Signals" icon="mdi-traffic-light" color="emerald">
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
  <SignalList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="emerald" />
    </template>
  </SignalList>
</template>


