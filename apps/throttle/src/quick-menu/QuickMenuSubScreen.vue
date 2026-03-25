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
  <div class="qm-sub">
    <button class="qm-sub__back" @click="emit('back')">
      <v-icon size="16">mdi-arrow-left</v-icon>
      <span>{{ title }}</span>
    </button>
    <div class="qm-sub__list">
      <button
        v-for="item in items"
        :key="item.id"
        class="qm-sub__item"
        @click="emit('select', item.id)"
      >
        <v-icon size="18" :color="item.color">{{ item.icon }}</v-icon>
        <span class="qm-sub__item-label">{{ item.label }}</span>
        <v-icon size="14" class="qm-sub__chevron">mdi-chevron-right</v-icon>
      </button>
    </div>
  </div>
</template>

<style scoped>
.qm-sub__back {
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
.qm-sub__back:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.qm-sub__list {
  display: flex;
  flex-direction: column;
}

.qm-sub__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 150ms ease;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.qm-sub__item:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}
.qm-sub__item:active {
  background: rgba(var(--v-theme-on-surface), 0.1);
}

.qm-sub__item-label {
  font-size: 0.75rem;
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.qm-sub__chevron {
  opacity: 0.25;
}
</style>
