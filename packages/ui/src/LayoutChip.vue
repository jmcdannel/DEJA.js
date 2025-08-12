<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import SelectLayout from './SelectLayout.vue'
const layoutId = useStorage('@DEJA/layoutId', '')

function handleSelect(_layoutId: string) {
  console.log('handleSelect', _layoutId)
  layoutId.value = _layoutId
  window.location.reload()
}

</script>
<template>
  <v-dialog>
    <template v-slot:activator="{ props: activatorProps}">
      <v-chip  v-bind="activatorProps" size="small" class="ma-1" 
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
          <span class=" lg:flex">{{ layoutId }}</span>
        </template>
      </v-chip>
    </template>
    <template v-slot:default="{ isActive }">
      <v-sheet class="p-4 relative flex flex-col flex-wrap gap-4">
        <SelectLayout :layoutId="layoutId" @selected="(newLayout: string) => handleSelect(newLayout)" />
      </v-sheet>
    </template>
  </v-dialog>
</template>