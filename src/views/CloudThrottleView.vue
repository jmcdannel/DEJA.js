<script async setup lang="ts">
  import { computed, watch, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useStorage } from '@vueuse/core'
  import router from '../router'

  import ThrottleComponent from '@/throttle/Throttle.component.vue'

  import { useLocos } from '@/api/useLocos'
  import { useDejaCloud } from '@/deja-cloud/useDejaCloud'

  const route = useRoute()
  const { releaseThrottle } = useDejaCloud()
  const { getThrottles, getLocos } = useLocos()

  const viewAs = useStorage('@DEJA/prefs/throttleView', 'Array')

  const address = ref(parseInt(route.params.address?.toString()))
  const throttles = getThrottles()
  const locos = getLocos()
  const currentThrottle = computed(() => throttles?.value.find((throttle) => throttle.address === address.value))
  
  watch(
    () => route.params.address,
    (newId, oldId) => {
      console.log('watch oute.params.address', newId, oldId)
      address.value = parseInt(newId?.toString())
      currentThrottle.value = throttles?.value.find((throttle) => throttle.address === address.value)
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

</script>

<template>
  <!-- <ThrottleMenu /> -->
  <template v-if="locos?.length  && throttles?.length && currentThrottle">
    <ThrottleComponent
      :throttle="currentThrottle" 
      :loco="getLoco(currentThrottle.address)"
      :viewAs="viewAs"
      @release="handleRelease"
    />
  </template>
</template>
