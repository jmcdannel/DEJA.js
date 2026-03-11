<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStorage, useWebSocket } from '@vueuse/core'
import { useDcc } from '@repo/dccex'
import { usePaneManager } from '../../composables/usePaneManager'

const emit = defineEmits<{
  'toggle-drawer': []
  'track-power-toggle': [state: boolean]
  'emergency-stop': []
}>()

const layoutId = useStorage('@DEJA/layoutId', '')
const wshost = useStorage('@DEJA/pref/ws-host', 'localhost:8082')
const paneManager = usePaneManager()

// WebSocket connection status
const { status: wsStatus } = useWebSocket(`ws://${wshost.value}/`, {
  autoReconnect: true,
})

const wsConnected = computed(() => wsStatus.value === 'OPEN')

// Clock
const clock = ref('')
let clockInterval: ReturnType<typeof setInterval>

function updateClock() {
  const now = new Date()
  clock.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  clearInterval(clockInterval)
})

// Track power state
const trackPower = ref(false)

function togglePower() {
  trackPower.value = !trackPower.value
  emit('track-power-toggle', trackPower.value)
}
</script>

<template>
  <div class="monitor-status-bar">
    <div class="monitor-status-bar__left">
      <button
        class="monitor-status-bar__menu-btn"
        aria-label="Toggle menu"
        @click="emit('toggle-drawer')"
      >
        <v-icon icon="mdi-menu" size="18" />
      </button>
      <span class="monitor-status-bar__app-name">DEJA.js Monitor</span>
    </div>

    <div class="monitor-status-bar__center">
      <span :class="['monitor-status-bar__ws-dot', wsConnected ? 'monitor-status-bar__ws-dot--connected' : 'monitor-status-bar__ws-dot--disconnected']" />
      <span class="monitor-status-bar__ws-label">
        {{ wsConnected ? 'WS Connected' : 'WS Disconnected' }}
      </span>
    </div>

    <div class="monitor-status-bar__right">
      <button
        :class="['monitor-status-bar__power-btn', trackPower ? 'monitor-status-bar__power-btn--on' : '']"
        title="Track Power"
        @click="togglePower"
      >
        <v-icon icon="mdi-flash" size="14" />
        <span>{{ trackPower ? 'ON' : 'OFF' }}</span>
      </button>

      <button
        class="monitor-status-bar__estop-btn"
        title="Emergency Stop"
        @click="emit('emergency-stop')"
      >
        <v-icon icon="mdi-octagon" size="14" />
        <span>E-Stop</span>
      </button>

      <span class="monitor-status-bar__info">
        Layout: {{ layoutId || '—' }}
      </span>

      <span class="monitor-status-bar__info">
        {{ paneManager.normalPanes.length + paneManager.minimizedPanes.length + (paneManager.maximizedPane ? 1 : 0) }} panes
      </span>

      <span class="monitor-status-bar__clock">{{ clock }}</span>
    </div>
  </div>
</template>
