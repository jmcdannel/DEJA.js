<script setup lang="ts">
import type { DocumentData } from 'firebase/firestore'

interface Props {
  item: DocumentData
  isRunning: boolean,
}

defineProps<Props>()
const state = defineModel('state', {
  type: Boolean
})

</script>
<template>
  <v-card 
    class="shadow-xl my-1 p-[1px] rounded-full"
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900 ' : ''"
    :color="item?.color || 'primary'"
  >
    <v-card-title 
      class="flex flex-row items-center gap-4 justify-between rounded-full px-2 bg-gray-900 bg-opacity-75"
      :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
>
      <v-icon 
        :icon="item?.icon || 'mdi-help'"
        class="text-5xl m-3"></v-icon>
      <h4 class="text-md font-bold mr-2 text-white">
        {{item?.name}}
        <span class="hidden md:inline text-sm font-normal ml-2 text-gray-300">
          <br />
          <v-chip 
            v-if="item?.device" 
            class="ml-2 text-xs"
            prepend-icon="mdi-memory"
            variant="outlined"
          >
            {{item?.device}}
          </v-chip>
        </span>
      </h4>
      <v-switch 
        v-model="state" 
        :color="item?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />
    </v-card-title>
  </v-card>
</template>