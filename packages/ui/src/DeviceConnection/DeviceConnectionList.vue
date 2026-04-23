<script setup lang="ts">
import { computed } from 'vue'
import type { Device, Turnout, Effect } from '@repo/modules'
import { useLayout, useTurnouts, useEfx } from '@repo/modules'
import { useDejaJS } from '@repo/deja'
import DeviceConnectCard from './DeviceConnectCard.vue'

interface Props {
  devices?: Device[]
  availablePorts?: string[]
  showHeader?: boolean
  showDetailsLink?: boolean
  serverOnline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  devices: () => [],
  availablePorts: () => [],
  showHeader: true,
  showDetailsLink: true,
  serverOnline: false,
})

const emit = defineEmits<{
  connect: [deviceId: string, serial?: string, topic?: string]
  disconnect: [deviceId: string]
  navigate: [deviceId: string]
  addDevice: []
  trackPowerToggle: [deviceId: string, newState: boolean]
}>()

const { getLayout, getDevices } = useLayout()
const { getTurnouts } = useTurnouts()
const { getEffects } = useEfx()
const { sendDejaCommand } = useDejaJS()

function handleRefreshPorts() {
  sendDejaCommand({ action: 'listPorts', payload: {} })
}

const layout = getLayout()
const layoutDevices = getDevices()

// Use prop devices if provided, otherwise fall back to layout devices
const resolvedDevices = computed(() =>
  props.devices.length > 0
    ? props.devices
    : (layoutDevices?.value as Device[] ?? [])
)

// Fetch all turnouts and effects once during setup (proper VueFire composable usage)
const allTurnouts = getTurnouts()
const allEffects = getEffects()

const trackPower = computed(() => layout?.value?.dccEx?.power ?? null)

const sortedDevices = computed(() => {
  return [...resolvedDevices.value].sort((a, b) => {
    // deja-server always first
    if (a.type === 'deja-server') return -1
    if (b.type === 'deja-server') return 1
    // then connected before disconnected
    const aConnected = a.isConnected ? 0 : 1
    const bConnected = b.isConnected ? 0 : 1
    return aConnected - bConnected
  })
})

// Compute counts from already-loaded collections (no useCollection in render)
const turnoutCountsByDevice = computed(() => {
  const counts = new Map<string, number>()
  for (const t of (allTurnouts.value ?? []) as Turnout[]) {
    if (t.device) counts.set(t.device, (counts.get(t.device) ?? 0) + 1)
  }
  return counts
})

const effectCountsByDevice = computed(() => {
  const counts = new Map<string, number>()
  for (const e of (allEffects.value ?? []) as Effect[]) {
    if (e.device) counts.set(e.device, (counts.get(e.device) ?? 0) + 1)
  }
  return counts
})

function getTurnoutCount(deviceId: string): number {
  return turnoutCountsByDevice.value.get(deviceId) ?? 0
}

function getEffectCount(deviceId: string): number {
  return effectCountsByDevice.value.get(deviceId) ?? 0
}
</script>

<template>
  <div>
    <!-- Header -->
    <div
      v-if="showHeader"
      class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-4 ga-2"
    >
      <h2 class="text-h5 font-weight-bold">Devices</h2>
      <div class="d-flex ga-2">
        <v-btn
          variant="tonal"
          size="small"
          :disabled="!serverOnline"
          @click="handleRefreshPorts"
        >
          <v-icon start icon="mdi-refresh" />
          Refresh Ports
        </v-btn>
        <v-btn
          variant="tonal"
          color="primary"
          size="small"
          @click="emit('addDevice')"
        >
          <v-icon start icon="mdi-plus" />
          Add Device
        </v-btn>
      </div>
    </div>

    <!-- Refresh Ports (always visible when no header) -->
    <div v-if="!showHeader" class="d-flex justify-end mb-3">
      <v-btn
        variant="tonal"
        size="small"
        :disabled="!serverOnline"
        @click="handleRefreshPorts"
      >
        <v-icon start icon="mdi-refresh" />
        Refresh Ports
      </v-btn>
    </div>

    <!-- Device cards -->
    <DeviceConnectCard
      v-for="device in sortedDevices"
      :key="device.id"
      class="mb-2"
      :device="device"
      :available-ports="availablePorts"
      :server-online="serverOnline"
      :show-details-link="showDetailsLink"
      :turnout-count="getTurnoutCount(device.id)"
      :effect-count="getEffectCount(device.id)"
      :track-power="device.type === 'dcc-ex' ? trackPower : null"
      @connect="(id, serial, topic) => emit('connect', id, serial, topic)"
      @disconnect="(id) => emit('disconnect', id)"
      @navigate="(id) => emit('navigate', id)"
      @track-power-toggle="(id, state) => emit('trackPowerToggle', id, state)"
    />

    <!-- Empty state -->
    <v-card
      v-if="resolvedDevices.length === 0"
      variant="tonal"
      class="text-center pa-8"
    >
      <v-icon icon="mdi-devices" size="48" color="primary" class="mb-4" />
      <div class="text-h6 mb-2">No devices configured</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        Add a DCC-EX command station or DEJA device to get started
      </div>
      <v-btn color="primary" variant="flat" @click="emit('addDevice')">
        <v-icon start icon="mdi-plus" />
        Add Device
      </v-btn>
    </v-card>
  </div>
</template>
