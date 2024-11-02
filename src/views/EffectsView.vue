<script setup lang="ts">
  import { useCurrentUser } from 'vuefire'
  import Effects from '@/effects/Effects.vue'
  const user = useCurrentUser()
  
</script>

<template>
  <main class="flex flex-col p-8 w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto">
    <h2 class="mb-4 placeholder:font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600">
      <strong class="text-3xl">Effects</strong>
    </h2>
    <template v-if="user">
      <Effects />
    </template>
    <template v-else>
      <p class="text-red-500">Login to DejaCloud to view effects.</p>
    </template>
  </main>
</template>
