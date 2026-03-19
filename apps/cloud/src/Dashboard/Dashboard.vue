<script setup lang="ts">
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
</script>

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
