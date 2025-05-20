<script setup lang="ts">
import { ref } from 'vue'
defineProps({
  json: Object,
  label: String
})

const view = ref(false)

</script>
<template>
  <div class="bg-zinc-950 border border-zinc-600 p-2 block my-4 rounded">
    <v-btn @click="view = !view" icon="mdi-eye-outline" v-model="view"></v-btn>
    <span class="ml-2">{{ label || 'View JSON' }}</span>
    <pre v-if="view" class="bg-zinc-950 text-green-500 p-4 rounded overflow-auto text-xs max-h-72">{{ json }}</pre> 
  </div>

</template>