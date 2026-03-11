<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLayout, useServerStatus } from '@repo/modules'
import { useDejaJS } from '@repo/deja'
import {
  DeviceConnectionList,
  SystemOverviewStats,
  CommandActivityChart,
  DeviceConnectionChart,
} from '@repo/ui'
import { ref as rtdbRef, onValue, off } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { useStorage } from '@vueuse/core'
import { useCommandActivity } from '@/composables/useCommandActivity'

const router = useRouter()
const { getDevices, getLayout, connectDevice, disconnectDevice } = useLayout()
const { sendDejaCommand } = useDejaJS()
const { serverStatus } = useServerStatus()

// Device data
const devices = getDevices()
const layout = getLayout()

// Port list from RTDB
const ports = ref<string[]>([])
const layoutId = useStorage('@DEJA/layoutId', '')

let unsubPorts: (() => void) | null = null

onMounted(() => {
  // Request port list
  sendDejaCommand({ action: 'listPorts', payload: {} })

  // Listen to RTDB portList
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

// Command activity (placeholder -- wired to empty ref until WebSocket integration)
const wsMessages = ref<{ action: string; payload?: unknown }[]>([])
const { activity: commandActivity } = useCommandActivity(wsMessages)

// Computed stats
const trackPower = computed(() => layout?.value?.dccEx?.power ?? null)
const connectedCount = computed(() => devices.value?.filter((d) => d.isConnected).length ?? 0)
const disconnectedCount = computed(() => (devices.value?.length ?? 0) - connectedCount.value)
const deviceCount = computed(() => ({
  connected: connectedCount.value,
  total: devices.value?.length ?? 0,
}))
const totalCommandCount = computed(() =>
  commandActivity.value.reduce((sum, b) => sum + b.count, 0),
)

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
  // Wait briefly for Firestore to propagate
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
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <!-- Device Connection List (Hero) -->
    <DeviceConnectionList
      :devices="devices ?? []"
      :available-ports="ports"
      link-mode="page"
      @connect="handleConnect"
      @disconnect="handleDisconnect"
      @reconnect="handleReconnect"
      @navigate="navigateToDevice"
      @refresh-ports="refreshPorts"
      @add-device="navigateToAddDevice"
    />

    <!-- Divider -->
    <v-divider class="my-6" />

    <!-- System Overview -->
    <h2 class="text-h5 font-weight-bold mb-4">System Overview</h2>

    <SystemOverviewStats
      :server-status="serverStatus"
      :device-count="deviceCount"
      :track-power="trackPower"
      :command-count="totalCommandCount"
      class="mb-4"
    />

    <!-- Graphs Row -->
    <v-row dense>
      <v-col cols="12" md="6">
        <CommandActivityChart :data="commandActivity" />
      </v-col>
      <v-col cols="12" md="6">
        <DeviceConnectionChart
          :connected="connectedCount"
          :disconnected="disconnectedCount"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
