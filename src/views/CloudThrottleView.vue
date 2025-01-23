<script async setup lang="ts">
  import { computed, watch, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import router from '../router'
  import type { Loco, Throttle } from '@/throttle/types'

  import ThrottleComponent from '@/throttle/Throttle.component.vue'

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
      console.log('watch oute.params.address', newId, oldId, currentThrottle.value)
      address.value = parseInt(newId?.toString())
    }
  )

  async function handleRelease(address: number) {
    console.log('handleRelease', address)
    if (address) {
      await releaseThrottle(address)
      router.push({ name: 'home' })
    }
  }

  function getLoco(locoAddress: number) {
    return locos?.value.find((loco) => loco.locoId === locoAddress)
  }

  const loco = computed<Loco|null>(() => currentThrottle?.value && (getLoco(currentThrottle.value?.address) as Loco) || null)

console.log('currentThrottle', currentThrottle.value)
</script>

<template>
  <!-- <ThrottleMenu /> -->
  <template v-if="currentThrottle && loco">
    <!-- <pre>{{ currentThrottle }}</pre> -->
    <ThrottleComponent
      :throttle="currentThrottle"
      :loco="loco"
      @release="handleRelease"
    />
  </template>
</template>
