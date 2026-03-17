<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage, useWebSocket } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { useLayout, useServerStatus } from '@repo/modules'
import { Logo, SelectLayout, UserProfile } from '@repo/ui'
import { usePaneManager } from '../../composables/usePaneManager'
import { useWsConnection } from '../../composables/useWsConnection'

const emit = defineEmits<{
  'toggle-drawer': []
  'track-power-toggle': [state: boolean]
  'emergency-stop': []
}>()

const router = useRouter()
const route = useRoute()
const layoutId = useStorage('@DEJA/layoutId', '')
const paneManager = usePaneManager()
const { getLayouts } = useLayout()
const layouts = getLayouts()
const { serverStatus } = useServerStatus()
const { wsUrl } = useWsConnection()

// Layout selection dialog
const layoutDialogOpen = ref(false)

function handleLayoutSelect() {
  layoutDialogOpen.value = false
  window.location.reload()
}

const currentLayoutName = computed(() => {
  const layout = layouts?.value?.find(l => l.id === layoutId.value)
  return layout?.name || layoutId.value || '—'
})

// WebSocket connection status
const { status: wsStatus } = useWebSocket(wsUrl, {
  autoReconnect: {
    delay: 2000,
    retries: 10,
  },
})

const wsConnected = computed(() => wsStatus.value === 'OPEN')

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
      <Logo size="xs" app-title="Monitor" variant="monitor" @click="router.push({ path: '/' })" class="cursor-pointer" />
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

      <span class="monitor-status-bar__divider" />

      <v-chip
        size="x-small"
        variant="tonal"
        prepend-icon="mdi-home"
        class="cursor-pointer"
        @click="layoutDialogOpen = true"
      >
        {{ currentLayoutName }}
      </v-chip>

      <span :class="['monitor-status-bar__ws-dot', wsConnected ? 'monitor-status-bar__ws-dot--connected' : 'monitor-status-bar__ws-dot--disconnected']" />
      <span class="monitor-status-bar__ws-label">
        {{ wsConnected ? 'WS' : 'WS' }}
      </span>

      <span :class="['monitor-status-bar__ws-dot', serverStatus?.online ? 'monitor-status-bar__ws-dot--connected' : 'monitor-status-bar__ws-dot--disconnected']" />
      <span class="monitor-status-bar__ws-label">
        {{ serverStatus?.online ? 'Server' : 'Server' }}
      </span>

      <span class="monitor-status-bar__info">
        {{ paneManager.normalPanes.length + paneManager.minimizedPanes.length + (paneManager.maximizedPane ? 1 : 0) }} panes
      </span>

      <span class="monitor-status-bar__divider" />

      <v-btn icon variant="text" size="x-small" @click="router.push({ name: 'home' })" title="Dashboard" :color="route.name === 'home' ? 'primary' : undefined">
        <v-icon size="16">mdi-monitor-dashboard</v-icon>
      </v-btn>
      <v-btn icon variant="text" size="x-small" @click="router.push({ name: 'Settings' })" title="Settings" :color="route.name === 'Settings' ? 'primary' : undefined">
        <v-icon size="16">mdi-cog-outline</v-icon>
      </v-btn>

      <UserProfile class="ml-1" size="24" />
    </div>
  </div>

  <!-- Layout Selection Dialog -->
  <v-dialog v-model="layoutDialogOpen" max-width="600px">
    <v-card>
      <v-card-title class="flex items-center gap-2">
        <v-icon>mdi-home</v-icon>
        Select Layout
      </v-card-title>
      <v-card-text>
        <SelectLayout @select="handleLayoutSelect" />
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="layoutDialogOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
