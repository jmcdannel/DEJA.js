<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounce } from '@vueuse/core'
import type { Loco } from '@repo/modules/locos'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import Speedometer from '@/throttle/Speedometer.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { ConsistIndicator, LocoAvatar, FunctionsSpeedDial } from '@repo/ui'
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

function toggleDirection(val: boolean | null) {
  isForward.value = val ?? true
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
  <main v-if="throttle" class="@container flex flex-col gap-2 p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative">
    <ThrottleHeader class="bg-gradient-to-r from-slate-700/20 to-blue-900/20">
      <template v-slot:left>
        <div class="flex flex-row items-center justify-center gap-1 px-4" style="background: rgba(var(--v-theme-surface), 0.6)">
          <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" @park="clearLoco" @stop="handleStop" variant="flat" />
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
      <div v-if="loco && showConsist" class="flex @[640px]:hidden justify-center">
        <ConsistIndicator :loco="loco" />
      </div>

      <!-- Slider + speed + direction -->
      <section class="flex flex-col items-center justify-center flex-1 py-2" style="height: 100%; min-height: 0;">
        <CurrentSpeed :speed="currentSpeed" />
        <v-slider
          v-model="sliderVal"
          direction="vertical"
          step="1"
          max="126"
          thumb-label="always"
          track-size="40"
          thumb-size="28"
          color="purple"
          track-color="purple-darken-4"
          track-fill-color="purple-darken-2"
          thumb-color="purple"
          style="flex: 1; min-height: 0; width: 80px;"
        />
        <div class="flex items-center gap-2 mt-2">
          <span class="text-xs font-bold" :class="isForward ? 'opacity-40' : 'text-red-400'">REV</span>
          <v-switch
            :model-value="isForward"
            @update:model-value="toggleDirection"
            color="purple"
            hide-details
            density="compact"
            inset
            class="lever-switch"
          />
          <span class="text-xs font-bold" :class="isForward ? 'text-green-400' : 'opacity-40'">FWD</span>
        </div>
      </section>

      <!-- Mobile: Functions + Logo -->
      <section v-if="loco" class="flex @[640px]:hidden flex-col gap-2 items-center">
        <FunctionsSpeedDial v-if="showFunctions" :loco="loco" />
        <RoadnameLogo :roadname="loco.meta?.roadname" size="xl" />
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

<style scoped>
.lever-switch :deep(.v-switch__track) {
  height: 28px;
  border-radius: 14px;
  opacity: 1;
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  border: 2px solid #475569;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}
.lever-switch :deep(.v-switch__thumb) {
  width: 24px;
  height: 24px;
  background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
  border: 1px solid #cbd5e1;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
</style>
