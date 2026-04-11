import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import {
  useUserPreferences,
  type ConductorSettings,
  type ConductorRightPanel,
  type ThrottleVariant,
} from '@repo/modules'

const DEFAULTS: ConductorSettings = {
  variant: 'buttons',
  rightPanel: 'turnouts',
}

export function useConductorSettings() {
  const { getPreference, setPreference } = useUserPreferences()

  const settings: ComputedRef<ConductorSettings> = getPreference('conductorSettings', DEFAULTS)

  const variant = computed(() => settings.value.variant)
  const rightPanel = computed(() => settings.value.rightPanel)

  async function setVariant(value: ThrottleVariant) {
    await setPreference('conductorSettings', { ...settings.value, variant: value })
  }

  async function setRightPanel(value: ConductorRightPanel) {
    await setPreference('conductorSettings', { ...settings.value, rightPanel: value })
  }

  return {
    variant,
    rightPanel,
    setVariant,
    setRightPanel,
  }
}

export default useConductorSettings
