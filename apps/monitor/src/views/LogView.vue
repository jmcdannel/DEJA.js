<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DCCLog from '../Dashboard/components/DCCLog/DCCLog.vue'
import TurnoutLogs from '../Dashboard/components/TurnoutLogs.vue'
import EffectLogs from '../Dashboard/components/EffectLogs.vue'
import DeviceSerialMonitors from '../Dashboard/components/DeviceSerialMonitor/DeviceSerialMonitors.vue'
import { useLayoutLogListeners } from '../composables/useLayoutLogListeners'
import { useLayout } from '@repo/modules'

const route = useRoute()
const router = useRouter()
const { turnoutChanges, effectChanges } = useLayoutLogListeners()
const { getDevices } = useLayout()
const devices = getDevices()
const resolvedDevices = computed(() => {
  const candidate = devices as unknown as { value?: unknown } | unknown
  if (Array.isArray(candidate)) {
    return candidate
  }

  if (candidate && Array.isArray((candidate as { value?: unknown }).value)) {
    return (candidate as { value: unknown[] }).value
  }

  return [] as unknown[]
})

const logType = computed(() => (route.params.logType as string || '').toLowerCase())

const currentLog = computed(() => {
  switch (logType.value) {
    case 'dcc':
      return {
        title: 'DCC Logger',
        component: DCCLog,
        props: {},
      }
    case 'turnouts':
      return {
        title: 'Turnout Logs',
        component: TurnoutLogs,
        props: { logs: turnoutChanges.value },
      }
    case 'effects':
      return {
        title: 'Effect Logs',
        component: EffectLogs,
        props: { logs: effectChanges.value },
      }
    case 'devices':
      return {
        title: 'Device Serial Monitors',
        component: DeviceSerialMonitors,
        props: { devices: resolvedDevices.value },
      }
    default:
      return null
  }
})

const pageTitle = computed(() => currentLog.value?.title ?? 'Unknown Log')

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
          <span class="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">Log Viewer</span>
          <span class="text-lg font-semibold text-slate-100">{{ pageTitle }}</span>
        </div>
        <v-spacer />
        <v-chip color="success" variant="tonal" size="small" prepend-icon="mdi-radar">Live</v-chip>
      </div>

      <div class="flex-1 overflow-hidden">
        <component
          v-if="currentLog"
          :is="currentLog.component"
          v-bind="currentLog.props"
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
            <p class="text-base font-semibold">Log view not found</p>
            <p class="text-sm text-slate-300">The requested log is unavailable. Return to the dashboard to continue monitoring.</p>
            <v-btn color="primary" variant="flat" @click="navigateHome">Back to dashboard</v-btn>
          </div>
        </v-alert>
      </div>
    </div>
  </v-container>
</template>
