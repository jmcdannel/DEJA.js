<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocos } from '@repo/modules/locos'
import ThrottleNavItem from '@/throttle/ThrottleNavItem.vue'
import ThrottleSwipeContainer from '@/throttle/ThrottleSwipeContainer.vue'
import ButtonsThrottle from '@/throttle/ButtonsThrottle.vue'
import SliderThrottle from '@/throttle/SliderThrottle.vue'
import Dashboard from '@/throttle/Dashboard.vue'
import { useThrottleSettings } from '@/throttle/useThrottleSettings'
import SaveToRosterChip from '@/throttle/SaveToRosterChip.vue'

const route = useRoute()
const router = useRouter()
const { getThrottles } = useLocos()
const throttles = getThrottles()

const routeAddr = computed(() => route.params.address ? parseInt(route.params.address.toString()) : NaN)
const activeAddress = ref<number | null>(Number.isNaN(routeAddr.value) ? (throttles.value[0]?.address ?? null) : routeAddr.value)

// Sync route → activeAddress
watch(routeAddr, (addr) => {
  if (!Number.isNaN(addr)) activeAddress.value = addr
})

// Sync activeAddress → route (when swipe changes it)
watch(activeAddress, (addr) => {
  if (addr != null && addr !== routeAddr.value) {
    router.replace({ name: 'throttle', params: { address: addr } })
  }
})

const { variant, speedDisplayType, showFunctions, showSpeedometer, showConsist } = useThrottleSettings()

const variantMap = {
  buttons: ButtonsThrottle,
  slider: SliderThrottle,
  dashboard: Dashboard,
} as const

const variantComponent = computed(() => variantMap[variant.value] ?? ButtonsThrottle)

const settingsProps = computed(() => ({
  showFunctions: showFunctions.value,
  showSpeedometer: showSpeedometer.value,
  showConsist: showConsist.value,
  speedDisplayType: speedDisplayType.value,
}))

function handleSelect(newAddress: number) {
  activeAddress.value = newAddress
}
</script>

<template>
  <div class="@container flex-grow flex flex-col relative overflow-hidden w-full h-full flex-1 min-h-0">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"></div>
      <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"></div>
      <div class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"></div>
    </div>
    <div class="absolute top-2 left-2 z-10">
      <SaveToRosterChip v-if="!Number.isNaN(routeAddr)" :address="routeAddr" />
    </div>

    <!-- 🚂 Swipeable throttle controls -->
    <ThrottleSwipeContainer
      v-if="throttles && throttles.length > 0"
      :throttles="throttles"
      :model-value="activeAddress"
      :variant-component="variantComponent"
      :variant-props="settingsProps"
      class="flex-1 min-h-0"
      @update:model-value="activeAddress = $event"
    />

    <!-- No throttle fallback -->
    <div v-else class="flex flex-col items-center justify-center flex-1 gap-4">
      <h2 class="text-2xl font-bold opacity-50">No Throttle Assigned</h2>
      <v-btn color="pink" variant="outlined" @click="$router.push({ name: 'throttle-list' })">
        Go to Throttle List
      </v-btn>
    </div>

    <!-- 🚂 Nav chips -->
    <v-slide-group selected-class="bg-success" show-arrows>
      <v-slide-group-item v-for="item in throttles" :key="item.id">
        <ThrottleNavItem v-if="item.address" :address="item.address" @select="handleSelect(item.address)" />
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>
