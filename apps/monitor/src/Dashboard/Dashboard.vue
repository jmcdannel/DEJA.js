<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core' 
import { useLayout } from '@repo/modules/layouts'
import { useLocos } from '@repo/modules/locos'
import { useTurnouts } from '@repo/modules/turnouts'
import { useEfx } from '@repo/modules/effects'
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
import { db } from '@repo/firebase-config/firebase'
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
  <!-- <v-sheet class="dashboard-layout flex flex-col gap-4">
    <div class="grid grid-cols-4 gap-4 px-4 pt-4">
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
    
    <div class="grid grid-cols-2 gap-4 px-4 ">
      <DevicesTable :devices="devices" />
      <ThrottleStatus :throttles="throttles" />
    </div>

    <div class="flex-grow grid grid-cols-3 gap-4 px-4 pb-4">
      <TurnoutLogs :logs="turnoutChanges" />
      <EffectLogs :logs="effectChanges" />
      <SensorLogs :logs="sensorChanges" />
      <DCCLog />
    </div>
  </v-sheet> -->
  <div class="dashboard-layout">
      <div class="p-6 h-screen grid grid-rows-[180px_1fr] gap-6">
        <!-- First Row - Fixed Height -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        <!-- Second Row - Fill Remaining Height -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
          <DCCLog />
          
          <TurnoutLogs :logs="turnoutChanges" />

          <EffectLogs :logs="effectChanges" />

        </div>
      </div>
    </div>
</template>
<style scoped>

@media (min-width: 960px) {
  .dashboard-layout {
    height: calc(100vh - 12.5Krem - var(--v-layout-bottom) - var(--v-layout-top));
  }
}

</style>