<script async setup lang="ts">
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import Throttle from '@/throttle/Throttle.vue'

  const route = useRoute()
  const address = ref(parseInt(route.params.address?.toString()))

</script>

<template>
  <Throttle :address="address" />
</template>
