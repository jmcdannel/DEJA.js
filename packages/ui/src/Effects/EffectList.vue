<script setup lang="ts">
import { computed } from 'vue'
import { efxTypes, useEfx, type Effect } from '@repo/modules/effects'
import { useLayout, type Tag } from '@repo/modules'
import List from '../ModuleList/List.vue'
import PageHeader from '../PageHeader/PageHeader.vue'
import ListControlBar from '../ListControls/ListControlBar.vue'
import { useListControls } from '../composables/useListControls'
import type { ListFilter } from '../ListControls/types'

const { getEffects, runEffect } = useEfx()
const { getDevices, getLayout } = useLayout()
const devices = getDevices()
const layout = getLayout()
const effects = getEffects()

const effectsList = computed(() =>
  effects?.value
    ? effects.value.map((effect) => ({
        ...effect,
        id: effect.id,
        icon: efxTypes.find((type) => type.value === effect.type)?.icon || 'mdi-help',
      }))
    : []
)

const deviceOptions = computed(() =>
  devices?.value ? devices.value.map((d) => ({ label: d.id, value: d.id })) : []
)
const tagOptions = computed(() =>
  layout?.value?.tags
    ? layout.value.tags.map((tag: Tag) => ({ label: tag.name, value: tag.id }))
    : []
)
const typeOptions = [...new Set(efxTypes.map((type) => ({ label: type.label, value: type.value })))]

const filters = computed<ListFilter[]>(() => [
  { type: 'device', label: 'Device', options: deviceOptions.value },
  { type: 'type', label: 'Type', options: typeOptions },
  { type: 'tags', label: 'Tags', options: tagOptions.value },
])

const viewOptions = [
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Grid' },
  { value: 'switch', icon: 'mdi-toggle-switch-outline', label: 'Switch' },
  { value: 'table', icon: 'mdi-table', label: 'Table' },
]

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'device', label: 'Device' },
  { value: 'type', label: 'Type' },
]

// NOTE: filters.value passes the initial snapshot. This is intentional —
// useListControls doesn't use options.filters for runtime filtering logic.
// The ListControlBar receives `filters` as a separate reactive prop.
const controls = useListControls('effects', {
  list: effectsList,
  filters: filters.value,
  viewOptions,
  sortOptions,
})

async function handleEffect(effect: Effect, newState: boolean) {
  await runEffect({ ...effect, state: newState })
}
</script>

<template>
  <PageHeader title="Effects" icon="mdi-rocket-launch" color="indigo">
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="indigo"
        :view-options="viewOptions"
        :sort-options="sortOptions"
        :filters="filters"
        search-placeholder="Search effects..."
      />
    </template>
  </PageHeader>
  <List
    :list="controls.filteredList.value"
    :view-as="controls.viewAs.value"
    empty-icon="mdi-auto-fix"
    empty-title="No effects"
    empty-description="Create effects to control lights and sounds"
    @update:state="handleEffect"
  />
</template>
