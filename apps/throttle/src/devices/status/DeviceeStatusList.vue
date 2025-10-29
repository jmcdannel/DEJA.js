<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useLayout, useEfx, useTurnouts, useLocos, type Device } from '@repo/modules'
import Stat from '@repo/ui/src/Stat.vue'
import DeviceStatusItem from './DeviceStatusItem.vue'
import Speedometer from '@/throttle/Speedometer.vue'

dayjs.extend(relativeTime)

defineEmits(['disconnect'])
const layoutId = useStorage('@DEJA/layoutId', '')
const { getDevices, getLayout } = useLayout()
const { getThrottles } = useLocos()
const { getTurnouts } = useTurnouts()
const { getEffects } = useEfx()
const throttles = getThrottles()
const layout = getLayout()
const devices = getDevices()
const turnouts = getTurnouts()
const effects = getEffects()
const router = useRouter()

function handleThrottleClick(address: number) {
  router.push({ name: 'throttle', params: { address } })
}

</script>
<template>
  <!-- <pre>layoutId:{{layout}}</pre> -->
   <v-row>
    <v-col cols="12" sm="6">
      <v-card 
        color="indigo"
        variant="tonal">
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar
              :color="layoutId ? 'success' : 'error'"
              size="large">
              <v-icon size="32" icon="mdi-train" />
            </v-avatar> 
          </template>
          <template v-slot:append>
            <v-avatar
              :color="layoutId ? 'success' : 'error'"
              size="large">
              <v-icon icon="mdi-lightning-bolt" size="32" />
            </v-avatar>        
          </template>
          <v-card-title>{{ layout?.name }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <v-chip size="x-large" color="indigo" variant="flat" prepend-icon="mdi-star-circle-outline">
            {{ layoutId }}
          </v-chip>
          <Stat :label="'Device'" :value="devices.length" :emptyLabel="'No devices found'" color="red" class="mt-4" />
          <Stat :label="'Turnout'" :value="turnouts.length" :emptyLabel="'No turnouts found'" color="blue" class="mt-4" />
          <Stat :label="'Effect'" :value="effects.length" :emptyLabel="'No effects found'" color="purple" class="mt-4" />          
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            variant="flat"
            @click="$emit('disconnect')">
            Disconnect
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6">
      <v-list
        v-if="throttles?.length"
        class="flex flex-wrap gap-4 p-4 justify-center bg-transparent">
        <Speedometer
          v-for="throttle in throttles"
          :key="throttle.address"
          :speed="throttle.speed"
          :address="throttle.address"
          @click="handleThrottleClick(throttle.address)"
        />
      </v-list>
    </v-col>
   </v-row>
        
   <v-row halign="start" justify="start" dense>
    <v-col cols="12" sm="4" lg="3"
      v-for="device in devices"
      :key="device.id" >
      <DeviceStatusItem :device="device" />
    </v-col>
  </v-row>
  
</template>