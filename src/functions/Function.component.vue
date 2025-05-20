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
  
  const dccApi = useDcc()  
  const func1State = ref(props.func.state);

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
  <button v-if="func" @click="cabFuction()"
    class="relative btn btn-md min-w-16 bg-gradient-to-br from-cyan-600 to-indigo-600">
    <FunctionIcon v-if="func?.icon" :icon="func?.icon" 
      class="w-4 h-4 md:w-6 md:h-6" 
      :class="func1State ? 'text-green-400' : 'text-gray-200'"
    />
    <FunctionIcon v-else-if="showDefaultIcon" icon="track" 
      class="w-4 h-4 md:w-6 md:h-6" 
      :class="func1State ? 'text-green-400' : 'text-gray-200'"
    />
    <template v-else>
      <div 
        class="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center"
        :class="func1State ? 'text-green-400' : 'text-gray-200'">
        {{ func?.label }}
      </div>
    </template>
    <span v-if="showLabel" class="ml-2">{{ func?.label }}</span>
  </button>  
</template>