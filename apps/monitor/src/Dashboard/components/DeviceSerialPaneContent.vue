<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDeviceSerialMonitor } from './DeviceSerialMonitor/useDeviceSerialMonitor'
import { useAutoScroll } from '../../composables/useAutoScroll'

const props = defineProps<{
  deviceId: string
  deviceName?: string
}>()

const { messages, status, isSubscribed, clearMessages } = useDeviceSerialMonitor(props.deviceId)

const scrollContainer = ref<HTMLElement | null>(null)
useAutoScroll(scrollContainer, messages)

const messageCount = computed(() => messages.value.length)

function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString()
  } catch {
    return timestamp
  }
}

defineExpose({
  messageCount,
  clear: clearMessages,
})
</script>

<template>
  <div ref="scrollContainer" class="flex-1 overflow-y-auto px-1 py-1">
    <div v-if="messages.length === 0" class="monitor-pane__empty">
      <span v-if="status === 'OPEN' && isSubscribed">Listening for serial data...</span>
      <span v-else-if="status === 'CONNECTING'">Connecting...</span>
      <span v-else>Waiting for device connection...</span>
    </div>
    <div v-else class="flex flex-col">
      <div v-for="msg in messages" :key="msg.id" class="monitor-pane__log-entry">
        <span class="monitor-pane__log-timestamp">{{ formatTime(msg.timestamp) }}</span>
        <span class="monitor-pane__log-message">
          <v-icon
            :icon="msg.direction === 'incoming' ? 'mdi-arrow-down' : 'mdi-arrow-up'"
            size="10"
            :class="msg.direction === 'incoming' ? 'text-blue-400' : 'text-green-400'"
            class="mr-1"
          />
          {{ msg.data }}
        </span>
      </div>
    </div>
  </div>
</template>
