<script setup lang="ts">
import { useMenu } from '@/core/Menu/useMenu'
import { ComingSoonBadge } from '@repo/ui'

const { menuConfig, saveFavorite, removeFavorite } = useMenu()

function toggle(item: { name: string; isFavorite: boolean; gated?: boolean }) {
  if (item.gated) return
  item.isFavorite ? removeFavorite(item.name) : saveFavorite(item.name)
}
</script>

<template>
  <div class="favorites-grid">
    <button
      v-for="item in menuConfig"
      :key="item.name"
      class="favorite-item"
      :class="{
        'favorite-item--active': item.isFavorite && !item.gated,
        'favorite-item--gated': item.gated,
      }"
      :disabled="item.gated"
      @click="toggle(item)"
    >
      <v-icon :size="20" :color="!item.gated && item.isFavorite ? item.color : undefined" :style="item.gated ? 'opacity: 0.35' : ''">{{ item.icon }}</v-icon>
      <span class="favorite-item__label">{{ item.label }}</span>
      <ComingSoonBadge v-if="item.gated" size="x-small" variant="outlined" />
      <v-icon v-else size="14" class="favorite-item__star">
        {{ item.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
      </v-icon>
    </button>
  </div>
  <p v-if="!menuConfig?.length" class="text-sm opacity-40 text-center py-4">No menu items available</p>
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
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-surface), 0.3);
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
  text-align: left;
}

.favorite-item:hover {
  border-color: rgba(var(--v-theme-on-surface), 0.25);
  background: rgba(var(--v-theme-primary), 0.05);
}

.favorite-item--active {
  border-color: rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-primary), 0.08);
}

.favorite-item__label {
  flex: 1;
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-item__star {
  color: rgba(var(--v-theme-on-surface), 0.3);
  flex-shrink: 0;
}

.favorite-item--active .favorite-item__star {
  color: #fbbf24;
}

.favorite-item--gated {
  opacity: 0.5;
  cursor: default;
  pointer-events: none;
}
</style>
