<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'blurred-bubbles-1'
}>(), {
  variant: 'blurred-bubbles-1',
});
</script>

<template>
  <div v-if="props.variant === 'blurred-bubbles-1'" class="absolute inset-0 pointer-events-none overflow-hidden">
    <div class="absolute w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[80px] -top-[150px] -right-[200px]"></div>
    <div class="absolute w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[70px] -bottom-[100px] -left-[150px]"></div>
    <div class="absolute w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[60px] top-[20%] left-[30%]"></div>
  </div>
</template>

<style scoped>
/* This component intentionally relies on utility classes for visuals */
</style>

