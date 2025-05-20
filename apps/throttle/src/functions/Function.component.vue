<script setup lang="ts">
  import { ref } from 'vue'
  import FunctionIcon from './FunctionIcon.component.vue'
  import useDcc from '../api/dccApi.js'

  const props = defineProps({
    func: {
        type: Object
    },
    address: {
        type: Number
    }
  })
  
  const dccApi = useDcc()  
  const func1State = ref(false);

  async function cabFuction() {
    func1State.value = !func1State.value;
    console.log('cabFuction', { 
        address:  props.address, 
        state: func1State.value,
        func: props.func
      })
    dccApi.setFunction(props.address, props.func?.id, func1State.value)
  }
</script>
<template>
  <button @click="cabFuction()"
    class="relative btn btn-md w-full bg-gradient-to-br from-cyan-600 to-indigo-600">
    <FunctionIcon v-if="func?.icon" :icon="func?.icon" class="w-6 h-6" />
    <template v-else>
      <div class="w-6 h-6 flex items-center justify-center">{{ func?.label }}</div>
    </template>
  </button>  
</template>