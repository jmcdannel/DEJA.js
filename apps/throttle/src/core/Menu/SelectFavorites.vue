<script setup lang="ts">
import { useMenu } from '@/core/Menu/useMenu'

const { menuConfig, saveFavorite, removeFavorite } = useMenu()

function toggle(item: { name: string; isFavorite: boolean }) {
  item.isFavorite ? removeFavorite(item.name) : saveFavorite(item.name)
}
</script>

<template>
  <div class="favorites-grid">
    <button
      v-for="item in menuConfig"
      :key="item.name"
      class="favorite-item"
      :class="{ 'favorite-item--active': item.isFavorite }"
      @click="toggle(item)"
    >
      <v-icon :size="20" :color="item.isFavorite ? item.color : undefined">{{ item.icon }}</v-icon>
      <span class="favorite-item__label">{{ item.label }}</span>
      <v-icon size="14" class="favorite-item__star">
        {{ item.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
      </v-icon>
    </button>
  </div>
  <p v-if="!menuConfig?.length" class="text-sm text-slate-500 text-center py-4">No menu items available</p>
</template>

<style scoped>
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 6, 23, 0.3);
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
  text-align: left;
}

.favorite-item:hover {
  border-color: rgba(148, 163, 184, 0.25);
  background: rgba(56, 189, 248, 0.05);
}

.favorite-item--active {
  border-color: rgba(56, 189, 248, 0.3);
  background: rgba(56, 189, 248, 0.08);
}

.favorite-item__label {
  flex: 1;
  font-size: 0.8rem;
  font-weight: 500;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-item__star {
  color: rgba(148, 163, 184, 0.4);
  flex-shrink: 0;
}

.favorite-item--active .favorite-item__star {
  color: #fbbf24;
}
</style>
