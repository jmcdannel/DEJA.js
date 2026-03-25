<script setup lang="ts">
import type { SortOption } from './types'

const props = defineProps<{
  modelValue: boolean
  sortBy: string
  options: SortOption[]
  color?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:sortBy': [value: string]
}>()

function select(value: string) {
  emit('update:sortBy', value)
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
        <span class="text-lg font-bold uppercase tracking-wider">Sort By</span>
        <v-btn icon="mdi-close" size="small" variant="text" @click="emit('update:modelValue', false)" />
      </div>
      <div class="flex flex-col gap-2">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="flex justify-between items-center p-4 rounded-lg border transition-colors"
          :class="sortBy === opt.value
            ? 'bg-indigo-500/15 border-indigo-500'
            : 'bg-slate-800 border-slate-700 hover:bg-slate-700'"
          @click="select(opt.value)"
        >
          <span
            class="text-sm uppercase tracking-wide"
            :class="sortBy === opt.value ? 'text-indigo-400 font-semibold' : 'text-slate-400'"
          >
            {{ opt.label }}
          </span>
          <v-icon
            :icon="sortBy === opt.value ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
            :color="sortBy === opt.value ? 'indigo' : 'grey'"
            size="20"
          />
        </button>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>
