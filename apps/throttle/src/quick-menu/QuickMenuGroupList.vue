<script setup lang="ts">
import type { GroupItem } from './useQuickMenuData'

defineProps<{
  title: string
  groups: GroupItem[]
  icon?: string
  color?: string
}>()

const emit = defineEmits<{
  back: []
  select: [groupId: string]
}>()
</script>

<template>
  <div class="qm-groups">
    <button class="qm-groups__back" @click="emit('back')">
      <v-icon size="16">mdi-arrow-left</v-icon>
      <span>{{ title }}</span>
    </button>
    <div v-if="groups.length > 0" class="qm-groups__list">
      <button
        v-for="group in groups"
        :key="group.id"
        class="qm-groups__item"
        @click="emit('select', group.id)"
      >
        <v-icon size="16" :color="color || 'cyan'" class="opacity-60">{{ icon || 'mdi-folder' }}</v-icon>
        <span class="qm-groups__label">{{ group.label }}</span>
        <span class="qm-groups__count">{{ group.count }}</span>
      </button>
    </div>
    <div v-else class="qm-groups__empty">
      <v-icon size="20" class="opacity-20 mb-1">mdi-folder-open-outline</v-icon>
      <span class="qm-groups__empty-text">None found</span>
    </div>
  </div>
</template>

<style scoped>
.qm-groups__back {
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
.qm-groups__back:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.qm-groups__list {
  display: flex;
  flex-direction: column;
  max-height: 240px;
  overflow-y: auto;
}

.qm-groups__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 14px;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 150ms ease;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.qm-groups__item:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}
.qm-groups__item:active {
  background: rgba(var(--v-theme-on-surface), 0.1);
}

.qm-groups__label {
  font-size: 0.75rem;
  font-weight: 500;
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qm-groups__count {
  font-size: 0.6rem;
  font-weight: 600;
  font-family: monospace;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.qm-groups__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  gap: 4px;
}
.qm-groups__empty-text {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.3);
}
</style>
