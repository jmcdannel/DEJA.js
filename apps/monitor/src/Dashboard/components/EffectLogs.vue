<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DocumentData } from 'firebase/firestore'

const props = defineProps<{
  logs: DocumentData[]
}>()

const TIMEOUT = 30000
const efxThrownCount = ref(0)

watch(() => props.logs, () => {
  if (props.logs.length > 0) {
    setTimeout(() => {
      efxThrownCount.value++
    }, TIMEOUT)
  }
}, { deep: true })
</script>

<template>
  <v-card color="light-blue-darken-3"class="flex flex-col overflow-hidden ">
    <v-card-title>Effect Logs</v-card-title>
    <v-card-text class="flex flex-1 flex-col-reverse gap-4 overflow-hidden">
      <div class="h-full overflow-y-auto scrollbar-thin">
        <v-alert 
          v-for="log in logs" 
          :key="log.id" 
          :color="log?.color || 'info'" 
          variant="tonal"
        >
          <div class="flex items-center gap-x-8">
            <v-icon 
              :color="log.state ? 'green' : 'red'" 
              :icon="log.state ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'" 
              size="64" 
            />
            <span class="font-semibold text-xm">{{ log.name }}</span>
            <!-- <span class="text-sm">{{ log.state ? 'On' : 'Off' }}</span> -->
            <v-spacer></v-spacer>
            <v-chip>{{ log.device }}</v-chip>
          </div>
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>