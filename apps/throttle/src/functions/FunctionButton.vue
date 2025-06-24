<script setup lang="ts">
  import { ref } from 'vue'
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
  const func1State = ref(props.func?.state || false)
  const { getIconComponent } = useFunctionIcon()
  const icon =  getIconComponent(props.func?.icon || 'mdi-lightbulb-on')

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
    v-if="func" 
    @click="cabFuction()"
    icon="icon">
      {{ icon }}
    <!-- <span v-if="showLabel" class="ml-2">{{ func?.label }}</span> -->
  </v-btn>  
</template>