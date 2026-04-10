<script setup lang="ts">
import { ref } from 'vue'
import ColorPicker from './ColorPicker.vue'

const props = defineProps<{
  modelValue: string
  defaultColor?: string
  label?: string
  description?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editColor = ref(false)

function handleSelect(val: string) {
  emit('update:modelValue', val)
  editColor.value = false
}

function handleCancel() {
  emit('update:modelValue', props.defaultColor ?? props.modelValue)
  editColor.value = false
}
</script>

<template>
  <div class="form-section__row">
    <div class="form-section__row-label">
      <span class="form-section__row-name">{{ label || 'Color' }}</span>
      <span v-if="description" class="form-section__row-desc">{{ description }}</span>
    </div>
    <div
      class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
      style="border-color: rgba(var(--v-theme-on-surface), 0.08); background: rgba(var(--v-theme-on-surface), 0.03)"
      @click="editColor = true"
    >
      <div class="w-6 h-6 rounded-full border-2 border-white/12" :style="{ background: modelValue }"></div>
      <span class="text-sm text-white/60 capitalize">{{ modelValue }}</span>
      <v-icon size="14" class="text-white/25">mdi-chevron-right</v-icon>
    </div>
  </div>
  <v-dialog v-model="editColor" max-width="80vw">
    <ColorPicker :model-value="modelValue" @select="handleSelect" @cancel="handleCancel" />
  </v-dialog>
</template>
