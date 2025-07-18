<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import DCCLog from '@/DCCEX/Log/DCCLog.vue'

const enabled = useStorage('@DEJA/pref/ws-logging', false)

</script>
<template>
  <v-dialog>
    <template v-slot:activator="{ props: activatorProps}">
      <v-sheet class="p-1" color="background">
        <v-chip v-bind="activatorProps"  size="small" class="ma-1" :color="!!enabled ? 'green' : 'red'">
          <template #append>
              <span v-if="enabled" class="ml-2 relative flex h-3 w-3">
                <span class="absolute inline-flex h-full w-full rounded-full bg-green-600 animate-ping opacity-75"></span>
                <span class="relative inline-flex h-full w-full rounded-full bg-green-600"></span>
              </span>
              <span v-else class="ml-2 relative flex h-3 w-3">
                <span class="absolute inline-flex h-full w-full rounded-full bg-red-600 animate-bounce opacity-75"></span>
                <span class="relative inline-flex h-full w-full rounded-full bg-red-600"></span>
              </span>
          </template>
          <template #default>
            <span class="hidden lg:flex">log</span>
          </template>
        </v-chip>
      </v-sheet>
    </template>
    <template v-slot:default="{ isActive }">
      <v-sheet class="p-4">
        <DCCLog />
        <v-btn
          text="Close Dialog"
          color="red"
          @click="isActive.value = false"
        ></v-btn>
      </v-sheet>
    </template>  
  </v-dialog>
  
</template>