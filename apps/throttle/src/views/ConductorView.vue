<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import ConductorLayout from '@/conductor/ConductorLayout.vue'

const user = useCurrentUser()

</script>
<template>
  <main class="flex flex-col flex-grow w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto conductor-view">
    <template v-if="user">
      <ConductorLayout />
    </template>
    <template v-else>
      <p class="text-red-500">Login to DejaCloud to view effects.</p>
    </template>
  </main>
</template>
<style scoped>
.conductor-view {
}
</style>