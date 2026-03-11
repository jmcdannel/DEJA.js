<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DocumentData } from 'firebase/firestore'
import { vAutoAnimate } from '@formkit/auto-animate/vue'

const props = defineProps<{
  logs: DocumentData[]
}>()

const TIMEOUT = 30000

watch(() => props.logs, () => {
  if (props.logs.length > 0) {
    setTimeout(() => {
      props.logs.shift()
    }, TIMEOUT)
  }
}, { deep: true })

function getSensorIcon(type?: string): string {
  switch (type) {
    case 'ir': return 'mdi-remote'
    case 'current': return 'mdi-flash'
    case 'reed': return 'mdi-magnet'
    case 'optical': return 'mdi-eye'
    case 'pressure': return 'mdi-gauge'
    case 'analog': return 'mdi-sine-wave'
    case 'dcc-ex': return 'mdi-cpu-64-bit'
    default: return 'mdi-access-point'
  }
}
</script>

<template>
  <v-card color="teal-darken-3" class="min-h-[420px]">
    <v-card-title class="flex items-center gap-2">
      <v-icon>mdi-access-point</v-icon>
      Sensor Logs
    </v-card-title>
    <v-card-text v-auto-animate class="flex flex-col-reverse gap-4">
      <v-alert
        v-for="log in logs"
        :key="log.id"
        :color="log.state ? 'teal' : 'grey'"
        type="info"
        variant="tonal"
      >
        <div class="flex items-center gap-x-4">
          <v-icon
            :color="log.state ? 'green' : 'red'"
            :icon="getSensorIcon(log.inputType || log.type)"
            size="48"
          />
          <div class="flex flex-col">
            <span class="font-semibold text-2xl">{{ log.name || log.id }}</span>
            <span class="text-xs opacity-70">{{ log.type || 'digital' }} {{ log.inputType ? `/ ${log.inputType}` : '' }}</span>
          </div>
          <v-spacer />
          <v-chip :color="log.state ? 'green' : 'red'" size="small">
            {{ log.state ? 'Active' : 'Inactive' }}
          </v-chip>
          <v-chip v-if="log.blockId" size="small" color="orange">
            {{ log.blockId }}
          </v-chip>
          <v-chip v-if="log.analogValue !== undefined" size="small">
            {{ log.analogValue }}
          </v-chip>
          <v-chip v-if="log.device">{{ log.device }}</v-chip>
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>
