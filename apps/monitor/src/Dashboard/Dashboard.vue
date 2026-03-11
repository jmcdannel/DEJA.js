<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLayout, useLocos, useTurnouts, useEfx, useSignals } from '@repo/modules'
import { useLayoutLogListeners } from '../composables/useLayoutLogListeners'
import { usePaneManager, PANE_COLORS, type PaneColorKey } from '../composables/usePaneManager'
import MonitorPane from './components/MonitorPane.vue'
import MonitorStatusBar from './components/MonitorStatusBar.vue'
import DccLogPane from './components/DccLogPane.vue'
import DeviceSerialPaneContent from './components/DeviceSerialPaneContent.vue'
import TurnoutLogPane from './components/TurnoutLogPane.vue'
import EffectLogPane from './components/EffectLogPane.vue'
import SensorLogPane from './components/SensorLogPane.vue'
import StatsPane from './components/StatsPane.vue'
import { useDcc } from '@repo/dccex'

const paneManager = usePaneManager()
const { turnoutChanges, effectChanges, sensorChanges } = useLayoutLogListeners()
const { sendDccCommand } = useDcc()
const { getDevices } = useLayout()

const devices = getDevices()

// Sync devices into pane manager
watch(
  () => {
    const raw = devices as unknown as { value?: unknown } | unknown
    if (Array.isArray(raw)) return raw
    if (raw && Array.isArray((raw as { value?: unknown[] }).value)) return (raw as { value: unknown[] }).value
    return []
  },
  (deviceList) => {
    paneManager.setDevices(
      deviceList.map((d: Record<string, unknown>) => ({
        id: d.id as string,
        name: (d.name as string) || (d.id as string),
        type: (d.type as string) || 'unknown',
        connection: (d.connection as string) || 'usb',
      }))
    )
  },
  { immediate: true }
)

// Template refs for pane content components
const dccLogRef = ref<InstanceType<typeof DccLogPane> | null>(null)
const turnoutLogRef = ref<InstanceType<typeof TurnoutLogPane> | null>(null)
const effectLogRef = ref<InstanceType<typeof EffectLogPane> | null>(null)
const sensorLogRef = ref<InstanceType<typeof SensorLogPane> | null>(null)

// Update message counts reactively
watch(() => dccLogRef.value?.messageCount, (count) => {
  if (count !== undefined) paneManager.updateMessageCount('dcc', count)
}, { immediate: true })

watch(() => turnoutLogRef.value?.messageCount, (count) => {
  if (count !== undefined) paneManager.updateMessageCount('turnouts', count)
}, { immediate: true })

watch(() => effectLogRef.value?.messageCount, (count) => {
  if (count !== undefined) paneManager.updateMessageCount('effects', count)
}, { immediate: true })

watch(() => sensorLogRef.value?.messageCount, (count) => {
  if (count !== undefined) paneManager.updateMessageCount('sensors', count)
}, { immediate: true })

// Grid style bindings
const gridStyle = computed(() => ({
  gridTemplateAreas: paneManager.gridTemplateAreas,
  gridTemplateRows: paneManager.gridTemplateRows,
  gridTemplateColumns: paneManager.gridTemplateColumns,
}))

// Pane visibility helpers
function isPaneVisible(id: string): boolean {
  if (paneManager.maximizedPane) {
    return paneManager.maximizedPane.id === id
  }
  const pane = paneManager.panes.find((p) => p.id === id)
  return pane?.state === 'normal'
}

function getPaneConfig(id: string) {
  return paneManager.panes.find((p) => p.id === id)
}

// Clear handlers
const deviceSerialRefs = ref<Record<string, { clear: () => void }>>({})

function handleClear(id: string) {
  switch (id) {
    case 'dcc': dccLogRef.value?.clear(); break
    case 'turnouts': turnoutLogRef.value?.clear(); break
    case 'effects': effectLogRef.value?.clear(); break
    case 'sensors': sensorLogRef.value?.clear(); break
    default:
      if (id.startsWith('device-')) {
        deviceSerialRefs.value[id]?.clear()
      }
      break
  }
}

// Status bar event handlers
const emit = defineEmits<{
  'toggle-drawer': []
}>()

async function handleTrackPowerToggle(newState: boolean) {
  await sendDccCommand({ action: 'dcc', payload: newState ? '1 MAIN' : '0' })
}

async function handleEmergencyStop() {
  await sendDccCommand({ action: 'dcc', payload: '!' })
}

// Extract device ID from pane ID
function deviceIdFromPaneId(paneId: string): string {
  return paneId.replace('device-', '')
}
</script>

<template>
  <div class="flex flex-col h-screen">
    <MonitorStatusBar
      @toggle-drawer="emit('toggle-drawer')"
      @track-power-toggle="handleTrackPowerToggle"
      @emergency-stop="handleEmergencyStop"
    />

    <div class="monitor-layout">
      <!-- Main grid -->
      <div class="monitor-grid" :style="gridStyle">
        <!-- DCC Log Pane -->
        <MonitorPane
          v-if="isPaneVisible('dcc')"
          v-bind="getPaneConfig('dcc')!"
          pane-id="dcc"
          @minimize="paneManager.toggleMinimize('dcc')"
          @restore="paneManager.restorePane('dcc')"
          @maximize="paneManager.toggleMaximize('dcc')"
          @clear="handleClear('dcc')"
        >
          <DccLogPane ref="dccLogRef" />
        </MonitorPane>

        <!-- Turnout Log Pane -->
        <MonitorPane
          v-if="isPaneVisible('turnouts')"
          v-bind="getPaneConfig('turnouts')!"
          pane-id="turnouts"
          @minimize="paneManager.toggleMinimize('turnouts')"
          @restore="paneManager.restorePane('turnouts')"
          @maximize="paneManager.toggleMaximize('turnouts')"
          @clear="handleClear('turnouts')"
        >
          <TurnoutLogPane ref="turnoutLogRef" :logs="turnoutChanges" />
        </MonitorPane>

        <!-- Effect Log Pane -->
        <MonitorPane
          v-if="isPaneVisible('effects')"
          v-bind="getPaneConfig('effects')!"
          pane-id="effects"
          @minimize="paneManager.toggleMinimize('effects')"
          @restore="paneManager.restorePane('effects')"
          @maximize="paneManager.toggleMaximize('effects')"
          @clear="handleClear('effects')"
        >
          <EffectLogPane ref="effectLogRef" :logs="effectChanges" />
        </MonitorPane>

        <!-- Sensor Log Pane -->
        <MonitorPane
          v-if="isPaneVisible('sensors')"
          v-bind="getPaneConfig('sensors')!"
          pane-id="sensors"
          @minimize="paneManager.toggleMinimize('sensors')"
          @restore="paneManager.restorePane('sensors')"
          @maximize="paneManager.toggleMaximize('sensors')"
          @clear="handleClear('sensors')"
        >
          <SensorLogPane ref="sensorLogRef" :logs="sensorChanges" />
        </MonitorPane>

        <!-- Stats Pane -->
        <MonitorPane
          v-if="isPaneVisible('stats')"
          v-bind="getPaneConfig('stats')!"
          pane-id="stats"
          :hide-clear="true"
          @minimize="paneManager.toggleMinimize('stats')"
          @restore="paneManager.restorePane('stats')"
          @maximize="paneManager.toggleMaximize('stats')"
          @clear="() => {}"
        >
          <StatsPane />
        </MonitorPane>

        <!-- Dynamic Device Panes -->
        <MonitorPane
          v-for="devicePane in paneManager.devicePanes"
          :key="devicePane.id"
          v-show="isPaneVisible(devicePane.id)"
          v-bind="getPaneConfig(devicePane.id)!"
          :pane-id="devicePane.id"
          @minimize="paneManager.toggleMinimize(devicePane.id)"
          @restore="paneManager.restorePane(devicePane.id)"
          @maximize="paneManager.toggleMaximize(devicePane.id)"
          @clear="handleClear(devicePane.id)"
        >
          <DeviceSerialPaneContent
            :ref="(el: any) => { if (el) deviceSerialRefs[devicePane.id] = el }"
            :device-id="deviceIdFromPaneId(devicePane.id)"
            :device-name="devicePane.name"
          />
        </MonitorPane>
      </div>

      <!-- Minimized bar -->
      <div class="monitor-minimized-bar">
        <div
          v-for="pane in paneManager.minimizedPanes"
          :key="pane.id"
          class="monitor-pane--minimized"
        >
          <MonitorPane
            v-bind="pane"
            :pane-id="pane.id"
            @minimize="paneManager.toggleMinimize(pane.id)"
            @restore="paneManager.restorePane(pane.id)"
            @maximize="paneManager.toggleMaximize(pane.id)"
            @clear="handleClear(pane.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
