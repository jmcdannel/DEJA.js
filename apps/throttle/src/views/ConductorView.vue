<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import ConductorLayout from '@/conductor/ConductorLayout.vue'

const user = useCurrentUser()
console.log('ConductorView user', user)

</script>
<template>
  <main class="@container flex flex-col flex-grow w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto conductor-view">
    <template v-if="user">
      <ConductorLayout />
    </template>
  </main>
</template>