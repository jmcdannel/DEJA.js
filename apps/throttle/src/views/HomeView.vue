<script setup lang="ts">
import { storeToRefs } from 'pinia'
  import SelectConnections from '../connections/SelectConnections.component.vue'
  import ThrottleView from '../views/ThrottleView.vue'
  import { useConnectionStore } from '@/connections/connectionStore.jsx'

  const { dejaConnected, isEmulated, serialConnected } = storeToRefs(useConnectionStore())

</script>
<template>
  <main class="flex" v-if="dejaConnected || isEmulated || serialConnected">
    <ThrottleView />
  </main>
  <main class="flex" v-else>
    <SelectConnections /> 
  </main>
</template>