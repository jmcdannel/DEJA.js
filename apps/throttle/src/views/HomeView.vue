<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import DeviceStatusList from '@repo/ui/src/DeviceStatus/DeviceStatusList.vue'
import { Login } from '@repo/auth'
import Speedometer from '@/throttle/Speedometer.vue'

const user = useCurrentUser()
const router = useRouter()
const layoutId = useStorage('@DEJA/layoutId', '')


function handleThrottleClick(address: number) {
  router.push({ name: 'throttle', params: { address } })
}

function handleRequestAccess() {
  alert('Request access functionality is not yet implemented.')
}

</script>
<template>
  <main class="flex flex-col flex-grow p-8 w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto">
    <header>
      <h2 class="text-transparent text-3xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600 mb-8">
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
      <div class="flex gap-4 flex-col md:flex-row w-full">
        <v-card
          class="mx-auto bg-slate-900 bg-opacity-70 rounded-lg basis-full md:basis-1/2 w-full"
          title="Login"
          color="primary"
          variant="outlined"
        >
          <v-card-text>
            <Login />
          </v-card-text>
        </v-card>
        <v-card
          class="mx-auto bg-slate-900 bg-opacity-70 rounded-lg basis-full md:basis-1/2 w-full"
          title="Sign up"
          color="primary"
          variant="outlined"
        >
          <v-card-text>
            <p class="mb-4">
              Don't have an account? Request to start using DEJA Throttle and other DEJA apps.
            </p>
            <form class="space-y-4 mt-4" @submit.prevent="handleRequestAccess">
              <div>
                <label for="email" class="block text-sm font-medium mb-1">Email</label>
                <input id="email" name="email" type="email" required class="w-full px-3 py-2 border rounded" />
              </div>

              <div class="flex items-center justify-between">
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded">Request Acceess</button>
                <button
                  type="button"
                  class="text-sm text-gray-500 underline"
                  @click="router.push('/guest')">
                  Continue as guest
                </button>
              </div>
            </form>
          </v-card-text>
        </v-card>
      </div>
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