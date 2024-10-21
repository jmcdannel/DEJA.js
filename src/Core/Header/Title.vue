<script setup lang="ts">
import { FaCloud } from 'vue3-icons/fa6'
defineProps({
  layoutId: String,
  active: Boolean
})
</script>
<template>
  <span class="flex items-center justify-start mr-4">
    <FaCloud class="w-8 h-8 mr-2" :class="layoutId || active ? 'text-cyan-500' : 'text-gray-500'" /> 
    <span class="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600 hidden sm:inline">DEJA Cloud</span>
  </span>
</template>