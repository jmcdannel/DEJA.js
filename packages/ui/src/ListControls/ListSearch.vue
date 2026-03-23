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
    class="flex-grow lcb-search-mobile"
  />

  <!-- Desktop -->
  <template v-else>
    <div
      v-if="!collapsible || expanded || modelValue"
      class="lcb-search-desktop"
    >
      <v-icon icon="mdi-magnify" size="16" class="opacity-40" />
      <input
        ref="searchInput"
        type="text"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        class="lcb-search-input"
        @blur="collapse"
      />
      <v-btn
        v-if="modelValue"
        icon="mdi-close"
        size="x-small"
        variant="text"
        density="compact"
        @click="emit('update:modelValue', ''); collapse()"
      />
    </div>
    <button
      v-else
      class="lcb-search-icon"
      @click="expand"
    >
      <v-icon icon="mdi-magnify" size="18" />
    </button>
  </template>
</template>
