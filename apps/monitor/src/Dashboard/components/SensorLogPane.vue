<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DocumentData } from 'firebase/firestore'
import { useAutoScroll } from '../../composables/useAutoScroll'

const props = defineProps<{
  logs: DocumentData[]
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const localLogs = ref<DocumentData[]>([])

watch(() => props.logs, (newLogs) => {
  localLogs.value = [...newLogs]
}, { deep: true, immediate: true })

useAutoScroll(scrollContainer, localLogs)

const messageCount = computed(() => localLogs.value.length)

function clear() {
  localLogs.value = []
}

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

defineExpose({ messageCount, clear })
</script>

<template>
  <div ref="scrollContainer" class="flex-1 overflow-y-auto px-1 py-1">
    <div v-if="localLogs.length === 0" class="monitor-pane__empty">
      Waiting for sensor events...
    </div>
    <div v-else class="flex flex-col gap-0.5">
      <div
        v-for="log in localLogs"
        :key="log.id"
        class="monitor-pane__log-entry"
      >
        <span class="monitor-pane__log-timestamp">
          {{ new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
        </span>
        <span class="monitor-pane__log-message">
          <v-icon
            :icon="getSensorIcon(log.inputType || log.type)"
            size="16"
            :color="log.state ? 'purple' : 'grey'"
            class="mr-1"
          />
          <span class="font-semibold">{{ log.name || log.id }}</span>
          <span class="text-slate-500 ml-1 text-xs">{{ log.type || 'digital' }}</span>
          <v-icon
            :icon="log.state ? 'mdi-circle' : 'mdi-circle-outline'"
            size="10"
            :color="log.state ? 'green' : 'red'"
            class="ml-2"
          />
        </span>
        <span v-if="log.device" class="monitor-pane__log-tag bg-purple-500/15 text-purple-400">
          {{ log.device }}
        </span>
      </div>
    </div>
  </div>
</template>
