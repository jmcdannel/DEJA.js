import { computed, type ComputedRef, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { backgrounds, useThemeSwitcher, type ThemeMode } from '@repo/ui'
import { useUserPreferences } from '@repo/modules'
import type { Command } from '../types'
import { useThrottleSettings } from '@/throttle/useThrottleSettings'
import { useConductorSettings } from '@/conductor/useConductorSettings'
import { useQuickMenu } from '@/quick-menu/useQuickMenu'

const APP_NAME = 'throttle'

const THEME_OPTIONS: Array<{ id: ThemeMode; title: string; icon: string }> = [
  { id: 'dark', title: 'Dark', icon: 'mdi-weather-night' },
  { id: 'light', title: 'Light', icon: 'mdi-weather-sunny' },
  { id: 'high-contrast', title: 'High Contrast', icon: 'mdi-contrast-circle' },
]

/**
 * 🎨 Build the Theme drill-down command (always visible).
 */
function buildThemeCommand(
  themePreference: Ref<ThemeMode> | ComputedRef<ThemeMode>,
  setTheme: (mode: ThemeMode) => void,
): Command {
  const children: Command[] = THEME_OPTIONS.map(({ id, title, icon }) => ({
    id: `settings.theme.${id}`,
    title,
    description: themePreference.value === id ? 'currently selected' : undefined,
    icon,
    category: 'settings',
    run: () => setTheme(id),
  }))

  return {
    id: 'settings.theme',
    title: 'Theme',
    icon: 'mdi-palette',
    category: 'settings',
    keywords: ['dark', 'light', 'high contrast', 'appearance'],
    run: () => {},
    children: {
      title: 'Theme',
      commands: children,
    },
  }
}

/**
 * 🖼️ Build the Background drill-down command (always visible).
 */
function buildBackgroundCommand(
  currentBackgroundId: string,
  setAppBackground: (appName: string, id: string) => Promise<void>,
): Command {
  const noneChild: Command = {
    id: 'settings.background.none',
    title: 'None',
    description: currentBackgroundId === 'none' ? 'currently selected' : undefined,
    icon: 'mdi-close-circle-outline',
    category: 'settings',
    run: async () => {
      await setAppBackground(APP_NAME, 'none')
    },
  }

  const bgChildren: Command[] = backgrounds.map((bg) => ({
    id: `settings.background.${bg.id}`,
    title: bg.name,
    description: currentBackgroundId === bg.id ? 'currently selected' : undefined,
    icon: bg.type === 'effect' ? 'mdi-auto-fix' : 'mdi-image',
    category: 'settings',
    keywords: [bg.category, bg.type],
    run: async () => {
      await setAppBackground(APP_NAME, bg.id)
    },
  }))

  return {
    id: 'settings.background',
    title: 'Background',
    icon: 'mdi-image-multiple',
    category: 'settings',
    keywords: ['wallpaper', 'scene', 'backdrop'],
    run: () => {},
    children: {
      title: 'Background',
      commands: [noneChild, ...bgChildren],
    },
  }
}

/**
 * 🏎️ Build the throttle-variant drill-down (Buttons / Slider / Dashboard).
 */
function buildVariantCommand(
  id: string,
  title: string,
  current: Ref<'buttons' | 'slider' | 'dashboard'> | ComputedRef<'buttons' | 'slider' | 'dashboard'>,
  setVariant: (v: 'buttons' | 'slider' | 'dashboard') => Promise<void> | void,
): Command {
  const options: Array<{ value: 'buttons' | 'slider' | 'dashboard'; title: string; icon: string }> = [
    { value: 'buttons', title: 'Buttons', icon: 'mdi-gesture-tap-button' },
    { value: 'slider', title: 'Slider', icon: 'mdi-tune-vertical' },
    { value: 'dashboard', title: 'Dashboard', icon: 'mdi-view-dashboard' },
  ]

  const children: Command[] = options.map(({ value, title: label, icon }) => ({
    id: `${id}.${value}`,
    title: label,
    description: current.value === value ? 'currently selected' : undefined,
    icon,
    category: 'settings',
    run: () => setVariant(value),
  }))

  return {
    id,
    title,
    icon: 'mdi-view-dashboard-variant',
    category: 'settings',
    run: () => {},
    children: { title, commands: children },
  }
}

/**
 * 🧭 useSettingsCommands — returns a contextual list of settings commands
 * based on the current route. Always includes Theme, Background and
 * "Open Settings page"; additional items are appended for throttle /
 * conductor routes. Returns an empty list on the Settings page itself.
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

  return computed<Command[]>(() => {
    const routeName = route.name

    // 🚪 On the Settings page itself, hide the whole Settings section.
    if (routeName === 'settings') {
      return []
    }

    const commands: Command[] = []

    // 🎨 Always-visible core items
    commands.push(
      buildThemeCommand(themePreference as Ref<ThemeMode>, setTheme),
      buildBackgroundCommand(currentBackground.value, setAppBackground),
    )

    // 🏎️ Throttle-route contextual items
    if (routeName === 'throttle' || routeName === 'throttles') {
      commands.push(
        buildVariantCommand(
          'settings.throttle.variant',
          'Throttle variant',
          throttleVariant,
          setThrottleVariant,
        ),
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
          id: 'settings.toggle.quickMenu',
          title: `Quick menu: ${quickMenuVisible.value ? 'visible' : 'hidden'}`,
          description: 'toggle',
          icon: 'mdi-menu',
          category: 'settings',
          run: () => {
            quickMenuVisible.value = !quickMenuVisible.value
          },
        },
      )
    }

    // 🎛️ Conductor-route contextual items
    if (routeName === 'conductor') {
      commands.push(
        buildVariantCommand(
          'settings.conductor.variant',
          'Conductor variant',
          conductorVariant,
          setConductorVariant,
        ),
      )

      const rightPanelOptions: Array<{
        value: 'turnouts' | 'effects' | 'signals' | 'devices' | 'routes'
        title: string
        icon: string
      }> = [
        { value: 'turnouts', title: 'Turnouts', icon: 'mdi-call-split' },
        { value: 'effects', title: 'Effects', icon: 'mdi-rocket-launch' },
        { value: 'signals', title: 'Signals', icon: 'mdi-traffic-light' },
        { value: 'devices', title: 'Devices', icon: 'mdi-chip' },
        { value: 'routes', title: 'Routes', icon: 'mdi-routes' },
      ]

      commands.push({
        id: 'settings.conductor.rightPanel',
        title: 'Right panel',
        icon: 'mdi-dock-right',
        category: 'settings',
        run: () => {},
        children: {
          title: 'Right panel',
          commands: rightPanelOptions.map(({ value, title, icon }) => ({
            id: `settings.conductor.rightPanel.${value}`,
            title,
            description:
              conductorRightPanel.value === value ? 'currently selected' : undefined,
            icon,
            category: 'settings',
            run: () => setConductorRightPanel(value),
          })),
        },
      })
    }

    // 🗂️ turnouts / effects / signals / roster — no extra items

    // ⚙️ Open Settings page (always last)
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
