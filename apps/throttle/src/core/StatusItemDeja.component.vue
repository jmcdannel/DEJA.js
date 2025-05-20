<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { 
    BsFillLightningChargeFill
  } from 'vue3-icons/bs'
  import { useConnectionStore } from '@/connections/connectionStore.jsx'
  import StatusMenuItem from '@/core/StatusMenuItem.component.vue'

  const { dejaConnected } = storeToRefs(useConnectionStore())
</script>
<template>
  <StatusMenuItem 
    :icon="BsFillLightningChargeFill" 
    :is-connected="dejaConnected"
    item-label="DEJA.js" 
    page="deja"
    highlight-color="sky">    
    {{ dejaConnected ? 'Connected' : 'Disconnected' }}
  </StatusMenuItem>
</template>