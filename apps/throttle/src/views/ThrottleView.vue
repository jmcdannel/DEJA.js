<script async setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useSwipe, type UseSwipeDirection } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useLocos } from '@repo/modules/locos'
import ThrottleNavItem from '@/throttle/ThrottleNavItem.vue'
import Throttle from '@/throttle/Throttle.vue'

const route = useRoute()
const router = useRouter()
const address = ref(parseInt(route.params.address?.toString()))
const { getThrottles } = useLocos()
const throttles = getThrottles()
const throttleNavRef = useTemplateRef('throttleNavRef')
const { isSwiping, direction } = useSwipe(throttleNavRef, {
    passive: false,
    onSwipe(e: TouchEvent) {
      
    },
    onSwipeEnd(e: TouchEvent, direction: UseSwipeDirection) {
      if (direction === 'left') {
        const currentIndex = throttles.value.findIndex(t => t.address === address.value)
        const nextIndex = (currentIndex + 1) % throttles.value.length
        const nextAddress = throttles.value[nextIndex]?.address
        if (nextAddress !== undefined) {
          address.value = nextAddress
          router.push({ name: 'throttle', params: { address: nextAddress } })
        }
      } else if (direction === 'right') {
        const currentIndex = throttles.value.findIndex(t => t.address === address.value)
        const prevIndex = (currentIndex - 1 + throttles.value.length) % throttles.value.length
        const prevAddress = throttles.value[prevIndex]?.address
        if (prevAddress !== undefined) {
          address.value = prevAddress
          router.push({ name: 'throttle', params: { address: prevAddress } })
        }
      }
    },
  },)

console.log('ThrottleView.vue initial address:', address.value)

watch(() => route.params.address, (newVal) => {
  address.value = parseInt(newVal?.toString())
})

function handleSelect(newAddress: number) {
  address.value = newAddress
  router.push({ name: 'throttle', params: { address: newAddress } })
}

</script>

<template>
  <div class="@container flex-grow flex flex-col relative overflow-hidden w-full h-full flex-1" ref="throttleNavRef">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"></div>
      <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"></div>
      <div class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"></div>
    </div>
    <Throttle :address="address" />
    <v-slide-group
      
      selected-class="bg-success"
      show-arrows
    >
    <v-slide-group-item 
      v-for="item in throttles"
      :key="item.id">
      <ThrottleNavItem :address="item.address" @select="handleSelect(item.address)" />
    </v-slide-group-item>
  </v-slide-group>
  </div>
</template>
