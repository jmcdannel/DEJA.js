<script setup lang="ts">
import { computed } from 'vue'
import type { Device, Turnout, Effect } from '@repo/modules'
import { useLayout, useTurnouts, useEfx } from '@repo/modules'
import DeviceConnectionCard from './DeviceConnectionCard.vue'
import DeviceTile from '../Dashboard/DeviceTile.vue'

interface Props {
  devices: Device[]
  availablePorts: string[]
  availableTopics?: string[]
  linkMode: 'page' | 'modal'
  showHeader?: boolean
  tileMode?: boolean
  serverOnline?: boolean
  serverUptime?: string
  connectedDeviceCount?: number
  totalDeviceCount?: number
  commandCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  availableTopics: () => [],
  showHeader: true,
  tileMode: false,
  serverOnline: false,
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
  refreshPorts: []
  addDevice: []
}>()

const { getLayout } = useLayout()
const { getTurnouts } = useTurnouts()
const { getEffects } = useEfx()

const layout = getLayout()

// Fetch all turnouts and effects once during setup (proper VueFire composable usage)
const allTurnouts = getTurnouts()
const allEffects = getEffects()

const trackPower = computed(() => layout?.value?.dccEx?.power ?? null)

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
          @click="emit('refreshPorts')"
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

    <!-- Empty state -->
    <v-card
      v-if="devices.length === 0"
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
