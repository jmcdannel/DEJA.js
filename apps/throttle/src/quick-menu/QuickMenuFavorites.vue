<script setup lang="ts">
import { useStorage } from '@vueuse/core'

interface QuickFavorite {
  id: string
  label: string
  icon: string
  color: string
  type: string
}

// Persisted favorites — empty by default, users will add their own
const favorites = useStorage<QuickFavorite[]>('@DEJA/quickMenu/favorites', [])
</script>

<template>
  <div class="quick-favs">
    <template v-if="favorites.length > 0">
      <div class="quick-favs__grid">
        <button
          v-for="fav in favorites"
          :key="fav.id"
          class="quick-favs__item"
        >
          <v-icon size="16" :color="fav.color">{{ fav.icon }}</v-icon>
          <span class="quick-favs__label">{{ fav.label }}</span>
        </button>
      </div>
    </template>
    <div v-else class="quick-favs__empty">
      <v-icon size="20" class="opacity-20 mb-1">mdi-star-outline</v-icon>
      <span class="quick-favs__empty-title">No favorites yet</span>
      <span class="quick-favs__empty-hint">Star turnouts, effects, or signals for quick access</span>
    </div>
  </div>
</template>

<style scoped>
.quick-favs {
  padding: 6px 8px;
}
.quick-favs__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.quick-favs__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgba(var(--v-theme-on-surface), 0.03);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.quick-favs__item:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-color: rgba(var(--v-theme-on-surface), 0.15);
}
.quick-favs__item:active {
  background: rgba(var(--v-theme-on-surface), 0.12);
}
.quick-favs__label {
  font-size: 0.6rem;
  font-weight: 500;
  white-space: nowrap;
}

.quick-favs__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 12px;
  gap: 2px;
  text-align: center;
}
.quick-favs__empty-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.4);
}
.quick-favs__empty-hint {
  font-size: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.25);
  line-height: 1.4;
}
</style>
