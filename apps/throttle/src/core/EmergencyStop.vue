<script setup>
  import { useDcc } from '@repo/dccex'

  const { sendDccCommand } = useDcc()
  
  async function stop() {
    await sendDccCommand({ action: 'dcc', payload: '!' })
    // TODO: update all throttles to a speed of 0
  }

</script>
<template>
  <v-btn @click="stop"
    class="relative text-error"
    icon="mdi-alert-octagon"
    variant="plain">
  </v-btn>
</template>
