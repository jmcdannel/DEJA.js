<script setup lang="ts">
import { computed } from 'vue'
import { useThemeSwitcher } from './composables/useThemeSwitcher'

const { themePreference, cycleTheme } = useThemeSwitcher()

const icon = computed(() => {
  if (themePreference.value === 'system') return 'mdi-monitor'
  if (themePreference.value === 'light') return 'mdi-weather-sunny'
  return 'mdi-weather-night'
})

const tooltipText = computed(() => {
  if (themePreference.value === 'system') return 'System Theme'
  if (themePreference.value === 'light') return 'Light Theme'
  return 'Dark Theme'
})
</script>

<template>
  <v-tooltip location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        size="small"
        class="theme-switcher-btn"
        @click="cycleTheme"
      >
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
    <span>{{ tooltipText }}</span>
  </v-tooltip>
</template>

<style scoped>
.theme-switcher-btn {
  backdrop-filter: blur(12px) !important;
  background: rgba(var(--v-theme-surface), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2) !important;
}
</style>
