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
  return `${filter.label}: ${selected.length} selected`
}

function toggleFilterValue(filterType: string, value: string) {
  const current = props.modelValue[filterType] ?? []
  const updated = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
  emit('update:modelValue', { ...props.modelValue, [filterType]: updated })
}

function removeFilter(filterType: string, value: string) {
  const current = props.modelValue[filterType] ?? []
  emit('update:modelValue', {
    ...props.modelValue,
    [filterType]: current.filter(v => v !== value),
  })
}
</script>

<template>
  <div v-if="mdAndUp" class="flex items-center gap-2 flex-wrap">
    <span class="text-xs tracking-wider text-slate-500 uppercase font-semibold">Filter:</span>

    <template v-for="(filter, idx) in filters" :key="filter.type">
      <v-menu v-if="idx < MAX_VISIBLE_FILTERS">
        <template #activator="{ props: menuProps }">
          <v-chip
            v-bind="menuProps"
            size="small"
            variant="flat"
            class="bg-slate-800 border border-slate-700"
            append-icon="mdi-chevron-down"
          >
            {{ getChipLabel(filter) }}
          </v-chip>
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

    <!-- Overflow "More" dropdown -->
    <v-menu v-if="filters.length > MAX_VISIBLE_FILTERS">
      <template #activator="{ props: menuProps }">
        <v-chip
          v-bind="menuProps"
          size="small"
          variant="flat"
          class="bg-slate-800 border border-slate-700"
          prepend-icon="mdi-dots-horizontal"
        >
          More
        </v-chip>
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

    <!-- Active filter removal chips -->
    <template v-for="filter in filters" :key="`active-${filter.type}`">
      <v-chip
        v-for="val in (modelValue[filter.type] ?? [])"
        :key="val"
        size="small"
        variant="flat"
        closable
        class="bg-slate-700"
        @click:close="removeFilter(filter.type, val)"
      >
        {{ filter.options.find(o => o.value === val)?.label ?? val }}
      </v-chip>
    </template>
  </div>
</template>
