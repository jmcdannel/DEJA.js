<script setup lang="ts">
import { computed } from 'vue'
import type { Device } from '@repo/modules'
import { useLayout } from '@repo/modules'
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

const selectedPort = defineModel<string>('selectedPort', { default: '' })
const selectedTopic = defineModel<string>('selectedTopic', { default: '' })

const deviceConfig = computed(() => {
  return deviceTypes.find((dt) => dt.value === props.device.type)
})

const isConnected = computed(() => props.device.isConnected ?? false)
const isUsbDevice = computed(
  () =>
    props.device.connection === 'usb' ||
    props.device.type === 'dcc-ex' ||
    props.device.type === 'deja-arduino' ||
    props.device.type === 'deja-arduino-led'
)
const isMqttDevice = computed(
  () => props.device.connection === 'wifi' || props.device.type === 'deja-mqtt'
)

const connectionLabel = computed(() => {
  if (isUsbDevice.value) return 'USB'
  if (isMqttDevice.value) return 'WiFi'
  return 'Unknown'
})

const connectionPath = computed(() => {
  if (props.device.port) return props.device.port
  if (props.device.topic) return props.device.topic
  return ''
})

const uptime = computed(() => {
  if (!props.device.lastConnected || !isConnected.value) return ''
  const now = Date.now()
  const last =
    props.device.lastConnected instanceof Date
      ? props.device.lastConnected.getTime()
      : new Date(props.device.lastConnected).getTime()
  const diff = now - last
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
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
    variant="tonal"
  >
    <v-card-text class="pa-4">
      <!-- Top row: device info + status -->
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="d-flex align-center ga-3">
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

      <!-- Disconnected: port/topic selector + connect -->
      <div v-else class="d-flex align-center ga-3">
        <v-select
          v-if="isUsbDevice"
          v-model="selectedPort"
          :items="availablePorts"
          label="Select serial port"
          density="compact"
          variant="outlined"
          hide-details
          class="flex-grow-1"
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
          class="flex-grow-1"
        />
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
    </v-card-text>
  </v-card>
</template>

<style scoped>
.device-connection-card {
  border-left: 4px solid;
  transition: border-color 0.3s ease;
}
</style>
