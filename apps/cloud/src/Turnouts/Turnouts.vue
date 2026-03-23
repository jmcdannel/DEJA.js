<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTurnouts, type Turnout } from '@repo/modules'
import { useLayout, type Tag } from '@repo/modules'
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'

const router = useRouter()
const { getTurnouts } = useTurnouts()
const { getDevices, getLayout } = useLayout()
const devices = getDevices()
const layout = getLayout()
const turnouts = getTurnouts()

const turnoutsList = computed(() =>
  turnouts?.value ? turnouts.value.map((t) => ({ ...t, id: t.id })) : []
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

function handleAdd() {
  router.push({ name: 'Add Turnout' })
}
</script>
<template>
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
