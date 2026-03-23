<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { ViewOption } from './types'

const props = defineProps<{
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
  <div v-if="mdAndUp" class="flex items-center gap-3">
    <span class="lcb-label"><v-icon icon="mdi-view-grid-outline" size="14" class="mr-1" />View:</span>
    <div class="lcb-view-group">
      <button
        v-for="opt in options"
        :key="opt.value"
        class="lcb-view-btn"
        :class="{ 'lcb-view-btn--active': modelValue === opt.value }"
        @click="emit('update:modelValue', opt.value)"
      >
        <v-icon :icon="opt.icon" size="18" />
        <v-tooltip activator="parent" location="top">{{ opt.label }}</v-tooltip>
      </button>
    </div>
  </div>
</template>
