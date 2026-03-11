<script setup lang="ts">
import { ref, watch } from 'vue'
import { useConnectionStatus } from '@/composables/useConnectionStatus'
import { useCommandQueue } from '@/composables/useCommandQueue'

const { isOnline, isBrowserOnline, isFirebaseConnected } = useConnectionStatus()
const { queue } = useCommandQueue()

const showReconnected = ref(false)
let wasDisconnected = false

watch(isOnline, (online) => {
  if (!online) {
    wasDisconnected = true
    showReconnected.value = false
  } else if (wasDisconnected) {
    wasDisconnected = false
    showReconnected.value = true
    setTimeout(() => {
      showReconnected.value = false
    }, 4000)
  }
})
</script>

<template>
  <!-- Offline banner — persistent while disconnected -->
  <v-snackbar
    :model-value="!isOnline"
    :timeout="-1"
    color="error"
    location="bottom center"
    class="connection-banner"
  >
    <div class="d-flex align-center">
      <v-icon start>mdi-wifi-off</v-icon>
      <div>
        <div class="font-weight-medium">Connection Lost</div>
        <div class="text-caption">
          <template v-if="!isBrowserOnline">
            Your device is offline.
          </template>
          <template v-else-if="!isFirebaseConnected">
            Unable to reach the server.
          </template>
          Commands will be sent when reconnected.
          <template v-if="queue.length > 0">
            ({{ queue.length }} queued)
          </template>
        </div>
      </div>
    </div>
  </v-snackbar>

  <!-- Reconnected banner — auto-dismisses -->
  <v-snackbar
    v-model="showReconnected"
    :timeout="4000"
    color="success"
    location="bottom center"
    class="connection-banner"
  >
    <div class="d-flex align-center">
      <v-icon start>mdi-wifi-check</v-icon>
      <span>Connection restored</span>
    </div>
  </v-snackbar>
</template>

<style scoped>
.connection-banner {
  z-index: 9999;
}
</style>
