<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const layoutId = useStorage('@DEJA/cloud/layoutId', 'betatrack')

</script>
<template>
  <v-chip size="small" class="ma-1" 
    prepend-icon="mdi-home" :color="layoutId ? 'green' : 'red'">
    <template #append>
      <span v-if="layoutId" class="ml-2 relative flex h-3 w-3">
        <span class="absolute inline-flex h-full w-full rounded-full bg-green-600 animate-ping opacity-75"></span>
        <span class="relative inline-flex h-full w-full rounded-full bg-green-600"></span>
      </span>
      <span v-else class="ml-2 relative flex h-3 w-3">
        <span class="absolute inline-flex h-full w-full rounded-full bg-red-600 animate-bounce opacity-75"></span>
        <span class="relative inline-flex h-full w-full rounded-full bg-red-600"></span>
      </span>
    </template>
    <template #default>
      <span class="hidden lg:flex">{{ layoutId }}</span>
    </template>
  </v-chip>
</template>