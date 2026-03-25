<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ListFilter } from './types'

const props = defineProps<{
  modelValue: boolean
  filters: ListFilter[]
  activeFilters: Record<string, string[]>
  color?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:activeFilters': [value: Record<string, string[]>]
}>()

const draft = ref<Record<string, string[]>>({})

watch(() => props.modelValue, (open) => {
  if (open) {
    draft.value = JSON.parse(JSON.stringify(props.activeFilters))
  }
})

function isSelected(filterType: string, value: string): boolean {
  return (draft.value[filterType] ?? []).includes(value)
}

function toggleValue(filterType: string, value: string) {
  const current = draft.value[filterType] ?? []
  draft.value = {
    ...draft.value,
    [filterType]: current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value],
  }
}

function clearAll() {
  draft.value = {}
}

function apply() {
  emit('update:activeFilters', { ...draft.value })
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
        <span class="text-lg font-bold uppercase tracking-wider">Filter</span>
        <v-btn variant="text" size="small" class="text-slate-400 uppercase tracking-wider" @click="clearAll">
          Clear All
        </v-btn>
      </div>
      <div v-for="filter in filters" :key="filter.type" class="mb-4">
        <div class="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-2">
          {{ filter.label }}
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in filter.options"
            :key="opt.value"
            class="px-5 py-2.5 rounded-lg text-sm border transition-colors"
            :class="isSelected(filter.type, opt.value)
              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'"
            @click="toggleValue(filter.type, opt.value)"
          >
            <v-icon
              v-if="isSelected(filter.type, opt.value)"
              icon="mdi-checkbox-marked"
              size="16"
              class="mr-1"
            />
            {{ opt.label }}
          </button>
        </div>
      </div>
      <v-btn
        block
        size="large"
        color="indigo"
        class="mt-4 font-bold uppercase tracking-wider"
        @click="apply"
      >
        Apply Filters
      </v-btn>
    </v-card>
  </v-bottom-sheet>
</template>
