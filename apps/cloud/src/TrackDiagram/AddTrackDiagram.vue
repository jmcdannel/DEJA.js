<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { trackDiagramType, DEFAULT_VIEWBOX, type TrackDiagram } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import { slugify } from '@repo/utils/slugify'
import { ref } from 'vue'

const router = useRouter()
const layoutId = useStorage<string | null>('@DEJA/layoutId', null)
const { setTrackDiagram } = useTrackDiagrams()
const name = ref('')
const loading = ref(false)

async function handleCreate() {
  if (!name.value || !layoutId.value) return
  loading.value = true
  const id = slugify(name.value)
  const diagram: Omit<TrackDiagram, 'id'> = {
    name: name.value,
    layoutId: layoutId.value,
    nodes: [],
    edges: [],
    viewBox: DEFAULT_VIEWBOX,
  }
  const success = await setTrackDiagram(id, diagram)
  loading.value = false
  if (success) {
    router.push({ name: 'Edit Track Diagram', params: { diagramId: id } })
  }
}
</script>
<template>
  <ModuleTitle menu="Track Diagrams" />
  <v-container>
    <v-card max-width="600" class="mx-auto" variant="tonal" color="indigo">
      <v-card-title>
        <v-icon :icon="trackDiagramType.icon" class="mr-2" />
        New Track Diagram
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="name" label="Diagram Name" variant="outlined" autofocus />
      </v-card-text>
      <v-card-actions>
        <v-btn text="Cancel" variant="outlined" @click="router.push({ name: 'Track Diagrams' })" />
        <v-spacer />
        <v-btn text="Create & Edit" color="indigo" :loading="loading" :disabled="!name" @click="handleCreate" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>
