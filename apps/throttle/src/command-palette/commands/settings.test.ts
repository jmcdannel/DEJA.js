import { describe, it, expect, vi, beforeEach } from 'vitest'
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

  // throttle settings
  const throttleVariantRef = makeRef<'buttons' | 'slider' | 'dashboard'>(
    'buttons',
  )
  const showFunctionsRef = makeRef(true)
  const showSpeedometerRef = makeRef(true)
  const showConsistRef = makeRef(true)
  const setThrottleVariantMock = vi.fn(async () => {})
  const setShowFunctionsMock = vi.fn(async () => {})
  const setShowSpeedometerMock = vi.fn(async () => {})
  const setShowConsistMock = vi.fn(async () => {})

  // conductor settings
  const conductorVariantRef = makeRef<'buttons' | 'slider' | 'dashboard'>(
    'buttons',
  )
  const conductorRightPanelRef = makeRef<
    'turnouts' | 'effects' | 'signals' | 'devices' | 'routes'
  >('turnouts')
  const setConductorVariantMock = vi.fn(async () => {})
  const setConductorRightPanelMock = vi.fn(async () => {})

  // quick menu
  const quickMenuVisibleRef = makeRef(true)

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
    showSpeedometerRef,
    showConsistRef,
    setThrottleVariantMock,
    setShowFunctionsMock,
    setShowSpeedometerMock,
    setShowConsistMock,
    conductorVariantRef,
    conductorRightPanelRef,
    setConductorVariantMock,
    setConductorRightPanelMock,
    quickMenuVisibleRef,
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
    showSpeedometer: mocks.showSpeedometerRef,
    showConsist: mocks.showConsistRef,
    setVariant: mocks.setThrottleVariantMock,
    setShowFunctions: mocks.setShowFunctionsMock,
    setShowSpeedometer: mocks.setShowSpeedometerMock,
    setShowConsist: mocks.setShowConsistMock,
  }),
}))

vi.mock('@/conductor/useConductorSettings', () => ({
  useConductorSettings: () => ({
    variant: mocks.conductorVariantRef,
    rightPanel: mocks.conductorRightPanelRef,
    setVariant: mocks.setConductorVariantMock,
    setRightPanel: mocks.setConductorRightPanelMock,
  }),
}))

vi.mock('@/quick-menu/useQuickMenu', () => ({
  useQuickMenu: () => ({
    quickMenuVisible: mocks.quickMenuVisibleRef,
  }),
}))

describe('useSettingsCommands', () => {
  beforeEach(() => {
    // 🔁 Reset all mocks + refs to a generic, non-route-specific baseline.
    mocks.routeName.value = 'turnouts'
    mocks.routePath.value = '/turnouts'
    mocks.themePreferenceRef.value = 'dark'
    mocks.currentBackgroundRef.value = 'none'
    mocks.throttleVariantRef.value = 'buttons'
    mocks.showFunctionsRef.value = true
    mocks.showSpeedometerRef.value = true
    mocks.showConsistRef.value = true
    mocks.conductorVariantRef.value = 'buttons'
    mocks.conductorRightPanelRef.value = 'turnouts'
    mocks.quickMenuVisibleRef.value = true

    mocks.pushMock.mockClear()
    mocks.setThemeMock.mockClear()
    mocks.getBackgroundMock.mockClear()
    mocks.setAppBackgroundMock.mockClear()
    mocks.setThrottleVariantMock.mockClear()
    mocks.setShowFunctionsMock.mockClear()
    mocks.setShowSpeedometerMock.mockClear()
    mocks.setShowConsistMock.mockClear()
    mocks.setConductorVariantMock.mockClear()
    mocks.setConductorRightPanelMock.mockClear()
  })

  it('returns an empty list on the settings route', () => {
    mocks.routeName.value = 'settings'
    mocks.routePath.value = '/settings'
    const commands = useSettingsCommands().value
    expect(commands).toEqual([])
  })

  it('returns only Theme, Background and Open Settings on a generic route (turnouts)', () => {
    const commands = useSettingsCommands().value
    expect(commands).toHaveLength(3)
    expect(commands.map((c) => c.id)).toEqual([
      'settings.theme',
      'settings.background',
      'settings.open-page',
    ])
  })

  it('adds throttle variant + 4 toggles on the throttle route', () => {
    mocks.routeName.value = 'throttle'
    mocks.routePath.value = '/throttle/3'
    const commands = useSettingsCommands().value
    const ids = commands.map((c) => c.id)
    expect(ids).toEqual([
      'settings.theme',
      'settings.background',
      'settings.throttle.variant',
      'settings.toggle.functions',
      'settings.toggle.speedometer',
      'settings.toggle.consist',
      'settings.toggle.quickMenu',
      'settings.open-page',
    ])
  })

  it('adds the same contextual items on the throttles (plural) route', () => {
    mocks.routeName.value = 'throttles'
    const commands = useSettingsCommands().value
    const ids = commands.map((c) => c.id)
    expect(ids).toContain('settings.throttle.variant')
    expect(ids).toContain('settings.toggle.functions')
    expect(ids).toContain('settings.toggle.speedometer')
    expect(ids).toContain('settings.toggle.consist')
    expect(ids).toContain('settings.toggle.quickMenu')
  })

  it('adds conductor variant + right panel on the conductor route', () => {
    mocks.routeName.value = 'conductor'
    mocks.routePath.value = '/conductor'
    const commands = useSettingsCommands().value
    const ids = commands.map((c) => c.id)
    expect(ids).toEqual([
      'settings.theme',
      'settings.background',
      'settings.conductor.variant',
      'settings.conductor.rightPanel',
      'settings.open-page',
    ])
  })

  it('theme drill children call setTheme with the right mode', async () => {
    const commands = useSettingsCommands().value
    const theme = commands.find((c) => c.id === 'settings.theme')!
    expect(theme.children).toBeDefined()
    const themeChildren = theme.children!.commands
    expect(themeChildren.map((c) => c.id)).toEqual([
      'settings.theme.dark',
      'settings.theme.light',
      'settings.theme.high-contrast',
    ])

    await themeChildren.find((c) => c.id === 'settings.theme.dark')!.run()
    expect(mocks.setThemeMock).toHaveBeenCalledWith('dark')

    await themeChildren.find((c) => c.id === 'settings.theme.light')!.run()
    expect(mocks.setThemeMock).toHaveBeenCalledWith('light')

    await themeChildren
      .find((c) => c.id === 'settings.theme.high-contrast')!
      .run()
    expect(mocks.setThemeMock).toHaveBeenCalledWith('high-contrast')
  })

  it('marks the currently-selected theme with a description', () => {
    mocks.themePreferenceRef.value = 'light'
    const commands = useSettingsCommands().value
    const theme = commands.find((c) => c.id === 'settings.theme')!
    const lightChild = theme.children!.commands.find(
      (c) => c.id === 'settings.theme.light',
    )!
    const darkChild = theme.children!.commands.find(
      (c) => c.id === 'settings.theme.dark',
    )!
    expect(lightChild.description).toBe('currently selected')
    expect(darkChild.description).toBeUndefined()
  })

  it('background drill places None first, then registry entries, and calls setAppBackground', async () => {
    const commands = useSettingsCommands().value
    const bg = commands.find((c) => c.id === 'settings.background')!
    const children = bg.children!.commands
    expect(children[0].id).toBe('settings.background.none')
    expect(children.slice(1).map((c) => c.id)).toEqual([
      'settings.background.northernlights',
      'settings.background.tracks',
    ])

    await children.find((c) => c.id === 'settings.background.none')!.run()
    expect(mocks.setAppBackgroundMock).toHaveBeenCalledWith('throttle', 'none')

    await children
      .find((c) => c.id === 'settings.background.northernlights')!
      .run()
    expect(mocks.setAppBackgroundMock).toHaveBeenCalledWith(
      'throttle',
      'northernlights',
    )

    await children.find((c) => c.id === 'settings.background.tracks')!.run()
    expect(mocks.setAppBackgroundMock).toHaveBeenCalledWith('throttle', 'tracks')
  })

  it('marks the currently-selected background with a description', () => {
    mocks.currentBackgroundRef.value = 'tracks'
    const commands = useSettingsCommands().value
    const bg = commands.find((c) => c.id === 'settings.background')!
    const tracksChild = bg.children!.commands.find(
      (c) => c.id === 'settings.background.tracks',
    )!
    const noneChild = bg.children!.commands.find(
      (c) => c.id === 'settings.background.none',
    )!
    expect(tracksChild.description).toBe('currently selected')
    expect(noneChild.description).toBeUndefined()
  })

  it('Open Settings command pushes { name: "settings" }', async () => {
    const commands = useSettingsCommands().value
    const open = commands.find((c) => c.id === 'settings.open-page')!
    await open.run()
    expect(mocks.pushMock).toHaveBeenCalledWith({ name: 'settings' })
  })

  it('throttle-variant drill children call setVariant with each value', async () => {
    mocks.routeName.value = 'throttle'
    const commands = useSettingsCommands().value
    const variant = commands.find(
      (c) => c.id === 'settings.throttle.variant',
    )!
    expect(variant.children).toBeDefined()
    const children = variant.children!.commands
    expect(children.map((c) => c.id)).toEqual([
      'settings.throttle.variant.buttons',
      'settings.throttle.variant.slider',
      'settings.throttle.variant.dashboard',
    ])

    await children
      .find((c) => c.id === 'settings.throttle.variant.slider')!
      .run()
    expect(mocks.setThrottleVariantMock).toHaveBeenCalledWith('slider')

    await children
      .find((c) => c.id === 'settings.throttle.variant.dashboard')!
      .run()
    expect(mocks.setThrottleVariantMock).toHaveBeenCalledWith('dashboard')
  })

  it('throttle toggle commands flip their underlying ref via the setters', async () => {
    mocks.routeName.value = 'throttle'
    mocks.showFunctionsRef.value = true
    mocks.showSpeedometerRef.value = false
    mocks.showConsistRef.value = true

    const commands = useSettingsCommands().value

    const functionsCmd = commands.find(
      (c) => c.id === 'settings.toggle.functions',
    )!
    await functionsCmd.run()
    expect(mocks.setShowFunctionsMock).toHaveBeenCalledWith(false)

    const speedometerCmd = commands.find(
      (c) => c.id === 'settings.toggle.speedometer',
    )!
    await speedometerCmd.run()
    expect(mocks.setShowSpeedometerMock).toHaveBeenCalledWith(true)

    const consistCmd = commands.find(
      (c) => c.id === 'settings.toggle.consist',
    )!
    await consistCmd.run()
    expect(mocks.setShowConsistMock).toHaveBeenCalledWith(false)
  })

  it('quickMenu toggle command flips quickMenuVisible directly', async () => {
    mocks.routeName.value = 'throttle'
    mocks.quickMenuVisibleRef.value = true
    const commands = useSettingsCommands().value
    const qm = commands.find((c) => c.id === 'settings.toggle.quickMenu')!
    await qm.run()
    expect(mocks.quickMenuVisibleRef.value).toBe(false)

    // flipping again restores it
    await qm.run()
    expect(mocks.quickMenuVisibleRef.value).toBe(true)
  })

  it('conductor right-panel drill children call setRightPanel with each value', async () => {
    mocks.routeName.value = 'conductor'
    const commands = useSettingsCommands().value
    const rightPanel = commands.find(
      (c) => c.id === 'settings.conductor.rightPanel',
    )!
    const children = rightPanel.children!.commands
    expect(children.map((c) => c.id)).toEqual([
      'settings.conductor.rightPanel.turnouts',
      'settings.conductor.rightPanel.effects',
      'settings.conductor.rightPanel.signals',
      'settings.conductor.rightPanel.devices',
      'settings.conductor.rightPanel.routes',
    ])

    await children
      .find((c) => c.id === 'settings.conductor.rightPanel.effects')!
      .run()
    expect(mocks.setConductorRightPanelMock).toHaveBeenCalledWith('effects')

    await children
      .find((c) => c.id === 'settings.conductor.rightPanel.devices')!
      .run()
    expect(mocks.setConductorRightPanelMock).toHaveBeenCalledWith('devices')
  })

  it('passes the current route path into getBackground', () => {
    mocks.routePath.value = '/turnouts'
    const commands = useSettingsCommands().value
    expect(commands.length).toBeGreaterThan(0)
    expect(mocks.getBackgroundMock).toHaveBeenCalledWith('throttle', '/turnouts')
  })
})
