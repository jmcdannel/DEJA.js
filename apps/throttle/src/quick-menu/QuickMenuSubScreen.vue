<script setup lang="ts">
export interface SubScreenItem {
  id: string
  label: string
  icon: string
  color: string
}

defineProps<{
  title: string
  items: SubScreenItem[]
}>()

const emit = defineEmits<{
  back: []
  select: [id: string]
}>()
</script>

<template>
  <div>
    <button class="qm-back-btn" @click="emit('back')">
      <v-icon size="16">mdi-arrow-left</v-icon>
      <span>{{ title }}</span>
    </button>
    <div class="qm-scrollable-list">
      <button
        v-for="item in items"
        :key="item.id"
        class="qm-list-item"
        @click="emit('select', item.id)"
      >
        <v-icon size="18" :color="item.color">{{ item.icon }}</v-icon>
        <span class="qm-list-item__label">{{ item.label }}</span>
        <v-icon size="14" class="qm-list-item__chevron">mdi-chevron-right</v-icon>
      </button>
    </div>
  </div>
</template>

<style>
@import './quick-menu-shared.css';
</style>
