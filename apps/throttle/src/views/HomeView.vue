<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { ref as rtdbRef, onValue, off } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { QuickConnectPanel, StatusPulse, OnboardingBanner } from '@repo/ui'
import { useOnboarding } from '@repo/modules'
import Speedometer from '@/throttle/Speedometer.vue'
import {
  useLayout,
  useServerStatus,
  useLocos,
  useTurnouts,
  useEfx,
  useSignals,
  useSensors,
  type Device,
} from '@repo/modules'
import { useDejaJS } from '@repo/deja'
import { formatUptime } from '@repo/utils'

const user = useCurrentUser()
const router = useRouter()
const layoutId = useStorage('@DEJA/layoutId', '')
const { getDevices, getLayout, connectDevice, disconnectDevice } = useLayout()
const { sendDejaCommand } = useDejaJS()
const layout = getLayout()
const devices = getDevices()
const { serverStatus } = useServerStatus()
const { getThrottles } = useLocos()
const { getTurnouts } = useTurnouts()
const { getEffects } = useEfx()
const { getSignals } = useSignals()
const { getSensors } = useSensors()

const { state: onboardingState, isComplete: onboardingComplete } = useOnboarding()

const throttles = getThrottles()
const turnouts = getTurnouts()
const effects = getEffects()
const signals = getSignals()
const sensors = getSensors()
const locoCount = computed(() => throttles.value?.length ?? 0)

// 🔌 Port list from RTDB
const ports = ref<string[]>([])
let unsubPorts: (() => void) | null = null

onMounted(() => {
  sendDejaCommand({ action: 'listPorts', payload: {} })
  if (layoutId.value) {
    const portRef = rtdbRef(rtdb, `portList/${layoutId.value}`)
    onValue(portRef, (snapshot) => {
      const val = snapshot.val()
      if (Array.isArray(val)) ports.value = val
    })
    unsubPorts = () => off(portRef)
  }
})

onUnmounted(() => {
  unsubPorts?.()
})

// Computed
const connectedDevices = computed(() => devices.value?.filter((d: Device) => d.isConnected) ?? [])
const serverUptime = computed(() => {
  if (!serverStatus.value?.online || !serverStatus.value?.lastSeen) return ''
  return formatUptime(serverStatus.value.lastSeen)
})

// Handlers
async function handleConnect(deviceId: string, serial?: string, topic?: string) {
  const device = devices.value?.find((d: Device) => d.id === deviceId)
  if (!device) return
  await connectDevice(device, serial, topic)
}

async function handleDisconnect(deviceId: string) {
  await disconnectDevice(deviceId)
}

function handleThrottleClick(address: number) {
  router.push({ name: 'throttle', params: { address } })
}

function handleLayoutDisconnect() {
  layoutId.value = ''
  router.push('/connect')
}

function openCloudSetup() {
  window.open('https://cloud.dejajs.com', '_blank')
}

const navItems = [
  { title: 'Throttles', icon: 'mdi-gamepad-variant', route: '/throttles', color: 'cyan' },
  { title: 'Turnouts', icon: 'mdi-swap-horizontal', route: '/turnouts', color: 'amber' },
  { title: 'Routes', icon: 'mdi-map-marker-path', route: '/routes', color: 'green' },
  { title: 'Effects', icon: 'mdi-auto-fix', route: '/effects', color: 'purple' },
  { title: 'Signals', icon: 'mdi-traffic-light', route: '/signals', color: 'red' },
  { title: 'Roster', icon: 'mdi-train', route: '/locos', color: 'blue' },
]
</script>
<template>
  <main class="flex flex-col flex-grow p-4 md:p-8 w-full overflow-auto gap-6">

    <!-- 🎨 Big Gradient Title -->
    <header>
      <h1 class="gradient-title">
        {{ layout?.name || 'DEJA' }}
      </h1>
      <div class="flex items-center gap-3 mt-2">
        <v-chip size="small" color="indigo" variant="flat" prepend-icon="mdi-star-circle-outline">
          {{ layoutId }}
        </v-chip>
        <div class="flex items-center gap-1.5">
          <StatusPulse :status="serverStatus?.online ? 'connected' : 'disconnected'" size="sm" />
          <span class="text-xs" :class="serverStatus?.online ? 'text-green-400' : 'text-red-400'">
            {{ serverStatus?.online ? 'Online' : 'Offline' }}
          </span>
          <span v-if="serverUptime" class="text-xs opacity-40 ml-1">· {{ serverUptime }}</span>
          <span v-if="serverStatus?.version" class="text-xs opacity-40 ml-1">· v{{ serverStatus.version }}</span>
        </div>
      </div>
    </header>

    <!-- 🚂 Onboarding Banner -->
    <OnboardingBanner
      v-if="user && layoutId && !onboardingComplete"
      :state="onboardingState"
      :loco-count="locoCount"
      variant="throttle"
      @add-loco="router.push({ name: 'roster' })"
      @open-cloud-setup="openCloudSetup"
    />

    <!-- ⚡ Quick Connect (prominent) -->
    <QuickConnectPanel
      v-if="devices?.length"
      :devices="devices ?? []"
      :available-ports="ports"
      @connect="handleConnect"
      @navigate="router.push('/connect')"
    />

    <!-- 🧭 Navigation Grid -->
    <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
      <v-card
        v-for="item in navItems"
        :key="item.route"
        class="text-center cursor-pointer rounded-xl transition-all hover:scale-105"
        variant="tonal"
        :color="item.color"
        @click="router.push(item.route)"
      >
        <v-card-text class="flex flex-col items-center gap-2 py-4">
          <v-icon size="32" :color="item.color">{{ item.icon }}</v-icon>
          <span class="text-xs font-semibold uppercase tracking-wider">{{ item.title }}</span>
        </v-card-text>
      </v-card>
    </div>

    <!-- 🏗️ Layout Overview Card -->
    <v-card class="layout-dashboard rounded-2xl" variant="flat">
      <v-card-text class="pa-5">
        <!-- Stats Row -->
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          <div class="stat-tile" @click="router.push('/connect')">
            <div class="stat-tile__value" :class="connectedDevices.length === (devices?.length ?? 0) ? 'text-green-400' : 'text-amber-400'">
              {{ connectedDevices.length }}/{{ devices?.length ?? 0 }}
            </div>
            <div class="stat-tile__label">Devices</div>
          </div>
          <div class="stat-tile" @click="router.push('/throttles')">
            <div class="stat-tile__value text-cyan-400">{{ throttles?.length ?? 0 }}</div>
            <div class="stat-tile__label">Throttles</div>
          </div>
          <div class="stat-tile" @click="router.push('/turnouts')">
            <div class="stat-tile__value text-amber-400">{{ turnouts?.length ?? 0 }}</div>
            <div class="stat-tile__label">Turnouts</div>
          </div>
          <div class="stat-tile" @click="router.push('/effects')">
            <div class="stat-tile__value text-purple-400">{{ effects?.length ?? 0 }}</div>
            <div class="stat-tile__label">Effects</div>
          </div>
          <div class="stat-tile" @click="router.push('/signals')">
            <div class="stat-tile__value text-red-400">{{ signals?.length ?? 0 }}</div>
            <div class="stat-tile__label">Signals</div>
          </div>
          <div class="stat-tile">
            <div class="stat-tile__value text-teal-400">{{ sensors?.length ?? 0 }}</div>
            <div class="stat-tile__label">Sensors</div>
          </div>
        </div>

        <!-- Active Throttles (Speedometers) -->
        <div v-if="throttles?.length" class="mb-5">
          <div class="section-label">🚂 Active Throttles</div>
          <div class="flex flex-wrap gap-4 justify-start">
            <Speedometer
              v-for="throttle in throttles"
              :key="throttle.address"
              :speed="throttle.speed"
              :address="throttle.address"
              @click="handleThrottleClick(throttle.address)"
            />
          </div>
        </div>

        <!-- Devices -->
        <div v-if="devices?.length">
          <div class="section-label">🔌 Devices</div>
          <div class="device-grid">
            <div
              v-for="device in devices"
              :key="device.id"
              class="device-chip"
              :class="{ 'device-chip--connected': device.isConnected }"
            >
              <v-icon
                size="18"
                :color="device.isConnected ? 'success' : 'error'"
                :icon="device.type === 'dcc-ex' ? 'mdi-memory' : device.type === 'deja-mqtt' ? 'mdi-wifi' : device.type === 'deja-arduino-led' ? 'mdi-led-strip' : 'mdi-usb'"
              />
              <div class="flex-grow min-w-0">
                <div class="text-xs font-semibold text-white truncate">{{ device.name || device.id }}</div>
                <div class="text-[10px] text-white/50 uppercase">{{ device.type }}</div>
              </div>
              <StatusPulse v-if="device.isConnected" status="connected" size="sm" />
              <v-btn
                v-if="device.isConnected"
                size="x-small"
                variant="text"
                color="error"
                icon="mdi-link-off"
                density="compact"
                @click.stop="handleDisconnect(device.id)"
              />
              <v-icon v-else size="12" color="error" icon="mdi-circle-outline" />
            </div>
          </div>
        </div>

        <!-- Disconnect Layout -->
        <div class="flex justify-end mt-5">
          <v-btn
            size="small"
            variant="outlined"
            color="error"
            prepend-icon="mdi-power"
            @click="handleLayoutDisconnect"
          >
            Disconnect Layout
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </main>
</template>

<style scoped>
/* 🎨 Gradient Title */
.gradient-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1;
  background: linear-gradient(135deg, #38bdf8 0%, #a78bfa 40%, #ec4899 70%, #f97316 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

/* Section labels */
.section-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.4;
  margin-bottom: 8px;
  font-weight: 600;
}

/* Dashboard card */
.layout-dashboard {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  color: #fff !important;
}

.layout-dashboard :deep(.v-card-title),
.layout-dashboard :deep(.v-card-subtitle),
.layout-dashboard :deep(.v-card-text) {
  color: #fff !important;
}

/* Stat tiles */
.stat-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-tile:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.stat-tile__value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
}

.stat-tile__label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.5;
  margin-top: 4px;
  font-weight: 600;
}

/* Device chips */
.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
}

.device-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.15s ease;
}

.device-chip--connected {
  border-color: rgba(34, 197, 94, 0.2);
  background: rgba(34, 197, 94, 0.06);
}

.device-chip:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
