<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounce } from '@vueuse/core'
import type { Loco } from '@repo/modules/locos'
import Speedometer from '@/throttle/Speedometer.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { Consist, LocoAvatar, MiniConsist, FunctionsSpeedDial } from '@repo/ui'
import { useThrottle } from '@/throttle/useThrottle'

const props = defineProps({
  address: { type: Number, required: true },
  showFunctions: { type: Boolean, default: true },
  showSpeedometer: { type: Boolean, default: true },
  showConsist: { type: Boolean, default: true },
})

const address = toRef(props, 'address')
const {
  currentSpeed,
  setSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(address)

const $router = useRouter()

// Local slider state synced with currentSpeed
const sliderVal = ref(Math.abs(currentSpeed.value))
const isForward = ref(currentSpeed.value >= 0)

watch(currentSpeed, (v) => {
  sliderVal.value = Math.abs(v)
  isForward.value = v >= 0
})

// Debounced speed emission (same pattern as SliderControls / ThrottleSlider)
const debouncedSpeed = useDebounce(sliderVal, 500)

watch(debouncedSpeed, (speed) => {
  const signedSpeed = isForward.value ? speed : -speed
  if (currentSpeed.value === signedSpeed) return
  setSpeed(signedSpeed)
})

function toggleDirection() {
  isForward.value = !isForward.value
  if (sliderVal.value !== 0) {
    const signedSpeed = isForward.value ? sliderVal.value : -sliderVal.value
    setSpeed(signedSpeed)
  }
}

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
          <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" @park="clearLoco" @stop="handleStop" variant="flat" />
          <MiniConsist v-if="loco" :loco="loco" />
          <v-spacer class="w-2 md:w-6" />
          <h1 class="text-xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 drop-shadow-lg">
            {{ loco?.name }}
          </h1>
          <v-spacer class="w-2 md:w-6" />
          <RoadnameLogo class="hidden sm:flex" v-if="loco" :roadname="loco.meta?.roadname" size="md" />
        </div>
      </template>
      <template v-slot:right>
        <ThrottleActionMenu @park="clearLoco" />
      </template>
    </ThrottleHeader>

    <section class="w-full h-full flex flex-col sm:flex-row justify-around flex-grow relative z-10">
      <!-- Column 1: Speedometer + Consist + Logo (desktop) -->
      <section v-if="loco" class="hidden sm:flex flex-col gap-2 mb-2 items-center justify-center flex-1 overflow-visible">
        <Speedometer v-if="showSpeedometer" :speed="currentSpeed" :address="address" :size="200" :show-label="false" />
        <Consist v-if="showConsist" :loco="loco" />
        <RoadnameLogo :roadname="loco.meta?.roadname" size="xl" />
      </section>

      <!-- Column 2: Functions (desktop) -->
      <section v-if="loco && showFunctions" class="hidden sm:flex flex-col gap-2 mb-2 items-center justify-center flex-1">
        <FunctionsSpeedDial :loco="loco" />
      </section>

      <!-- Column 3: Vertical slider + direction toggle -->
      <section class="flex flex-col items-center justify-center flex-1 h-full py-4">
        <v-slider
          v-model="sliderVal"
          direction="vertical"
          step="1"
          max="126"
          thumb-label="always"
          show-ticks
          track-size="40"
          thumb-size="28"
          color="purple"
          track-color="purple-darken-4"
          track-fill-color="purple-darken-2"
          thumb-color="purple"
          class="h-full"
        />
        <v-btn
          :color="isForward ? 'purple' : 'pink'"
          variant="tonal"
          size="large"
          class="mt-2"
          @click="toggleDirection"
        >
          {{ isForward ? 'FWD' : 'REV' }}
        </v-btn>
      </section>

      <!-- Mobile-only optional sections -->
      <section v-if="loco" class="flex sm:hidden flex-col gap-2 items-center">
        <FunctionsSpeedDial v-if="showFunctions" :loco="loco" />
      </section>
    </section>
  </main>

  <main v-else>
    <div class="flex flex-col items-center justify-center h-full w-full gap-4">
      <h2 class="text-2xl font-bold text-gray-700">No Throttle Assigned</h2>
      <v-btn color="pink" variant="outlined" @click="$router.push({ name: 'throttle-list' })">
        Go to Throttle List
      </v-btn>
    </div>
  </main>
</template>
