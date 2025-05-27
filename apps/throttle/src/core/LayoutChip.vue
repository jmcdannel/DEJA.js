<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { useConnectionStore } from '@/connections/connectionStore.jsx'
  import { useDcc } from '@repo/dccex'
  const { sendDccCommand } = useDcc()
  const { 
    dccExConnected, 
    layoutId
  } = storeToRefs(useConnectionStore())

function handleLayoutClick() {
  sendDccCommand({ action: 'getStatus', payload: { } })
}

</script>
<template>
  <v-chip v-if="layoutId" 
    :color="dccExConnected ? 'success' : 'warning'" 
    :class="dccExConnected ? '' : 'animate-pulse'"
    @click="handleLayoutClick"
    size="large"
    :text="layoutId"
    variant="tonal">
    <template #prepend>
      <v-icon icon="mdi-chip" />
    </template>
  </v-chip>
</template>