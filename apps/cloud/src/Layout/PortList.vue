<script setup lang="ts">
import { computed } from 'vue'
import { useDejaJS } from '@repo/deja/useDejaJS'
import { useLayout } from '@repo/modules'

const { sendDejaCommand } = useDejaJS()
const { getDevices } = useLayout()
const devices = getDevices()

const props = defineProps<{
  ports: string[]
}>()

const portDetails = computed(() =>
  (props.ports || []).map((port) => {
    const device = devices.value.find((d) => d.port === port)
    return {
      path: port,
      name: port.split('/').pop() ?? port,
      device: device ?? null,
      isConnected: device?.isConnected ?? false,
      deviceName: device?.name ?? null,
      deviceType: device?.type ?? null,
      deviceId: device?.id ?? null,
    }
  }),
)

function handleRefresh() {
  sendDejaCommand({ action: 'listPorts', payload: {} })
}

function getDeviceIcon(type: string | null): string {
  switch (type) {
    case 'dcc-ex': return 'mdi-memory'
    case 'deja-arduino': return 'mdi-chip'
    case 'deja-arduino-led': return 'mdi-led-on'
    case 'deja-mqtt': return 'mdi-wifi'
    case 'deja-server': return 'mdi-server'
    default: return 'mdi-serial-port'
  }
}
</script>

<template>
  <div class="port-list">
    <div class="port-list__header">
      <span class="port-list__count">{{ ports?.length || 0 }} port{{ (ports?.length || 0) !== 1 ? 's' : '' }} detected</span>
      <button class="port-list__refresh" @click="handleRefresh" title="Scan for ports">
        <v-icon size="16">mdi-refresh</v-icon>
      </button>
    </div>

    <div v-if="portDetails.length" class="port-list__items">
      <div
        v-for="p in portDetails"
        :key="p.path"
        class="port-item"
        :class="{ 'port-item--connected': p.isConnected, 'port-item--assigned': p.device && !p.isConnected }"
      >
        <div class="port-item__indicator" />
        <v-icon size="18" class="port-item__icon">{{ getDeviceIcon(p.deviceType) }}</v-icon>
        <div class="port-item__info">
          <div class="port-item__name">{{ p.name }}</div>
          <div class="port-item__path">{{ p.path }}</div>
        </div>
        <div v-if="p.device" class="port-item__device">
          <span class="port-item__device-name">{{ p.deviceName }}</span>
          <span v-if="p.deviceId" class="port-item__device-id">{{ p.deviceId }}</span>
          <span class="port-item__status">{{ p.isConnected ? 'ONLINE' : 'OFFLINE' }}</span>
        </div>
        <div v-else class="port-item__unassigned">
          <span>Unassigned</span>
        </div>
      </div>
    </div>

    <div v-else class="port-list__empty">
      <v-icon size="24" class="text-slate-600 mb-2">mdi-usb-port</v-icon>
      <p>No serial ports detected</p>
      <button class="port-list__scan-btn" @click="handleRefresh">
        <v-icon size="14">mdi-refresh</v-icon>
        Scan ports
      </button>
    </div>
  </div>
</template>

<style scoped>
.port-list {
  background: rgba(2, 6, 23, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.port-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.port-list__count {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(148, 163, 184, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.port-list__refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.5);
  color: rgba(148, 163, 184, 0.5);
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease, background 150ms ease;
}

.port-list__refresh:hover {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
  background: rgba(56, 189, 248, 0.08);
}

.port-list__items {
  display: flex;
  flex-direction: column;
}

.port-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
  transition: background 150ms ease;
}

.port-item:last-child {
  border-bottom: none;
}

.port-item:hover {
  background: rgba(148, 163, 184, 0.03);
}

.port-item__indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.25);
  flex-shrink: 0;
}

.port-item--connected .port-item__indicator {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
}

.port-item--assigned .port-item__indicator {
  background: #f59e0b;
}

.port-item__icon {
  color: rgba(148, 163, 184, 0.4);
  flex-shrink: 0;
}

.port-item--connected .port-item__icon {
  color: #22d3ee;
}

.port-item--assigned .port-item__icon {
  color: rgba(148, 163, 184, 0.6);
}

.port-item__info {
  flex: 1;
  min-width: 0;
}

.port-item__name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #e0f2fe;
  font-family: 'Roboto Mono', monospace;
  letter-spacing: 0.02em;
}

.port-item__path {
  font-size: 0.65rem;
  color: rgba(148, 163, 184, 0.4);
  font-family: 'Roboto Mono', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.port-item__device {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.port-item__device-name {
  font-size: 0.7rem;
  font-weight: 500;
  color: #cbd5e1;
}

.port-item__device-id {
  font-size: 0.6rem;
  font-family: 'Roboto Mono', monospace;
  color: rgba(148, 163, 184, 0.5);
  letter-spacing: 0.02em;
}

.port-item__status {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.4);
}

.port-item--connected .port-item__status {
  color: #22c55e;
}

.port-item__unassigned {
  font-size: 0.7rem;
  color: rgba(148, 163, 184, 0.3);
  font-style: italic;
  flex-shrink: 0;
}

.port-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  color: rgba(148, 163, 184, 0.4);
  font-size: 0.8rem;
}

.port-list__scan-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.5);
  color: rgba(148, 163, 184, 0.6);
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease;
}

.port-list__scan-btn:hover {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
}
</style>
