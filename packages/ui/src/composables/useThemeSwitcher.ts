// packages/ui/src/composables/useThemeSwitcher.ts

import { ref, watch, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useTheme as useVuetifyTheme } from 'vuetify'
import type { ThemeMode } from '../themes/types'
import { THEME_MODES, THEME_MODE_DEFINITIONS } from '../themes/modes'

export type { ThemeMode }

export function useThemeSwitcher() {
  const vuetifyTheme = useVuetifyTheme()

  // Store the user's explicit preference
  const themePreference = useStorage<ThemeMode>('@DEJA/theme-preference', 'dark')

  // Computed actual state (light or dark)
  const isDark = ref(false)

  const applyTheme = (mode: ThemeMode) => {
    const modeDef = THEME_MODE_DEFINITIONS[mode]
    isDark.value = modeDef.dark

    // Sync HTML classes from mode definition
    const html = document.documentElement
    // Remove all possible theme classes first
    const allClasses = THEME_MODES.flatMap(m => THEME_MODE_DEFINITIONS[m].htmlClasses)
    const uniqueClasses = [...new Set(allClasses)]
    uniqueClasses.forEach(cls => html.classList.remove(cls))
    // Add classes for the current mode
    modeDef.htmlClasses.forEach(cls => html.classList.add(cls))

    // Update Vuetify theme name directly
    vuetifyTheme.global.name.value = mode
  }

  // Watch for changes in preference
  watch(themePreference, (newPref) => {
    applyTheme(newPref)
  })

  // Initialize on mount
  onMounted(() => {
    applyTheme(themePreference.value)
  })

  const setTheme = (mode: ThemeMode) => {
    themePreference.value = mode
  }

  const cycleTheme = () => {
    const currentIndex = THEME_MODES.indexOf(themePreference.value)
    const nextIndex = (currentIndex + 1) % THEME_MODES.length
    setTheme(THEME_MODES[nextIndex])
  }

  return {
    themePreference,
    isDark,
    setTheme,
    cycleTheme
  }
}
