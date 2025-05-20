<script setup>
  import { computed, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useConnectionStore } from '@/connections/connectionStore'
  import { useEfx } from '@/effects/useEfx'

  const { runEffect, getEffectsByType } = useEfx()

  const {
    isEmulated,
    isSerial,
    dccExConnected
   } = storeToRefs(useConnectionStore())

  const power = ref(null)
  const enabled = computed(() => dccExConnected || isEmulated || isSerial)
  const locked = ref(false)

  watch(power, async (newPower) => {
    const powerEfx = await getEffectsByType('power')
    powerEfx.forEach(efx => {
      runEffect({...efx, state: newPower })
    })
    console.log('power', newPower, powerEfx)
  })

</script>
<template>
  <button @click="power = !power"
    :disabled="!enabled"
    class="btn btn-ghost btn-circle relative"
    :class="{
      'text-gray-500': power === null,
      'text-success': power === true,
      'text-error': power === false,  
    }">
    <v-icon icon="mdi-power" size="x-large"></v-icon>
      <span 
        class="w-1 h-1 rounded-full absolute -top-1"
        :class="{
          'bg-success': locked,
          'bg-gray-500 animate-bounce': !locked && power === null,
          'bg-error': !locked,  
        }"
      ></span>
    </button>
</template>
