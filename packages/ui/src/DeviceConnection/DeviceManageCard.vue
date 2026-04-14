<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import type { Device } from '@repo/modules'
import { isArduinoFamilyType, isWifiDeviceType, useLayout, useServerStatus } from '@repo/modules'
import StatusPulse from '../animations/StatusPulse.vue'

// ── Props & Emits ──────────────────────────────────────────────────

interface DeviceManageCardProps {
  device: Device
  ports: string[] | null | undefined
  /** How long to wait for a connect before flagging it as failed (ms) */
  connectTimeoutMs?: number
}

interface DeviceManageCardEmits {
  connect: [deviceId: string, serial?: string, topic?: string]
  disconnect: [deviceId: string]
  navigate: [deviceId: string]
}

const props = withDefaults(defineProps<DeviceManageCardProps>(), {
  connectTimeoutMs: 10_000,
})
const emit = defineEmits<DeviceManageCardEmits>()

// ── Composables ────────────────────────────────────────────────────

const { deviceTypes, autoConnectDevice, updateDevice } = useLayout()
const { serverStatus } = useServerStatus()

// ── Local State ────────────────────────────────────────────────────

const serial = ref(props.device?.port || '')
const autoConnect = ref(props.device?.autoConnect || false)

/** 'idle' | 'connecting' | 'error' — drives button + error state */
const connectState = ref<'idle' | 'connecting' | 'error'>('idle')
const connectError = ref<string | null>(null)
let connectTimer: ReturnType<typeof setTimeout> | null = null

function clearConnectTimer() {
  if (connectTimer) {
    clearTimeout(connectTimer)
    connectTimer = null
  }
}

// Keep local state in sync if the upstream device doc changes (e.g. auto-connect
// flipped elsewhere, or port saved by another session).
watch(
  () => props.device?.autoConnect,
  (val) => {
    autoConnect.value = val ?? false
  },
)
watch(
  () => props.device?.port,
  (val) => {
    if (val && !serial.value) serial.value = val
  },
)

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

// 🛜 ESP32 WiFi is a member of the Arduino family but connects over WiFi/MQTT —
// so a 'deja-esp32-wifi' device with connection: 'wifi' must be treated as MQTT,
// not USB. The connection field wins over the firmware-family classification.
const isUsbDevice = computed(
  () =>
    !isDejaServer.value &&
    props.device?.connection !== 'wifi' &&
    !isWifiDeviceType(props.device?.type) &&
    (props.device?.connection === 'usb' ||
      props.device?.type === 'dcc-ex' ||
      isArduinoFamilyType(props.device?.type)),
)

const isMqttDevice = computed(
  () =>
    !isDejaServer.value &&
    (props.device?.connection === 'wifi' || isWifiDeviceType(props.device?.type)),
)

const deviceColor = computed(() => deviceType.value?.color ?? 'grey')

// 🖥️ Non-server devices can't be connected unless the DEJA server is online —
// the server is the process that actually opens the serial port / subscribes
// to MQTT on behalf of the device. Gate the Connect button on it so users
// don't try to connect into a black hole.
const serverOnline = computed(() => serverStatus.value?.online ?? false)
const canConnect = computed(() => {
  if (isDejaServer.value) return false
  if (!serverOnline.value) return false
  if (isUsbDevice.value && !serial.value) return false
  return true
})
const connectDisabledReason = computed(() => {
  if (!serverOnline.value) {
    return 'Start the DEJA server (deja start) before connecting devices.'
  }
  if (isUsbDevice.value && !serial.value) {
    return 'Select a USB port to connect.'
  }
  return ''
})

const connectionLabel = computed(() => {
  if (isDejaServer.value) return 'Server'
  if (isUsbDevice.value) return 'USB'
  if (isMqttDevice.value) return 'WiFi'
  return props.device?.connection || 'Device'
})

const connectionIcon = computed(() => {
  if (isDejaServer.value) return 'mdi-server'
  if (isUsbDevice.value) return 'mdi-usb-port'
  if (isMqttDevice.value) return 'mdi-wifi'
  return 'mdi-devices'
})

/** The path/topic/IP to display under the status line — read-only. */
const connectionPath = computed(() => {
  if (isDejaServer.value) return serverStatus.value?.ip ?? null
  if (isUsbDevice.value) return props.device?.port || null
  if (isMqttDevice.value) return props.device?.topic || null
  return null
})

const statusLabel = computed(() => {
  if (connectState.value === 'connecting') return 'Connecting…'
  if (connectState.value === 'error') return 'Connection failed'
  return isConnected.value ? 'Connected' : 'Disconnected'
})

const statusClass = computed(() => {
  if (connectState.value === 'error') return 'text-red-400'
  if (connectState.value === 'connecting') return 'text-amber-400'
  return isConnected.value ? 'text-green-400' : 'text-red-400'
})

// ── Watchers for connect lifecycle ─────────────────────────────────

// When the device actually flips to connected, clear any pending error/timer.
watch(
  () => props.device?.isConnected,
  (connected) => {
    if (connected) {
      clearConnectTimer()
      connectState.value = 'idle'
      connectError.value = null
    }
  },
)

onBeforeUnmount(clearConnectTimer)

// ── Handlers ───────────────────────────────────────────────────────

function handleConnect() {
  connectError.value = null
  connectState.value = 'connecting'

  if (isUsbDevice.value) {
    emit('connect', props.device.id, serial.value, undefined)
  } else {
    // 🔕 topic is server-generated — always pass undefined
    emit('connect', props.device.id, undefined, undefined)
  }

  clearConnectTimer()
  connectTimer = setTimeout(() => {
    if (!props.device?.isConnected) {
      connectState.value = 'error'
      connectError.value =
        'Connection timed out. Check the server logs (`deja logs`) for details.'
    }
  }, props.connectTimeoutMs)
}

function handleDisconnect() {
  clearConnectTimer()
  connectState.value = 'idle'
  connectError.value = null
  emit('disconnect', props.device.id)
}

async function handleClearPort() {
  if (props.device?.id) {
    serial.value = ''
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
    class="device-manage-card w-full h-full flex flex-col transition-all duration-200 hover:-translate-y-0.5"
    :class="{ 'device-manage-card--connected': isConnected }"
    variant="flat"
  >
    <!-- ── Header ──────────────────────────────────────────────── -->
    <div class="device-manage-card__header">
      <v-icon
        class="drag-handle cursor-grab active:cursor-grabbing opacity-30 hover:opacity-80 flex-shrink-0"
        size="small"
      >
        mdi-drag
      </v-icon>

      <div
        class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity"
        @click="emit('navigate', device.id)"
      >
        <v-avatar :color="deviceColor" variant="tonal" size="36" rounded="lg">
          <img
            v-if="deviceType?.image"
            :src="deviceType.image"
            alt=""
            class="w-7 h-7"
          />
          <v-icon
            v-else
            :icon="deviceType?.icon || 'mdi-help'"
            :color="deviceColor"
          />
        </v-avatar>

        <div class="flex flex-col min-w-0">
          <span class="device-manage-card__id text-sm font-semibold truncate">
            {{ device?.id }}
          </span>
          <span
            class="text-[0.65rem] opacity-55 uppercase tracking-[0.12em] truncate"
          >
            {{ deviceType?.label || device?.type || 'Device' }}
          </span>
        </div>
      </div>

      <v-icon
        :icon="isConnected ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="isConnected ? 'green' : 'grey'"
        size="10"
        class="flex-shrink-0"
      />
    </div>

    <v-divider class="opacity-40" />

    <!-- ── Body ────────────────────────────────────────────────── -->
    <v-card-text class="flex-1 !py-4 !px-4 space-y-3">
      <!-- Status line -->
      <div class="flex items-center gap-2">
        <StatusPulse
          :status="
            connectState === 'connecting'
              ? 'disconnected'
              : isConnected
                ? 'connected'
                : 'disconnected'
          "
          size="sm"
        />
        <span class="text-xs font-medium" :class="statusClass">
          {{ statusLabel }}
        </span>
        <v-spacer />
        <div class="flex items-center gap-1 text-[0.65rem] opacity-50">
          <v-icon :icon="connectionIcon" size="12" />
          <span class="uppercase tracking-wider">{{ connectionLabel }}</span>
        </div>
      </div>

      <!-- Path / topic — plain mono text, not a button/chip -->
      <div
        v-if="connectionPath"
        class="device-manage-card__path text-[0.72rem] text-slate-400 truncate"
        :title="connectionPath"
      >
        {{ connectionPath }}
      </div>

      <!-- 🔌 USB port picker (only when disconnected USB device) -->
      <v-combobox
        v-if="!isDejaServer && !isConnected && isUsbDevice"
        v-model="serial"
        label="USB Port"
        variant="outlined"
        density="compact"
        item-title="label"
        :items="ports || []"
        :disabled="connectState === 'connecting'"
        clearable
        hide-details
        @click:clear="handleClearPort"
      />

      <!-- ⚠️ Connection error / timeout message -->
      <v-alert
        v-if="connectError"
        type="error"
        variant="tonal"
        density="compact"
        class="text-xs"
      >
        {{ connectError }}
      </v-alert>

      <!-- ⚡ Auto-connect -->
      <v-switch
        v-if="!isDejaServer"
        v-model="autoConnect"
        color="green"
        label="Auto Connect"
        hide-details
        density="compact"
        class="mt-0"
        @update:model-value="handleAutoConnect"
      />
    </v-card-text>

    <!-- ── Footer ──────────────────────────────────────────────── -->
    <div class="device-manage-card__footer">
      <v-btn
        variant="text"
        :color="deviceColor"
        size="small"
        @click="emit('navigate', device.id)"
      >
        Details
        <v-icon end icon="mdi-arrow-right" />
      </v-btn>

      <v-spacer />

      <template v-if="isDejaServer">
        <v-chip
          :color="isConnected ? 'success' : 'error'"
          size="x-small"
          variant="tonal"
          :prepend-icon="isConnected ? 'mdi-check-circle' : 'mdi-alert-circle'"
        >
          {{ isConnected ? 'Online' : 'Offline' }}
        </v-chip>
      </template>

      <template v-else>
        <v-tooltip
          v-if="!isConnected"
          :disabled="canConnect || connectState === 'connecting'"
          location="top"
          :text="connectDisabledReason"
        >
          <template #activator="{ props: tipProps }">
            <!-- Tooltip needs to wrap the button even when disabled, so we
                 bind tipProps via a span wrapper (v-btn :disabled swallows
                 pointer events on Safari). -->
            <span v-bind="tipProps">
              <v-btn
                :text="connectState === 'connecting' ? 'Connecting…' : 'Connect'"
                :color="deviceColor"
                variant="tonal"
                size="small"
                prepend-icon="mdi-power-plug"
                :loading="connectState === 'connecting'"
                :disabled="!canConnect"
                @click="handleConnect"
              />
            </span>
          </template>
        </v-tooltip>
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
.device-manage-card {
  background: rgba(15, 23, 42, 0.55) !important;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  backdrop-filter: blur(6px);
  box-shadow: 0 12px 30px -24px rgba(56, 189, 248, 0.35);
}

.device-manage-card--connected {
  border-color: rgba(56, 189, 248, 0.28);
  box-shadow: 0 18px 40px -28px rgba(56, 189, 248, 0.55);
}

.device-manage-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.device-manage-card__id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.01em;
}

.device-manage-card__path {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.device-manage-card__footer {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem 0.35rem 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(148, 163, 184, 0.04);
}
</style>
