<script setup>
import { ref, watch } from 'vue'
import { useEfx } from '@repo/modules/effects'

const { runEffect, getEffectsByType } = useEfx()

const power = ref(null)
const locked = ref(false)

watch(power, async (newPower) => {
  const powerEfx = await getEffectsByType('power')
  powerEfx.forEach(efx => {
    runEffect({...efx, state: newPower })
  })
})

</script>
<template>
  <button @click="power = !power"
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
