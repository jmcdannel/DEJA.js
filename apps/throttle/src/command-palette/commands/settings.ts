import { computed, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { backgrounds, useThemeSwitcher, type ThemeMode } from '@repo/ui'
import { useUserPreferences } from '@repo/modules'
import type { Command, CycleControl, ToggleControl } from '../types'
import { useThrottleSettings } from '@/throttle/useThrottleSettings'
import { useConductorSettings } from '@/conductor/useConductorSettings'
import { useQuickMenu } from '@/quick-menu/useQuickMenu'

const APP_NAME = 'throttle'

type ThrottleVariant = 'buttons' | 'slider' | 'dashboard'
type ConductorRightPanel =
  | 'turnouts'
  | 'effects'
  | 'signals'
  | 'devices'
  | 'routes'

const THEME_OPTIONS: CycleControl<ThemeMode>['options'] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'high-contrast', label: 'High Contrast' },
]

const VARIANT_OPTIONS: CycleControl<ThrottleVariant>['options'] = [
  { value: 'buttons', label: 'Buttons' },
  { value: 'slider', label: 'Slider' },
  { value: 'dashboard', label: 'Dashboard' },
]

const RIGHT_PANEL_OPTIONS: CycleControl<ConductorRightPanel>['options'] = [
  { value: 'turnouts', label: 'Turnouts' },
  { value: 'effects', label: 'Effects' },
  { value: 'signals', label: 'Signals' },
  { value: 'devices', label: 'Devices' },
  { value: 'routes', label: 'Routes' },
]

/**
 * 🧭 useSettingsCommands — returns a contextual list of settings commands
 * based on the current route. Every setting is a single Command with an
 * inline `control` (cycle or toggle) so users can flip values with ← / →
 * without drilling in. Always includes Theme, Background and "Open
 * Settings page"; additional items are appended for throttle / conductor
 * routes. Returns an empty list on the Settings page itself.
 */
export function useSettingsCommands(): ComputedRef<Command[]> {
  const router = useRouter()
  const route = useRoute()

  const { themePreference, setTheme } = useThemeSwitcher()
  const { getBackground, setAppBackground } = useUserPreferences()
  // 🖼️ Reactive to both the current route and the stored preference.
  const currentBackground = computed(() =>
    getBackground(APP_NAME, route.path).value,
  )

  const {
    variant: throttleVariant,
    showFunctions,
    showSpeedometer,
    showConsist,
    setVariant: setThrottleVariant,
    setShowFunctions,
    setShowSpeedometer,
    setShowConsist,
  } = useThrottleSettings()

  const {
    variant: conductorVariant,
    rightPanel: conductorRightPanel,
    setVariant: setConductorVariant,
    setRightPanel: setConductorRightPanel,
  } = useConductorSettings()

  const { quickMenuVisible } = useQuickMenu()

  function buildThemeCommand(): Command {
    const control: CycleControl<ThemeMode> = {
      kind: 'cycle',
      options: THEME_OPTIONS,
      value: themePreference.value,
      set: (next) => setTheme(next),
    }
    return {
      id: 'settings.theme',
      title: 'Theme',
      icon: 'mdi-palette',
      category: 'settings',
      keywords: ['dark', 'light', 'high contrast', 'appearance'],
      keepOpen: true,
      run: () => {},
      control,
    }
  }

  function buildBackgroundCommand(): Command {
    const options: CycleControl<string>['options'] = [
      { value: 'none', label: 'None' },
      ...backgrounds.map((bg) => ({ value: bg.id, label: bg.name })),
    ]
    const control: CycleControl<string> = {
      kind: 'cycle',
      options,
      value: currentBackground.value || 'none',
      set: async (next) => {
        await setAppBackground(APP_NAME, next)
      },
    }
    return {
      id: 'settings.background',
      title: 'Background',
      icon: 'mdi-image-multiple',
      category: 'settings',
      keywords: ['wallpaper', 'scene', 'backdrop'],
      keepOpen: true,
      run: () => {},
      control,
    }
  }

  function buildVariantCommand<T extends string>(
    id: string,
    title: string,
    options: CycleControl<T>['options'],
    value: T,
    setter: (v: T) => Promise<void> | void,
  ): Command {
    const control: CycleControl<T> = {
      kind: 'cycle',
      options,
      value,
      set: (next) => setter(next),
    }
    return {
      id,
      title,
      icon: 'mdi-view-dashboard-variant',
      category: 'settings',
      keepOpen: true,
      run: () => {},
      control,
    }
  }

  function buildToggleCommand(
    id: string,
    title: string,
    icon: string,
    value: boolean,
    setter: (v: boolean) => Promise<void> | void,
  ): Command {
    const control: ToggleControl = {
      kind: 'toggle',
      value,
      set: (next) => setter(next),
    }
    return {
      id,
      title,
      icon,
      category: 'settings',
      keepOpen: true,
      run: () => {},
      control,
    }
  }

  return computed<Command[]>(() => {
    const routeName = route.name

    // 🚪 On the Settings page itself, hide the whole Settings section.
    if (routeName === 'settings') {
      return []
    }

    const commands: Command[] = []

    // 🎨 Always-visible core items
    commands.push(buildThemeCommand(), buildBackgroundCommand())

    // 🏎️ Throttle-route contextual items
    if (routeName === 'throttle' || routeName === 'throttles') {
      commands.push(
        buildVariantCommand(
          'settings.throttle.variant',
          'Throttle variant',
          VARIANT_OPTIONS,
          throttleVariant.value,
          setThrottleVariant,
        ),
        buildToggleCommand(
          'settings.toggle.functions',
          'Show functions',
          'mdi-function-variant',
          showFunctions.value,
          setShowFunctions,
        ),
        buildToggleCommand(
          'settings.toggle.speedometer',
          'Show speedometer',
          'mdi-speedometer',
          showSpeedometer.value,
          setShowSpeedometer,
        ),
        buildToggleCommand(
          'settings.toggle.consist',
          'Show consist',
          'mdi-train-car-flatbed-car',
          showConsist.value,
          setShowConsist,
        ),
        buildToggleCommand(
          'settings.toggle.quickMenu',
          'Quick menu visible',
          'mdi-menu',
          quickMenuVisible.value,
          (next) => {
            quickMenuVisible.value = next
          },
        ),
      )
    }

    // 🎛️ Conductor-route contextual items
    if (routeName === 'conductor') {
      commands.push(
        buildVariantCommand(
          'settings.conductor.variant',
          'Conductor variant',
          VARIANT_OPTIONS,
          conductorVariant.value,
          setConductorVariant,
        ),
        {
          id: 'settings.conductor.rightPanel',
          title: 'Right panel',
          icon: 'mdi-dock-right',
          category: 'settings',
          keepOpen: true,
          run: () => {},
          control: {
            kind: 'cycle',
            options: RIGHT_PANEL_OPTIONS,
            value: conductorRightPanel.value,
            set: (next) => setConductorRightPanel(next),
          } as CycleControl<ConductorRightPanel>,
        },
      )
    }

    // 🗂️ turnouts / effects / signals / roster — no extra items

    // ⚙️ Open Settings page (always last, plain command — no control)
    commands.push({
      id: 'settings.open-page',
      title: 'Open Settings page',
      icon: 'mdi-cog',
      category: 'settings',
      keywords: ['preferences', 'full settings'],
      run: async () => {
        await router.push({ name: 'settings' })
      },
    })

    return commands
  })
}
