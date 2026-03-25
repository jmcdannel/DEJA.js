<script setup lang="ts">
export interface ToggleItem {
  id: string
  name: string
  state: boolean
  icon?: string
  color?: string
}

defineProps<{
  title: string
  items: ToggleItem[]
}>()

const emit = defineEmits<{
  back: []
  toggle: [id: string, state: boolean]
}>()

function onToggle(id: string, v: unknown) {
  emit('toggle', id, !!v)
}
</script>

<template>
  <div class="qm-items">
    <button class="qm-items__back" @click="emit('back')">
      <v-icon size="16">mdi-arrow-left</v-icon>
      <span>{{ title }}</span>
      <span class="qm-items__count">{{ items.length }}</span>
    </button>
    <div v-if="items.length > 0" class="qm-items__list">
      <div
        v-for="item in items"
        :key="item.id"
        class="qm-items__row"
      >
        <v-icon
          v-if="item.icon"
          size="14"
          :color="item.state ? (item.color || 'green') : undefined"
          class="qm-items__icon"
        >
          {{ item.icon }}
        </v-icon>
        <span class="qm-items__name">{{ item.name }}</span>
        <v-switch
          :model-value="item.state"
          density="compact"
          hide-details
          color="green"
          class="qm-items__switch"
          @update:model-value="(v) => onToggle(item.id, v)"
        />
      </div>
    </div>
    <div v-else class="qm-items__empty">
      <v-icon size="20" class="opacity-20 mb-1">mdi-playlist-remove</v-icon>
      <span>No items</span>
    </div>
  </div>
</template>

<style scoped>
.qm-items__back {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  transition: background 150ms ease;
}
.qm-items__back:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.qm-items__count {
  font-size: 0.6rem;
  font-weight: 600;
  font-family: monospace;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-left: auto;
}

.qm-items__list {
  display: flex;
  flex-direction: column;
  max-height: 260px;
  overflow-y: auto;
}

.qm-items__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 14px 2px 14px;
}

.qm-items__icon {
  flex-shrink: 0;
  opacity: 0.5;
}

.qm-items__name {
  font-size: 0.7rem;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.qm-items__switch {
  flex-shrink: 0;
}
.qm-items__switch :deep(.v-switch__track) {
  height: 14px;
  width: 28px;
}
.qm-items__switch :deep(.v-switch__thumb) {
  height: 10px;
  width: 10px;
}
.qm-items__switch :deep(.v-selection-control) {
  min-height: 28px;
}

.qm-items__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  gap: 4px;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.3);
}
</style>
