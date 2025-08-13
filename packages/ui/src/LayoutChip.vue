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
      <v-chip  
        v-bind="activatorProps" 
        size="small" 
        class="ma-1 shadow-md" 
        prepend-icon="mdi-home" 
        :color="layoutId ? 'success' : 'error'"
        variant="elevated"
        dark
      >
        <template #append>
          <span v-if="layoutId" class="ml-2 relative flex h-3 w-3">
            <span class="absolute inline-flex h-full w-full rounded-full bg-green-400 animate-ping opacity-75"></span>
            <span class="relative inline-flex h-full w-full rounded-full bg-green-400"></span>
          </span>
          <span v-else class="ml-2 relative flex h-3 w-3">
            <span class="absolute inline-flex h-full w-full rounded-full bg-red-400 animate-bounce opacity-75"></span>
            <span class="relative inline-flex h-full w-full rounded-full bg-red-400"></span>
          </span>
        </template>
        <template #default>
          <span class="font-medium text-white">{{ layoutId || 'No Layout' }}</span>
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