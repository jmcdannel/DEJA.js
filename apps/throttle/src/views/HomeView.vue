<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import DeviceStatusList from '@repo/ui/src/DeviceStatus/DeviceStatusList.vue'
import Speedometer from '@/throttle/Speedometer.vue'

const user = useCurrentUser()
const router = useRouter()
const layoutId = useStorage('@DEJA/layoutId', '')


function handleThrottleClick(address: number) {
  router.push({ name: 'throttle', params: { address } })
}
</script>
<template>
  <main class="flex flex-col flex-grow p-8 w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto">
    <header>
      <h2 class="text-transparent text-3xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600 my-4">
        Welcome to <br>
        <span class="text-8xl font-bold uppercase bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">DEJA</span>
        <br>
        <span class="text-6xl font-bold uppercase bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-400">Throttle</span>
      </h2>
    </header>
    
    <DeviceStatusList v-if="user && layoutId"
      :show-throttles="true"
      @disconnect="router.push('/connect')"
      @throttle-click="handleThrottleClick">
      <template #throttles="{ throttles, handleThrottleClick }">
        <Speedometer
          v-for="throttle in throttles"
          :key="throttle.address"
          :speed="throttle.speed"
          :address="throttle.address"
          @click="handleThrottleClick(throttle.address)"
        />
      </template>
    </DeviceStatusList>
    <template v-else-if="!user">
      <p class="text-lg mb-4">
        Please connect to a layout to see the status.
      </p>
      <v-btn
        class="mt-4"
        color="primary"
        @click="router.push('/login')">
        Sign In
      </v-btn>
    </template>
    <template v-else>
      <p class="text-lg mb-4">
        No layout connected. Please select a layout to view its status.
      </p>
      <v-btn
        class="mt-4"
        color="primary"
        @click="router.push('/connect')">
        Select Layout
      </v-btn>
    </template>
  </main>
</template>