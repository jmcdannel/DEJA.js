<script setup lang="ts">
import { ref } from 'vue'
import { defaultFunctions, type LocoFunction } from '@repo/modules/locos'
import { useLocos } from '@repo/modules/locos/useLocos'
import { createLogger } from '@repo/utils'
import EditFunc from '@/Roster/Functions/EditFunction.vue'

const log = createLogger('Functions')
// import LcdDisplay from '@/Core/UI/LcdDisplay.vue'

const props = defineProps({
  loco: Object,
})
const locoFunctions = ref(props.loco?.functions)
const address = ref(props.loco?.id)
const isModified = ref(false)
const { updateFunctions } = useLocos()

async function handleSave() {
  log.debug('handleSave', address.value, locoFunctions.value)
  if (address.value) {
    await updateFunctions(address.value, locoFunctions.value)
  }
}

async function handleEdit(func: LocoFunction) {
  log.debug('handleSave', func)
  const existing = locoFunctions.value?.find((lf:LocoFunction) => lf.id === func?.id)
  locoFunctions.value = existing 
    ? (locoFunctions.value || []).map((lf:LocoFunction) => {
        if (lf.id === func?.id) {
          return {
            ...lf,
            ...func
          }
        }
        return lf
      })
    : [...(locoFunctions.value || []), { ...existing, ...func }]
  isModified.value = true
  
  log.debug('handleEdit', locoFunctions.value, func, existing)
}

defineExpose({ handleSave, isModified })
</script>
<template>
  <div class="px-5 py-4">
    <EditFunc
      v-for="defaultFunc in defaultFunctions"
      :key="defaultFunc.label"
      :locoFunction="locoFunctions?.find((lf: LocoFunction) => lf.id === defaultFunc.id)"
      :defaultFunction="defaultFunc"
      @edit="handleEdit"
    />
  </div>
</template>