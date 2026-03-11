import { ref, watch, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useTheme as useVuetifyTheme } from 'vuetify'

export type ThemeMode = 'light' | 'dark' | 'high-contrast'

export function useThemeSwitcher() {
  const vuetifyTheme = useVuetifyTheme()

  // Store the user's explicit preference
  const themePreference = useStorage<ThemeMode>('@DEJA/theme-preference', 'dark')
  
  // Computed actual state (light or dark)
  const isDark = ref(false)

  const applyTheme = (mode: ThemeMode) => {
    isDark.value = mode === 'dark' || mode === 'high-contrast'

    // Sync Tailwind dark mode class
    const html = document.documentElement
    if (mode === 'dark' || mode === 'high-contrast') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }

    // High-contrast class for targeted overrides
    if (mode === 'high-contrast') {
      html.classList.add('high-contrast')
    } else {
      html.classList.remove('high-contrast')
    }

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
    const order: ThemeMode[] = ['light', 'dark', 'high-contrast']
    const currentIndex = order.indexOf(themePreference.value)
    const nextIndex = (currentIndex + 1) % order.length
    setTheme(order[nextIndex])
  }

  return {
    themePreference,
    isDark,
    setTheme,
    cycleTheme
  }
}
