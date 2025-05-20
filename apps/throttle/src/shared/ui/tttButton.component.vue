
<script setup lang="ts">
  
  const props = defineProps({
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
  
</script>
<template>
  <button :class="`btn btn-${props.size} btn-outline border-${props.variant} text-${props.variant}`" @click="props?.onClick">
    <slot></slot>
  </button>
</template>
