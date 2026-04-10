<script setup lang="ts">
import type { TrackDiagram } from '@repo/modules'
import { useRouter } from 'vue-router'
import ListPage from '@/Core/UI/ListPage.vue'
import TrackDiagramList from '@/TrackDiagram/TrackDiagramList.vue'

const router = useRouter()

function handleEdit(diagram: TrackDiagram) {
  router.push({ name: 'Edit Track Diagram', params: { diagramId: diagram.id } })
}
</script>

<template>
  <ListPage
    title="Track Diagrams"
    icon="mdi-map-marker-path"
    color="violet"
    :add-to="{ name: 'Add Track Diagram' }"
    add-label="New Track Diagram"
  >
    <TrackDiagramList @edit="handleEdit" />
  </ListPage>
</template>
