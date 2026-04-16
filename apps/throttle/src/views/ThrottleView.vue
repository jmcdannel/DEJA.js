<script async setup lang="ts">
import { computed, watch, useTemplateRef } from 'vue'
import { useStorage, useSwipe, type UseSwipeDirection } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useLocos } from '@repo/modules/locos'
import ThrottleNavItem from '@/throttle/ThrottleNavItem.vue'
import ButtonsThrottle from '@/throttle/ButtonsThrottle.vue'
import SliderThrottle from '@/throttle/SliderThrottle.vue'
import Dashboard from '@/throttle/Dashboard.vue'
import { useThrottleSettings } from '@/throttle/useThrottleSettings'
import SaveToRosterChip from '@/throttle/SaveToRosterChip.vue'

const route = useRoute()
const router = useRouter()
const { getThrottles } = useLocos()
const throttles = getThrottles()
const lastThrottleAddress = useStorage<number>('@DEJA/lastThrottleAddress', throttles.value[0]?.address || 3)
const routeAddr = computed(() => route.params.address ? parseInt(route.params.address.toString()) : NaN)
if (!Number.isNaN(routeAddr.value)) {
  lastThrottleAddress.value = routeAddr.value
} else if (lastThrottleAddress.value === undefined || Number.isNaN(lastThrottleAddress.value)) {
  lastThrottleAddress.value = 3
}
const throttleNavRef = useTemplateRef('throttleNavRef')
useSwipe(throttleNavRef, {
    passive: false,
    onSwipe(e: TouchEvent) {
      
    },
    onSwipeEnd(e: TouchEvent, direction: UseSwipeDirection) {
      if (direction === 'left') {
        const currentIndex = throttles.value.findIndex(t => t.address === lastThrottleAddress.value)
        const nextIndex = (currentIndex + 1) % throttles.value.length
        const nextAddress = throttles.value[nextIndex]?.address
        if (nextAddress !== undefined) {
          lastThrottleAddress.value = nextAddress
          router.push({ name: 'throttle', params: { address: nextAddress } })
        }
      } else if (direction === 'right') {
        const currentIndex = throttles.value.findIndex(t => t.address === lastThrottleAddress.value)
        const prevIndex = (currentIndex - 1 + throttles.value.length) % throttles.value.length
        const prevAddress = throttles.value[prevIndex]?.address
        if (prevAddress !== undefined) {
          lastThrottleAddress.value = prevAddress
          router.push({ name: 'throttle', params: { address: prevAddress } })
        }
      }
    },
  },)

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

watch(() => route.params.address, (newVal) => {
  lastThrottleAddress.value = parseInt(newVal?.toString())
})

function handleSelect(newAddress: number) {
  lastThrottleAddress.value = newAddress
  router.push({ name: 'throttle', params: { address: newAddress } })
}

</script>

<template>
  <div class="@container flex-grow flex flex-col relative overflow-hidden w-full h-full flex-1 min-h-0" ref="throttleNavRef">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"></div>
      <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"></div>
      <div class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"></div>
    </div>
    <div class="absolute top-2 left-2 z-10">
      <SaveToRosterChip v-if="!Number.isNaN(routeAddr)" :address="routeAddr" />
    </div>
    <component :is="variantComponent" :address="routeAddr" v-bind="settingsProps" class="flex-1 min-h-0" />
    <v-slide-group
      selected-class="bg-success"
      show-arrows
    >
      <v-slide-group-item
        v-for="item in throttles"
        :key="item.id"
      >
        <ThrottleNavItem v-if="item.address" :address="item.address" @select="handleSelect(item.address)" />
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>
