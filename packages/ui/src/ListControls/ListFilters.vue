<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { ListFilter } from './types'

const MAX_VISIBLE_FILTERS = 3

const props = defineProps<{
  modelValue: Record<string, string[]>
  filters: ListFilter[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string[]>]
}>()

const { mdAndUp } = useDisplay()

function getChipLabel(filter: ListFilter): string {
  const selected = props.modelValue[filter.type] ?? []
  if (!selected.length) return `All ${filter.label}`
  if (selected.length === 1) {
    const opt = filter.options.find(o => o.value === selected[0])
    return opt?.label ?? selected[0]
  }
  return `${selected.length} selected`
}

function toggleFilterValue(filterType: string, value: string) {
  const current = props.modelValue[filterType] ?? []
  const updated = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
  emit('update:modelValue', { ...props.modelValue, [filterType]: updated })
}
</script>

<template>
  <div v-if="mdAndUp" class="flex items-center gap-3">
    <span class="lcb-label"><v-icon icon="mdi-filter-variant" size="14" class="mr-1" />Filter:</span>

    <template v-for="(filter, idx) in filters" :key="filter.type">
      <v-menu v-if="idx < MAX_VISIBLE_FILTERS">
        <template #activator="{ props: menuProps }">
          <button v-bind="menuProps" class="lcb-chip">
            {{ getChipLabel(filter) }}
            <v-icon icon="mdi-chevron-down" size="14" class="ml-1 opacity-50" />
          </button>
        </template>
        <v-list
          density="compact"
          :selected="modelValue[filter.type] ?? []"
          select-strategy="classic"
          @click:select="({ id }) => toggleFilterValue(filter.type, id as string)"
        >
          <v-list-item
            v-for="opt in filter.options"
            :key="opt.value"
            :value="opt.value"
            :title="opt.label"
          />
        </v-list>
      </v-menu>
    </template>

    <v-menu v-if="filters.length > MAX_VISIBLE_FILTERS">
      <template #activator="{ props: menuProps }">
        <button v-bind="menuProps" class="lcb-chip">
          More
          <v-icon icon="mdi-chevron-down" size="14" class="ml-1 opacity-50" />
        </button>
      </template>
      <v-list density="compact">
        <template v-for="filter in filters.slice(MAX_VISIBLE_FILTERS)" :key="filter.type">
          <v-list-subheader>{{ filter.label }}</v-list-subheader>
          <v-list-item
            v-for="opt in filter.options"
            :key="opt.value"
            :value="opt.value"
            :title="opt.label"
            :active="(modelValue[filter.type] ?? []).includes(opt.value)"
            @click="toggleFilterValue(filter.type, opt.value)"
          />
        </template>
      </v-list>
    </v-menu>
  </div>
</template>
