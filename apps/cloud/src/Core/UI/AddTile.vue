<script setup lang="ts">
defineProps({
  color: {
    type: String,
    default: 'primary'
  }
})

</script>
<template>
  <v-sheet 
    rounded="lg"
    :color="color"
    class="w-full h-full min-h-36 border-2 border-opacity-30 dark:border-opacity-30 hover:border-opacity-100 hover:dark:border-opacity-90 text-white mx-auto border-dashed"    
    >
    <v-btn class="cursor-pointer w-full flex items-center justify-center h-auto min-h-full"
      :class="`hover:bg-${color}-50 hover:dark:bg-${color}-500`" @click="$emit('add')">
      <v-icon :color="color" size="48" class="stroke-none" >mdi-cloud-plus</v-icon>
    </v-btn>
  </v-sheet>
</template>