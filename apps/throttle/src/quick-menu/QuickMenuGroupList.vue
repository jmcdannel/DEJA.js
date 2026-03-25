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
  <div>
    <button class="qm-back-btn" @click="emit('back')">
      <v-icon size="16">mdi-arrow-left</v-icon>
      <span>{{ title }}</span>
    </button>
    <div v-if="groups.length > 0" class="qm-scrollable-list">
      <button
        v-for="group in groups"
        :key="group.id"
        class="qm-list-item"
        @click="emit('select', group.id)"
      >
        <v-icon size="16" :color="color || 'cyan'" class="opacity-60">{{ icon || 'mdi-folder' }}</v-icon>
        <span class="qm-list-item__label">{{ group.label }}</span>
        <span class="qm-list-item__count">{{ group.count }}</span>
      </button>
    </div>
    <div v-else class="qm-empty">
      <v-icon size="20" class="opacity-20 mb-1">mdi-folder-open-outline</v-icon>
      <span>None found</span>
    </div>
  </div>
</template>

<style>
@import './quick-menu-shared.css';
</style>
