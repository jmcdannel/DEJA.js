<script setup lang="ts">
defineEmits(['selected'])
defineProps({
  loco: Object
})
</script>
<template>
  <button 
    class="m-2"
    @click="$emit('selected', loco.locoId)" 
    role="link">
      <v-avatar       
        :color="loco?.meta?.color || 'primary'"
        :size="96" 
        class="mr-2">{{  loco.locoId }}
      </v-avatar>
  </button>
</template>