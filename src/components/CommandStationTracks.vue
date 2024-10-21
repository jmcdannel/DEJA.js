<script setup lang="ts">
import { FaPowerOff } from 'vue3-icons/fa6'

defineProps({
  dccEx: Object
})

</script>
<template>
  <div v-if="dccEx" class="flex-grow flex flex-col max-w-64">
    <div class="flex py-1 min-w-48 justify-between bg-purple-500 border-purple-500 border my-1 items-center py-1 px-2 rounded-full bg-opacity-20"> 
      <VaAvatar class="bg-red-500" size="small">A</VaAvatar>
      <h3>{{ dccEx.trackA }}</h3>
      <VaAvatar class="bg-transparent text-red-500" size="small"><FaPowerOff /></VaAvatar>
    </div>
    <div class="flex py-1 min-w-48 justify-between bg-purple-500 border-purple-500 border my-1 items-center py-1 px-2 rounded-full bg-opacity-20"> 
      <VaAvatar class="bg-red-500" size="small">A</VaAvatar>
      <h3>{{ dccEx.trackB }}</h3>
      <VaAvatar class="bg-transparent text-red-500" size="small"><FaPowerOff /></VaAvatar>
    </div>
  </div>
</template>