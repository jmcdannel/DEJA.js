<script setup lang="ts">
import { ref, computed } from 'vue'

const VIEW_OPTIONS = [
  { title: 'Cards', value: 'card' },
  { title: 'Table', value: 'table' },
  { title: 'Buttons', value: 'button' },
  { title: 'Switches', value: 'switch' },
  { title: 'Raw', value: 'raw' },
]

const props = defineProps<{
  modelValue: string[]
  viewOptions?: { title: string; value: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const showMenu = ref(false)
const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <v-menu v-model="showMenu" offset-y>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon="mdi-eye" variant="outlined"></v-btn>
    </template>
    <v-list 
      :items="viewOptions || VIEW_OPTIONS" 
      v-model:selected="selected" 
      select-strategy="single-independent"
    >
    </v-list>
  </v-menu>
</template>