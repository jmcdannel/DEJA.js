<script setup lang="ts">
  import { useCurrentUser } from 'vuefire'
  import Effects from '@/effects/Effects.vue'
  const user = useCurrentUser()
  
</script>

<template>
  <main class="flex flex-col flex-grow p-8 w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto">
   <template v-if="user">
      <Effects />
    </template>
    <template v-else>
      <p class="text-red-500">Login to DejaCloud to view effects.</p>
    </template>
  </main>
</template>
