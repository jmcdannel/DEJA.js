<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  import { useThrottleStore } from "@/throttle/throttleStore"
  import ThrottleComponent from '@/throttle/Throttle.vue'
  import type { Throttle } from '@/throttle/types'

  const route = useRoute()
  const { acquireThrottle, releaseThrottle } = useThrottleStore()
  const throttle  = computed(() => route.params?.address
    ? acquireThrottle(parseInt(route.params.address.toString()))
    : null)

  function handleRelease() {
    throttle.value?.id && releaseThrottle(throttle.value?.id)
  }
</script>

<template>
  <template v-if="throttle">
    <ThrottleComponent :throttle="throttle" @release="handleRelease" />
  </template>
</template>
