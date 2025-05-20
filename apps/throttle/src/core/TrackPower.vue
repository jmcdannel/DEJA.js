<script setup>
  import { computed, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useWakeLock } from '@vueuse/core'
  import { useConnectionStore } from '@/connections/connectionStore'
  import { useDcc } from '@/api/dccApi'

  const { isSupported, isActive, request, release } = useWakeLock()

  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'

  const {
    isEmulated,
    isSerial,
    dccExConnected
   } = storeToRefs(useConnectionStore())
  const dccApi = useDcc()
  const power = ref(null)
  const enabled = computed(() => dccExConnected || isEmulated || isSerial)
  const locked = ref(false)

  watch(power, async (newPower) => {
    console.log('power', newPower)

    await dccApi.setPower(newPower ? DEFAULT_ON : DEFAULT_OFF)

    if (newPower && isSupported.value && !isActive.value) {
        console.log('locking screen')
        await request('screen')
        locked.value = true
      } else if (!newPower && isActive.value) {
        console.log('unlocking screen')
        await release()
        locked.value = false
      } else {
        console.log('screen lock noop', isSupported.value, isActive.value)
      }
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
    <v-icon icon="mdi-fence-electric" size="x-large"></v-icon>
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
