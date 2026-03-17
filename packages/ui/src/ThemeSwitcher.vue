<script setup lang="ts">
import { computed } from 'vue'
import { useThemeSwitcher } from './composables/useThemeSwitcher'

const { themePreference, cycleTheme } = useThemeSwitcher()

const icon = computed(() => {
  switch (themePreference.value) {
    case 'light': return 'mdi-white-balance-sunny'
    case 'dark': return 'mdi-moon-waning-crescent'
    case 'high-contrast': return 'mdi-contrast-box'
    default: return 'mdi-theme-light-dark'
  }
})

const tooltipText = computed(() => {
  switch (themePreference.value) {
    case 'light': return 'Light mode'
    case 'dark': return 'Dark mode'
    case 'high-contrast': return 'High contrast'
    default: return 'Theme'
  }
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
