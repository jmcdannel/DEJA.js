<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLocos, type Loco } from '@repo/modules/locos'
import { useThrottleStore } from "@/throttle/throttleStore"
import ThrottleComponent from '@/throttle/Throttle.vue'
import type { Throttle } from '@/throttle/types'

const route = useRoute()
const { acquireThrottle, releaseThrottle } = useThrottleStore()
const { getLoco } = useLocos()
const throttle = computed<Throttle | null>(() => {
  const address = route.params?.address ? parseInt(route.params.address.toString()) : null
  return address ? acquireThrottle(address) : null
})
const loco = computed<Loco | null>(() => {
  const address = route.params?.address ? route.params.address.toString() : null
  return address ? getLoco(address) as unknown as Loco : null
})

function handleRelease() {
  throttle.value?.id && releaseThrottle(throttle.value?.id)
}
</script>

<template>
  <template v-if="throttle && loco">
    <ThrottleComponent :throttle="throttle" :loco="loco" @release="handleRelease" />
  </template>
</template>
