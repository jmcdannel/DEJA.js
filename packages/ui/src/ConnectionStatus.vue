<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { ServerStatus, Device } from '@repo/modules'

const props = defineProps<{
  layoutName?: string
  layoutId?: string
  serverStatus?: ServerStatus | null
  devices: Device[]
}>()

const emit = defineEmits<{
  navigate: []
}>()

const { mdAndUp } = useDisplay()

const connectedCount = computed(() =>
  props.devices.filter(d => d.isConnected).length
)

const allConnected = computed(() =>
  props.devices.length > 0 && props.devices.every(d => d.isConnected)
)

const overallStatus = computed<'connected' | 'warning' | 'disconnected'>(() => {
  if (!props.layoutId) return 'disconnected'
  if (!props.serverStatus?.online) return 'disconnected'
  if (props.devices.length === 0) return 'connected'
  if (allConnected.value) return 'connected'
  return 'warning'
})

const statusColor = computed(() => ({
  connected: '#22c55e',
  warning: '#eab308',
  disconnected: '#ef4444',
}[overallStatus.value]))

const bgClass = computed(() => ({
  connected: 'status-bg-connected',
  warning: 'status-bg-warning',
  disconnected: 'status-bg-disconnected',
}[overallStatus.value]))

const deviceStatusColor = computed(() => {
  if (props.devices.length === 0) return '#6b7280'
  if (allConnected.value) return '#22c55e'
  if (connectedCount.value > 0) return '#eab308'
  return '#ef4444'
})
</script>

<template>
  <button
    class="connection-status"
    :class="bgClass"
    @click="emit('navigate')"
  >
    <!-- Home icon with status dot overlay -->
    <span class="icon-badge">
      <v-icon size="18" color="white">mdi-home</v-icon>
      <span class="status-dot" :style="{ background: statusColor }" />
    </span>

    <!-- Layout name (desktop only) -->
    <span v-if="mdAndUp" class="layout-name">
      {{ layoutName || 'No Layout' }}
    </span>

    <!-- Device count pill (desktop only, when devices exist) -->
    <span v-if="mdAndUp && devices.length > 0" class="device-pill">
      <span class="device-dot" :style="{ color: deviceStatusColor }">●</span>
      {{ connectedCount }}/{{ devices.length }}
    </span>

    <!-- Chevron -->
    <v-icon size="14" class="chevron">mdi-chevron-right</v-icon>
  </button>
</template>

<style scoped>
.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 13px;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  backdrop-filter: blur(16px);
  min-height: 32px;
}

.connection-status:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Status background tints */
.status-bg-connected {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.status-bg-connected:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
}

.status-bg-warning {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.25);
}
.status-bg-warning:hover {
  background: rgba(234, 179, 8, 0.2);
  border-color: rgba(234, 179, 8, 0.4);
}

.status-bg-disconnected {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.status-bg-disconnected:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

/* Home icon with status badge */
.icon-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid rgba(11, 17, 32, 0.8);
}

/* Layout name */
.layout-name {
  font-weight: 500;
  white-space: nowrap;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Device count pill */
.device-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1px 7px;
  font-size: 11px;
}

.device-dot {
  font-size: 8px;
  line-height: 1;
}

/* Chevron */
.chevron {
  opacity: 0.4;
}

/* ═══ Light mode ═══ */
:root:not(.dark) .connection-status {
  color: #1a1a2e;
}
:root:not(.dark) .status-dot {
  border-color: rgba(255, 255, 255, 0.9);
}
:root:not(.dark) .device-pill {
  background: rgba(0, 0, 0, 0.06);
}
:root:not(.dark) .status-bg-connected {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.2);
}
:root:not(.dark) .status-bg-warning {
  background: rgba(234, 179, 8, 0.08);
  border-color: rgba(234, 179, 8, 0.2);
}
:root:not(.dark) .status-bg-disconnected {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
}

/* ═══ High-contrast ═══ */
.high-contrast .connection-status {
  backdrop-filter: none;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: transparent;
}
.high-contrast .connection-status:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: none;
  border-color: #fff;
}
.high-contrast .status-dot {
  border-color: #000;
}
</style>
