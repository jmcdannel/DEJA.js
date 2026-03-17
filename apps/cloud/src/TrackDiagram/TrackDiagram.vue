<script setup lang="ts">
import type { TrackDiagram } from '@repo/modules'
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import TrackDiagramList from '@/TrackDiagram/TrackDiagramList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEdit(diagram: TrackDiagram) {
  router.push({ name: 'Edit Track Diagram', params: { diagramId: diagram.id } })
}

function handleAdd() {
  router.push({ name: 'Add Track Diagram' })
}
</script>
<template>
  <ModuleTitle menu="Track Diagrams" />
  <TrackDiagramList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="indigo" />
    </template>
  </TrackDiagramList>
</template>
