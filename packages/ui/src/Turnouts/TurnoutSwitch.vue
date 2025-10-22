<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type Turnout } from '@repo/modules'

interface Props {
  turnout: Turnout,
  isRunning: boolean
}

const props = defineProps<Props>()
const state = defineModel('state', {
  type: Boolean
})

</script>

<template>
  <v-card 
    class="shadow-xl p-[1px] rounded-full"
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900 ' : ''"
    :color="turnout?.color || 'primary'"
  >
    <v-card-title 
      class="flex flex-row items-center gap-2 justify-between rounded-full pl-2 pr-8 bg-gray-900 bg-opacity-75"
      :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
    >
      <v-icon :icon="turnout?.type === 'servo' ? 'mdi-call-split' : 'mdi-electric-switch'" class="w-6 h-6" />
      <h4 class="text-md font-bold mr-2 text-white fill-white dark:text-white! dark:fill-white text-center ">
        {{turnout?.name}}
        <span class="hidden md:inline text-sm font-normal ml-2 text-gray-300">
          <br />
          <v-chip 
          v-if="turnout?.device" 
          class="ml-2 text-xs"
          prepend-icon="mdi-memory"
          variant="outlined"
        >
          {{turnout?.device}}
        </v-chip>
        </span>
      </h4>
      <v-switch 
        v-model="state" 
        :color="turnout?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />
    </v-card-title>
  </v-card>
</template> 