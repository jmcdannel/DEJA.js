import { computed, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useThrottleSettings } from '@/throttle/useThrottleSettings'
import type { Command } from '../types'

export function useSettingsCommands(): ComputedRef<Command[]> {
  const router = useRouter()
  const { variant, showFunctions, showSpeedometer, showConsist, setVariant, setShowFunctions, setShowSpeedometer, setShowConsist } = useThrottleSettings()

  return computed<Command[]>(() => [
    {
      id: 'settings.variant.buttons',
      title: 'Throttle variant: Buttons',
      description: variant.value === 'buttons' ? 'currently selected' : undefined,
      icon: 'mdi-gesture-tap-button',
      category: 'settings',
      run: () => setVariant('buttons'),
    },
    {
      id: 'settings.variant.slider',
      title: 'Throttle variant: Slider',
      description: variant.value === 'slider' ? 'currently selected' : undefined,
      icon: 'mdi-tune-vertical',
      category: 'settings',
      run: () => setVariant('slider'),
    },
    {
      id: 'settings.variant.dashboard',
      title: 'Throttle variant: Dashboard',
      description: variant.value === 'dashboard' ? 'currently selected' : undefined,
      icon: 'mdi-view-dashboard',
      category: 'settings',
      run: () => setVariant('dashboard'),
    },
    {
      id: 'settings.toggle.functions',
      title: `Show functions: ${showFunctions.value ? 'on' : 'off'}`,
      description: 'toggle',
      icon: 'mdi-function-variant',
      category: 'settings',
      run: () => setShowFunctions(!showFunctions.value),
    },
    {
      id: 'settings.toggle.speedometer',
      title: `Show speedometer: ${showSpeedometer.value ? 'on' : 'off'}`,
      description: 'toggle',
      icon: 'mdi-speedometer',
      category: 'settings',
      run: () => setShowSpeedometer(!showSpeedometer.value),
    },
    {
      id: 'settings.toggle.consist',
      title: `Show consist: ${showConsist.value ? 'on' : 'off'}`,
      description: 'toggle',
      icon: 'mdi-train-car-flatbed-car',
      category: 'settings',
      run: () => setShowConsist(!showConsist.value),
    },
    {
      id: 'settings.open-page',
      title: 'Open Settings page',
      icon: 'mdi-cog',
      category: 'settings',
      keywords: ['preferences', 'full settings'],
      run: async () => { await router.push({ name: 'settings' }) },
    },
  ])
}
