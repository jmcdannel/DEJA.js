<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { collection, query, where } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useCollection, useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { db, rtdb } from '@repo/firebase-config'
import { ref as rtdbRef, onValue, off } from 'firebase/database'
import { createLogger, formatUptime } from '@repo/utils'
import { useLayout, useServerStatus, type Device } from '@repo/modules'
import { DeviceConnectionList, DeviceStatusItem, StatusPulse } from '@repo/ui'

const log = createLogger('Connect')

const user = useCurrentUser()
const router = useRouter()

const layoutsQuery = computed(() => {
  if (!user.value?.email) return null
  return query(collection(db, 'layouts'), where('owner', '==', user.value.email))
})

const layouts = useCollection(layoutsQuery)
const layoutId = useStorage('@DEJA/layoutId', '')

function handleLayoutSelect(selectedLayoutId: string) {
  log.debug('Selected layout ID:', selectedLayoutId)
  if (selectedLayoutId) {
    layoutId.value = selectedLayoutId
    router.push({ name: 'home' })
  }
}

function handleLayoutDisconnect() {
  layoutId.value = ''
}

// Server status
const { serverStatus } = useServerStatus()
const serverUptime = computed(() => {
  if (!serverStatus.value?.online || !serverStatus.value?.lastSeen) return ''
  return formatUptime(serverStatus.value.lastSeen)
})

// Device connection management
const { getDevices, connectDevice, disconnectDevice } = useLayout()
const devices = getDevices()

const ports = ref<string[]>([])
let unsubPorts: (() => void) | null = null

watch(layoutId, (id) => {
  unsubPorts?.()
  unsubPorts = null
  if (id) {
    const portRef = rtdbRef(rtdb, `portList/${id}`)
    onValue(portRef, (snapshot) => {
      const val = snapshot.val()
      if (Array.isArray(val)) ports.value = val
    })
    unsubPorts = () => off(portRef)
  }
}, { immediate: true })

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
  <v-container class="py-6">
    <div class="connect-layout">
      <div class="connect-content">
        <!-- Layout Selection -->
        <div class="connect-section">
          <div class="connect-section__header">
            <v-icon size="20" class="connect-section__icon">mdi-home-outline</v-icon>
            <h2 class="connect-section__title">Your Layouts</h2>
          </div>
          <div
            v-for="layout in layouts"
            :key="layout.id"
            class="connect-row cursor-pointer"
            :class="{ 'connect-row--active': layout.id === layoutId }"
            @click="handleLayoutSelect(layout.id)"
          >
            <div class="flex items-center gap-3">
              <v-avatar
                :color="layout.id === layoutId ? 'success' : 'grey'"
                variant="tonal"
                size="36"
                rounded="lg"
              >
                <v-icon size="20" icon="mdi-train" />
              </v-avatar>
              <div>
                <div class="connect-row__name">{{ layout.name }}</div>
                <div v-if="layout.description" class="connect-row__desc">{{ layout.description }}</div>
              </div>
            </div>
            <v-icon v-if="layout.id === layoutId" color="success" size="20">mdi-check-circle</v-icon>
          </div>
          <div v-if="layoutId" class="connect-row connect-row--actions">
            <v-btn
              size="small"
              variant="outlined"
              color="error"
              prepend-icon="mdi-power"
              class="text-none"
              @click="handleLayoutDisconnect"
            >
              Disconnect Layout
            </v-btn>
          </div>
        </div>

        <!-- Server Status -->
        <div v-if="layoutId" class="connect-section">
          <div class="connect-section__header">
            <v-icon size="20" class="connect-section__icon">mdi-server-network</v-icon>
            <h2 class="connect-section__title">DEJA Server</h2>
          </div>
          <div class="connect-row">
            <div class="flex items-center gap-3">
              <v-avatar
                :color="serverStatus?.online ? 'success' : 'error'"
                variant="tonal"
                size="36"
                rounded="lg"
              >
                <v-icon size="20" icon="mdi-server-network" />
              </v-avatar>
              <div>
                <div class="connect-row__name" :class="serverStatus?.online ? 'text-green-400' : 'text-red-400'">
                  {{ serverStatus?.online ? 'Online' : 'Offline' }}
                </div>
                <div v-if="serverStatus?.version" class="connect-row__desc">v{{ serverStatus.version }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <StatusPulse :status="serverStatus?.online ? 'connected' : 'disconnected'" size="sm" />
              <span v-if="serverUptime" class="text-xs opacity-40">{{ serverUptime }}</span>
            </div>
          </div>
        </div>

        <!-- Devices -->
        <div v-if="layoutId" class="connect-section">
          <div class="connect-section__header">
            <v-icon size="20" class="connect-section__icon">mdi-devices</v-icon>
            <h2 class="connect-section__title">Devices</h2>
            <v-spacer />
            <v-chip
              v-if="devices?.length"
              size="x-small"
              :color="devices.every((d: Device) => d.isConnected || d.type === 'deja-server') ? 'success' : 'warning'"
              variant="tonal"
            >
              {{ devices.filter((d: Device) => d.isConnected).length }}/{{ devices.length }} connected
            </v-chip>
          </div>
          <div class="connect-row connect-row--block">
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
        </div>
      </div>
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
  </v-container>
</template>

<style scoped>
.connect-layout {
  max-width: 700px;
  margin: 0 auto;
}

.connect-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.connect-section {
  background: rgba(var(--v-theme-surface), 0.45);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  overflow: clip;
}

.connect-section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.connect-section__icon {
  color: rgb(var(--v-theme-primary));
}

.connect-section__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.connect-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  gap: 16px;
  transition: background 150ms ease;
}

.connect-row:last-child {
  border-bottom: none;
}

.connect-row.cursor-pointer:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

.connect-row--active {
  background: rgba(var(--v-theme-success), 0.06);
  border-left: 3px solid rgb(var(--v-theme-success));
}

.connect-row--block {
  flex-direction: column;
  align-items: stretch;
}

.connect-row--actions {
  padding: 12px 20px 16px;
  justify-content: flex-end;
}

.connect-row__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.connect-row__desc {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}
</style>
