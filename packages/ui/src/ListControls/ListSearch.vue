<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  collapsible?: boolean
}>(), {
  placeholder: 'Search...',
  collapsible: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { mdAndUp } = useDisplay()
const expanded = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

function expand() {
  expanded.value = true
  setTimeout(() => searchInput.value?.focus(), 50)
}

function collapse() {
  if (!props.modelValue) {
    expanded.value = false
  }
}
</script>

<template>
  <!-- Mobile: always full width -->
  <v-text-field
    v-if="!mdAndUp"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :placeholder="placeholder"
    density="compact"
    variant="outlined"
    hide-details
    clearable
    prepend-inner-icon="mdi-magnify"
    class="flex-grow"
  />

  <!-- Desktop collapsible -->
  <template v-else>
    <v-text-field
      v-if="!collapsible || expanded || modelValue"
      ref="searchInput"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      :placeholder="placeholder"
      density="compact"
      variant="outlined"
      hide-details
      clearable
      prepend-inner-icon="mdi-magnify"
      style="max-width: 220px;"
      @blur="collapse"
      @click:clear="emit('update:modelValue', ''); collapse()"
    />
    <v-btn
      v-else
      icon="mdi-magnify"
      size="small"
      variant="text"
      @click="expand"
    />
  </template>
</template>
