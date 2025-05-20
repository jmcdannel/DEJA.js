<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  speed: {
    type: Number,
    required: true
  }
});
</script>
<template>
  <div class="flex justify-center mt-4">
    <span class="
      current-speed 
      [min-width:5rem] 
      md:[min-width:8rem] 
      shadow-lg 
      shadow-blue-500/50 
      text-center 
      text-xl
      md:text-5xl 
      p-4 
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