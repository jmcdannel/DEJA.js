<script setup>
  import { ref, watch } from 'vue'
  import { useWakeLock } from '@vueuse/core'
  import { useDcc } from '@repo/dccex'

  const { isSupported, isActive, request, release } = useWakeLock()

  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'

  const { setPower } = useDcc()
  const power = ref(null)
  const locked = ref(false)

  watch(power, async (newPower) => {
    await setPower(newPower ? DEFAULT_ON : DEFAULT_OFF)
    if (newPower && isSupported.value && !isActive.value) {
        await request('screen')
        locked.value = true
      } else if (!newPower && isActive.value) {
        await release()
        locked.value = false
      }
  })

</script>
<template>
  <v-btn 
    @click="power = !power"
    :color="power ? 'success' : 'error'"
    icon="mdi-fence-electric"
    variant="plain">
  </v-btn>
</template>
