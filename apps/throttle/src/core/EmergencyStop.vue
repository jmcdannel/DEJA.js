<script setup>
  import { useDcc } from '@repo/dccex'

  const { sendDccCommand } = useDcc()
  
  async function stop() {
    await sendDccCommand({ action: 'dcc', payload: '!' })
    // TODO: update all throttles to a speed of 0
  }

</script>
<template>
  <button @click="stop"
    class="btn btn-ghost btn-circle relative text-error">
    <v-icon icon="mdi-alert-octagon" size="x-large"></v-icon>
    </button>
</template>
