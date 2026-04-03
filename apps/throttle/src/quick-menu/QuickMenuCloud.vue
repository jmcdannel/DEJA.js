<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CLOUD_MENU_ITEMS } from '@repo/modules/quick-menu'
import type { EntityScreen } from './useQuickMenu'

const router = useRouter()
const emit = defineEmits<{
  navigate: []
  drill: [screen: EntityScreen]
}>()

// Items that have sub-screens drill in instead of navigating
const drillScreens: Record<string, EntityScreen> = {
  locos: 'locos',
  effects: 'effects',
  routes: 'routes',
  turnouts: 'turnouts',
  signals: 'signals',
  sensors: 'sensors',
}

function handleClick(item: (typeof CLOUD_MENU_ITEMS)[number]) {
  const screen = drillScreens[item.id]
  if (screen) {
    emit('drill', screen)
  } else {
    router.push({ name: item.routeName })
    emit('navigate')
  }
}
</script>

<template>
  <div class="quick-cloud">
    <div class="quick-cloud__grid">
      <button
        v-for="item in CLOUD_MENU_ITEMS"
        :key="item.id"
        class="quick-cloud__item"
        @click="handleClick(item)"
      >
        <v-icon size="18" :color="item.color">{{ item.icon }}</v-icon>
        <span class="quick-cloud__item-label">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quick-cloud {
  padding: 8px;
}
.quick-cloud__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
}
.quick-cloud__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border-radius: 8px;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 150ms ease;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.quick-cloud__item:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}
.quick-cloud__item:active {
  background: rgba(var(--v-theme-on-surface), 0.12);
}
.quick-cloud__item-label {
  font-size: 0.6rem;
  font-weight: 500;
  white-space: nowrap;
}
</style>
