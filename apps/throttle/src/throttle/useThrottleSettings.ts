import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useUserPreferences, type ThrottleSettings, type ThrottleVariant, type TileVariant, type SpeedDisplayType, type ConductorRightPanel } from '@repo/modules'

const DEFAULTS: ThrottleSettings = {
  variant: 'buttons',
  speedDisplayType: 'dial',
  showFunctions: true,
  showSpeedometer: true,
  showConsist: true,
}

export function useThrottleSettings() {
  const { getPreference, setPreference } = useUserPreferences()

  const settings: ComputedRef<ThrottleSettings> = getPreference('throttleSettings', DEFAULTS)

  const variant = computed(() => settings.value.variant)
  const tileVariant = computed(() => settings.value.tileVariant ?? 'default')
  const speedDisplayType = computed(() => settings.value.speedDisplayType ?? 'dial')
  const showFunctions = computed(() => settings.value.showFunctions)
  const showSpeedometer = computed(() => settings.value.showSpeedometer)
  const showConsist = computed(() => settings.value.showConsist)
  const rightPanel = computed(() => settings.value.rightPanel ?? 'turnouts')

  async function setVariant(value: ThrottleVariant) {
    await setPreference('throttleSettings', { ...settings.value, variant: value })
  }

  async function setTileVariant(value: TileVariant) {
    await setPreference('throttleSettings', { ...settings.value, tileVariant: value })
  }

  async function setSpeedDisplayType(value: SpeedDisplayType) {
    await setPreference('throttleSettings', { ...settings.value, speedDisplayType: value })
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

  async function setRightPanel(value: ConductorRightPanel) {
    await setPreference('throttleSettings', { ...settings.value, rightPanel: value })
  }

  return {
    variant,
    tileVariant,
    speedDisplayType,
    showFunctions,
    showSpeedometer,
    showConsist,
    setVariant,
    setTileVariant,
    setSpeedDisplayType,
    setShowFunctions,
    setShowSpeedometer,
    setShowConsist,
    rightPanel,
    setRightPanel,
  }
}

export default useThrottleSettings
