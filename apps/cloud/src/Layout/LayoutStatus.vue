<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import AddLayout from '@/Layout/AddLayout.vue'
import SelectLayout from '@/Layout/SelectLayout.vue'

const layoutId = useStorage('@DEJA/layoutId', 'betatrack')

function handleSelect(_layoutId: string) {
  console.log('handleSelect', _layoutId)
  layoutId.value = _layoutId
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
          <span class="hidden lg:flex">{{ layoutId }}</span>
        </template>
      </v-chip></template>
    <template v-slot:default="{ isActive }">
      <v-sheet class="p-4 relative">
        <SelectLayout :layoutId="layoutId" @selected="handleSelect" />
        <v-divider class="my-4" />
        <AddLayout />
        <v-btn
          icon="mdi-close"
          color="red"
          class="absolute top-2 right-2"
          @click="isActive.value = false"
        ></v-btn>
      </v-sheet>
    </template>
  </v-dialog>
</template>