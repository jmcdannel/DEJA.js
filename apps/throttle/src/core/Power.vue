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
  <v-btn 
    @click="power = !power"
    :color="power ? 'success' : 'error'"
    icon="mdi-power"
    variant="plain">
  </v-btn>
</template>
