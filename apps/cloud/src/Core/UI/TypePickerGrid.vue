<script setup lang="ts">
export interface TypeOption {
  value: string
  label: string
  icon?: string
  color?: string
  description?: string
  disabled?: boolean
}

defineProps<{
  options: TypeOption[]
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div v-if="options.length === 0" class="type-picker-grid__empty">
    <v-icon icon="mdi-help-circle" size="32" class="opacity-40" />
    <p class="text-sm opacity-60 mt-2">No options available.</p>
  </div>

  <div v-else class="type-picker-grid">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      :disabled="opt.disabled"
      class="type-picker-grid__tile"
      :class="{
        'type-picker-grid__tile--selected': modelValue === opt.value,
        'type-picker-grid__tile--disabled': opt.disabled,
      }"
      @click="!opt.disabled && emit('update:modelValue', opt.value)"
    >
      <div class="type-picker-grid__tile-header">
        <v-avatar :color="opt.color || 'slate'" variant="tonal" size="34" rounded="lg">
          <v-icon :icon="opt.icon || 'mdi-help'" :color="opt.color" size="18" />
        </v-avatar>

        <div class="type-picker-grid__tile-text">
          <div class="type-picker-grid__tile-name">{{ opt.label }}</div>
          <div v-if="opt.description" class="type-picker-grid__tile-desc">{{ opt.description }}</div>
        </div>

        <v-icon
          v-if="modelValue === opt.value"
          icon="mdi-check-circle"
          color="cyan"
          size="18"
          class="type-picker-grid__tile-check"
        />
        <v-chip v-else-if="opt.disabled" size="x-small" variant="tonal" class="type-picker-grid__tile-check opacity-60">
          Soon
        </v-chip>
      </div>
    </button>
  </div>
</template>

<style scoped>
.type-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.6rem;
}

.type-picker-grid__tile {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  text-align: left;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(15, 23, 42, 0.55);
  color: #e0f2fe;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    background 150ms ease,
    transform 150ms ease,
    box-shadow 150ms ease;
}

.type-picker-grid__tile:hover:not(.type-picker-grid__tile--disabled) {
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(56, 189, 248, 0.06);
  transform: translateY(-1px);
}

.type-picker-grid__tile--selected {
  border-color: rgba(56, 189, 248, 0.8);
  background: rgba(56, 189, 248, 0.12);
  box-shadow: 0 12px 28px -18px rgba(56, 189, 248, 0.65);
}

.type-picker-grid__tile--disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.type-picker-grid__tile-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.type-picker-grid__tile-text {
  flex: 1;
  min-width: 0;
}

.type-picker-grid__tile-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #f8fafc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-picker-grid__tile-desc {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(148, 163, 184, 0.72);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-picker-grid__tile-check {
  flex-shrink: 0;
}

.type-picker-grid__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 0.75rem;
  background: rgba(15, 23, 42, 0.35);
}
</style>
