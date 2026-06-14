import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CycleControl, ToggleControl } from '../types'
import { useSettingsCommands } from './settings'

// 🎭 Hoisted mock state so vi.mock factories can reference it.
// We use plain `{ value }` objects (ref-like) to avoid importing `vue` at hoist time.
const mocks = vi.hoisted(() => {
  const makeRef = <T>(initial: T): { value: T } => ({ value: initial })

  // vue-router
  const routeName = makeRef<string | null | undefined>('turnouts')
  const routePath = makeRef<string>('/turnouts')
  const pushMock = vi.fn(async () => {})

  // @repo/ui — theme + backgrounds registry
  const themePreferenceRef = makeRef<'dark' | 'light' | 'high-contrast'>('dark')
  const setThemeMock = vi.fn()
  const backgroundsFake = [
    {
      id: 'northernlights',
      name: 'Northern Lights',
      type: 'image',
      category: 'photo',
    },
    {
      id: 'tracks',
      name: 'Railroad Tracks',
      type: 'image',
      category: 'photo',
    },
  ]

  // @repo/modules — user preferences. getBackground returns a ref-like.
  const currentBackgroundRef = makeRef<string>('none')
  const getBackgroundMock = vi.fn(() => currentBackgroundRef)
  const setAppBackgroundMock = vi.fn(async () => {})

  // throttle settings (conductor settings are consolidated here — rightPanel)
  const throttleVariantRef = makeRef<'buttons' | 'slider' | 'dashboard'>(
    'buttons',
  )
  const showFunctionsRef = makeRef(true)
  const showConsistRef = makeRef(true)
  const rightPanelRef = makeRef<
    'turnouts' | 'effects' | 'signals' | 'devices' | 'routes'
  >('turnouts')
  const setThrottleVariantMock = vi.fn(async () => {})
  const setShowFunctionsMock = vi.fn(async () => {})
  const setShowConsistMock = vi.fn(async () => {})
  const setRightPanelMock = vi.fn(async () => {})

  return {
    routeName,
    routePath,
    pushMock,
    themePreferenceRef,
    setThemeMock,
    backgroundsFake,
    currentBackgroundRef,
    getBackgroundMock,
    setAppBackgroundMock,
    throttleVariantRef,
    showFunctionsRef,
    showConsistRef,
    rightPanelRef,
    setThrottleVariantMock,
    setShowFunctionsMock,
    setShowConsistMock,
    setRightPanelMock,
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => ({
    get name() {
      return mocks.routeName.value
    },
    get path() {
      return mocks.routePath.value
    },
  }),
  useRouter: () => ({ push: mocks.pushMock }),
}))

vi.mock('@repo/ui', () => ({
  useThemeSwitcher: () => ({
    themePreference: mocks.themePreferenceRef,
    setTheme: mocks.setThemeMock,
  }),
  backgrounds: mocks.backgroundsFake,
}))

vi.mock('@repo/modules', () => ({
  useUserPreferences: () => ({
    getBackground: mocks.getBackgroundMock,
    setAppBackground: mocks.setAppBackgroundMock,
  }),
}))

vi.mock('@/throttle/useThrottleSettings', () => ({
  useThrottleSettings: () => ({
    variant: mocks.throttleVariantRef,
    showFunctions: mocks.showFunctionsRef,
    showConsist: mocks.showConsistRef,
    rightPanel: mocks.rightPanelRef,
    setVariant: mocks.setThrottleVariantMock,
    setShowFunctions: mocks.setShowFunctionsMock,
    setShowConsist: mocks.setShowConsistMock,
    setRightPanel: mocks.setRightPanelMock,
  }),
}))

function asCycle<T = string>(cmd: { control?: unknown }): CycleControl<T> {
  const c = cmd.control as CycleControl<T> | undefined
  if (!c || c.kind !== 'cycle') {
    throw new Error('Expected cycle control')
  }
  return c
}

function asToggle(cmd: { control?: unknown }): ToggleControl {
  const c = cmd.control as ToggleControl | undefined
  if (!c || c.kind !== 'toggle') {
    throw new Error('Expected toggle control')
  }
  return c
}

describe('useSettingsCommands', () => {
  beforeEach(() => {
    // 🔁 Reset all mocks + refs to a generic, non-route-specific baseline.
    mocks.routeName.value = 'turnouts'
    mocks.routePath.value = '/turnouts'
    mocks.themePreferenceRef.value = 'dark'
    mocks.currentBackgroundRef.value = 'none'
    mocks.throttleVariantRef.value = 'buttons'
    mocks.showFunctionsRef.value = true
    mocks.showConsistRef.value = true
    mocks.rightPanelRef.value = 'turnouts'

    mocks.pushMock.mockClear()
    mocks.setThemeMock.mockClear()
    mocks.getBackgroundMock.mockClear()
    mocks.setAppBackgroundMock.mockClear()
    mocks.setThrottleVariantMock.mockClear()
    mocks.setShowFunctionsMock.mockClear()
    mocks.setShowConsistMock.mockClear()
    mocks.setRightPanelMock.mockClear()
  })

  it('returns an empty list on the settings route', () => {
    mocks.routeName.value = 'settings'
    mocks.routePath.value = '/settings'
    const commands = useSettingsCommands().value
    expect(commands).toEqual([])
  })

  it('returns only Theme and Open Settings on a generic route (turnouts)', () => {
    const commands = useSettingsCommands().value
    expect(commands).toHaveLength(2)
    expect(commands.map((c) => c.id)).toEqual([
      'settings.theme',
      'settings.open-page',
    ])
  })

  it('adds throttle variant + 2 toggles on the throttle route', () => {
    mocks.routeName.value = 'throttle'
    mocks.routePath.value = '/throttle/3'
    const commands = useSettingsCommands().value
    const ids = commands.map((c) => c.id)
    expect(ids).toEqual([
      'settings.theme',
      'settings.throttle.variant',
      'settings.toggle.functions',
      'settings.toggle.consist',
      'settings.open-page',
    ])
  })

  it('adds the same contextual items on the throttles (plural) route', () => {
    mocks.routeName.value = 'throttles'
    const commands = useSettingsCommands().value
    const ids = commands.map((c) => c.id)
    expect(ids).toContain('settings.throttle.variant')
    expect(ids).toContain('settings.toggle.functions')
    expect(ids).toContain('settings.toggle.consist')
  })

  it('adds throttle variant, toggles + right panel on the conductor route', () => {
    mocks.routeName.value = 'conductor'
    mocks.routePath.value = '/conductor'
    const commands = useSettingsCommands().value
    const ids = commands.map((c) => c.id)
    expect(ids).toEqual([
      'settings.theme',
      'settings.throttle.variant',
      'settings.toggle.functions',
      'settings.toggle.consist',
      'settings.conductor.rightPanel',
      'settings.open-page',
    ])
  })

  it('no settings command has `children` — all drill-downs replaced by inline controls', () => {
    mocks.routeName.value = 'throttle'
    const throttleCommands = useSettingsCommands().value
    expect(throttleCommands.every((c) => !c.children)).toBe(true)
    mocks.routeName.value = 'conductor'
    const conductorCommands = useSettingsCommands().value
    expect(conductorCommands.every((c) => !c.children)).toBe(true)
  })

  it('theme cycle control has 3 options and calls setTheme on set', async () => {
    const theme = useSettingsCommands().value.find(
      (c) => c.id === 'settings.theme',
    )!
    const control = asCycle<'dark' | 'light' | 'high-contrast'>(theme)
    expect(control.options.map((o) => o.value)).toEqual([
      'dark',
      'light',
      'high-contrast',
    ])
    expect(control.value).toBe('dark')
    await control.set('light')
    expect(mocks.setThemeMock).toHaveBeenCalledWith('light')
    await control.set('high-contrast')
    expect(mocks.setThemeMock).toHaveBeenCalledWith('high-contrast')
  })

  it('theme control value tracks themePreference', () => {
    mocks.themePreferenceRef.value = 'light'
    const theme = useSettingsCommands().value.find(
      (c) => c.id === 'settings.theme',
    )!
    expect(asCycle(theme).value).toBe('light')
  })

  it('Open Settings command pushes { name: "settings" } and has no control', async () => {
    const commands = useSettingsCommands().value
    const open = commands.find((c) => c.id === 'settings.open-page')!
    expect(open.control).toBeUndefined()
    await open.run()
    expect(mocks.pushMock).toHaveBeenCalledWith({ name: 'settings' })
  })

  it('throttle-variant cycle control calls setVariant with each value', async () => {
    mocks.routeName.value = 'throttle'
    const variant = useSettingsCommands().value.find(
      (c) => c.id === 'settings.throttle.variant',
    )!
    const control = asCycle<'buttons' | 'slider' | 'dashboard'>(variant)
    expect(control.options.map((o) => o.value)).toEqual([
      'buttons',
      'slider',
      'dashboard',
    ])
    await control.set('slider')
    expect(mocks.setThrottleVariantMock).toHaveBeenCalledWith('slider')
    await control.set('dashboard')
    expect(mocks.setThrottleVariantMock).toHaveBeenCalledWith('dashboard')
  })

  it('throttle toggle controls flip via their underlying setters', async () => {
    mocks.routeName.value = 'throttle'
    mocks.showFunctionsRef.value = true
    mocks.showConsistRef.value = true

    const commands = useSettingsCommands().value

    const functionsCmd = commands.find(
      (c) => c.id === 'settings.toggle.functions',
    )!
    const fToggle = asToggle(functionsCmd)
    expect(fToggle.value).toBe(true)
    await fToggle.set(!fToggle.value)
    expect(mocks.setShowFunctionsMock).toHaveBeenCalledWith(false)

    const consistCmd = commands.find(
      (c) => c.id === 'settings.toggle.consist',
    )!
    const cToggle = asToggle(consistCmd)
    await cToggle.set(!cToggle.value)
    expect(mocks.setShowConsistMock).toHaveBeenCalledWith(false)
  })

  it('conductor right-panel cycle control calls setRightPanel with each value', async () => {
    mocks.routeName.value = 'conductor'
    const rightPanel = useSettingsCommands().value.find(
      (c) => c.id === 'settings.conductor.rightPanel',
    )!
    const control = asCycle<
      'turnouts' | 'effects' | 'signals' | 'devices' | 'routes'
    >(rightPanel)
    expect(control.options.map((o) => o.value)).toEqual([
      'turnouts',
      'effects',
      'signals',
      'devices',
      'routes',
    ])
    await control.set('effects')
    expect(mocks.setRightPanelMock).toHaveBeenCalledWith('effects')
    await control.set('devices')
    expect(mocks.setRightPanelMock).toHaveBeenCalledWith('devices')
  })
})
