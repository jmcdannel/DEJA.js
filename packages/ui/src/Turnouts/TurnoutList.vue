<script setup lang="ts">
import { computed } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules'
import { useLayout, type Tag } from '@repo/modules'
import List from '../ModuleList/List.vue'
import PageHeader from '../PageHeader/PageHeader.vue'
import ListControlBar from '../ListControls/ListControlBar.vue'
import { useListControls } from '../composables/useListControls'
import type { ListFilter } from '../ListControls/types'
import CTCSwitch from './CTCSwitch.vue'

const { getTurnouts, setTurnout } = useTurnouts()
const { getDevices, getLayout } = useLayout()
const devices = getDevices()
const layout = getLayout()
const turnouts = getTurnouts()

const turnoutsList = computed(() =>
  turnouts?.value
    ? turnouts.value.map((turnout) => ({
        ...turnout,
        id: turnout.id,
        icon: 'mdi-call-split',
      }))
    : []
)

const deviceOptions = computed(() =>
  devices?.value ? devices.value.map((device) => ({ label: device.id, value: device.id })) : []
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

const viewOptions = [
  { value: 'ctc-switch', icon: 'mdi-transit-connection-variant', label: 'CTC Switch' },
  { value: 'switch', icon: 'mdi-toggle-switch-outline', label: 'Switch' },
  { value: 'button', icon: 'mdi-gesture-tap-button', label: 'Button' },
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Card' },
  { value: 'table', icon: 'mdi-table', label: 'Table' },
  { value: 'raw', icon: 'mdi-code-json', label: 'Raw' },
]

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'device', label: 'Device' },
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
]

const controls = useListControls('turnouts', {
  list: turnoutsList,
  filters: filters.value,
  viewOptions,
  sortOptions,
  defaultView: 'ctc-switch',
})

async function handleTurnout(turnout: Turnout) {
  await setTurnout(turnout.id, turnout)
}
</script>

<template>
  <PageHeader title="Turnouts" icon="mdi-call-split" color="amber">
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="amber"
        :view-options="viewOptions"
        :sort-options="sortOptions"
        :filters="filters"
        search-placeholder="Search turnouts..."
      />
    </template>
  </PageHeader>
  <List
    :list="controls.filteredList.value"
    :view-as="controls.viewAs.value"
    empty-icon="mdi-swap-horizontal"
    empty-title="No turnouts"
    empty-description="Add turnouts to control track switches"
    @update:state="handleTurnout"
  >
    <template #item="{ item }">
      <CTCSwitch
        :turnout="item as Turnout"
        :turnout-id="item?.id"
        :state="item.state"
        class="w-42 sm:w-64 md:w-84"
      />
    </template>
  </List>
</template>
