import { ref, watch, onMounted } from 'vue'
import { useStorage, usePreferredDark } from '@vueuse/core'
import { useTheme as useVuetifyTheme } from 'vuetify'

export type ThemeMode = 'light' | 'dark' | 'system'

export function useThemeSwitcher() {
  const vuetifyTheme = useVuetifyTheme()
  const preferredDark = usePreferredDark()
  
  // Store the user's explicit preference ('light', 'dark', or 'system')
  const themePreference = useStorage<ThemeMode>('@DEJA/theme-preference', 'system')
  
  // Computed actual state (light or dark)
  const isDark = ref(false)

  const applyTheme = (mode: ThemeMode) => {
    let resolvedIsDark = false
    
    if (mode === 'system') {
      resolvedIsDark = preferredDark.value
    } else {
      resolvedIsDark = mode === 'dark'
    }

    isDark.value = resolvedIsDark

    // Update HTML class
    if (resolvedIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Update Vuetify
    vuetifyTheme.global.name.value = resolvedIsDark ? 'dark' : 'light'
  }

  // Watch for changes in preference or system preference
  watch([themePreference, preferredDark], ([newPref]) => {
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
    if (themePreference.value === 'system') setTheme('light')
    else if (themePreference.value === 'light') setTheme('dark')
    else setTheme('system')
  }

  return {
    themePreference,
    isDark,
    setTheme,
    cycleTheme
  }
}
