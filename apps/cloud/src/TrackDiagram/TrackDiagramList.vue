<script async setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useCollection } from 'vuefire'
import type { TrackDiagram } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'
import TrackDiagramListItem from '@/TrackDiagram/TrackDiagramListItem.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const emit = defineEmits(['edit'])
const { trackDiagramsCol } = useTrackDiagrams()
const list = useCollection<TrackDiagram>(trackDiagramsCol, { ssrKey: 'trackDiagrams' })

function handleEdit(item: TrackDiagram) {
  emit('edit', item)
}
</script>
<template>
  <v-container v-if="list?.length">
    <v-row v-auto-animate>
      <v-col v-if="$slots.prepend" cols="12"><slot name="prepend" /></v-col>
      <v-col
        v-for="item in list"
        :key="item.id"
        cols="12" sm="6" lg="4"
      >
        <TrackDiagramListItem :diagram="item" @edit="handleEdit" />
      </v-col>
    </v-row>
  </v-container>
  <EmptyState
    v-if="!list?.length"
    icon="mdi-map-marker-path"
    color="indigo"
    title="No Track Diagrams"
    description="Create visual track diagrams for your layout. Draw tracks, turnouts, and route endpoints that power interactive route maps."
    :use-cases="[
      { icon: 'mdi-pencil-ruler', text: 'Visual layout editor' },
      { icon: 'mdi-map', text: 'Interactive route maps' },
      { icon: 'mdi-robot', text: 'AI image import' },
    ]"
    action-label="Create Diagram"
    action-to="/track-diagrams/new"
  />
</template>
