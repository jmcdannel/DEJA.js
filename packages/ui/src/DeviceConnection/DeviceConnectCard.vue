<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Device } from '@repo/modules'
import { isArduinoFamilyType, isWifiDeviceType, useLayout, useServerStatus } from '@repo/modules'
import StatusPulse from '../animations/StatusPulse.vue'
import TrackPower from '../TrackPower.vue'

interface DeviceConnectCardProps {
  device: Device
  availablePorts: string[]
  serverOnline: boolean
  showDetailsLink?: boolean
  // Server stats (deja-server only)
  serverUptime?: string
  connectedDeviceCount?: number
  totalDeviceCount?: number
  serverVersion?: string
  // Device stats (non-server devices)
  turnoutCount?: number
  effectCount?: number
  trackPower?: boolean | null
}

const props = withDefaults(defineProps<DeviceConnectCardProps>(), {
  showDetailsLink: true,
  serverUptime: '',
  connectedDeviceCount: 0,
  totalDeviceCount: 0,
  serverVersion: '',
  turnoutCount: 0,
  effectCount: 0,
  trackPower: null,
})

const emit = defineEmits<{
  connect: [deviceId: string, serial?: string, topic?: string]
  disconnect: [deviceId: string]
  navigate: [deviceId: string]
  trackPowerToggle: [deviceId: string, newState: boolean]
}>()

const { deviceTypes } = useLayout()
const { serverStatus } = useServerStatus()

const selectedPort = defineModel<string>('selectedPort', { default: '' })

const copied = ref(false)

// 🔌 Prepopulate port from saved device value if it matches available ports
watch(
  () => props.availablePorts,
  (ports) => {
    if (!selectedPort.value && props.device.port && ports.includes(props.device.port)) {
      selectedPort.value = props.device.port
    }
  },
  { immediate: true },
)

// ⚙️ Device config — icon, color, label from useLayout
const deviceConfig = computed(() => deviceTypes.find((dt) => dt.value === props.device.type))

// 🖥️ Is this the DEJA server card?
const isDejaServer = computed(() => props.device.type === 'deja-server')

// ✅ Connection status — server uses serverStatus, devices use device.isConnected
const isConnected = computed(() => {
  if (isDejaServer.value) return serverStatus.value?.online ?? false
  return props.device.isConnected ?? false
})

// 🔌 USB device check — 🛜 deja-esp32-wifi is a member of ARDUINO_FAMILY_TYPES but
// connects over WiFi/MQTT, so the type-based WiFi check must short-circuit the
// firmware-family branch. Explicit `connection: 'wifi'` also wins over stale
// defaults, so devices saved before the auto-default watcher render correctly.
const isUsbDevice = computed(
  () =>
    !isDejaServer.value &&
    props.device.connection !== 'wifi' &&
    !isWifiDeviceType(props.device.type) &&
    (props.device.connection === 'usb' ||
      props.device.type === 'dcc-ex' ||
      isArduinoFamilyType(props.device.type)),
)

// 📡 MQTT/WiFi device check — any WiFi device type OR explicit wifi connection.
const isMqttDevice = computed(
  () =>
    !isDejaServer.value &&
    (props.device.connection === 'wifi' || isWifiDeviceType(props.device.type)),
)

// 🏷️ Human-readable connection type label
const connectionLabel = computed(() => {
  if (isDejaServer.value) return 'Server'
  if (isUsbDevice.value) return 'USB'
  if (isMqttDevice.value) return 'WiFi'
  return 'Unknown'
})

// 📍 Connection path (port, topic, or server IP)
const connectionPath = computed(() => {
  if (isDejaServer.value) return serverStatus.value?.ip ?? ''
  if (props.device.port) return props.device.port
  if (props.device.topic) return props.device.topic
  return ''
})

// 🎨 Left border color based on connection status
const borderColor = computed(() =>
  isConnected.value
    ? 'rgb(var(--v-theme-device-connected))'
    : 'rgb(var(--v-theme-device-disconnected))',
)

// 🚫 Non-server devices are dimmed when server is offline
const isDimmed = computed(() => !isDejaServer.value && !props.serverOnline)

// 🔗 Connect handler — USB passes serial port; MQTT topic is server-generated.
function handleConnect() {
  if (isUsbDevice.value) {
    emit('connect', props.device.id, selectedPort.value, undefined)
  } else {
    emit('connect', props.device.id, undefined, undefined)
  }
}

// 📋 Copy "deja start" to clipboard with brief feedback
async function copyDejaStart() {
  try {
    await navigator.clipboard.writeText('deja start')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Clipboard API may fail in insecure contexts — silent fallback
  }
}
</script>

<template>
  <v-card
    class="device-connect-card"
    :class="{ 'device-connect-card--dimmed': isDimmed }"
    :style="{ borderLeftColor: borderColor }"
    variant="flat"
  >
    <v-card-text class="pa-4">
      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 🖥️ STATE 1 & 2: DEJA SERVER (online / offline)           -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <template v-if="isDejaServer">
        <!-- Top row: avatar + name + status -->
        <div class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2">
          <div
            class="d-flex align-center ga-3 device-connect-card__link"
            @click="emit('navigate', device.id)"
          >
            <v-avatar
              :color="isConnected ? (deviceConfig?.color ?? 'purple') : 'grey'"
              variant="tonal"
              size="44"
              rounded="lg"
              :style="{ opacity: isConnected ? 1 : 0.5 }"
            >
              <v-icon :icon="deviceConfig?.icon ?? 'mdi-laptop'" />
            </v-avatar>
            <div>
              <div
                class="text-subtitle-1 font-weight-bold"
                :class="`text-${isConnected ? (deviceConfig?.color ?? 'purple') : 'grey'}`"
              >
                {{ device.name || 'DEJA Server' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ deviceConfig?.label || 'DEJA Server' }}
              </div>
            </div>
          </div>

          <!-- Status indicator -->
          <div class="text-right">
            <div v-if="isConnected" class="d-flex align-center ga-1">
              <StatusPulse status="connected" size="sm" />
              <span class="text-caption text-success">Online</span>
            </div>
            <div v-else class="d-flex align-center ga-1">
              <StatusPulse status="disconnected" size="sm" />
              <span class="text-caption text-error">Offline</span>
            </div>
          </div>
        </div>

<!-- 🟢 Server ONLINE: stats row -->
        <template v-if="isConnected">
          <div class="d-flex ga-2 flex-wrap mb-3">
            <div v-if="serverUptime" class="device-connect-card__stat">
              <div class="device-connect-card__stat-label">Uptime</div>
              <div class="device-connect-card__stat-value">{{ serverUptime }}</div>
            </div>
            <div
              v-if="totalDeviceCount !== undefined && totalDeviceCount > 0"
              class="device-connect-card__stat"
            >
              <div class="device-connect-card__stat-label">Devices</div>
              <div class="device-connect-card__stat-value">
                {{ connectedDeviceCount }} / {{ totalDeviceCount }}
              </div>
            </div>
            <div v-if="serverVersion" class="device-connect-card__stat">
              <div class="device-connect-card__stat-label">Version</div>
              <div class="device-connect-card__stat-value">{{ serverVersion }}</div>
            </div>
          </div>

          <!-- Details button -->
          <div v-if="showDetailsLink" class="d-flex justify-end">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              @click="emit('navigate', device.id)"
            >
              <v-icon start icon="mdi-cloud" />
              Details
            </v-btn>
          </div>
        </template>

<!-- 🔴 Server OFFLINE: CTA block -->
        <template v-else>
          <v-chip size="small" color="error" variant="tonal" prepend-icon="mdi-server-off" class="mb-3">
            Server Offline
          </v-chip>

          <div class="device-connect-card__server-cta mb-3">
            <div class="text-body-2 text-medium-emphasis mb-2">
              Start the server to connect your devices
            </div>
            <div class="device-connect-card__code">
              <span class="text-body-2 font-weight-bold">deja start</span>
              <v-btn
                size="x-small"
                variant="text"
                :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
                :color="copied ? 'success' : undefined"
                @click="copyDejaStart"
              />
            </div>
            <div v-if="copied" class="text-caption text-success mt-1">Copied!</div>
          </div>

          <!-- Details button still available -->
          <div v-if="showDetailsLink" class="d-flex justify-end">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              @click="emit('navigate', device.id)"
            >
              <v-icon start icon="mdi-cloud" />
              Details
            </v-btn>
          </div>
        </template>
      </template>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 🚂 STATE 5: Device DISCONNECTED (server offline)          -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <template v-else-if="isDimmed">
        <div class="d-flex align-center ga-3">
          <v-avatar
            :color="deviceConfig?.color ?? 'grey'"
            variant="tonal"
            size="40"
            rounded="lg"
            style="opacity: 0.5"
          >
            <v-icon :icon="deviceConfig?.icon ?? 'mdi-devices'" />
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-grey">
              {{ device.name || device.id }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ deviceConfig?.label || device.type }} &middot; {{ connectionLabel }}
            </div>
            <div class="text-caption text-medium-emphasis font-italic mt-1">
              Waiting for server...
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 🟢 STATE 3: Device CONNECTED (server online)              -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <template v-else-if="isConnected">
        <!-- Top row: avatar + name + status -->
        <div class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2">
          <div
            class="d-flex align-center ga-3 device-connect-card__link"
            @click="emit('navigate', device.id)"
          >
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
                {{ device.name || device.id }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ deviceConfig?.label || device.type }} &middot; {{ connectionLabel }}
              </div>
              <div v-if="connectionPath" class="text-caption text-medium-emphasis device-connect-card__path">
                {{ connectionPath }}
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="d-flex align-center ga-1">
              <StatusPulse status="connected" size="sm" />
              <span class="text-caption text-success">Connected</span>
            </div>
          </div>
        </div>

        <!-- Metadata chips -->
        <div class="d-flex justify-space-between align-center flex-wrap ga-2">
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
          </div>

          <!-- Actions -->
          <div class="d-flex align-center ga-2">
            <TrackPower
              v-if="device.type === 'dcc-ex'"
              :power-state="trackPower ?? undefined"
              :is-connected="true"
              @toggle="(newState) => emit('trackPowerToggle', device.id, newState)"
            />
            <v-btn
              size="small"
              variant="tonal"
              color="error"
              @click="emit('disconnect', device.id)"
            >
              Disconnect
            </v-btn>
            <v-btn
              v-if="showDetailsLink"
              size="small"
              variant="tonal"
              color="primary"
              @click="emit('navigate', device.id)"
            >
              <v-icon start icon="mdi-cloud" />
              Details
            </v-btn>
            <v-btn
              v-else
              size="small"
              variant="text"
              color="primary"
              icon="mdi-open-in-new"
              @click="emit('navigate', device.id)"
            />
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 🔴 STATE 4: Device DISCONNECTED (server online)           -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <template v-else>
        <!-- Top row: avatar + name -->
        <div class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2">
          <div
            class="d-flex align-center ga-3 device-connect-card__link"
            @click="emit('navigate', device.id)"
          >
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
                {{ device.name || device.id }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ deviceConfig?.label || device.type }} &middot; {{ connectionLabel }}
              </div>
              <div class="text-caption text-error">
                Disconnected
              </div>
            </div>
          </div>
        </div>

        <!-- Inline connection form -->
        <div class="device-connect-card__connect">
          <!-- 🔌 USB: port dropdown -->
          <v-select
            v-if="isUsbDevice"
            v-model="selectedPort"
            :items="availablePorts"
            label="Select serial port"
            density="compact"
            variant="outlined"
            hide-details
            class="device-connect-card__port-select"
            no-data-text="No ports found — click Refresh Ports"
          />

          <!-- Action buttons -->
          <div class="d-flex ga-2">
            <v-btn
              color="success"
              variant="flat"
              @click="handleConnect"
              :disabled="isUsbDevice && !selectedPort"
            >
              Connect
            </v-btn>
            <v-btn
              v-if="showDetailsLink"
              variant="tonal"
              color="primary"
              @click="emit('navigate', device.id)"
            >
              <v-icon start icon="mdi-cloud" />
              Details
            </v-btn>
            <v-btn
              v-else
              size="small"
              variant="text"
              color="primary"
              icon="mdi-open-in-new"
              @click="emit('navigate', device.id)"
            />
          </div>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.device-connect-card {
  transition: border-color 0.3s ease;
  background: rgba(var(--v-theme-surface), 0.65) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  border-left: 4px solid;
  border-radius: 8px;
}

/* 📊 Stat tiles for server stats */
.device-connect-card__stat {
  flex: 1;
  min-width: 70px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  padding: 6px 8px;
  border-radius: 6px;
  text-align: center;
}

.device-connect-card__stat-label {
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.4;
}

.device-connect-card__stat-value {
  font-size: 0.8125rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

/* 🔗 Clickable name area */
.device-connect-card__link {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.device-connect-card__link:hover {
  opacity: 0.8;
}

/* 🖥️ Monospace path display */
.device-connect-card__path {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420px;
}

/* 🔌 Connection form row */
.device-connect-card__connect {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-connect-card__port-select {
  width: 100%;
}

@media (min-width: 600px) {
  .device-connect-card__connect {
    flex-direction: row;
    align-items: center;
  }

  .device-connect-card__port-select {
    flex: 1;
    max-width: 280px;
  }
}

/* 🚫 Dimmed state for server-offline devices */
.device-connect-card--dimmed {
  opacity: 0.5;
  pointer-events: none;
}

/* 🖥️ Server CTA block */
.device-connect-card__server-cta {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 8px;
  padding: 16px;
}

.device-connect-card__code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  background: rgba(var(--v-theme-on-surface), 0.08);
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
