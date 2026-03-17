<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DocumentData } from 'firebase/firestore'
import { useAutoScroll } from '../../composables/useAutoScroll'

const props = defineProps<{
  logs: DocumentData[]
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const localLogs = ref<DocumentData[]>([])

// Mirror props into local state so clear works
import { watch } from 'vue'
watch(() => props.logs, (newLogs) => {
  localLogs.value = [...newLogs]
}, { deep: true, immediate: true })

useAutoScroll(scrollContainer, localLogs)

const messageCount = computed(() => localLogs.value.length)

function clear() {
  localLogs.value = []
}

defineExpose({ messageCount, clear })
</script>

<template>
  <div ref="scrollContainer" class="flex-1 overflow-y-auto px-1 py-1">
    <div v-if="localLogs.length === 0" class="monitor-pane__empty">
      Waiting for turnout changes...
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
            :icon="log.state ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'"
            size="16"
            :color="log.state ? 'green' : 'grey'"
            class="mr-1"
          />
          <span class="font-semibold">{{ log.name }}</span>
          <span class="text-slate-500 ml-2">{{ log.state ? 'Thrown' : 'Closed' }}</span>
        </span>
        <span v-if="log.device" class="monitor-pane__log-tag bg-green-500/15 text-green-400">
          {{ log.device }}
        </span>
      </div>
    </div>
  </div>
</template>
