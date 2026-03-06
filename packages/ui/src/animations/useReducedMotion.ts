import { computed } from 'vue'
import { useMediaQuery, useStorage } from '@vueuse/core'
import { presets, type PresetName } from './presets'

export function useReducedMotion() {
  const systemPrefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const userOverride = useStorage<boolean | null>('@DEJA/reducedMotion', null)

  const isReduced = computed(() => {
    if (userOverride.value !== null) return userOverride.value
    return systemPrefersReduced.value
  })

  function getPreset(name: PresetName) {
    if (isReduced.value) {
      return {
        initial: { opacity: 0 },
        enter: { opacity: 1, transition: { duration: 0 } },
      }
    }
    return presets[name]
  }

  return {
    isReduced,
    userOverride,
    getPreset,
  }
}
