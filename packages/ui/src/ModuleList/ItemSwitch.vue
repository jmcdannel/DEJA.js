<script setup lang="ts">
import { computed, watch } from 'vue'
import type { DocumentData } from 'firebase/firestore'
import { useHaptics } from '../composables/useHaptics'

interface Props {
  item: DocumentData
  isRunning: boolean
}

const props = defineProps<Props>()
const state = defineModel('state', { type: Boolean })
const { vibrate } = useHaptics()

watch(state, () => { vibrate('light') })

const icon = computed(() => props.item?.icon || 'mdi-help')
const accent = computed(() => props.item?.color || 'primary')
</script>

<template>
  <v-card
    :color="accent"
    variant="tonal"
    rounded="pill"
    class="module-switch"
    :class="{ 'module-switch--running': isRunning }"
  >
    <v-icon :icon="icon" :color="accent" size="22" />

    <div class="module-switch__text">
      <div class="module-switch__name">{{ item?.name }}</div>
      <div v-if="item?.device" class="module-switch__device">
        <v-icon icon="mdi-memory" size="10" class="mr-0.5" />{{ item.device }}
      </div>
    </div>

    <v-switch
      v-model="state"
      :color="accent"
      :disabled="isRunning"
      :loading="isRunning"
      density="compact"
      hide-details
      inset
      class="module-switch__control"
    />
  </v-card>
</template>

<style scoped>
.module-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 6px 16px !important;
  border: 1px solid currentColor;
  transition: box-shadow 150ms ease, transform 150ms ease;
}
.module-switch:hover {
  box-shadow: 0 0 0 1px currentColor, 0 0 12px -2px currentColor;
}

.module-switch__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1.15;
}
.module-switch__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.module-switch__device {
  display: inline-flex;
  align-items: center;
  font-size: 0.6875rem;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-switch__control {
  flex-shrink: 0;
  margin-right: -6px;
}
.module-switch__control :deep(.v-selection-control) {
  min-height: 0;
}

/* Running / transitioning — pulsing accent glow. */
.module-switch--running {
  box-shadow: 0 0 0 1.5px currentColor, 0 0 16px -2px currentColor;
  animation: module-switch-pulse 1.4s ease-in-out infinite;
}

@keyframes module-switch-pulse {
  0%, 100% { box-shadow: 0 0 0 1.5px currentColor, 0 0 18px -2px currentColor; }
  50%      { box-shadow: 0 0 0 1.5px currentColor, 0 0  6px -2px currentColor; }
}
</style>
