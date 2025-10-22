<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEfx, efxTypes, type Effect } from '@repo/modules'

const { runEffect } = useEfx()

interface Props {
  effect: Effect,
  isRunning: boolean,
}

const props = defineProps<Props>()
const state = defineModel('state', {
  type: Boolean
})
const efxType = computed(() => efxTypes.find((type) => type.value === props?.effect?.type))

</script>

<template>
  <v-card 
    class="shadow-xl my-1 p-[1px] rounded-full"
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900 ' : ''"
    :color="effect?.color || 'primary'"
  >
    <v-card-title 
      class="flex flex-row items-center gap-4 justify-between rounded-full px-2 bg-gray-900 bg-opacity-75"
      :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
>
      <v-icon 
        :icon="efxType?.icon || 'mdi-help'"
        class="text-5xl m-3"></v-icon>
      <h4 class="text-md font-bold mr-2 text-white">
        {{effect?.name}}
        <span class="hidden md:inline text-sm font-normal ml-2 text-gray-300">
          <br />
          <v-chip 
            v-if="effect?.device" 
            class="ml-2 text-xs"
            prepend-icon="mdi-memory"
            variant="outlined"
          >
            {{effect?.device}}
          </v-chip>
        </span>
      </h4>
      <v-switch 
        v-model="state" 
        :color="effect?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />
    </v-card-title>
  </v-card>
</template>