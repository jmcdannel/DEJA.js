<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { rtdb } from '@repo/firebase-config'
import { ref as rtdbRef, onValue, off } from 'firebase/database'
import { useLayout, useServerStatus, type Device } from '@repo/modules'
import { DeviceConnectionList, DeviceStatusItem, StatusPulse, SelectLayout } from '@repo/ui'
import { useDisplay } from 'vuetify'

const user = useCurrentUser()
const router = useRouter()
const { mdAndUp } = useDisplay()

const layoutId = useStorage('@DEJA/layoutId', '')

function handleLayoutSelect(selectedLayoutId: string) {
  if (selectedLayoutId) {
    layoutId.value = selectedLayoutId
    router.push({ name: 'home' })
  }
}

// Server status
const { serverStatus } = useServerStatus()
const serverUptime = computed(() => {
  if (!serverStatus.value?.online || !serverStatus.value?.lastSeen) return ''
  const elapsed = Date.now() - Number(serverStatus.value.lastSeen)
  const mins = Math.floor(elapsed / 60000)
  const hrs = Math.floor(mins / 60)
  if (hrs > 0) return `${hrs}h ${mins % 60}m`
  return `${mins}m`
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

// Jump-to sections
const sections = computed(() => {
  const items = [
    { id: 'layout', label: 'Layout', icon: 'mdi-home-city-outline' },
  ]
  if (layoutId.value) {
    items.push(
      { id: 'server', label: 'Server', icon: 'mdi-server-network' },
      { id: 'devices', label: 'Devices', icon: 'mdi-devices' },
    )
  }
  return items
})

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <v-container class="py-6">
    <div class="settings-layout">
      <!-- Content -->
      <div class="settings-content">
        <!-- Layout Selection -->
        <div id="layout" class="settings-section">
          <div class="settings-section__header">
            <v-icon size="20" class="settings-section__icon">mdi-home-city-outline</v-icon>
            <h2 class="settings-section__title">Layout</h2>
          </div>
          <div class="settings-row settings-row--block">
            <SelectLayout
              variant="compact"
              :layout-id="layoutId"
              @selected="handleLayoutSelect"
            />
          </div>
        </div>

        <!-- Server Status -->
        <template v-if="layoutId">
          <div id="server" class="settings-section">
            <div class="settings-section__header">
              <v-icon size="20" class="settings-section__icon">mdi-server-network</v-icon>
              <h2 class="settings-section__title">DEJA Server</h2>
            </div>
            <div class="settings-row">
              <div class="settings-row__label">
                <span class="settings-row__name">Status</span>
                <span v-if="serverStatus?.version" class="settings-row__desc">v{{ serverStatus.version }}</span>
              </div>
              <div class="settings-row__value flex items-center gap-3">
                <StatusPulse :status="serverStatus?.online ? 'connected' : 'disconnected'" size="sm" />
                <v-chip
                  :color="serverStatus?.online ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                >
                  {{ serverStatus?.online ? 'Online' : 'Offline' }}
                </v-chip>
              </div>
            </div>
            <div v-if="serverUptime" class="settings-row">
              <div class="settings-row__label">
                <span class="settings-row__name">Uptime</span>
              </div>
              <div class="settings-row__value opacity-60">{{ serverUptime }}</div>
            </div>
          </div>

          <!-- Devices -->
          <div id="devices" class="settings-section">
            <div class="settings-section__header">
              <v-icon size="20" class="settings-section__icon">mdi-devices</v-icon>
              <h2 class="settings-section__title">Devices</h2>
            </div>
            <div class="settings-row settings-row--block">
              <DeviceConnectionList
                :devices="devices ?? []"
                :available-ports="ports"
                :show-header="false"
                :server-online="serverStatus?.online ?? false"
                @connect="handleConnect"
                @disconnect="handleDisconnect"
                @navigate="openDeviceModal"
              />
            </div>
          </div>
        </template>
      </div>

      <!-- Jump-to nav (desktop only) -->
      <nav v-if="mdAndUp" class="settings-nav">
        <div class="settings-nav__inner">
          <p class="text-xs opacity-40 uppercase tracking-widest font-medium mb-3">Connect</p>
          <button
            v-for="s in sections"
            :key="s.id"
            class="settings-nav__item"
            @click="scrollTo(s.id)"
          >
            <v-icon size="16">{{ s.icon }}</v-icon>
            {{ s.label }}
          </button>
        </div>
      </nav>
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
.settings-layout {
  display: flex;
  gap: 32px;
  max-width: 1100px;
}

.settings-nav {
  flex-shrink: 0;
  width: 180px;
  position: sticky;
  top: 80px;
  align-self: flex-start;
}

.settings-nav__inner {
  padding: 16px 0;
}

.settings-nav__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-size: 0.8rem;
  font-weight: 500;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
}

.settings-nav__item:hover {
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-primary), 0.08);
}

.settings-content {
  flex: 1;
  min-width: 0;
}

.settings-section {
  background: rgba(var(--v-theme-surface), 0.45);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: clip;
}

.settings-section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.settings-section__icon { color: rgb(var(--v-theme-primary)); }

.settings-section__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  gap: 16px;
}
.settings-row:last-child { border-bottom: none; }
.settings-row--block { flex-direction: column; align-items: stretch; }

.settings-row__label { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.settings-row__name { font-size: 0.875rem; font-weight: 500; color: rgba(var(--v-theme-on-surface), 0.8); }
.settings-row__desc { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.45); }
.settings-row__value { flex-shrink: 0; }
</style>
