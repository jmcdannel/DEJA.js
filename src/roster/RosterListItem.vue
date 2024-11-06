<script setup lang="ts">
defineEmits(['selected'])
defineProps({
  loco: Object
})
</script>
<template>
  <button 
    class="
      btn 
      btn-md 
      btn-outline 
      flex
      justify-between
      bg-indigo-950 
      bg-opacity-30 
      border-primary 
      text-primary 
      w-full 
      my-1
      hover:bg-indigo-950 
      hover:border-cyan-900
      hover:bg-opacity-60 
      hover:text-primary 
    "
    @click="$emit('selected', loco.locoId)" 
    role="link">        
    <span><v-avatar color="primary" :size="24" class="mr-2">{{  loco.locoId }}</v-avatar>
      {{ loco?.name || loco?.locoId }}
    </span>
    <span><v-avatar v-for="cloco in loco.consist" :key="cloco.address" :size="18" color="secondary" class="opacity-70">{{  cloco.address }}</v-avatar></span>
  </button>
</template>