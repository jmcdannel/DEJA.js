<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core' 
import { useLayout, useLocos, useTurnouts, useEfx } from '@repo/modules'
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

const TIMEOUT  = 30000 // 30 seconds for the timeout

const { getLayout, getDevices } = useLayout()
const { getThrottles } = useLocos()
const { getTurnouts } = useTurnouts()
const { getEffects } = useEfx()
const layoutId = useStorage('@DEJA/layoutId', '')
const layout = getLayout()
const devices = getDevices()
const throttles = getThrottles()
const turnouts = getTurnouts()
const effects = getEffects()
const turnoutChanges = ref<DocumentData[]>([])
const effectChanges = ref<DocumentData[]>([])
const sensorChanges = ref<DocumentData[]>([])
const turnoutsThrownCount = ref(0)
const efxThrownCount = ref(0)

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

onSnapshot(collection(db, `layouts/${layoutId.value}/turnouts`), (snapshot) => {
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

onSnapshot(collection(db, `layouts/${layoutId.value}/effects`), (snapshot) => {
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