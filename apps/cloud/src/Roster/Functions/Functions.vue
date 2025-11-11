<script setup lang="ts">
import { ref } from 'vue'
import { useFunctions, defaultFunctions, type LocoFunction } from '@repo/modules/locos'
import ViewJson from '@/Core/UI/ViewJson.vue'
import EditFunc from '@/Roster/Functions/EditFunction.vue'
// import LcdDisplay from '@/Core/UI/LcdDisplay.vue'

const props = defineProps({
  loco: Object,
})
const locoFunctions = ref(props.loco?.functions)
const address = ref(props.loco?.id)
const isModified = ref(false)
const { updateFunctions } = useFunctions()

async function handleSave() {
  console.log('handleSave', address.value, locoFunctions.value)
  if (address.value) {
    await updateFunctions(address.value, locoFunctions.value)
  }
}

async function handleEdit(func: LocoFunction) {
  console.log('handleSave', func)
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
  
  console.log('handleEdit', locoFunctions.value, func, existing)
}

</script>
<template>
  <v-btn class="m-2" color="pink" @click="handleSave" :disabled="!isModified">
    <v-icon>mdi-content-save</v-icon>
    Save
  </v-btn>
  <v-btn class="m-2" color="pink" variant="tonal">
    All <v-icon>mdi-eye</v-icon>     
  </v-btn>
  <v-btn class="m-2" color="pink" variant="tonal">
    All <v-icon>mdi-eye-off</v-icon>     
  </v-btn>
  <EditFunc 
    v-for="defaultFunc in defaultFunctions" 
    :key="defaultFunc.label" 
    :locoFunction="locoFunctions?.find((lf: LocoFunction) => lf.id === defaultFunc.id)" 
    :defaultFunction="defaultFunc" 
    @edit="handleEdit"
  />
  <!-- <template v-for="defaultFunc in defaultFunctions" :key="defaultFunc.label">
    <ViewJson :json="defaultFunc" label="RAW DEFAULT"></ViewJson>
    <ViewJson :json="loco?.functions.find(lf => lf.id === defaultFunc.id)" label="RAW LOCO"></ViewJson>
  </template> -->
  <!-- <LcdDisplay 
    :content="`address: ${address}`"
    title="LOCO ADDRESS"
    color="blue"
    size="sm"
    :max-lines="3"
  /> -->
  <ViewJson :json="loco?.functions || {}" label="RAW loco Data"></ViewJson>
  <ViewJson :json="locoFunctions" label="RAW locoFunctions Data"></ViewJson>
  <ViewJson :json="defaultFunctions" label="RAW DEFAULT FUNCTIONS"></ViewJson>
</template>