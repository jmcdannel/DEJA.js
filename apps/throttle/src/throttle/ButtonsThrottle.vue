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
  <main v-if="throttle" class="@container flex flex-col gap-2 p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative">
    <ThrottleHeader class="bg-gradient-to-r from-slate-700/20 to-blue-900/20">
      <template v-slot:left>
        <div class="flex flex-row items-center justify-center gap-1 px-4" style="background: rgba(var(--v-theme-surface), 0.6)">
          <LocoNumberPlate
            v-if="loco"
            :address="loco.address"
            :color="loco.meta?.roadname ? ROADNAMES.find(r => r.value === loco.meta?.roadname)?.color : undefined"
            size="sm"
          />
          <v-spacer class="w-2 md:w-6" />
          <h1 class="text-xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-lg">
            {{ loco?.name }}
          </h1>
        </div>
      </template>
      <template v-slot:right>
        <ThrottleActionMenu @park="clearLoco" />
      </template>
    </ThrottleHeader>

    <section class="w-full h-full flex flex-col @[640px]:flex-row @[640px]:items-center justify-around flex-grow relative z-10">
      <!-- Desktop left: Consist + Speedometer -->
      <section v-if="loco" class="hidden @[640px]:flex flex-col gap-4 items-center justify-center flex-1">
        <ConsistIndicator v-if="showConsist" :loco="loco" />
        <Speedometer v-if="showSpeedometer" :speed="currentSpeed" :address="address" :size="200" :show-label="false" />
        <div v-if="showConsist && loco.consist?.length" class="grid grid-cols-2 gap-3">
          <Speedometer
            v-for="cloco in loco.consist"
            :key="cloco.address"
            :speed="currentSpeed"
            :address="cloco.address"
            :size="120"
            :show-label="true"
          />
        </div>
      </section>

      <!-- Desktop center: Logo + Functions -->
      <section v-if="loco" class="hidden @[640px]:flex flex-col gap-2 items-center justify-center flex-1">
        <RoadnameLogo :roadname="loco.meta?.roadname" size="2xl" />
        <FunctionsSpeedDial v-if="showFunctions" :loco="loco" />
      </section>

      <!-- Mobile: Consist -->
      <div v-if="loco && showConsist" class="flex @[640px]:hidden justify-center order-1">
        <ConsistIndicator :loco="loco" />
      </div>

      <!-- Desktop right / Mobile: Speed display + buttons -->
      <section class="flex flex-col gap-2 mb-2 items-center justify-center flex-1 order-2" style="max-height: 60vh;">
        <CurrentSpeed :speed="currentSpeed" />
        <ThrottleButtonControls @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
      </section>

      <!-- Mobile: Functions -->
      <section v-if="loco && showFunctions" class="flex @[640px]:hidden flex-col gap-2 items-center justify-center order-3">
        <FunctionsSpeedDial :loco="loco" />
      </section>

      <!-- Mobile: Logo -->
      <div v-if="loco" class="flex @[640px]:hidden justify-center order-4 mb-2">
        <RoadnameLogo :roadname="loco.meta?.roadname" size="xl" />
      </div>
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
