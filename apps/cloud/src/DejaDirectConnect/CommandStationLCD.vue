<script setup lang="ts">
import { FaUsb } from 'vue3-icons/fa6'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'

defineProps({
  dccEx: Object
})

</script>
<template>
  <div v-if="dccEx" class="flex-grow relative max-w-64">
    <FaUsb class="w-12 h-12 text-green-500 absolute right-2 top-2" />
    <LcdDisplay 
      :content="[
        dccEx.LCD2 || '',
        dccEx.LCD3 || '',
        '> _'
      ]"
      title="DCC-EX LCD"
      color="green"
      size="sm"
      :max-lines="4"
      :show-cursor="true"
    />
  </div>
</template>