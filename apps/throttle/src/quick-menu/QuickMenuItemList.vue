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
  <div>
    <button class="qm-back-btn" @click="emit('back')">
      <v-icon size="16">mdi-arrow-left</v-icon>
      <span>{{ title }}</span>
      <span class="qm-list-item__count" style="margin-left: auto">{{ items.length }}</span>
    </button>
    <div v-if="items.length > 0" class="qm-scrollable-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="qm-item-row"
      >
        <v-icon
          v-if="item.icon"
          size="14"
          :color="item.state ? (item.color || 'green') : undefined"
          class="qm-item-row__icon"
        >
          {{ item.icon }}
        </v-icon>
        <span class="qm-list-item__label">{{ item.name }}</span>
        <v-switch
          :model-value="item.state"
          density="compact"
          hide-details
          color="green"
          class="qm-item-row__switch"
          @update:model-value="(v) => onToggle(item.id, v)"
        />
      </div>
    </div>
    <div v-else class="qm-empty">
      <v-icon size="20" class="opacity-20 mb-1">mdi-playlist-remove</v-icon>
      <span>No items</span>
    </div>
  </div>
</template>

<style>
@import './quick-menu-shared.css';
</style>

<style scoped>
.qm-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 14px;
}
.qm-item-row__icon {
  flex-shrink: 0;
  opacity: 0.5;
}
.qm-item-row__switch {
  flex-shrink: 0;
}
.qm-item-row__switch :deep(.v-switch__track) {
  height: 14px;
  width: 28px;
}
.qm-item-row__switch :deep(.v-switch__thumb) {
  height: 10px;
  width: 10px;
}
.qm-item-row__switch :deep(.v-selection-control) {
  min-height: 28px;
}
</style>
