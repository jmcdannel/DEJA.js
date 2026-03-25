<script setup lang="ts">
import { computed } from 'vue'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'
import { useLayout, type Tag } from '@repo/modules'
import List from './ModuleList/List.vue'
import PageHeader from './PageHeader/PageHeader.vue'
import ListControlBar from './ListControls/ListControlBar.vue'
import { useListControls } from './composables/useListControls'
import type { ListFilter } from './ListControls/types'

const { getSignals, setSignalAspect } = useSignals()
const { getDevices, getLayout } = useLayout()
const signals = getSignals()
const devices = getDevices()
const layout = getLayout()

const signalsList = computed(() =>
  signals.value
    ? signals.value.map((signal) => ({ ...signal, icon: 'mdi-traffic-light' }))
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
  { value: 'signal', icon: 'mdi-traffic-light', label: 'Signal' },
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Card' },
  { value: 'table', icon: 'mdi-table', label: 'Table' },
  { value: 'raw', icon: 'mdi-code-json', label: 'Raw' },
]

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'device', label: 'Device' },
]

const controls = useListControls('signals', {
  list: signalsList,
  filters: filters.value,
  viewOptions,
  sortOptions,
  defaultView: 'signal',
})

function canToggle(signal: Signal, aspect: Exclude<SignalAspect, null>): boolean {
  const pinMap: Record<Exclude<SignalAspect, null>, number | undefined> = {
    red: signal.red,
    yellow: signal.yellow,
    green: signal.green,
  }
  return typeof pinMap[aspect] === 'number'
}

async function toggleAspect(signal: Signal, aspect: Exclude<SignalAspect, null>) {
  if (!canToggle(signal, aspect)) return
  const nextAspect: SignalAspect = signal.aspect === aspect ? null : aspect
  await setSignalAspect(signal.id, nextAspect)
}
</script>

<template>
  <PageHeader title="Signals" icon="mdi-traffic-light" color="emerald">
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="emerald"
        :view-options="viewOptions"
        :sort-options="sortOptions"
        :filters="filters"
        search-placeholder="Search signals..."
      />
    </template>
  </PageHeader>
  <List
    :list="controls.filteredList.value"
    :view-as="controls.viewAs.value"
    empty-icon="mdi-traffic-light"
    empty-title="No signals"
    empty-description="Add signals to control track indicators"
  >
    <template #item="{ item }">
      <v-card class="p-2 flex flex-col items-center bg-opacity-50" color="cyan" variant="tonal" rounded>
        <v-card-title color="cyan">{{ (item as Signal).name || item.id }}</v-card-title>
        <v-card-text>
          <div class="flex flex-col items-center p-3 rounded-lg bg-neutral-900 border border-neutral-700" style="width: 72px;">
            <v-btn
              icon="mdi-circle"
              size="small"
              :color="(item as Signal).aspect === 'red' ? 'red-darken-1' : 'red'"
              :variant="(item as Signal).aspect === 'red' ? 'flat' : 'tonal'"
              :disabled="!canToggle(item as Signal, 'red')"
              @click="toggleAspect(item as Signal, 'red')"
            />
            <v-btn
              icon="mdi-circle"
              class="my-2"
              size="small"
              :color="(item as Signal).aspect === 'yellow' ? 'amber-darken-2' : 'amber'"
              :variant="(item as Signal).aspect === 'yellow' ? 'flat' : 'tonal'"
              :disabled="!canToggle(item as Signal, 'yellow')"
              @click="toggleAspect(item as Signal, 'yellow')"
            />
            <v-btn
              icon="mdi-circle"
              size="small"
              :color="(item as Signal).aspect === 'green' ? 'green-darken-2' : 'green'"
              :variant="(item as Signal).aspect === 'green' ? 'flat' : 'tonal'"
              :disabled="!canToggle(item as Signal, 'green')"
              @click="toggleAspect(item as Signal, 'green')"
            />
          </div>
        </v-card-text>
      </v-card>
    </template>
  </List>
</template>
