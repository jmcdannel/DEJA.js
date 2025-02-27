<script setup lang="ts">
import type { PropType } from 'vue'
import type { Loco } from '@/throttle/types'

defineEmits(['selected'])
defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true
  }
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
      bg-opacity-30 
      border-primary 
      text-primary 
      w-full 
      my-1
      hover:bg-opacity-60 
    "
    @click="$emit('selected', loco.locoId)" 
    :color="loco?.meta?.color || 'primary'"
    role="link">        
    <span><v-avatar color="primary" :size="24" class="mr-2">{{  loco.locoId }}</v-avatar>
      {{ loco?.name || loco?.locoId }}
    </span>
    <span><v-avatar v-for="cloco in loco.consist" :key="cloco.address" :size="18" color="secondary" class="opacity-70">{{  cloco.address }}</v-avatar></span>
  </button>
</template>