<script setup lang="ts">
import { computed } from 'vue'
import type { Device } from '@repo/modules'
import { useLayout, useTurnouts, useEfx } from '@repo/modules'
import { useCollection } from 'vuefire'
import DeviceConnectionCard from './DeviceConnectionCard.vue'

interface Props {
  devices: Device[]
  availablePorts: string[]
  availableTopics?: string[]
  linkMode: 'page' | 'modal'
  showHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  availableTopics: () => [],
  showHeader: true,
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
const { getTurnoutsByDevice } = useTurnouts()
const { getEffectsByDevice } = useEfx()

const layout = getLayout()

const trackPower = computed(() => layout?.value?.dccEx?.power ?? null)

const sortedDevices = computed(() => {
  return [...props.devices].sort((a, b) => {
    const aConnected = a.isConnected ? 0 : 1
    const bConnected = b.isConnected ? 0 : 1
    return aConnected - bConnected
  })
})

function getTurnoutCount(deviceId: string): number {
  const queryRef = getTurnoutsByDevice(deviceId)
  if (!queryRef) return 0
  const data = useCollection(queryRef)
  return data.value?.length ?? 0
}

function getEffectCount(deviceId: string): number {
  const queryRef = getEffectsByDevice(deviceId)
  if (!queryRef) return 0
  const data = useCollection(queryRef)
  return data.value?.length ?? 0
}
</script>

<template>
  <div>
    <!-- Header -->
    <div
      v-if="showHeader"
      class="d-flex justify-space-between align-center mb-4"
    >
      <h2 class="text-h5 font-weight-bold">Devices</h2>
      <div class="d-flex ga-2">
        <v-btn variant="tonal" size="small" @click="emit('refreshPorts')">
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

    <!-- Device cards -->
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
