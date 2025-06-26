<script setup lang="ts">
import { ref, computed } from 'vue'

const SORT_OPTIONS = [
  { title: 'Name', value: 'name' },
  { title: 'Device', value: 'device' },
  { title: 'Type', value: 'type' },
]

const props = defineProps<{
  modelValue: string[]
  sortOptions?: { title: string; value: string }[]
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
      <v-btn v-bind="props" icon="mdi-sort" variant="outlined"></v-btn>
    </template>
    <v-list 
      :items="SORT_OPTIONS" 
      v-model:selected="selected" 
      select-strategy="single-independent"
    >
    </v-list>
  </v-menu>
</template>