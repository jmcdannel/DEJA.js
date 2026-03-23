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
  props.options.find(o => o.value === props.modelValue)?.label ?? 'Sort'
)
</script>

<template>
  <div v-if="mdAndUp" class="flex items-center gap-2">
    <span class="text-xs tracking-wider text-slate-500 uppercase font-semibold">Sort:</span>
    <v-menu>
      <template #activator="{ props: menuProps }">
        <v-chip
          v-bind="menuProps"
          size="small"
          variant="flat"
          class="bg-slate-800 border border-slate-700"
          append-icon="mdi-chevron-down"
        >
          {{ currentLabel }}
        </v-chip>
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
