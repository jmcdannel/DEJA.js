<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DocumentData } from 'firebase/firestore'

const props = defineProps<{
  logs: DocumentData[]
}>()

const TIMEOUT = 30000
const turnoutsThrownCount = ref(0)

watch(() => props.logs, () => {
  if (props.logs.length > 0) {
    setTimeout(() => {
      turnoutsThrownCount.value++
    }, TIMEOUT)
  }
}, { deep: true })
</script>

<template>
  <v-card color="blue-darken-3" class="h-full min-h-0 overflow-auto">
    <v-card-title>Turnout Logs</v-card-title>
    <v-card-text class="flex flex-col-reverse gap-4">
      <v-alert 
        v-for="log in logs" 
        :key="log.id" 
        :color="log?.color || 'info'" 
        type="info" 
        variant="tonal"
      >
        <div class="flex items-center gap-x-8">
          <v-icon 
            :icon="log.state ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'" 
            size="64" 
          />
          <span class="font-semibold text-3xl">{{ log.name }}</span>
          <span class="text-sm">{{ log.state ? 'Thrown' : 'Closed' }}</span>
          <v-spacer></v-spacer>
          <v-chip>{{ log.device }}</v-chip>
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>