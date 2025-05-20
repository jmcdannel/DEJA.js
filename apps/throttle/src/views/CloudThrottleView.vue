<script async setup lang="ts">
  import { computed, watch, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import router from '../router'
  import type { Loco, Throttle } from '@/throttle/types'
  import ThrottleComponent from '@/throttle/Throttle.vue'
  import { useLocos } from '@/api/useLocos'
  import { useDejaCloud } from '@/deja-cloud/useDejaCloud'

  const route = useRoute()
  const { releaseThrottle } = useDejaCloud()
  const { getThrottles, getLocos } = useLocos()

  const address = ref(parseInt(route.params.address?.toString()))
  const throttles = getThrottles()
  const locos = getLocos()

  const currentThrottle = computed<Throttle|null>(() => (throttles?.value.find((throttle) => throttle.address === address.value) as Throttle) || null)
  
  watch(
    () => route.params.address,
    (newId, oldId) => {
      address.value = parseInt(newId?.toString())
    }
  )

  async function handleRelease(address: number) {
    if (address) {
      await releaseThrottle(address)
      router.push({ name: 'home' })
    }
  }

  function getLoco(locoAddress: number) {
    return locos?.value.find((loco) => loco.locoId === locoAddress)
  }

  const loco = computed<Loco|null>(() => currentThrottle?.value && (getLoco(currentThrottle.value?.address) as Loco) || null)

</script>

<template>
  <template v-if="currentThrottle && loco">
    <ThrottleComponent
      :throttle="currentThrottle"
      :loco="loco"
      @release="handleRelease"
    />
  </template>
</template>
