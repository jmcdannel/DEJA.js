<script async setup lang="ts">
  import { useRouter } from 'vue-router'
  import ThrottleTile from '@/throttle/ThrottleTile.vue'

  import { useLocos } from '@/api/useLocos'
  import { useDejaCloud } from '@/deja-cloud/useDejaCloud'

  const $router = useRouter()
  const { releaseThrottle } = useDejaCloud()
  const { getThrottles, getLocos } = useLocos()

  const throttles = getThrottles()
  const locos = getLocos()

  async function handleRelease(address: number) {
    console.log('handleRelease', address)
    if (address) {
      await releaseThrottle(address)
    }
  }

  async function handleSelect(address: number) {
    console.log('handleRelease', address)
    if (address) {      
      $router.push({ name: 'cloud-throttle', params: { address } })
    }
  }

  function getLoco(locoAddress: number) {
    console.log('getLoco', locoAddress, locos?.value)
    return locos?.value.find((loco) => loco.locoId === locoAddress)
  }

</script>

<template>
  <template v-if="locos?.length  && throttles?.length">
    <div class="flex-grow flex flex-col relative overflow-auto">
      <div class="flex-grow"></div>
      <ThrottleTile 
        v-for="throttle in throttles"
        :key="throttle.id"
        :throttle="throttle" 
        :loco="getLoco(throttle.address)"
        @release="handleRelease"
        @select="handleSelect"
      />
    </div>
  </template>
  <!-- <pre>
    {{ throttles }}
  </pre> -->
</template>
