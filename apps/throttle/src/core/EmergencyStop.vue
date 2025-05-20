<script setup>
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useConnectionStore } from '@/connections/connectionStore'
  import { useDcc } from '@/api/dccApi'

  const {
    isEmulated,
    isSerial,
    dccExConnected
   } = storeToRefs(useConnectionStore())
  const dccApi = useDcc()
  const enabled = computed(() => dccExConnected || isEmulated || isSerial)
  
  async function stop() {
    await dccApi.sendDccCommand({ action: 'dcc', payload: '!' })
    // TODO: update all throttles to a speed of 0

  }

</script>
<template>
  <button @click="stop"
    :disabled="!enabled"
    class="btn btn-ghost btn-circle relative text-error">
    <v-icon icon="mdi-alert-octagon" size="x-large"></v-icon>
    </button>
</template>
