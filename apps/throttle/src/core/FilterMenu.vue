<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLayout } from '@repo/modules'

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

const { getDevices } = useLayout()
const devices = getDevices()
</script>

<template>
  <v-menu v-model="showMenu" offset-y>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon="mdi-filter-variant" variant="outlined"></v-btn>
    </template>
    <v-list 
      :items="devices" 
      item-title="id"
      item-value="id"
      v-model:selected="selected" 
      select-strategy="independent"
    >
    </v-list>
  </v-menu>
</template>