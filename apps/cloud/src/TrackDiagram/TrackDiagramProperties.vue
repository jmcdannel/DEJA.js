<script setup lang="ts">
import { computed } from 'vue'
import type { TrackDiagramNode, TrackDiagramEdge } from '@repo/modules'
import { DEFAULT_TRACK_COLORS } from './constants'

const props = defineProps<{
  node?: TrackDiagramNode | null
  edge?: TrackDiagramEdge | null
}>()

const emit = defineEmits<{
  'update:node': [updates: Partial<TrackDiagramNode>]
  'update:edge': [updates: Partial<TrackDiagramEdge>]
}>()

const trackLineOptions = computed(() =>
  Object.keys(DEFAULT_TRACK_COLORS).map((name) => ({ title: name, value: name }))
)
</script>
<template>
  <v-card v-if="node" variant="tonal" color="indigo" class="pa-3">
    <v-card-title class="text-sm">Node Properties</v-card-title>
    <v-text-field
      :model-value="node.label"
      label="Label"
      variant="outlined"
      density="compact"
      @update:model-value="emit('update:node', { label: $event })"
    />
    <v-text-field
      v-if="node.type === 'station'"
      :model-value="node.data.routePointId"
      label="Route Point ID"
      variant="outlined"
      density="compact"
      hint="Maps to Route point1/point2"
      @update:model-value="emit('update:node', { data: { ...node.data, routePointId: $event } })"
    />
    <v-text-field
      v-if="node.type === 'turnout'"
      :model-value="node.data.turnoutId"
      label="Turnout ID"
      variant="outlined"
      density="compact"
      hint="Links to Firestore turnout document"
      @update:model-value="emit('update:node', { data: { ...node.data, turnoutId: $event } })"
    />
    <v-text-field
      v-if="node.type === 'turnout'"
      :model-value="node.rotation"
      label="Rotation (degrees)"
      type="number"
      variant="outlined"
      density="compact"
      @update:model-value="emit('update:node', { rotation: Number($event) })"
    />
  </v-card>

  <v-card v-else-if="edge" variant="tonal" color="indigo" class="pa-3">
    <v-card-title class="text-sm">Edge Properties</v-card-title>
    <v-select
      :model-value="edge.data.trackLine"
      :items="trackLineOptions"
      label="Track Line"
      variant="outlined"
      density="compact"
      @update:model-value="emit('update:edge', { data: { ...edge.data, trackLine: $event } })"
    />
    <v-text-field
      :model-value="edge.data.strokeWidth"
      label="Stroke Width"
      type="number"
      variant="outlined"
      density="compact"
      @update:model-value="emit('update:edge', { data: { ...edge.data, strokeWidth: Number($event) } })"
    />
  </v-card>

  <v-card v-else variant="outlined" class="pa-3 text-center text-gray-500">
    <p class="text-sm">Select a node or edge to edit its properties.</p>
  </v-card>
</template>
