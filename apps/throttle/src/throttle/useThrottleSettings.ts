import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useUserPreferences, type ThrottleSettings, type ThrottleVariant } from '@repo/modules'

const DEFAULTS: ThrottleSettings = {
  variant: 'buttons',
  showFunctions: true,
  showSpeedometer: true,
  showConsist: true,
}

export function useThrottleSettings() {
  const { getPreference, setPreference } = useUserPreferences()

  const settings: ComputedRef<ThrottleSettings> = getPreference('throttleSettings', DEFAULTS)

  const variant = computed(() => settings.value.variant)
  const showFunctions = computed(() => settings.value.showFunctions)
  const showSpeedometer = computed(() => settings.value.showSpeedometer)
  const showConsist = computed(() => settings.value.showConsist)

  async function setVariant(value: ThrottleVariant) {
    await setPreference('throttleSettings', { ...settings.value, variant: value })
  }

  async function setShowFunctions(value: boolean) {
    await setPreference('throttleSettings', { ...settings.value, showFunctions: value })
  }

  async function setShowSpeedometer(value: boolean) {
    await setPreference('throttleSettings', { ...settings.value, showSpeedometer: value })
  }

  async function setShowConsist(value: boolean) {
    await setPreference('throttleSettings', { ...settings.value, showConsist: value })
  }

  return {
    variant,
    showFunctions,
    showSpeedometer,
    showConsist,
    setVariant,
    setShowFunctions,
    setShowSpeedometer,
    setShowConsist,
  }
}

export default useThrottleSettings
