<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { SortOption } from './types'

const props = defineProps<{
  modelValue: string
  options: SortOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { mdAndUp } = useDisplay()

const currentLabel = computed(() =>
  props.options.find(o => o.value === props.modelValue)?.label ?? 'Default'
)
</script>

<template>
  <div v-if="mdAndUp" class="flex items-center gap-3">
    <span class="lcb-label">Sort:</span>
    <v-menu>
      <template #activator="{ props: menuProps }">
        <button v-bind="menuProps" class="lcb-sort-btn">
          {{ currentLabel }}
          <v-icon icon="mdi-chevron-down" size="14" class="ml-2 opacity-50" />
        </button>
      </template>
      <v-list
        density="compact"
        :selected="[modelValue]"
        @click:select="({ id }) => emit('update:modelValue', id as string)"
      >
        <v-list-item
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :title="opt.label"
        />
      </v-list>
    </v-menu>
  </div>
</template>
