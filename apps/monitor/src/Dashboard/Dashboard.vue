<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
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
import { db } from '@repo/firebase-config'
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore'

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
const turnoutChanges = ref<DocumentData[]>([])
const effectChanges = ref<DocumentData[]>([])
const signalChanges = ref<DocumentData[]>([])
const sensorChanges = ref<DocumentData[]>([])
const turnoutsThrownCount = ref(0)
const efxThrownCount = ref(0)
const signalsActiveCount = ref(0)

// Firebase listeners
let turnoutUnsubscribe: (() => void) | null = null
let effectUnsubscribe: (() => void) | null = null
let signalUnsubscribe: (() => void) | null = null

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

// Watch for layoutId changes and set up Firebase listeners
watch(layoutId, (newLayoutId) => {
  // Clean up existing listeners
  if (turnoutUnsubscribe) {
    turnoutUnsubscribe()
    turnoutUnsubscribe = null
  }
  if (effectUnsubscribe) {
    effectUnsubscribe()
    effectUnsubscribe = null
  }
  if (signalUnsubscribe) {
    signalUnsubscribe()
    signalUnsubscribe = null
  }

  // Only set up listeners if we have a valid layoutId
  if (newLayoutId && newLayoutId.trim() !== '') {
    console.log('Setting up Firebase listeners for layout:', newLayoutId)
    
    // Set up turnout listener
    turnoutUnsubscribe = onSnapshot(collection(db, `layouts/${newLayoutId}/turnouts`), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          console.log('Modified turnout: ', change.doc.data())
          turnoutChanges.value.push(change.doc.data())
        } else if (change.type === 'added') {
          console.log('Added turnout: ', change.doc.data())
        } else if (change.type === 'removed') {
          console.log('Removed turnout: ', change.doc.data())
        }
      })
    })

    // Set up effect listener
    effectUnsubscribe = onSnapshot(collection(db, `layouts/${newLayoutId}/effects`), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          console.log('Modified effect: ', change.doc.data())
          effectChanges.value.push(change.doc.data())
        } else if (change.type === 'added') {
          console.log('Added effect: ', change.doc.data())
        } else if (change.type === 'removed') {
          console.log('Removed effect: ', change.doc.data())
        }
      })
    })

    signalUnsubscribe = onSnapshot(collection(db, `layouts/${newLayoutId}/signals`), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          console.log('Modified signal: ', change.doc.data())
          signalChanges.value.push(change.doc.data())
        } else if (change.type === 'added') {
          console.log('Added signal: ', change.doc.data())
        } else if (change.type === 'removed') {
          console.log('Removed signal: ', change.doc.data())
        }
      })
    })
  }
}, { immediate: true })

// Clean up listeners when component unmounts
onUnmounted(() => {
  if (turnoutUnsubscribe) {
    turnoutUnsubscribe()
  }
  if (effectUnsubscribe) {
    effectUnsubscribe()
  }
  if (signalUnsubscribe) {
    signalUnsubscribe()
  }
})

</script>

<template>
  <v-sheet class="h-full">
    <div class="p-6 h-full flex flex-col gap-6">
      <!-- First Row - Takes only the height it needs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-shrink-0">
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
      </div>

      <!-- Second Row - Uses half of remaining height with scrolling -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div class="overflow-auto">
          <DCCLog />
        </div>
        <div class="overflow-auto">
          <TurnoutLogs :logs="turnoutChanges" />
        </div>
        <div class="overflow-auto">
          <EffectLogs :logs="effectChanges" />
        </div>
      </div>

      <!-- Third Row - Uses half of remaining height with scrolling -->
      <div class="flex-1 min-h-0 overflow-auto">
        <DeviceSerialMonitors :devices="devices" />
      </div>
    </div>
  </v-sheet>
</template>