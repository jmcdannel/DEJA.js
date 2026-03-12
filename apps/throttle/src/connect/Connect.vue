<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { collection, query, where } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useCollection, useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { db, rtdb } from '@repo/firebase-config'
import { ref as rtdbRef, onValue, off } from 'firebase/database'
import { createLogger } from '@repo/utils'
import { useLayout, useServerStatus, type Device } from '@repo/modules'
import { DeviceConnectionList, DeviceStatusItem, StatusPulse } from '@repo/ui'

const log = createLogger('Connect')

const user = useCurrentUser()
const router = useRouter()
log.debug('Loading LayoutsList.vue', user.value)

// Create a computed property for the layouts query that only runs when user is available
const layoutsQuery = computed(() => {
  if (!user.value?.email) {
    // Return null if no user email, which will prevent the query from running
    return null
  }

  const layoutsRef = collection(db, 'layouts')
  return query(layoutsRef, where('owner', '==', user.value.email))
})

// Use the computed query, but only when it's not null
const layouts = useCollection(layoutsQuery)

const layoutId = useStorage('@DEJA/layoutId', '')

function handleLayoutSelect(selectedLayoutId: string) {
  log.debug('Selected layout ID:', selectedLayoutId)
  if (selectedLayoutId) {
    layoutId.value = selectedLayoutId
    router.push({ name: 'home' })
  }
}

// Server status (auto-detect, same as header chip)
const { serverStatus } = useServerStatus()

const serverUptime = computed(() => {
  if (!serverStatus.value?.online || !serverStatus.value?.lastSeen) return ''
  const now = Date.now()
  const raw = serverStatus.value.lastSeen
  let last: number
  if (typeof raw === 'number') {
    last = raw
  } else if (raw instanceof Date) {
    last = raw.getTime()
  } else {
    last = new Date(raw as string).getTime()
  }
  if (Number.isNaN(last)) return ''
  const diff = now - last
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
})

// Device connection management
const { getDevices, connectDevice, disconnectDevice } = useLayout()
const devices = getDevices()

const ports = ref<string[]>([])
let unsubPorts: (() => void) | null = null

// Listen to RTDB portList when layout is selected
watch(layoutId, (id) => {
  // Clean up previous listener
  unsubPorts?.()
  unsubPorts = null

  if (id) {
    const portRef = rtdbRef(rtdb, `portList/${id}`)
    onValue(portRef, (snapshot) => {
      const val = snapshot.val()
      if (Array.isArray(val)) {
        ports.value = val
      }
    })
    unsubPorts = () => off(portRef)
  }
}, { immediate: true })

// Device event handlers
async function handleConnect(deviceId: string, serial?: string, topic?: string) {
  const device = devices.value?.find((d: Device) => d.id === deviceId)
  if (!device) return
  await connectDevice(device, serial, topic)
}

async function handleDisconnect(deviceId: string) {
  await disconnectDevice(deviceId)
}

// Device detail modal
const selectedDeviceId = ref<string | null>(null)
const showDeviceModal = ref(false)

function openDeviceModal(deviceId: string) {
  selectedDeviceId.value = deviceId
  showDeviceModal.value = true
}

const selectedDevice = computed(() => {
  if (!selectedDeviceId.value || !devices.value) return null
  return devices.value.find((d: Device) => d.id === selectedDeviceId.value) ?? null
})
</script>

<template>
  <main class="flex flex-col flex-grow p-8 w-full overflow-auto">
    <v-card
      class="mx-auto my-8"
      max-width="400"
    >
      <v-card-text>
        <h2 class="text-h6 mb-2">Your Layouts</h2>
        <div v-for="layout in layouts" :key="layout.id"
          class="p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-800 my-2"
          :class="{ 'border-green-500 bg-green-800': layout.id === layoutId, 'border-gray-200 bg-gray-900': layout.id !== layoutId }"
          @click="handleLayoutSelect(layout.id)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <v-icon :color="layout.id === layoutId ? 'green' : 'grey'">mdi-home</v-icon>
              <div>
                <h4 class="font-medium">{{ layout.name }}</h4>
                <p v-if="layout.description" class="text-sm text-gray-600">{{ layout.description }}</p>
              </div>
            </div>
            <v-icon v-if="layout.id === layoutId" color="green">mdi-check-circle</v-icon>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- DEJA Server Status (auto-detect) -->
    <v-card
      v-if="layoutId"
      class="mx-auto mt-6"
      max-width="600"
      :style="{
        borderLeftColor: serverStatus?.online
          ? 'rgb(var(--v-theme-success))'
          : 'rgb(var(--v-theme-error))',
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
      }"
      variant="tonal"
    >
      <v-card-text class="pa-4">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center ga-3">
            <v-avatar
              :color="serverStatus?.online ? 'success' : 'error'"
              variant="tonal"
              size="40"
              rounded="lg"
            >
              <v-icon icon="mdi-server-network" />
            </v-avatar>
            <div>
              <div
                class="text-subtitle-1 font-weight-bold"
                :class="serverStatus?.online ? 'text-success' : 'text-error'"
              >
                DEJA Server
              </div>
              <div v-if="serverStatus?.version" class="text-caption text-medium-emphasis">
                v{{ serverStatus.version }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="d-flex align-center ga-1">
              <StatusPulse :status="serverStatus?.online ? 'connected' : 'disconnected'" size="sm" />
              <span class="text-caption" :class="serverStatus?.online ? 'text-success' : 'text-error'">
                {{ serverStatus?.online ? 'Online' : 'Offline' }}
              </span>
            </div>
            <div v-if="serverUptime" class="text-caption text-medium-emphasis">
              uptime {{ serverUptime }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Device Connection List (shown after layout is selected) -->
    <div v-if="layoutId" class="mt-6 mx-auto w-full" style="max-width: 600px">
      <DeviceConnectionList
        :devices="devices ?? []"
        :available-ports="ports"
        link-mode="modal"
        :show-header="false"
        @connect="handleConnect"
        @disconnect="handleDisconnect"
        @navigate="openDeviceModal"
      />
    </div>

    <!-- Device Detail Modal -->
    <v-dialog v-model="showDeviceModal" max-width="600">
      <v-card v-if="selectedDevice">
        <v-card-title>Device Details</v-card-title>
        <v-card-text>
          <DeviceStatusItem :device="selectedDevice" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeviceModal = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </main>
</template>
