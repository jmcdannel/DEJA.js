<script setup lang="ts">
  import { ref } from 'vue'
  import { useDisplay } from 'vuetify'
  import { useDcc } from '@repo/dccex'
  import { useFunctionIcon } from '@repo/modules/locos'

  const props = defineProps({
    func: {
        type: Object
    },
    address: {
        type: Number
    },
    showLabel: {
        type: Boolean,
        default: false
    },
    showDefaultIcon: {
        type: Boolean,
        default: false
    }
  })
  
  const { setFunction } = useDcc()
  const { getIconComponent } = useFunctionIcon()
  const func1State = ref(props.func?.state || false)
  const icon =  getIconComponent(props.func?.icon)
  const { mobile } = useDisplay()

  async function cabFuction() {
    func1State.value = !func1State.value;
    console.log('cabFuction', { 
        address:  props.address, 
        state: func1State.value,
        func: props.func
      })
    setFunction(props.address, props.func?.id, func1State.value)
  }
</script>
<template>
  <v-btn 
    v-if="func && showLabel && !mobile" 
    @click="cabFuction()"
    :prepend-icon="icon"
    class="relative bg-gradient-to-br from-cyan-600 to-indigo-600 p-2">
    {{ func?.label }}
  </v-btn>
  <v-btn 
    v-else-if="func && showLabel" 
    @click="cabFuction()"
    :prepend-icon="icon"
    class="relative bg-gradient-to-br from-cyan-600 to-indigo-600 p-2"
  >
    {{ func?.label }}
  </v-btn>
  <v-btn 
    v-else-if="func" 
    @click="cabFuction()"
    :icon="icon"
    class="relative bg-gradient-to-br from-cyan-600 to-indigo-600 p-2"
  />
    
</template>