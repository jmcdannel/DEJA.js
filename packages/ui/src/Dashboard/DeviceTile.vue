<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Device } from '@repo/modules'
import { useLayout, useServerStatus } from '@repo/modules'
import StatusPulse from '../animations/StatusPulse.vue'

interface Props {
  device: Device
  availablePorts: string[]
  availableTopics?: string[]
  turnoutCount?: number
  effectCount?: number
  trackPower?: boolean | null
  serverUptime?: string
  connectedDeviceCount?: number
  totalDeviceCount?: number
  commandCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  availableTopics: () => [],
  turnoutCount: 0,
  effectCount: 0,
  trackPower: null,
  serverUptime: '',
  connectedDeviceCount: 0,
  totalDeviceCount: 0,
  commandCount: 0,
})

const emit = defineEmits<{
  connect: [deviceId: string, serial?: string, topic?: string]
  disconnect: [deviceId: string]
  reconnect: [deviceId: string]
  navigate: [deviceId: string]
}>()

const { deviceTypes } = useLayout()
const { serverStatus } = useServerStatus()

const selectedPort = defineModel<string>('selectedPort', { default: '' })
const selectedTopic = defineModel<string>('selectedTopic', { default: '' })

// Prepopulate port/topic from saved device values
watch(
  () => props.availablePorts,
  (ports) => {
    if (!selectedPort.value && props.device.port && ports.includes(props.device.port)) {
      selectedPort.value = props.device.port
    }
  },
  { immediate: true },
)

watch(
  () => props.device.topic,
  (topic) => {
    if (!selectedTopic.value && topic) {
      selectedTopic.value = topic
    }
  },
  { immediate: true },
)

const deviceConfig = computed(() => {
  return deviceTypes.find((dt) => dt.value === props.device.type)
})

const isDejaServer = computed(() => props.device.type === 'deja-server')
const isConnected = computed(() => {
  if (isDejaServer.value) return serverStatus.value?.online ?? false
  return props.device.isConnected ?? false
})
const isUsbDevice = computed(
  () =>
    !isDejaServer.value &&
    (props.device.connection === 'usb' ||
      props.device.type === 'dcc-ex' ||
      props.device.type === 'deja-arduino' ||
      props.device.type === 'deja-arduino-led'),
)
const isMqttDevice = computed(
  () =>
    !isDejaServer.value &&
    (props.device.connection === 'wifi' || props.device.type === 'deja-mqtt'),
)

const connectionLabel = computed(() => {
  if (isDejaServer.value) return 'Server'
  if (isUsbDevice.value) return 'USB'
  if (isMqttDevice.value) return 'WiFi'
  return 'Unknown'
})

const connectionPath = computed(() => {
  if (isDejaServer.value) return serverStatus.value?.ip ?? ''
  if (props.device.port) return props.device.port
  if (props.device.topic) return props.device.topic
  return ''
})

function handleConnect() {
  if (isUsbDevice.value) {
    emit('connect', props.device.id, selectedPort.value, undefined)
  } else {
    emit('connect', props.device.id, undefined, selectedTopic.value || props.device.topic)
  }
}
</script>

<template>
  <v-card
    class="device-tile mb-2"
    :style="{
      borderLeftColor: isConnected
        ? `rgb(var(--v-theme-device-connected))`
        : `rgb(var(--v-theme-device-disconnected))`,
    }"
    variant="flat"
  >
    <v-card-text class="pa-4">
      <!-- Top row: device info + status -->
      <div class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2">
        <div class="d-flex align-center ga-3 device-tile__link" @click="emit('navigate', device.id)">
          <v-avatar
            :color="deviceConfig?.color ?? 'grey'"
            variant="tonal"
            size="40"
            rounded="lg"
          >
            <v-icon :icon="deviceConfig?.icon ?? 'mdi-devices'" />
          </v-avatar>
          <div>
            <div
              class="text-subtitle-1 font-weight-bold"
              :class="`text-${deviceConfig?.color ?? 'grey'}`"
            >
              {{ device.name || deviceConfig?.label || device.type }}
            </div>
            <div v-if="isConnected" class="text-caption text-medium-emphasis">
              {{ connectionLabel }} &middot; {{ connectionPath }}
              <template v-if="isDejaServer && serverStatus?.version">
                &middot; v{{ serverStatus.version }}
              </template>
            </div>
            <div v-else class="text-caption text-error">
              Disconnected{{ connectionPath ? '' : ' — no port assigned' }}
            </div>
          </div>
        </div>
        <div v-if="isConnected" class="text-right">
          <div class="d-flex align-center ga-1">
            <StatusPulse status="connected" size="sm" />
            <span class="text-caption text-success font-weight-bold">
              {{ isDejaServer ? 'Online' : 'Connected' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Connected: stat row -->
      <div v-if="isConnected" class="d-flex ga-2 flex-wrap">
        <!-- deja-server stats -->
        <template v-if="isDejaServer">
          <div class="device-tile__stat">
            <div class="device-tile__stat-label">Uptime</div>
            <div class="device-tile__stat-value">{{ serverUptime || '—' }}</div>
          </div>
          <div class="device-tile__stat">
            <div class="device-tile__stat-label">Devices</div>
            <div class="device-tile__stat-value text-primary">
              {{ connectedDeviceCount }}/{{ totalDeviceCount }}
            </div>
          </div>
          <div class="device-tile__stat">
            <div class="device-tile__stat-label">Commands</div>
            <div class="device-tile__stat-value" style="color: rgb(var(--v-theme-secondary))">
              {{ commandCount }}
            </div>
          </div>
        </template>

        <!-- dcc-ex stats -->
        <template v-else-if="device.type === 'dcc-ex'">
          <div class="device-tile__stat">
            <div class="device-tile__stat-label">Turnouts</div>
            <div class="device-tile__stat-value">{{ turnoutCount }}</div>
          </div>
          <div class="device-tile__stat">
            <div class="device-tile__stat-label">Effects</div>
            <div class="device-tile__stat-value">{{ effectCount }}</div>
          </div>
          <div
            class="device-tile__stat"
            :class="trackPower ? 'device-tile__stat--highlight' : ''"
          >
            <div class="device-tile__stat-label">Track</div>
            <div
              class="device-tile__stat-value"
              :class="trackPower ? 'text-warning' : ''"
            >
              {{ trackPower === null ? '—' : trackPower ? 'ON' : 'OFF' }}
            </div>
          </div>
        </template>

        <!-- deja-arduino / deja-arduino-led stats -->
        <template v-else-if="device.type === 'deja-arduino' || device.type === 'deja-arduino-led'">
          <div class="device-tile__stat">
            <div class="device-tile__stat-label">Effects</div>
            <div class="device-tile__stat-value">{{ effectCount }}</div>
          </div>
          <div v-if="device.strips?.length" class="device-tile__stat">
            <div class="device-tile__stat-label">Strips</div>
            <div class="device-tile__stat-value">{{ device.strips.length }}</div>
          </div>
        </template>

        <!-- deja-mqtt stats -->
        <template v-else-if="device.type === 'deja-mqtt'">
          <div class="device-tile__stat">
            <div class="device-tile__stat-label">Effects</div>
            <div class="device-tile__stat-value">{{ effectCount }}</div>
          </div>
        </template>
      </div>

      <!-- Disconnected: deja-server shows offline chip -->
      <div v-else-if="isDejaServer" class="d-flex align-center ga-2">
        <v-chip size="small" color="error" variant="tonal" prepend-icon="mdi-server-off">
          Server Offline
        </v-chip>
        <v-btn
          size="small"
          variant="tonal"
          color="primary"
          @click="emit('navigate', device.id)"
        >
          Details
          <v-icon end icon="mdi-arrow-right" />
        </v-btn>
      </div>

      <!-- Disconnected: port/topic selector + connect -->
      <div v-else class="device-tile__connect">
        <v-select
          v-if="isUsbDevice"
          v-model="selectedPort"
          :items="availablePorts"
          label="Select serial port"
          density="compact"
          variant="outlined"
          hide-details
          class="device-tile__port-select"
          no-data-text="No ports found — click Refresh Ports"
        />
        <v-text-field
          v-else-if="isMqttDevice"
          v-model="selectedTopic"
          :placeholder="device.topic || 'Enter MQTT topic...'"
          label="MQTT topic"
          density="compact"
          variant="outlined"
          hide-details
          class="device-tile__port-select"
        />
        <div class="d-flex ga-2">
          <v-btn
            color="success"
            variant="flat"
            size="small"
            :disabled="isUsbDevice ? !selectedPort : false"
            @click="handleConnect"
          >
            Connect
          </v-btn>
          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            @click="emit('navigate', device.id)"
          >
            Details
            <v-icon end icon="mdi-arrow-right" />
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.device-tile {
  transition: border-color 0.3s ease;
  background: rgba(var(--v-theme-surface), 0.65) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  border-left: 4px solid;
  border-radius: 8px;
}

.device-tile__link {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.device-tile__link:hover {
  opacity: 0.8;
}

.device-tile__stat {
  flex: 1;
  min-width: 70px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  padding: 6px 8px;
  border-radius: 6px;
  text-align: center;
}

.device-tile__stat--highlight {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.15);
}

.device-tile__stat-label {
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.4;
}

.device-tile__stat-value {
  font-size: 0.8125rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.device-tile__connect {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-tile__port-select {
  width: 100%;
}

@media (min-width: 600px) {
  .device-tile__connect {
    flex-direction: row;
    align-items: center;
  }

  .device-tile__port-select {
    flex: 1;
    max-width: 280px;
  }
}
</style>
