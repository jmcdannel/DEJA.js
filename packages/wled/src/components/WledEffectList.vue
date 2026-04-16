<script setup lang="ts">
import { useWledEffects } from '../composables/useWledEffects'

interface Props {
  modelValue: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [effectId: number]
}>()

// 🎬 Searchable effect list
const { searchQuery, filteredEffects } = useWledEffects()

function selectEffect(id: number) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="wled-effect-list">
    <!-- Search input -->
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search effects..."
      />
    </div>

    <!-- Scrollable pill grid -->
    <div class="effect-grid">
      <button
        v-for="effect in filteredEffects"
        :key="effect.id"
        type="button"
        class="effect-pill"
        :class="{ active: modelValue === effect.id }"
        @click="selectEffect(effect.id)"
      >
        {{ effect.name }}
      </button>
      <div v-if="filteredEffects.length === 0" class="no-results">
        No effects found
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 🎨 Neon effect list */
.wled-effect-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 13px;
  pointer-events: none;
  opacity: 0.6;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  background: #12121e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #484f58;
}

.search-input:focus {
  border-color: #7928ca;
}

/* Scrollable pill grid */
.effect-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px 2px;
  scrollbar-width: thin;
  scrollbar-color: #2d2d44 transparent;
}

.effect-grid::-webkit-scrollbar {
  width: 4px;
}

.effect-grid::-webkit-scrollbar-track {
  background: transparent;
}

.effect-grid::-webkit-scrollbar-thumb {
  background: #2d2d44;
  border-radius: 2px;
}

/* 💊 Effect pills */
.effect-pill {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background: #12121e;
  border: 1px solid #2d2d44;
  color: #8b8ba0;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.effect-pill:hover {
  border-color: #ff0080;
  color: #e2e8f0;
}

/* ✨ Active pill — neon glow */
.effect-pill.active {
  background: #ff008018;
  border-color: #ff008050;
  color: #ffffff;
  box-shadow: 0 0 8px #ff008040;
}

.no-results {
  font-size: 12px;
  color: #484f58;
  padding: 8px;
  text-align: center;
  width: 100%;
}
</style>
