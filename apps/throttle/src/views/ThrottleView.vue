<script async setup lang="ts">
  import { watch, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useLocos, type LocoThrottle } from '@repo/modules/locos'
  import Throttle from '@/throttle/Throttle.vue'

  const route = useRoute()
  const { getLocoThrottle } = useLocos()

  const address = ref(parseInt(route.params.address?.toString()))
  const locoThrottle = ref(<LocoThrottle | null>null)

  watch(
    address,
    async (newAddress) => {
      locoThrottle.value = await getLocoThrottle(newAddress)
    },
    { immediate: true }
  )

  
</script>

<template>
  <Throttle  v-if="locoThrottle"
    :throttle="locoThrottle.throttle"
    :loco="locoThrottle.loco"
  />
</template>
