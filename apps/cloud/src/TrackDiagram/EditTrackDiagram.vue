<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import type { TrackDiagram } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import TrackDiagramEditor from '@/TrackDiagram/TrackDiagramEditor.vue'

const log = createLogger('EditTrackDiagram')
const route = useRoute()
const router = useRouter()
const { getTrackDiagram } = useTrackDiagrams()
const diagram = ref<TrackDiagram | null>(null)
const loading = ref(true)

async function loadDiagram() {
  loading.value = true
  const diagramId = route.params.diagramId as string
  try {
    const result = await getTrackDiagram(diagramId)
    if (result) {
      diagram.value = result
    }
  } catch (error) {
    log.error('Error loading diagram:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadDiagram)
</script>
<template>
  <ModuleTitle menu="Track Diagrams" />
  <div v-if="loading" class="p-6 flex justify-center">
    <v-progress-circular indeterminate color="indigo" />
  </div>
  <v-alert v-else-if="!diagram" type="error" class="ma-4" text="Diagram not found." closable @click:close="router.push({ name: 'Track Diagrams' })" />
  <TrackDiagramEditor v-else-if="diagram" :diagram="diagram" />
</template>
