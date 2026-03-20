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
  <v-card variant="flat" class="quick-connect-panel mb-3">
    <v-card-text class="pa-4">
      <!-- All connected state -->
      <div v-if="allConnected" class="d-flex align-center justify-center ga-3 pa-3">
        <StatusPulse status="connected" size="sm" />
        <div>
          <div class="quick-connect-panel__label text-success font-weight-bold">All devices connected</div>
          <div class="quick-connect-panel__sublabel">
            {{ connectedCount }} of {{ devices.length }} online
          </div>
        </div>
      </div>

      <!-- Has disconnected devices -->
      <template v-else-if="disconnectedDevices.length > 0">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="text-overline text-medium-emphasis" style="font-size: 0.625rem">Quick Connect</div>
          <v-chip size="x-small" color="error" variant="tonal">
            {{ disconnectedDevices.length }} offline
          </v-chip>
        </div>

        <div
          v-for="device in disconnectedDevices"
          :key="device.id"
          class="quick-connect-panel__row"
        >
          <div
            class="d-flex align-center ga-2 mb-2 quick-connect-panel__device-link"
            @click="emit('navigate', device.id)"
          >
            <v-avatar
              :color="getDeviceConfig(device.type)?.color ?? 'grey'"
              variant="tonal"
              size="22"
              rounded="lg"
            >
              <v-icon :icon="getDeviceConfig(device.type)?.icon ?? 'mdi-devices'" size="12" />
            </v-avatar>
            <span
              class="quick-connect-panel__device-name"
              :class="`text-${getDeviceConfig(device.type)?.color ?? 'grey'}`"
            >
              {{ device.name || getDeviceConfig(device.type)?.label }}
            </span>
          </div>
          <div class="d-flex align-center ga-2">
            <v-select
              v-if="isUsbDevice(device)"
              v-model="selections[device.id]"
              :items="availablePorts"
              label="Port"
              density="compact"
              variant="outlined"
              hide-details
              class="flex-grow-1 quick-connect-panel__input"
              no-data-text="No ports"
            />
            <v-text-field
              v-else
              v-model="selections[device.id]"
              :placeholder="device.topic || 'MQTT topic...'"
              label="Topic"
              density="compact"
              variant="outlined"
              hide-details
              class="flex-grow-1 quick-connect-panel__input"
            />
            <v-btn
              size="x-small"
              color="success"
              variant="flat"
              :disabled="isUsbDevice(device) ? !selections[device.id] : false"
              @click="handleConnect(device)"
            >
              Connect
            </v-btn>
          </div>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.quick-connect-panel {
  background: rgba(var(--v-theme-surface), 0.6) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px;
  backdrop-filter: blur(8px);
}

.quick-connect-panel__label {
  font-size: 0.75rem;
}

.quick-connect-panel__sublabel {
  font-size: 0.6875rem;
  opacity: 0.5;
}

.quick-connect-panel__device-name {
  font-size: 0.6875rem;
  font-weight: 600;
}

.quick-connect-panel__row {
  padding: 10px 0;
}

.quick-connect-panel__row + .quick-connect-panel__row {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.quick-connect-panel__device-link {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.quick-connect-panel__device-link:hover {
  opacity: 0.75;
}

.quick-connect-panel__input :deep(.v-field) {
  font-size: 0.75rem;
}

.quick-connect-panel__input :deep(.v-field__input) {
  font-size: 0.75rem;
  min-height: 32px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.quick-connect-panel__input :deep(.v-label) {
  font-size: 0.75rem;
}
</style>
