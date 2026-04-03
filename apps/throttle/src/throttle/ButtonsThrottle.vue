<script setup lang="ts">
import { toRef } from 'vue'
import { useRouter } from 'vue-router'
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import Speedometer from '@/throttle/Speedometer.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { ConsistIndicator, LocoNumberPlate, FunctionsSpeedDial } from '@repo/ui'
import { ROADNAMES } from '@repo/modules'
import { useThrottle } from '@/throttle/useThrottle'

const props = defineProps({
  address: { type: Number, required: true },
  showFunctions: { type: Boolean, default: true },
  showSpeedometer: { type: Boolean, default: true },
  showConsist: { type: Boolean, default: true },
})

const address = toRef(props, 'address')
const {
  adjustSpeed: handleAdjustSpeed,
  currentSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(address)

const $router = useRouter()

async function clearLoco() {
  handleStop()
  releaseThrottle()
  $router.push({ name: 'throttle-list' })
}
</script>

<template>
  <main v-if="throttle" class="flex flex-col gap-2 p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative">
    <ThrottleHeader class="bg-gradient-to-r from-purple-300/10 to-pink-600/10 text-purple-400/10">
      <template v-slot:left>
        <div class="flex flex-row items-center justify-center gap-1 px-4" style="background: rgba(var(--v-theme-surface), 0.6)">
          <LocoNumberPlate
            v-if="loco"
            :address="loco.address"
            :color="loco.meta?.roadname ? ROADNAMES.find(r => r.value === loco.meta?.roadname)?.color : undefined"
            size="sm"
          />
          <v-spacer class="w-2 md:w-6" />
          <h1 class="text-xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 drop-shadow-lg">
            {{ loco?.name }}
          </h1>
          <v-spacer class="w-2 md:w-6" />
          <RoadnameLogo class="hidden sm:flex" v-if="loco" :roadname="loco.meta?.roadname" size="md" />
        </div>
      </template>
      <template v-slot:right>
        <v-btn color="red" variant="tonal" size="small" class="text-none mr-2" prepend-icon="mdi-alert-octagon" @click="handleStop">E-Stop</v-btn>
        <ThrottleActionMenu @park="clearLoco" />
      </template>
    </ThrottleHeader>

    <section class="w-full h-full flex flex-col sm:flex-row sm:items-center justify-around flex-grow relative z-10">
      <!-- Column 1: Speedometer + Consist + Logo (desktop) -->
      <section v-if="loco" class="hidden sm:flex flex-col gap-4 mb-2 items-center justify-center flex-1 overflow-visible px-4">
        <Speedometer v-if="showSpeedometer" :speed="currentSpeed" :address="address" :size="200" :show-label="false" />
        <ConsistIndicator v-if="showConsist" :loco="loco" />
        <RoadnameLogo :roadname="loco.meta?.roadname" size="xl" />
      </section>
      <section v-if="loco" class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1">
        <ConsistIndicator v-if="loco" :loco="loco" />
        <v-spacer />
        <RoadnameLogo v-if="loco" :roadname="loco.meta?.roadname" :size="'xl'" />
        <v-spacer />
        <FunctionsSpeedDial :loco="loco" />
      </section>

      <!-- Column 3: Speed display + buttons -->
      <section class="flex flex-col gap-2 mb-2 items-center justify-center flex-1" style="max-height: 60vh;">
        <CurrentSpeed :speed="currentSpeed" />
        <ThrottleButtonControls @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
      </section>

      <!-- Mobile-only optional sections -->
      <section v-if="loco" class="flex sm:hidden flex-col gap-2 items-center">
        <FunctionsSpeedDial v-if="showFunctions" :loco="loco" />
      </section>
    </section>
  </main>

  <main v-else>
    <div class="flex flex-col items-center justify-center h-full w-full gap-4">
      <h2 class="text-2xl font-bold opacity-50">No Throttle Assigned</h2>
      <v-btn color="pink" variant="outlined" @click="$router.push({ name: 'throttle-list' })">
        Go to Throttle List
      </v-btn>
    </div>
  </main>
</template>
