<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core' 
import { useLayout } from '@repo/modules/layouts'
import { useLocos } from '@repo/modules/locos'
import { useTurnouts } from '@repo/modules/turnouts'
import { useEfx } from '@repo/modules/effects'
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
  <v-app-bar color="indigo-darken-4" dark>
    <template #title>
      <h1>Dashboard - {{ layoutId}}</h1>
    </template>
  </v-app-bar>
  <!-- <pre>
    {{ layout }}
  </pre> -->
  <v-sheet class="p-4 flex flex-col gap-4 h-full">
    <div class="grid grid-cols-4 gap-4">
      <v-card variant="tonal" color="red">
        <v-card-title>Layout Information</v-card-title>
        <v-card-text class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-red text-2xl font-semibold mb-1">{{ layoutId }}</div>
            <div class="text-sm font-medium text-gray-400">Layout ID</div>
          </div>
          <div>
            <div class="text-red text-2xl font-semibold mb-1">{{ layout?.name }}</div>
            <div class="text-sm font-medium text-gray-400">Layout Name</div>
          </div>
        </v-card-text>
      </v-card>
      <v-card variant="tonal" color="green">
        <v-card-title>Turnout Information</v-card-title>
        <v-card-text class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-green text-2xl font-semibold mb-1">{{ turnouts.length }}</div>
            <div class="text-sm font-medium text-gray-400">Turnouts</div>
          </div>
          <div>
            <div class="text-green text-2xl font-semibold mb-1">{{ turnoutsThrownCount }}</div>
            <div class="text-sm font-medium text-gray-400">Turnouts Thrown</div>
          </div>
        </v-card-text>
      </v-card>
      <v-card variant="tonal" color="blue">
        <v-card-title>Effect Information</v-card-title>
        <v-card-text class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-blue text-2xl font-semibold mb-1">{{ effects.length }}</div>
            <div class="text-sm font-medium text-gray-400">Effects</div>
          </div>
          <div>
            <div class="text-blue text-2xl font-semibold mb-1">{{ efxThrownCount }}</div>
            <div class="text-sm font-medium text-gray-400">Effects Active</div>
          </div>
        </v-card-text>
      </v-card>
      <v-card variant="tonal" color="purple">
        <v-card-title>Throttle Information</v-card-title>
        <v-card-text class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-purple text-2xl font-semibold mb-1">{{ throttles.length }}</div>
            <div class="text-sm font-medium text-gray-400">Throttles</div>
          </div>
          <div>
            <div class="text-purple text-2xl font-semibold mb-1">{{ throttles.filter(t => t.speed > 0).length }}</div>
            <div class="text-sm font-medium text-gray-400">Throttles Active</div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <div class=" grid grid-cols-2 gap-4">
      <v-card color="zinc-500" variant="tonal">
        <v-card-title>Devices</v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Type</th>
                <th>Status</th>
                <th>Config</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="device in devices" :key="device.id">
                <td>{{ device.id }}</td>
                <td>{{ device.type }}</td>
                <td>
                  <v-chip :text="device.isConnected ? 'Connected' : 'Disconnected'" 
                          :color="device.isConnected ? 'green' : 'red'">
                    {{ device.isConnected ? 'Connected' : 'Disconnected' }}
                  </v-chip>
                </td>
                <td>{{ device?.port || device?.topic }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <v-card color="zinc-500" variant="tonal">
        <v-card-title>Throttles</v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Loco Address</th>
                <th>Speed</th>
                <th>Direction</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="throttle in throttles" :key="throttle.address">
                <td><v-avatar color="primary" size="64">{{ throttle.address }}</v-avatar></td>
                <td><v-avatar color="secondary" tile size="64">{{ throttle.speed }}</v-avatar></td>
                <td>{{ throttle.direction ? 'Forward' : 'Reverse' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>

    <div class="flex-grow grid grid-cols-2 gap-4">
      <v-card variant="tonal" class="h-full min-h-0 overflow-auto">
        <v-card-title>Turnout Logs</v-card-title>
        <v-card-text class="flex flex-col-reverse gap-4">
          <v-alert v-for="log in turnoutChanges" :key="log.id" :color="log?.color || 'info'" type="info" variant="tonal">
            <div class="flex items-center gap-x-8">
              <v-icon :icon="log.state ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'" size="64" />
              <span class="font-semibold text-3xl">{{ log.name }}</span>
              <span class="text-sm">{{ log.state ? 'Thrown' : 'Closed' }}</span>
              <v-spacer></v-spacer>
              <v-chip>{{ log.device }}</v-chip>
            </div>
          </v-alert>
            <!-- <pre v-for="log in turnoutChanges">{{ log }}</pre> -->
        </v-card-text>
      </v-card>
      <v-card color="zinc-500" variant="tonal" class="min-h-[420px]">
        <v-card-title>Effect Logs</v-card-title>
        <v-card-text class="flex flex-col-reverse gap-4">
          <v-alert v-for="log in effectChanges" :key="log.id" :color="log?.color || 'info'" type="info" variant="tonal">
            <div class="flex items-center gap-x-8">
              <v-icon :color="log.state ? 'green' : 'red'" :icon="log.state ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'" size="64" />
              <span class="font-semibold text-3xl">{{ log.name }}</span>
              <span class="text-sm">{{ log.state ? 'On' : 'Off' }}</span>
              <v-spacer></v-spacer>
              <v-chip>{{ log.device }}</v-chip>
            </div>
          </v-alert>
        </v-card-text>
      </v-card>
    </div>
  </v-sheet>
</template>