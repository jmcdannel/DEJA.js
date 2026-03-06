<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { StatusPulse } from '@repo/ui'
import AddLayout from '@/Layout/AddLayout.vue'
import SelectLayout from '@/Layout/SelectLayout.vue'

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
      <v-sheet class="p-1" color="background">
        <v-chip  v-bind="activatorProps" size="small" class="ma-1" 
          prepend-icon="mdi-home" :color="layoutId ? 'green' : 'red'">
          <template #append>
            <span class="ml-2">
              <StatusPulse :status="layoutId ? 'connected' : 'disconnected'" size="sm" />
            </span>
          </template>
          <template #default>
            <span class=" lg:flex">{{ layoutId }}</span>
          </template>
        </v-chip>
      </v-sheet>
    </template>
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