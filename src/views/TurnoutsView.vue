<script setup lang="ts">
  import { useCurrentUser } from 'vuefire'
  import Turnouts from '@/turnouts/Turnouts.vue'
  const user = useCurrentUser()
  
</script>

<template>
  <main class="flex flex-col flex-grow p-4 w-full forest-background bg-opacity-50 bg-fixed overflow-auto">
    <template v-if="user">
      <Turnouts />
    </template>
    <template v-else>
      <p class="text-red-500">Login to DejaCloud to view turnouts.</p>
    </template>
  </main>
</template>
