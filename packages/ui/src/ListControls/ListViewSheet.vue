<script setup lang="ts">
import type { ViewOption } from './types'

const props = defineProps<{
  modelValue: boolean
  viewAs: string
  options: ViewOption[]
  color?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:viewAs': [value: string]
}>()

function select(value: string) {
  emit('update:viewAs', value)
  emit('update:modelValue', false)
}
</script>

<template>
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <div class="flex justify-center mb-3">
        <div class="w-10 h-1 bg-slate-600 rounded-full" />
      </div>
      <div class="flex justify-between items-center mb-4">
        <span class="text-lg font-bold uppercase tracking-wider">Layout View</span>
        <v-btn icon="mdi-close" size="small" variant="text" @click="emit('update:modelValue', false)" />
      </div>
      <div class="flex border border-slate-700 rounded-lg overflow-hidden">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="flex-1 flex flex-col items-center py-4 transition-colors"
          :class="viewAs === opt.value
            ? 'bg-indigo-500/20 border border-indigo-500 rounded-lg'
            : 'hover:bg-slate-800'"
          @click="select(opt.value)"
        >
          <v-icon :icon="opt.icon" size="24" :class="viewAs === opt.value ? 'text-indigo-400' : 'text-slate-500'" />
          <span class="text-xs uppercase mt-1 font-semibold" :class="viewAs === opt.value ? 'text-indigo-400' : 'text-slate-500'">
            {{ opt.label }}
          </span>
        </button>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>
