<script setup lang="ts">
defineProps({
  speed: {
    type: Number,
    required: true
  }
});
</script>
<template>
  <div class="flex justify-center">
    <span class="
      current-speed 
      min-w-16
      @[1024px]:min-w-24
      shadow-blue-500/50 
      text-center 
      text-xl
      @[960px]:text-2xl
      @[1024px]:text-3xl 
      p-3
      rounded-xl 
      shadow-inner 
      bg-gradient-to-r 
      from-purple-500 
      to-pink-600">{{ speed }}</span>
  </div>
</template>
<style scoped>
  .current-speed {
    box-shadow: inset 0 0 12px 12px rgba(0,0,0,.5);
  }
</style>