# Cloud Dashboard Homepage Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Cloud app homepage into a two-column dashboard with rich device tiles, a sidebar with quick connect and layout info, and a guided empty state for new users.

**Architecture:** New presentational components in `@repo/ui` (DeviceTile, QuickConnectPanel, LayoutInfoCard, DashboardEmptyState) consumed by the cloud app's Dashboard.vue. DeviceConnectionList gains a `tileMode` prop to render DeviceTile instead of DeviceConnectionCard. All QuickStart instances unify to a 3-step flow.

**Tech Stack:** Vue 3 (`<script setup lang="ts">`), Vuetify 3, Tailwind CSS, Firebase/Vuefire, `@repo/modules` composables

**Spec:** `docs/superpowers/specs/2026-03-19-cloud-dashboard-homepage-redesign.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/modules/layouts/types.ts` | Modify | Add `color`/`image` to `DeviceType` interface |
| `packages/ui/src/Dashboard/DeviceTile.vue` | Create | Rich device card with embedded per-device stats |
| `packages/ui/src/Dashboard/QuickConnectPanel.vue` | Create | Sidebar quick connect widget |
| `packages/ui/src/Dashboard/LayoutInfoCard.vue` | Create | Layout identity + server connection URL |
| `packages/ui/src/Dashboard/DashboardEmptyState.vue` | Create | New user welcome stepper |
| `packages/ui/src/Dashboard/index.ts` | Modify | Export new components |
| `packages/ui/src/index.ts` | Modify | Export new components |
| `packages/ui/src/DeviceConnection/DeviceConnectionList.vue` | Modify | Add `tileMode`, sort deja-server first |
| `packages/ui/src/QuickStart/QuickStart.vue` | Modify | Unify to 3-step flow with prerequisite |
| `apps/cloud/src/Dashboard/Dashboard.vue` | Modify | Two-column layout, wire everything up |
| `apps/cloud/src/views/SetupComplete.vue` | Modify | Align to unified 3-step flow |

---

### Task 1: Fix DeviceType Interface

**Files:**
- Modify: `packages/modules/layouts/types.ts:82-86`

- [ ] **Step 1: Add missing fields to DeviceType**

In `packages/modules/layouts/types.ts`, change:

```typescript
export interface DeviceType {
  value: string
  label: string
  icon: string
}
```

to:

```typescript
export interface DeviceType {
  value: string
  label: string
  icon: string
  color?: string
  image?: string
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter=@repo/modules check-types 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/modules/layouts/types.ts
git commit -m "fix: add color and image fields to DeviceType interface"
```

---

### Task 2: Create DeviceTile Component

**Files:**
- Create: `packages/ui/src/Dashboard/DeviceTile.vue`

- [ ] **Step 1: Create DeviceTile.vue**

Create the full component at `packages/ui/src/Dashboard/DeviceTile.vue`:

```vue
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
  background: rgba(15, 23, 42, 0.65) !important;
  border: 1px solid rgba(148, 163, 184, 0.15);
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
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
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
  }
}
</style>
```

- [ ] **Step 2: Type-check**

Run: `pnpm check-types 2>&1 | tail -5`
Expected: No errors in DeviceTile.vue

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/Dashboard/DeviceTile.vue
git commit -m "feat(ui): add DeviceTile rich device card component"
```

---

### Task 3: Create QuickConnectPanel Component

**Files:**
- Create: `packages/ui/src/Dashboard/QuickConnectPanel.vue`

- [ ] **Step 1: Create QuickConnectPanel.vue**

Create the component at `packages/ui/src/Dashboard/QuickConnectPanel.vue`:

```vue
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
    <v-card-text class="pa-3">
      <!-- All connected state -->
      <div v-if="allConnected" class="d-flex align-center justify-center ga-2 pa-2">
        <StatusPulse status="connected" size="sm" />
        <div>
          <div class="text-caption text-success font-weight-bold">All devices connected</div>
          <div class="text-caption text-medium-emphasis">
            {{ connectedCount }} of {{ devices.length }} online
          </div>
        </div>
      </div>

      <!-- Has disconnected devices -->
      <template v-else-if="disconnectedDevices.length > 0">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-overline text-medium-emphasis">Quick Connect</div>
          <v-chip size="x-small" color="error" variant="tonal">
            {{ disconnectedDevices.length }} offline
          </v-chip>
        </div>

        <div
          v-for="device in disconnectedDevices"
          :key="device.id"
          class="quick-connect-panel__row"
        >
          <div class="d-flex align-center ga-2 mb-1">
            <v-avatar
              :color="getDeviceConfig(device.type)?.color ?? 'grey'"
              variant="tonal"
              size="24"
              rounded="lg"
            >
              <v-icon :icon="getDeviceConfig(device.type)?.icon ?? 'mdi-devices'" size="14" />
            </v-avatar>
            <span
              class="text-caption font-weight-bold"
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
              class="flex-grow-1"
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
              class="flex-grow-1"
            />
            <v-btn
              size="small"
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
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.quick-connect-panel__row {
  padding: 8px 0;
}

.quick-connect-panel__row + .quick-connect-panel__row {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
```

- [ ] **Step 2: Type-check**

Run: `pnpm check-types 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/Dashboard/QuickConnectPanel.vue
git commit -m "feat(ui): add QuickConnectPanel sidebar widget"
```

---

### Task 4: Create LayoutInfoCard Component

**Files:**
- Create: `packages/ui/src/Dashboard/LayoutInfoCard.vue`

- [ ] **Step 1: Create LayoutInfoCard.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  layoutName?: string
  layoutId: string
  serverIp?: string | null
  wsPort?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  layoutName: undefined,
  serverIp: null,
  wsPort: 8082,
})

const connectionUrl = computed(() => {
  if (!props.serverIp) return null
  return `ws://${props.serverIp}:${props.wsPort}`
})
</script>

<template>
  <v-card variant="flat" class="layout-info-card mb-3">
    <v-card-text class="pa-3">
      <div class="text-overline text-medium-emphasis mb-2">Layout</div>
      <div class="text-subtitle-2 font-weight-bold text-high-emphasis mb-1">
        {{ layoutName || 'Unnamed Layout' }}
      </div>
      <div class="text-caption text-medium-emphasis font-mono mb-3">
        ID: {{ layoutId }}
      </div>

      <div class="text-caption text-medium-emphasis mb-1">Server Connection</div>
      <div v-if="connectionUrl" class="layout-info-card__url">
        <code class="text-caption">{{ connectionUrl }}</code>
      </div>
      <div v-else class="text-caption text-medium-emphasis">—</div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.layout-info-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.layout-info-card__url {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  padding: 4px 8px;
  font-family: 'Roboto Mono', 'Fira Code', monospace;
}

.font-mono {
  font-family: 'Roboto Mono', 'Fira Code', monospace;
}
</style>
```

- [ ] **Step 2: Type-check**

Run: `pnpm check-types 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/Dashboard/LayoutInfoCard.vue
git commit -m "feat(ui): add LayoutInfoCard sidebar widget"
```

---

### Task 5: Create DashboardEmptyState Component

**Files:**
- Create: `packages/ui/src/Dashboard/DashboardEmptyState.vue`

- [ ] **Step 1: Create DashboardEmptyState.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import ServerSetupInfo from '../ServerSetupInfo.vue'

interface Props {
  completed?: number[]
  uid?: string | null
  layoutId?: string
  serverOnline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  completed: () => [],
  uid: undefined,
  layoutId: undefined,
  serverOnline: false,
})

const emit = defineEmits<{
  addLoco: [address: number, name: string]
}>()

const isComplete = (step: number) => props.completed.includes(step)

// Step 2 auto-completes when server is online
const step2Complete = computed(() => isComplete(2) || props.serverOnline)

// Step 3 active when server is online
const step3Active = computed(() => step2Complete.value)

// Quick-add loco form state
const locoAddress = ref('')
const locoName = ref('')
const locoAdded = ref(false)

function handleAddLoco() {
  const address = parseInt(locoAddress.value)
  if (!address || address < 1) return
  emit('addLoco', address, locoName.value || `Loco ${address}`)
  locoAdded.value = true
}

function addAnother() {
  locoAddress.value = ''
  locoName.value = ''
  locoAdded.value = false
}

const ctaLinks = [
  { label: 'Docs', url: 'https://docs.dejajs.com' },
  { label: 'DEJA IO', url: 'https://dejajs.com/io' },
  { label: 'Help', url: 'https://dejajs.com/help' },
  { label: 'FAQ', url: 'https://dejajs.com/faq' },
]
</script>

<template>
  <div class="empty-state">
    <!-- Welcome header -->
    <div class="text-center mb-7">
      <v-icon icon="mdi-train" size="48" color="primary" class="mb-3" />
      <h2 class="text-h5 font-weight-bold text-high-emphasis mb-1">Welcome to DEJA Cloud</h2>
      <p class="text-body-2 text-medium-emphasis mx-auto" style="max-width: 360px">
        Your layout control center. Let's get your railroad connected in a few quick steps.
      </p>
    </div>

    <!-- Prerequisite note -->
    <div class="empty-state__prereq mb-5">
      <v-icon icon="mdi-usb-port" size="16" class="mr-2 text-medium-emphasis" />
      <span class="text-caption text-medium-emphasis">
        Make sure your DCC-EX CommandStation is connected to your computer via USB before installing the server.
      </span>
    </div>

    <!-- Steps -->
    <div class="empty-state__steps">
      <!-- Step 1: Create account -->
      <div class="empty-state__step">
        <div class="empty-state__track">
          <div class="empty-state__circle empty-state__circle--complete">
            <v-icon icon="mdi-check" size="14" />
          </div>
          <div class="empty-state__connector empty-state__connector--complete" />
        </div>
        <div class="empty-state__content empty-state__content--done">
          <p class="empty-state__title">Create your account</p>
          <p class="empty-state__desc">You're signed in — nice!</p>
        </div>
      </div>

      <!-- Step 2: Install server -->
      <div class="empty-state__step">
        <div class="empty-state__track">
          <div
            class="empty-state__circle"
            :class="step2Complete ? 'empty-state__circle--complete' : 'empty-state__circle--active'"
          >
            <v-icon v-if="step2Complete" icon="mdi-check" size="14" />
            <span v-else>2</span>
          </div>
          <div
            class="empty-state__connector"
            :class="step2Complete ? 'empty-state__connector--complete' : ''"
          />
        </div>
        <div
          class="empty-state__content"
          :class="{ 'empty-state__content--done': step2Complete }"
        >
          <p class="empty-state__title">Install the DEJA Server</p>
          <p class="empty-state__desc">Run on Raspberry Pi, Mac, or Linux</p>
          <ServerSetupInfo v-if="!step2Complete" :uid="uid" :layout-id="layoutId" />
          <p v-else class="empty-state__hint">Server connected!</p>
        </div>
      </div>

      <!-- Step 3: Run first train -->
      <div class="empty-state__step">
        <div class="empty-state__track">
          <div
            class="empty-state__circle"
            :class="
              step3Active
                ? 'empty-state__circle--active'
                : 'empty-state__circle--pending'
            "
          >
            <span>3</span>
          </div>
        </div>
        <div
          class="empty-state__content"
          :class="{ 'empty-state__content--pending': !step3Active }"
        >
          <p class="empty-state__title">Run your first train</p>
          <p class="empty-state__desc">Add a locomotive and open the Throttle app</p>

          <template v-if="step3Active">
            <div v-if="!locoAdded" class="mt-3">
              <div class="d-flex ga-3 mb-3 flex-wrap">
                <v-text-field
                  v-model="locoAddress"
                  label="DCC Address"
                  placeholder="3"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="max-width: 120px"
                  @keydown.enter="handleAddLoco"
                />
                <v-text-field
                  v-model="locoName"
                  label="Name (optional)"
                  placeholder="My Engine"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="flex-grow-1"
                  @keydown.enter="handleAddLoco"
                />
              </div>
              <v-btn
                color="primary"
                variant="flat"
                size="small"
                prepend-icon="mdi-plus"
                :disabled="!locoAddress"
                @click="handleAddLoco"
              >
                Add Locomotive
              </v-btn>
            </div>

            <div v-else class="mt-3">
              <v-alert type="success" variant="tonal" density="compact" class="mb-3">
                Locomotive {{ locoAddress }} added to your roster!
              </v-alert>
              <div class="d-flex ga-2 flex-wrap">
                <v-btn
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addAnother"
                >
                  Add Another
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  size="small"
                  href="https://throttle.dejajs.com"
                  target="_blank"
                  prepend-icon="mdi-speedometer"
                >
                  Open Throttle
                </v-btn>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Resource links -->
    <div class="empty-state__links">
      <a
        v-for="link in ctaLinks"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="empty-state__link"
      >{{ link.label }}</a>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  max-width: 520px;
  margin: 0 auto;
  padding: 24px 0;
}

.empty-state__prereq {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 8px 12px;
}

.empty-state__steps {
  display: flex;
  flex-direction: column;
}

.empty-state__step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.empty-state__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.empty-state__circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: background-color 300ms ease, border-color 300ms ease, color 300ms ease;
}

.empty-state__circle--active {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.empty-state__circle--pending {
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
  color: rgba(148, 163, 184, 0.5);
}

.empty-state__circle--complete {
  background-color: rgb(var(--v-theme-success));
  color: #fff;
}

.empty-state__connector {
  width: 1px;
  height: 4rem;
  margin-top: 4px;
  background-color: rgba(var(--v-theme-primary), 0.2);
  transition: background-color 300ms ease;
}

.empty-state__connector--complete {
  background-color: rgba(var(--v-theme-success), 0.25);
}

.empty-state__content {
  flex: 1;
  padding-top: 3px;
  padding-bottom: 16px;
  transition: opacity 300ms ease;
}

.empty-state__content--done {
  opacity: 0.55;
}

.empty-state__content--pending {
  opacity: 0.4;
}

.empty-state__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 2px;
}

.empty-state__content--done .empty-state__title {
  text-decoration: line-through;
  text-decoration-color: rgba(148, 163, 184, 0.4);
}

.empty-state__desc {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.7);
  margin-bottom: 8px;
}

.empty-state__hint {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.5);
  font-style: italic;
}

.empty-state__links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  margin-top: 8px;
  justify-content: center;
}

.empty-state__link {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  transition: color 150ms ease;
}

.empty-state__link:hover {
  color: #bae6fd;
  text-decoration: underline;
}
</style>
```

- [ ] **Step 2: Type-check**

Run: `pnpm check-types 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/Dashboard/DashboardEmptyState.vue
git commit -m "feat(ui): add DashboardEmptyState welcome stepper"
```

---

### Task 6: Export New Components

**Files:**
- Modify: `packages/ui/src/Dashboard/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Update Dashboard/index.ts**

In `packages/ui/src/Dashboard/index.ts`, add exports after the existing ones:

```typescript
export { default as DeviceTile } from './DeviceTile.vue'
export { default as QuickConnectPanel } from './QuickConnectPanel.vue'
export { default as LayoutInfoCard } from './LayoutInfoCard.vue'
export { default as DashboardEmptyState } from './DashboardEmptyState.vue'
```

- [ ] **Step 2: Update packages/ui/src/index.ts**

In `packages/ui/src/index.ts`, find the dashboard exports line:

```typescript
export { SystemOverviewStats, CommandActivityChart, DeviceConnectionChart } from './Dashboard'
```

Change to:

```typescript
export { SystemOverviewStats, CommandActivityChart, DeviceConnectionChart, DeviceTile, QuickConnectPanel, LayoutInfoCard, DashboardEmptyState } from './Dashboard'
```

- [ ] **Step 3: Type-check**

Run: `pnpm check-types 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Dashboard/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): export new dashboard components"
```

---

### Task 7: Update DeviceConnectionList — Sort + TileMode

**Files:**
- Modify: `packages/ui/src/DeviceConnection/DeviceConnectionList.vue`

- [ ] **Step 1: Add tileMode prop and server stat props**

In `packages/ui/src/DeviceConnection/DeviceConnectionList.vue`, update the `Props` interface and add the import:

Add `DeviceTile` import at the top of `<script setup>`:

```typescript
import DeviceTile from '../Dashboard/DeviceTile.vue'
```

Update the `Props` interface:

```typescript
interface Props {
  devices: Device[]
  availablePorts: string[]
  availableTopics?: string[]
  linkMode: 'page' | 'modal'
  showHeader?: boolean
  tileMode?: boolean
  serverUptime?: string
  connectedDeviceCount?: number
  totalDeviceCount?: number
  commandCount?: number
}
```

Update `withDefaults`:

```typescript
const props = withDefaults(defineProps<Props>(), {
  availableTopics: () => [],
  showHeader: true,
  tileMode: false,
  serverUptime: '',
  connectedDeviceCount: 0,
  totalDeviceCount: 0,
  commandCount: 0,
})
```

- [ ] **Step 2: Update sortedDevices to put deja-server first**

Replace the `sortedDevices` computed:

```typescript
const sortedDevices = computed(() => {
  return [...props.devices].sort((a, b) => {
    // deja-server always first
    if (a.type === 'deja-server') return -1
    if (b.type === 'deja-server') return 1
    // then connected before disconnected
    const aConnected = a.isConnected ? 0 : 1
    const bConnected = b.isConnected ? 0 : 1
    return aConnected - bConnected
  })
})
```

- [ ] **Step 3: Update template to conditionally render DeviceTile**

In the template, replace the `DeviceConnectionCard` `v-for` block (lines 87–101) with:

```html
    <!-- Device cards / tiles -->
    <template v-if="tileMode">
      <DeviceTile
        v-for="device in sortedDevices"
        :key="device.id"
        :device="device"
        :available-ports="availablePorts"
        :available-topics="availableTopics"
        :turnout-count="getTurnoutCount(device.id)"
        :effect-count="getEffectCount(device.id)"
        :track-power="device.type === 'dcc-ex' ? trackPower : null"
        :server-uptime="device.type === 'deja-server' ? serverUptime : undefined"
        :connected-device-count="device.type === 'deja-server' ? connectedDeviceCount : undefined"
        :total-device-count="device.type === 'deja-server' ? totalDeviceCount : undefined"
        :command-count="device.type === 'deja-server' ? commandCount : undefined"
        @connect="(id, serial, topic) => emit('connect', id, serial, topic)"
        @disconnect="(id) => emit('disconnect', id)"
        @reconnect="(id) => emit('reconnect', id)"
        @navigate="(id) => emit('navigate', id)"
      />
    </template>
    <template v-else>
      <DeviceConnectionCard
        v-for="device in sortedDevices"
        :key="device.id"
        :device="device"
        :available-ports="availablePorts"
        :available-topics="availableTopics"
        :link-mode="linkMode"
        :turnout-count="getTurnoutCount(device.id)"
        :effect-count="getEffectCount(device.id)"
        :track-power="device.type === 'dcc-ex' ? trackPower : null"
        @connect="(id, serial, topic) => emit('connect', id, serial, topic)"
        @disconnect="(id) => emit('disconnect', id)"
        @reconnect="(id) => emit('reconnect', id)"
        @navigate="(id) => emit('navigate', id)"
      />
    </template>
```

- [ ] **Step 4: Type-check**

Run: `pnpm check-types 2>&1 | tail -10`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/DeviceConnection/DeviceConnectionList.vue
git commit -m "feat(ui): add tileMode to DeviceConnectionList, sort deja-server first"
```

---

### Task 8: Rewrite Dashboard.vue — Two-Column Layout

**Files:**
- Modify: `apps/cloud/src/Dashboard/Dashboard.vue`

- [ ] **Step 1: Update imports**

Replace the imports section of `Dashboard.vue`:

```typescript
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useLayout, useServerStatus, useLocos } from '@repo/modules'
import { useDejaJS } from '@repo/deja'
import {
  DeviceConnectionList,
  CommandActivityChart,
  QuickConnectPanel,
  LayoutInfoCard,
  DashboardEmptyState,
  ThrottleLaunchQR,
} from '@repo/ui'
import { ref as rtdbRef, onValue, off } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { useStorage } from '@vueuse/core'
import { formatUptime } from '@repo/utils'
import { useCommandActivity } from '@/composables/useCommandActivity'
```

- [ ] **Step 2: Update script logic**

Replace everything between the imports and `</script>` with:

```typescript
const router = useRouter()
const user = useCurrentUser()
const { getDevices, getLayout, connectDevice, disconnectDevice } = useLayout()
const { sendDejaCommand } = useDejaJS()
const { serverStatus } = useServerStatus()
const { createLoco } = useLocos()

// Device data
const devices = getDevices()
const layout = getLayout()

// Port list from RTDB
const ports = ref<string[]>([])
const layoutId = useStorage('@DEJA/layoutId', '')
const wsPort = import.meta.env.VITE_WS_PORT || '8082'

let unsubPorts: (() => void) | null = null

onMounted(() => {
  sendDejaCommand({ action: 'listPorts', payload: {} })

  if (layoutId.value) {
    const portRef = rtdbRef(rtdb, `portList/${layoutId.value}`)
    onValue(portRef, (snapshot) => {
      const val = snapshot.val()
      if (Array.isArray(val)) {
        ports.value = val
      }
    })
    unsubPorts = () => off(portRef)
  }
})

onUnmounted(() => {
  unsubPorts?.()
})

// Command activity
const wsMessages = ref<{ action: string; payload?: unknown }[]>([])
const { activity: commandActivity } = useCommandActivity(wsMessages)

// Computed
const serverUptime = computed(() => {
  if (!serverStatus.value?.online || !serverStatus.value?.lastSeen) return ''
  return formatUptime(serverStatus.value.lastSeen)
})

const trackPower = computed(() => layout?.value?.dccEx?.power ?? null)
const connectedCount = computed(() => devices.value?.filter((d) => d.isConnected).length ?? 0)
const totalCommandCount = computed(() =>
  commandActivity.value.reduce((sum, b) => sum + b.count, 0),
)

// Empty state
const showEmptyState = computed(() => !devices.value || devices.value.length === 0)
const emptyStateSteps = computed(() => {
  const steps: number[] = [1] // Always signed in
  if (serverStatus.value?.online) steps.push(2)
  return steps
})

// Event handlers
async function handleConnect(deviceId: string, serial?: string, topic?: string) {
  const device = devices.value?.find((d) => d.id === deviceId)
  if (!device) return
  await connectDevice(device, serial, topic)
}

async function handleDisconnect(deviceId: string) {
  await disconnectDevice(deviceId)
}

async function handleReconnect(deviceId: string) {
  const device = devices.value?.find((d) => d.id === deviceId)
  if (!device) return
  await disconnectDevice(deviceId)
  setTimeout(async () => {
    await connectDevice(device, device.port, device.topic)
  }, 1000)
}

function navigateToDevice(deviceId: string) {
  router.push({ name: 'DeviceDetails', params: { deviceId } })
}

function refreshPorts() {
  sendDejaCommand({ action: 'listPorts', payload: {} })
}

function navigateToAddDevice() {
  router.push({ name: 'Devices' })
}

async function handleAddLoco(address: number, name: string) {
  await createLoco(address, name, undefined, true)
}
```

- [ ] **Step 3: Replace the template**

Replace the entire `<template>` block:

```html
<template>
  <v-container fluid class="pa-4 pa-md-6">
    <!-- Empty State -->
    <DashboardEmptyState
      v-if="showEmptyState"
      :completed="emptyStateSteps"
      :uid="user?.uid"
      :layout-id="layoutId"
      :server-online="serverStatus?.online ?? false"
      @add-loco="handleAddLoco"
    />

    <!-- Active Dashboard -->
    <v-row v-else>
      <!-- Left Column: Devices -->
      <v-col cols="12" md="8">
        <DeviceConnectionList
          :devices="devices ?? []"
          :available-ports="ports"
          tile-mode
          link-mode="page"
          :server-uptime="serverUptime"
          :connected-device-count="connectedCount"
          :total-device-count="devices?.length ?? 0"
          :command-count="totalCommandCount"
          @connect="handleConnect"
          @disconnect="handleDisconnect"
          @reconnect="handleReconnect"
          @navigate="navigateToDevice"
          @refresh-ports="refreshPorts"
          @add-device="navigateToAddDevice"
        />
      </v-col>

      <!-- Right Column: Sidebar -->
      <v-col cols="12" md="4" class="d-flex flex-column ga-3">
        <QuickConnectPanel
          :devices="devices ?? []"
          :available-ports="ports"
          @connect="handleConnect"
        />

        <LayoutInfoCard
          :layout-name="layout?.name"
          :layout-id="layoutId"
          :server-ip="serverStatus?.ip"
          :ws-port="wsPort"
        />

        <CommandActivityChart :data="commandActivity" />

        <v-card variant="flat" class="pa-3 text-center" style="background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
          <div class="text-overline text-medium-emphasis mb-2">Launch Throttle</div>
          <div class="d-flex justify-center">
            <ThrottleLaunchQR :size="100" label="Scan to open on mobile" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
```

- [ ] **Step 4: Type-check**

Run: `pnpm check-types 2>&1 | tail -10`
Expected: No errors

- [ ] **Step 5: Visual verification**

Run: `pnpm --filter=deja-cloud dev`
Open http://localhost:3011 and verify:
- Two-column layout on desktop
- Server status bar is gone
- deja-server is first in device list
- Sidebar shows Quick Connect, Layout Info, Activity chart, QR code
- If no devices: empty state stepper appears

- [ ] **Step 6: Commit**

```bash
git add apps/cloud/src/Dashboard/Dashboard.vue
git commit -m "feat(cloud): redesign dashboard with two-column layout, rich tiles, and empty state"
```

---

### Task 9: Unify QuickStart Component

**Files:**
- Modify: `packages/ui/src/QuickStart/QuickStart.vue`

- [ ] **Step 1: Update script section**

Replace the `<script setup>` block in `packages/ui/src/QuickStart/QuickStart.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import ServerSetupInfo from '../ServerSetupInfo.vue'

interface Props {
  completed?: number[]
  uid?: string | null
  layoutId?: string
  serverOnline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  completed: () => [],
  uid: undefined,
  layoutId: undefined,
  serverOnline: false,
})

const emit = defineEmits<{
  addLoco: [address: number, name: string]
}>()

const isComplete = (step: number) => props.completed.includes(step)
const step2Complete = computed(() => isComplete(2) || props.serverOnline)
const step3Active = computed(() => step2Complete.value)

// Quick-add loco form
const locoAddress = ref('')
const locoName = ref('')
const locoAdded = ref(false)

function handleAddLoco() {
  const address = parseInt(locoAddress.value)
  if (!address || address < 1) return
  emit('addLoco', address, locoName.value || `Loco ${address}`)
  locoAdded.value = true
}

function addAnother() {
  locoAddress.value = ''
  locoName.value = ''
  locoAdded.value = false
}

const ctaLinks = [
  { label: 'Docs', url: 'https://docs.dejajs.com' },
  { label: 'DEJA IO', url: 'https://dejajs.com/io' },
  { label: 'Help', url: 'https://dejajs.com/help' },
  { label: 'FAQ', url: 'https://dejajs.com/faq' },
]
</script>
```

- [ ] **Step 2: Replace the template**

Replace the `<template>` block:

```html
<template>
  <div class="quick-start">
    <p class="quick-start__section-label">Quick Start</p>

    <!-- Prerequisite note -->
    <div class="quick-start__prereq">
      <v-icon icon="mdi-usb-port" size="16" class="mr-2" style="opacity: 0.5" />
      <span>Make sure your DCC-EX CommandStation is connected via USB.</span>
    </div>

    <!-- Step 1: Register -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="isComplete(1) ? 'quick-start__circle--complete' : 'quick-start__circle--active'"
        >
          <span>{{ isComplete(1) ? '✓' : '1' }}</span>
        </div>
        <div
          class="quick-start__connector"
          :class="isComplete(1) ? 'quick-start__connector--complete' : ''"
        />
      </div>
      <div class="quick-start__content" :class="{ 'quick-start__content--done': isComplete(1) }">
        <p class="quick-start__title">Create your account</p>
        <p class="quick-start__desc">Sign up at DEJA Cloud to get your Layout ID</p>
        <p v-if="isComplete(1)" class="quick-start__hint">You're already registered</p>
      </div>
    </div>

    <!-- Step 2: Install -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="
            step2Complete
              ? 'quick-start__circle--complete'
              : isComplete(1)
                ? 'quick-start__circle--active'
                : 'quick-start__circle--pending'
          "
        >
          <span>{{ step2Complete ? '✓' : '2' }}</span>
        </div>
        <div
          class="quick-start__connector"
          :class="step2Complete ? 'quick-start__connector--complete' : ''"
        />
      </div>
      <div class="quick-start__content" :class="{ 'quick-start__content--done': step2Complete }">
        <p class="quick-start__title">Install the server</p>
        <p class="quick-start__desc">Run on Raspberry Pi, Mac, or Linux</p>
        <ServerSetupInfo v-if="!step2Complete" :uid="uid" :layout-id="layoutId" />
        <p v-else class="quick-start__hint">Server connected!</p>
      </div>
    </div>

    <!-- Step 3: Run first train -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="step3Active ? 'quick-start__circle--active' : 'quick-start__circle--pending'"
        >
          <span>3</span>
        </div>
      </div>
      <div
        class="quick-start__content"
        :class="{ 'quick-start__content--done': false, 'quick-start__content--pending': !step3Active }"
      >
        <p class="quick-start__title">Run your first train</p>
        <p class="quick-start__desc">Add a locomotive and open the Throttle app</p>

        <template v-if="step3Active">
          <div v-if="!locoAdded" class="quick-start__loco-form">
            <div class="d-flex ga-2 mb-2 flex-wrap">
              <v-text-field
                v-model="locoAddress"
                label="DCC Address"
                placeholder="3"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 110px"
                @keydown.enter="handleAddLoco"
              />
              <v-text-field
                v-model="locoName"
                label="Name (optional)"
                placeholder="My Engine"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
                @keydown.enter="handleAddLoco"
              />
            </div>
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              prepend-icon="mdi-plus"
              :disabled="!locoAddress"
              @click="handleAddLoco"
            >
              Add Locomotive
            </v-btn>
          </div>
          <div v-else>
            <v-alert type="success" variant="tonal" density="compact" class="mb-2">
              Locomotive {{ locoAddress }} added!
            </v-alert>
            <div class="d-flex ga-2">
              <v-btn variant="tonal" size="small" prepend-icon="mdi-plus" @click="addAnother">
                Add Another
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                size="small"
                href="https://throttle.dejajs.com"
                target="_blank"
                prepend-icon="mdi-speedometer"
              >
                Open Throttle
              </v-btn>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- CTA links -->
    <div class="quick-start__links">
      <a
        v-for="link in ctaLinks"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="quick-start__link"
      >{{ link.label }}</a>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Add prerequisite and pending CSS**

Add to the existing `<style scoped>` block (keep all existing styles, add these):

```css
.quick-start__prereq {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 1.25rem;
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.6);
}

.quick-start__content--pending {
  opacity: 0.4;
}

.quick-start__loco-form {
  margin-top: 8px;
}
```

- [ ] **Step 4: Type-check**

Run: `pnpm check-types 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/QuickStart/QuickStart.vue
git commit -m "feat(ui): unify QuickStart to 3-step flow with prerequisite note"
```

---

### Task 10: Align SetupComplete to Unified Flow

**Files:**
- Modify: `apps/cloud/src/views/SetupComplete.vue`

- [ ] **Step 1: Add serverStatus import and computed**

In the `<script setup>` of `SetupComplete.vue`, add the import:

```typescript
import { useServerStatus } from '@repo/modules'
```

Add after the existing composable calls:

```typescript
const { serverStatus } = useServerStatus()
```

Add a computed for completed steps:

```typescript
const quickStartCompleted = computed(() => {
  const steps: number[] = [1] // Always registered on this page
  if (serverStatus.value?.online) steps.push(2)
  return steps
})
```

- [ ] **Step 2: Update QuickStart usage in template**

Find the QuickStart usage in the template:

```html
<QuickStart :completed="[1]" :uid="user?.uid" :layout-id="primaryLayoutId" />
```

Replace with:

```html
<QuickStart
  :completed="quickStartCompleted"
  :uid="user?.uid"
  :layout-id="primaryLayoutId"
  :server-online="serverStatus?.online ?? false"
  @add-loco="handleAddLoco"
/>
```

- [ ] **Step 3: Wire handleAddLoco to QuickStart event**

The existing `handleAddLoco` function in `SetupComplete.vue` already calls `createLoco(address, name)`. However, its signature takes values from local refs. Add a handler that bridges the event:

```typescript
async function handleQuickStartAddLoco(address: number, name: string) {
  locoAddress.value = String(address)
  locoName.value = name
  await handleAddLoco()
}
```

Then update the template to use `@add-loco="handleQuickStartAddLoco"`.

Note: The existing "Quick Add Loco" section above QuickStart stays as-is — it provides a more prominent loco form on this specific page. The QuickStart step 3 provides it in the stepper context. Both work and don't conflict.

- [ ] **Step 4: Type-check**

Run: `pnpm check-types 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/views/SetupComplete.vue
git commit -m "feat(cloud): align SetupComplete to unified 3-step QuickStart flow"
```

---

### Task 11: Final Lint + Type Check

- [ ] **Step 1: Lint all changed packages**

Run: `pnpm lint`
Fix any lint errors.

- [ ] **Step 2: Full type check**

Run: `pnpm check-types`
Expected: No errors

- [ ] **Step 3: Commit any lint fixes**

```bash
git add -A
git commit -m "chore: lint fixes for dashboard redesign"
```
