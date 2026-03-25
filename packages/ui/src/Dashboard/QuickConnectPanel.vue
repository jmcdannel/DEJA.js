<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Device } from '@repo/modules'
import { useLayout } from '@repo/modules'
import StatusPulse from '../animations/StatusPulse.vue'

interface Props {
  devices: Device[]
  availablePorts: string[]
  availableTopics?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  availableTopics: () => [],
})

const emit = defineEmits<{
  connect: [deviceId: string, serial?: string, topic?: string]
  navigate: [deviceId: string]
}>()

const { deviceTypes } = useLayout()

const disconnectedDevices = computed(() =>
  props.devices.filter((d) => !d.isConnected && d.type !== 'deja-server'),
)

const connectedCount = computed(() =>
  props.devices.filter((d) => d.isConnected || d.type === 'deja-server').length,
)

const allConnected = computed(
  () => props.devices.length > 0 && disconnectedDevices.value.length === 0,
)

// Per-device port/topic selections
const selections = ref<Record<string, string>>({})

// Pre-populate saved ports/topics
watch(
  () => disconnectedDevices.value,
  (devices) => {
    for (const device of devices) {
      if (!selections.value[device.id]) {
        if (device.port) selections.value[device.id] = device.port
        else if (device.topic) selections.value[device.id] = device.topic
      }
    }
  },
  { immediate: true },
)

function getDeviceConfig(type: string) {
  return deviceTypes.find((dt) => dt.value === type)
}

function isUsbDevice(device: Device) {
  return (
    device.connection === 'usb' ||
    device.type === 'dcc-ex' ||
    device.type === 'deja-arduino' ||
    device.type === 'deja-arduino-led'
  )
}

function getSubtitle(device: Device) {
  const config = getDeviceConfig(device.type)
  if (device.type === 'dcc-ex') return 'DCC Command Station'
  if (device.type === 'deja-arduino') return 'USB Serial Interface'
  if (device.type === 'deja-arduino-led') return 'Lighting Controller'
  if (device.type === 'deja-mqtt') return 'Wireless Control Node'
  return config?.label ?? 'Device'
}

function handleConnect(device: Device) {
  const value = selections.value[device.id]
  if (isUsbDevice(device)) {
    emit('connect', device.id, value, undefined)
  } else {
    emit('connect', device.id, undefined, value || device.topic)
  }
}
</script>

<template>
  <div class="qc">
    <!-- Header -->
    <div class="qc__header">
      <span class="qc__title">Quick Connect</span>
      <v-chip
        v-if="allConnected"
        size="x-small"
        color="success"
        variant="tonal"
        prepend-icon="mdi-check-circle"
      >
        All online
      </v-chip>
      <v-chip
        v-else-if="disconnectedDevices.length > 0"
        size="x-small"
        color="error"
        variant="tonal"
      >
        {{ disconnectedDevices.length }} offline
      </v-chip>
    </div>

    <!-- All connected state -->
    <div v-if="allConnected" class="qc__connected">
      <StatusPulse status="connected" size="md" />
      <div>
        <div class="text-success font-weight-bold text-sm">All devices connected</div>
        <div class="text-xs opacity-50">{{ connectedCount }} of {{ devices.length }} online</div>
      </div>
    </div>

    <!-- Device cards -->
    <div
      v-for="device in disconnectedDevices"
      :key="device.id"
      class="qc__device"
    >
      <!-- Device info row -->
      <div class="qc__device-info" @click="emit('navigate', device.id)">
        <v-avatar
          :color="getDeviceConfig(device.type)?.color ?? 'grey'"
          variant="tonal"
          size="40"
          rounded="lg"
        >
          <v-icon :icon="getDeviceConfig(device.type)?.icon ?? 'mdi-devices'" size="22" />
        </v-avatar>
        <div>
          <div class="qc__device-name">
            {{ device.name || getDeviceConfig(device.type)?.label }}
          </div>
          <div class="qc__device-subtitle">{{ getSubtitle(device) }}</div>
        </div>
      </div>

      <!-- Port/topic selector + Link button -->
      <div class="qc__device-actions">
        <v-select
          v-if="isUsbDevice(device)"
          v-model="selections[device.id]"
          :items="availablePorts"
          :placeholder="device.port || 'Select port...'"
          density="compact"
          variant="solo-filled"
          hide-details
          flat
          class="qc__input"
          no-data-text="No ports detected"
        />
        <v-text-field
          v-else
          v-model="selections[device.id]"
          :placeholder="device.topic || 'topic/subscribe'"
          density="compact"
          variant="solo-filled"
          hide-details
          flat
          class="qc__input"
        />
        <v-btn
          size="small"
          color="cyan"
          variant="flat"
          class="qc__link-btn"
          :disabled="isUsbDevice(device) ? !selections[device.id] : false"
          @click="handleConnect(device)"
        >
          Link
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qc {
  background: rgba(10, 18, 36, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 16px;
  padding: 20px;
}

/* Header */
.qc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.qc__title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
  color: rgba(148, 163, 184, 0.5);
}

/* All connected */
.qc__connected {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.15);
}

/* Device cards */
.qc__device {
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.08);
  transition: border-color 0.2s ease;
}

.qc__device:hover {
  border-color: rgba(148, 163, 184, 0.15);
}

.qc__device + .qc__device {
  margin-top: 10px;
}

.qc__device-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.qc__device-info:hover {
  opacity: 0.8;
}

.qc__device-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1.2;
}

.qc__device-subtitle {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(148, 163, 184, 0.5);
  font-weight: 600;
}

/* Actions row */
.qc__device-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qc__input {
  flex: 1;
}

.qc__input :deep(.v-field) {
  font-size: 0.8rem;
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 8px !important;
  min-height: 36px;
}

.qc__input :deep(.v-field__input) {
  font-size: 0.8rem;
  min-height: 36px;
  padding-top: 6px;
  padding-bottom: 6px;
  color: #94a3b8;
}

.qc__input :deep(.v-field__input::placeholder) {
  color: rgba(148, 163, 184, 0.4);
}

.qc__input :deep(.v-label) {
  font-size: 0.8rem;
}

/* Link button */
.qc__link-btn {
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
  border-radius: 8px;
  min-width: 64px;
  height: 36px;
}
</style>
