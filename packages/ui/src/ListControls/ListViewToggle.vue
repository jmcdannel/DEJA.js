<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { ViewOption } from './types'

defineProps<{
  modelValue: string
  options: ViewOption[]
  color?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { mdAndUp } = useDisplay()
</script>

<template>
  <div v-if="mdAndUp" class="flex items-center gap-2">
    <span class="text-xs tracking-wider text-slate-500 uppercase font-semibold">View:</span>
    <v-btn-toggle
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      density="compact"
      mandatory
      class="border border-slate-700 rounded-md"
    >
      <v-btn
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        :icon="opt.icon"
        size="small"
        variant="text"
      >
        <v-icon :icon="opt.icon" />
        <v-tooltip activator="parent" location="top">{{ opt.label }}</v-tooltip>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>
