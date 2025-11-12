<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useLayout, useLocos, useTurnouts, useEfx, useSignals } from '@repo/modules'
import LayoutCard from './components/LayoutCard.vue'
import TurnoutStatsCard from './components/TurnoutStatsCard.vue'
import EffectStatsCard from './components/EffectStatsCard.vue'
import ThrottleStatsCard from './components/ThrottleStatsCard.vue'
import DevicesTable from './components/DevicesTable.vue'
import TurnoutLogs from './components/TurnoutLogs.vue'
import SensorLogs from './components/SensorLogs.vue'
import EffectLogs from './components/EffectLogs.vue'
import ThrottleStatus from './components/ThrottleStatus.vue'
import DCCLog from './components/DCCLog/DCCLog.vue'
import DeviceSerialMonitors from './components/DeviceSerialMonitor/DeviceSerialMonitors.vue'
import type { DocumentData } from 'firebase/firestore'
import { useLayoutLogListeners } from '../composables/useLayoutLogListeners'

const TIMEOUT  = 1000 * 60 * 5 // 5 minutes for the timeout

const { getLayout, getDevices } = useLayout()
const { getThrottles } = useLocos()
const { getTurnouts } = useTurnouts()
const { getEffects } = useEfx()
const { getSignals } = useSignals()
const layoutId = useStorage('@DEJA/layoutId', '')
const layout = getLayout()
const devices = getDevices()
const throttles = getThrottles()
const turnouts = getTurnouts()
const effects = getEffects()
const signals = getSignals()
const { turnoutChanges, effectChanges, signalChanges } = useLayoutLogListeners()
const turnoutsThrownCount = ref(0)
const efxThrownCount = ref(0)
const signalsActiveCount = ref(0)

watch(turnoutChanges, () => {
  if (turnoutChanges.value.length > 0) {
    setTimeout(() => {
      turnoutsThrownCount.value++
      turnoutChanges.value.shift()
    }, TIMEOUT)
  }
}, { deep: true })

watch(effectChanges, () => {
  if (effectChanges.value.length > 0) {
    setTimeout(() => {
      efxThrownCount.value++
      effectChanges.value.shift()
    }, TIMEOUT)
  }
}, { deep: true })

watch(signalChanges, () => {
  if (signalChanges.value.length > 0) {
    setTimeout(() => {
      signalsActiveCount.value++
      signalChanges.value.shift()
    }, TIMEOUT)
  }
}, { deep: true })

</script>

<template>
  <v-sheet class="h-full">
    <div class="h-full max-h-full flex flex-col">
      <!-- First Row - Takes only the height it needs -->
      <!-- <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 flex-shrink-0">
        <LayoutCard />
        <TurnoutStatsCard 
          :total-count="turnouts.length"
          :thrown-count="turnoutsThrownCount"
        />
        <EffectStatsCard
          :total-count="effects.length"
          :active-count="efxThrownCount"
          :signal-count="signals.length"
          :active-signal-count="signalsActiveCount"
        />
        <ThrottleStatsCard
          :total-count="throttles.length"
          :active-count="throttles.filter(t => t.speed > 0).length"
        />
      </div> -->

      <!-- Second Row - Uses half of remaining height with scrolling -->
      <div class="grid grid-cols-1 lg:grid-cols-3 flex-1 min-h-0 bg-gray-950 max-h-[50vh]">
        <DCCLog />
        <TurnoutLogs :logs="turnoutChanges" />
        <EffectLogs :logs="effectChanges" />
      </div>

      <!-- Third Row - Uses half of remaining height with scrolling -->
      <div class="grid grid-cols-1 flex-1 min-h-0 bg-cyan-950 max-h-[50vh]">
        <div class="overflow-auto flex-1 min-h-0">
          <DeviceSerialMonitors :devices="devices" />
        </div>
      </div>
    </div>
  </v-sheet>
</template>