<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Device } from '@repo/modules'
import { useLayout, useServerStatus } from '@repo/modules'
import { formatUptime } from '@repo/utils'
import StatusPulse from '../animations/StatusPulse.vue'

interface Props {
  device: Device
  availablePorts: string[]
  availableTopics?: string[]
  linkMode: 'page' | 'modal'
  turnoutCount?: number
  effectCount?: number
  trackPower?: boolean | null
}

const props = withDefaults(defineProps<Props>(), {
  availableTopics: () => [],
  turnoutCount: 0,
  effectCount: 0,
  trackPower: null,
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

// Prepopulate port/topic if the device has a saved value that matches available options
watch(
  () => props.availablePorts,
  (ports) => {
    if (!selectedPort.value && props.device.port && ports.includes(props.device.port)) {
      selectedPort.value = props.device.port
    }
  },
  { immediate: true }
)

watch(
  () => props.device.topic,
  (topic) => {
    if (!selectedTopic.value && topic) {
      selectedTopic.value = topic
    }
  },
  { immediate: true }
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
    !isDejaServer.value && (
      props.device.connection === 'usb' ||
      props.device.type === 'dcc-ex' ||
      props.device.type === 'deja-arduino' ||
      props.device.type === 'deja-arduino-led'
    )
)
const isMqttDevice = computed(
  () => !isDejaServer.value && (props.device.connection === 'wifi' || props.device.type === 'deja-mqtt')
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

const uptime = computed(() => {
  if (!props.device.lastConnected || !isConnected.value) return ''
  return formatUptime(props.device.lastConnected)
})

function handleConnect() {
  if (isUsbDevice.value) {
    emit('connect', props.device.id, selectedPort.value, undefined)
  } else {
    emit(
      'connect',
      props.device.id,
      undefined,
      selectedTopic.value || props.device.topic
    )
  }
}
</script>

<template>
  <v-card
    class="device-connection-card mb-2"
    :style="{
      borderLeftColor: isConnected
        ? 'rgb(var(--v-theme-device-connected))'
        : 'rgb(var(--v-theme-device-disconnected))',
    }"
    variant="flat"
  >
    <v-card-text class="pa-4">
      <!-- Top row: device info + status -->
      <div class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2">
        <div class="d-flex align-center ga-3 device-info-link" @click="emit('navigate', device.id)">
          <v-avatar
            :color="deviceConfig?.color ?? 'grey'"
            variant="tonal"
            size="40"
            rounded="lg"
            class="cursor-pointer"
          >
            <v-icon :icon="deviceConfig?.icon ?? 'mdi-devices'" />
          </v-avatar>
          <div>
            <div
              class="text-subtitle-1 font-weight-bold cursor-pointer"
              :class="`text-${deviceConfig?.color ?? 'grey'}`"
            >
              {{ device.name || deviceConfig?.label || device.type }}
            </div>
            <div v-if="isConnected" class="text-caption text-medium-emphasis">
              {{ connectionLabel }} &middot; {{ connectionPath }}
            </div>
            <div v-else class="text-caption text-error">
              &#9679; Disconnected{{
                connectionPath ? '' : ' — no port assigned'
              }}
            </div>
          </div>
        </div>
        <div v-if="isConnected" class="text-right">
          <div class="d-flex align-center ga-1">
            <StatusPulse status="connected" size="sm" />
            <span class="text-caption text-success">Connected</span>
          </div>
          <div v-if="uptime" class="text-caption text-medium-emphasis">
            uptime {{ uptime }}
          </div>
        </div>
      </div>

      <!-- Connected: metadata tags + actions -->
      <div
        v-if="isConnected"
        class="d-flex justify-space-between align-center flex-wrap ga-2"
      >
        <div class="d-flex ga-2 flex-wrap">
          <v-chip
            v-if="turnoutCount > 0"
            size="x-small"
            variant="tonal"
            color="surface-variant"
          >
            {{ turnoutCount }} turnouts
          </v-chip>
          <v-chip
            v-if="effectCount > 0"
            size="x-small"
            variant="tonal"
            color="surface-variant"
          >
            {{ effectCount }} effects
          </v-chip>
          <v-chip
            v-if="device.type === 'dcc-ex' && trackPower !== null"
            size="x-small"
            variant="tonal"
            :color="trackPower ? 'warning' : 'surface-variant'"
          >
            Track: {{ trackPower ? 'ON' : 'OFF' }}
          </v-chip>
        </div>
        <div class="d-flex ga-2">
          <template v-if="isDejaServer">
            <v-chip size="small" color="success" variant="tonal" prepend-icon="mdi-ip-network">
              {{ serverStatus?.ip }}
            </v-chip>
          </template>
          <template v-else>
            <v-btn
              size="small"
              variant="tonal"
              color="warning"
              @click="emit('reconnect', device.id)"
            >
              <v-icon start icon="mdi-refresh" />
              Reconnect
            </v-btn>
            <v-btn
              size="small"
              variant="tonal"
              color="error"
              @click="emit('disconnect', device.id)"
            >
              Disconnect
            </v-btn>
          </template>
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

      <!-- Disconnected: deja-server shows status only -->
      <div v-else-if="isDejaServer" class="d-flex align-center ga-2">
        <v-chip size="small" color="error" variant="tonal" prepend-icon="mdi-server-off">
          Server Offline
        </v-chip>
        <v-btn
          variant="tonal"
          color="primary"
          size="small"
          @click="emit('navigate', device.id)"
        >
          Details
          <v-icon end icon="mdi-arrow-right" />
        </v-btn>
      </div>

      <!-- Disconnected: port/topic selector + connect -->
      <div v-else class="device-connection-actions">
        <v-select
          v-if="isUsbDevice"
          v-model="selectedPort"
          :items="availablePorts"
          label="Select serial port"
          density="compact"
          variant="outlined"
          hide-details
          class="device-connection-port-select"
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
          class="device-connection-port-select"
        />
        <div class="d-flex ga-2">
          <v-btn
            color="success"
            variant="flat"
            @click="handleConnect"
            :disabled="isUsbDevice ? !selectedPort : false"
          >
            Connect
          </v-btn>
          <v-btn
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
.device-connection-card {
  border-left: 4px solid;
  transition: border-color 0.3s ease;
  background: rgba(var(--v-theme-surface), 0.65) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  border-left: 4px solid;
}

.device-connection-card .text-subtitle-1 {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.device-connection-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-connection-port-select {
  width: 100%;
}

.device-info-link {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.device-info-link:hover {
  opacity: 0.8;
}

@media (min-width: 600px) {
  .device-connection-actions {
    flex-direction: row;
    align-items: center;
  }

  .device-connection-port-select {
    flex: 1;
  }
}
</style>
