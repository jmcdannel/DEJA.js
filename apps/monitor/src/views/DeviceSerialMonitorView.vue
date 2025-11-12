<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DeviceSerialMonitor from '../Dashboard/components/DeviceSerialMonitor/DeviceSerialMonitor.vue'
import { useLayout } from '@repo/modules'

interface LayoutDevice {
  id: string
  name?: string
  type?: string
  isConnected?: boolean
  port?: string
  topic?: string
}

const route = useRoute()
const router = useRouter()
const { getDevices } = useLayout()
const devices = getDevices()

const resolvedDevices = computed<LayoutDevice[]>(() => {
  const candidate = devices as unknown

  if (Array.isArray(candidate)) {
    return candidate as LayoutDevice[]
  }

  if (candidate && typeof candidate === 'object' && Array.isArray((candidate as { value?: unknown }).value)) {
    return (candidate as { value: LayoutDevice[] }).value
  }

  return []
})

const deviceId = computed(() => String(route.params.deviceId ?? ''))

const currentDevice = computed<LayoutDevice | undefined>(() =>
  resolvedDevices.value.find((device) => device.id === deviceId.value)
)

const deviceName = computed(() => {
  const device = currentDevice.value
  if (!device) return deviceId.value
  if (device.name) return device.name
  if (device.port) return `${device.type || 'Device'} (${device.port})`
  if (device.topic) return `${device.type || 'Device'} (${device.topic})`
  return device.id
})

const deviceType = computed(() => currentDevice.value?.type ?? 'unknown')
const isConnected = computed(() => currentDevice.value?.isConnected ?? false)

const pageTitle = computed(() => `${deviceName.value} Serial Monitor`)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}

function navigateHome() {
  router.push({ name: 'home' })
}

function openDeviceList() {
  router.push({ name: 'log-view', params: { logType: 'devices' } })
}
</script>

<template>
  <v-container fluid class="py-6 h-full bg-transparent">
    <div class="mx-auto flex h-full max-w-[1600px] flex-col gap-4">
      <div class="flex items-center gap-4 rounded-lg border border-slate-700/60 bg-slate-900/60 px-4 py-3">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          size="small"
          density="comfortable"
          aria-label="Go back"
          @click="goBack"
        />
        <div class="flex flex-col">
          <span class="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">Device Serial Monitor</span>
          <span class="text-lg font-semibold text-slate-100">{{ pageTitle }}</span>
        </div>
        <v-spacer />
        <div class="flex items-center gap-2">
          <v-chip
            v-if="currentDevice"
            color="success"
            variant="tonal"
            size="small"
            prepend-icon="mdi-radar"
          >
            Live
          </v-chip>
          <v-btn
            variant="text"
            size="small"
            density="comfortable"
            prepend-icon="mdi-view-grid"
            @click="openDeviceList"
          >
            All devices
          </v-btn>
        </div>
      </div>

      <div class="flex-1 overflow-hidden">
        <DeviceSerialMonitor
          v-if="currentDevice"
          :device-id="deviceId"
          :device-name="deviceName"
          :device-type="deviceType"
          :is-connected="isConnected"
          class="h-full"
        />
        <v-alert
          v-else
          type="warning"
          variant="tonal"
          border="start"
          border-color="warning"
          class="h-full items-center justify-center text-center"
        >
          <div class="space-y-2">
            <p class="text-base font-semibold">Device not found</p>
            <p class="text-sm text-slate-300">
              The requested device is unavailable. Return to the device list or dashboard to continue monitoring.
            </p>
            <div class="flex items-center justify-center gap-2">
              <v-btn color="primary" variant="flat" @click="openDeviceList">
                Device list
              </v-btn>
              <v-btn color="secondary" variant="text" @click="navigateHome">
                Dashboard
              </v-btn>
            </div>
          </div>
        </v-alert>
      </div>
    </div>
  </v-container>
</template>
