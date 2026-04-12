<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Device } from '@repo/modules'
import { isArduinoFamilyType, useLayout, useServerStatus } from '@repo/modules'
import StatusPulse from '../animations/StatusPulse.vue'

// ── Props & Emits ──────────────────────────────────────────────────

interface DeviceManageCardProps {
  device: Device
  ports: string[] | null | undefined
}

interface DeviceManageCardEmits {
  connect: [deviceId: string, serial?: string, topic?: string]
  disconnect: [deviceId: string]
  navigate: [deviceId: string]
}

const props = defineProps<DeviceManageCardProps>()
const emit = defineEmits<DeviceManageCardEmits>()

// ── Composables ────────────────────────────────────────────────────

const { deviceTypes, autoConnectDevice, updateDevice } = useLayout()
const { serverStatus } = useServerStatus()

// ── Local State ────────────────────────────────────────────────────

const serial = ref(props.device?.port || '')
const autoConnect = ref(props.device?.autoConnect || false)

// ── Computed ───────────────────────────────────────────────────────

const deviceType = computed(() =>
  deviceTypes.find((type) => type.value === props.device?.type),
)

const isDejaServer = computed(() => props.device?.type === 'deja-server')

const isConnected = computed(() =>
  isDejaServer.value
    ? serverStatus.value?.online ?? false
    : props.device?.isConnected ?? false,
)

const isUsbDevice = computed(
  () =>
    !isDejaServer.value &&
    (props.device?.connection === 'usb' ||
      props.device?.type === 'dcc-ex' ||
      isArduinoFamilyType(props.device?.type)),
)

const isMqttDevice = computed(
  () =>
    !isDejaServer.value &&
    (props.device?.connection === 'wifi' || props.device?.type === 'deja-mqtt'),
)

const serverIp = computed(() => serverStatus.value?.ip ?? null)

const deviceColor = computed(() => deviceType.value?.color ?? 'grey')

// ── Handlers ───────────────────────────────────────────────────────

function handleConnect() {
  if (isUsbDevice.value) {
    emit('connect', props.device.id, serial.value, undefined)
  } else {
    emit('connect', props.device.id, undefined, props.device?.topic)
  }
}

function handleDisconnect() {
  emit('disconnect', props.device.id)
}

async function handleClearPort() {
  if (props.device?.id) {
    await updateDevice(props.device.id, { port: '' })
  }
}

async function handleAutoConnect(checked: boolean | null) {
  if (checked !== null && props.device?.id) {
    await autoConnectDevice(props.device.id, checked)
  }
}
</script>

<template>
  <v-card
    class="device-manage-card mx-auto w-full h-full justify-between flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    density="compact"
  >
    <!-- ── Title Row ──────────────────────────────────────────── -->
    <v-card-title class="flex flex-nowrap items-center gap-3 !overflow-visible">
      <v-icon
        class="drag-handle cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 flex-shrink-0"
        size="small"
      >
        mdi-drag
      </v-icon>

      <div
        class="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
        @click="emit('navigate', device.id)"
      >
        <v-avatar :color="deviceColor" variant="tonal" size="36" rounded="lg">
          <img
            v-if="deviceType?.image"
            :src="deviceType.image"
            alt=""
            class="w-8 h-8"
          />
          <v-icon
            v-else
            :icon="deviceType?.icon || 'mdi-help'"
            :color="deviceColor"
          />
        </v-avatar>

        <div class="flex flex-col min-w-0">
          <span class="device-manage-card__id text-sm font-bold truncate">
            {{ device?.id }}
          </span>
          <span class="text-xs opacity-70 uppercase tracking-wider">
            {{ deviceType?.label || device?.type || 'Device' }}
          </span>
        </div>
      </div>

      <v-spacer />

      <v-icon
        :icon="isConnected ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="isConnected ? 'green' : 'grey'"
        size="small"
        class="flex-shrink-0"
      />
    </v-card-title>

    <!-- ── Card Body ──────────────────────────────────────────── -->
    <v-card-text>
      <!-- Chip group: connection type -->
      <div class="flex justify-between w-full items-start mb-3">
        <v-chip-group>
          <v-chip
            v-if="isUsbDevice"
            size="small"
            variant="outlined"
            prepend-icon="mdi-usb"
          >
            USB
          </v-chip>
          <v-chip
            v-else-if="isMqttDevice"
            size="small"
            variant="outlined"
            prepend-icon="mdi-wifi"
          >
            WiFi
          </v-chip>
          <v-chip
            v-else
            size="small"
            variant="outlined"
            prepend-icon="mdi-devices"
          >
            {{ device?.connection || 'Device' }}
          </v-chip>

          <!-- 🌐 Server IP chip -->
          <v-chip
            v-if="isDejaServer && isConnected && serverIp"
            size="small"
            variant="outlined"
            prepend-icon="mdi-ip-network"
          >
            {{ serverIp }}
          </v-chip>
        </v-chip-group>

        <!-- Port / topic badge -->
        <v-btn
          v-if="device?.port"
          size="small"
          variant="outlined"
          :color="deviceColor"
          prepend-icon="mdi-memory"
        >
          {{ device.port }}
        </v-btn>
        <v-btn
          v-else-if="device?.topic"
          size="small"
          variant="outlined"
          :color="deviceColor"
          prepend-icon="mdi-wifi"
        >
          {{ device.topic }}
        </v-btn>
      </div>

      <!-- Status indicator -->
      <div class="flex items-center gap-2 mb-3">
        <StatusPulse
          :status="isConnected ? 'connected' : 'disconnected'"
          size="sm"
        />
        <span
          class="text-xs"
          :class="isConnected ? 'text-green-400' : 'text-red-400'"
        >
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>

      <!-- 🔌 USB port combobox (disconnected USB devices only, not deja-server) -->
      <v-combobox
        v-if="!isDejaServer && !isConnected && isUsbDevice"
        v-model="serial"
        label="USB Port"
        variant="outlined"
        item-title="label"
        density="compact"
        :items="ports || []"
        :disabled="isConnected"
        clearable
        @click:clear="handleClearPort"
      />

      <!-- ⚡ Auto-connect toggle -->
      <v-switch
        v-if="!isDejaServer && (isConnected || device?.autoConnect)"
        v-model="autoConnect"
        color="green"
        label="Auto Connect"
        hide-details
        density="compact"
        @update:model-value="handleAutoConnect"
      />
    </v-card-text>

    <!-- ── Footer ─────────────────────────────────────────────── -->
    <v-divider />
    <div class="device-manage-card__footer">
      <v-btn
        variant="tonal"
        :color="deviceColor"
        size="small"
        @click="emit('navigate', device.id)"
      >
        Details
        <v-icon end icon="mdi-arrow-right" />
      </v-btn>

      <v-spacer />

      <!-- deja-server: online / offline chip -->
      <template v-if="isDejaServer">
        <v-chip
          v-if="isConnected"
          color="success"
          size="x-small"
          variant="tonal"
          prepend-icon="mdi-check-circle"
        >
          Online
        </v-chip>
        <v-chip
          v-else
          color="error"
          size="x-small"
          variant="tonal"
          prepend-icon="mdi-alert-circle"
        >
          Offline
        </v-chip>
      </template>

      <!-- Other devices: connect / disconnect -->
      <template v-else>
        <v-btn
          v-if="!isConnected"
          text="Connect"
          :color="deviceColor"
          variant="tonal"
          size="small"
          prepend-icon="mdi-power-plug"
          @click="handleConnect"
        />
        <v-btn
          v-else
          text="Disconnect"
          color="error"
          variant="text"
          size="small"
          prepend-icon="mdi-power-plug-off"
          @click="handleDisconnect"
        />
      </template>
    </div>
  </v-card>
</template>

<style scoped>
.device-manage-card__id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.01em;
}

.device-manage-card__footer {
  display: flex;
  align-items: center;
  padding: 4px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}
</style>
