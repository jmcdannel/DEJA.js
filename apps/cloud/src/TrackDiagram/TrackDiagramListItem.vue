<script setup lang="ts">
import { computed, ref } from 'vue'
import { trackDiagramType, type TrackDiagram } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'

const { deleteTrackDiagram } = useTrackDiagrams()

const props = defineProps<{ diagram: TrackDiagram }>()
defineEmits(['edit'])

const confirmDelete = ref(false)
const color = computed(() => trackDiagramType.color)

async function handleDelete() {
  if (!props.diagram.id) return
  await deleteTrackDiagram(props.diagram.id)
  confirmDelete.value = false
}
</script>
<template>
  <v-card class="mx-auto w-full h-full flex flex-col justify-between" :color="color" variant="tonal" density="compact">
    <template #title>
      <span class="text-md">{{ diagram.name }}</span>
    </template>
    <template #prepend>
      <v-icon :icon="trackDiagramType.icon" class="text-2xl m-3" />
    </template>
    <v-card-text class="min-h-8 flex py-2">
      <v-chip v-if="diagram.nodes?.length" size="small" class="mr-2">{{ diagram.nodes.length }} nodes</v-chip>
      <v-chip v-if="diagram.edges?.length" size="small">{{ diagram.edges.length }} edges</v-chip>
    </v-card-text>
    <v-spacer />
    <v-card-actions>
      <v-btn v-if="!confirmDelete" icon="mdi-delete" variant="tonal" size="small" @click="confirmDelete = true" />
      <template v-else>
        <v-btn text="Cancel" variant="outlined" size="small" @click="confirmDelete = false" />
        <v-btn text="Confirm" variant="tonal" size="small" prepend-icon="mdi-delete" @click="handleDelete" />
      </template>
      <v-spacer />
      <v-btn text="Edit" variant="tonal" prepend-icon="mdi-pencil" size="small" @click="$emit('edit', diagram)" />
    </v-card-actions>
  </v-card>
</template>
