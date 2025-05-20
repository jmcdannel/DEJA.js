
<script setup lang="ts">
  import { defineProps } from 'vue'
  
  const props = defineProps({
    label: {
      type: String,
    },
    variant: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: 'md'
    },
    onClick: {
      type: Function,
      default: () => {}
    }
  })

  function getButtonColor() {
    switch(props.variant) {
      case 'primary':
        return 'border-violet-500 text-white'
      case 'secondary':
        return 'border-cyan-500 text-white'
      case 'tertiary':
        return 'border-indigo-500 text-white'
      case 'neutral':
        return 'border-gray-500 text-white'
      case 'success':
        return 'border-green-500 text-white'
      case 'warning':
        return 'border-orange-500 text-white'
      case 'error':
        return 'border-red-500 text-white'
      case 'information':
        return 'border-blue-500 text-white'
      default:
        return 'border-primary-500 text-white'
    }
  }

  const btnClass = `btn btn-${props.size} btn-outline ${getButtonColor()}`
  
</script>
<template>
  <button :class="btnClass" @click="props?.onClick">
    <slot>{{ props.label }}</slot>
  </button>
</template>
