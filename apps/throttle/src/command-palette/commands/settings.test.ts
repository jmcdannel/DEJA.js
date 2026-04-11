import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

const variantRef = ref<'buttons' | 'slider' | 'dashboard'>('buttons')
const showFunctionsRef = ref(true)
const showSpeedometerRef = ref(true)
const showConsistRef = ref(true)
const setVariantMock = vi.fn(async () => {})
const setShowFunctionsMock = vi.fn(async () => {})
const setShowSpeedometerMock = vi.fn(async () => {})
const setShowConsistMock = vi.fn(async () => {})
const pushMock = vi.fn()

vi.mock('@/throttle/useThrottleSettings', () => ({
  useThrottleSettings: () => ({
    variant: variantRef,
    showFunctions: showFunctionsRef,
    showSpeedometer: showSpeedometerRef,
    showConsist: showConsistRef,
    setVariant: setVariantMock,
    setShowFunctions: setShowFunctionsMock,
    setShowSpeedometer: setShowSpeedometerMock,
    setShowConsist: setShowConsistMock,
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

import { useSettingsCommands } from './settings'

describe('useSettingsCommands', () => {
  beforeEach(() => {
    variantRef.value = 'buttons'
    showFunctionsRef.value = true
    showSpeedometerRef.value = true
    showConsistRef.value = true
    setVariantMock.mockClear()
    setShowFunctionsMock.mockClear()
    setShowSpeedometerMock.mockClear()
    setShowConsistMock.mockClear()
    pushMock.mockClear()
  })

  it('produces 7 commands', () => {
    const commands = useSettingsCommands().value
    expect(commands).toHaveLength(7)
    const ids = commands.map((c) => c.id)
    expect(ids).toContain('settings.variant.buttons')
    expect(ids).toContain('settings.variant.slider')
    expect(ids).toContain('settings.variant.dashboard')
    expect(ids).toContain('settings.toggle.functions')
    expect(ids).toContain('settings.toggle.speedometer')
    expect(ids).toContain('settings.toggle.consist')
    expect(ids).toContain('settings.open-page')
  })

  it('variant commands call setVariant with the right value when run', async () => {
    const commands = useSettingsCommands().value

    const buttonsCmd = commands.find((c) => c.id === 'settings.variant.buttons')!
    await buttonsCmd.run()
    expect(setVariantMock).toHaveBeenCalledWith('buttons')

    setVariantMock.mockClear()
    const sliderCmd = commands.find((c) => c.id === 'settings.variant.slider')!
    await sliderCmd.run()
    expect(setVariantMock).toHaveBeenCalledWith('slider')

    setVariantMock.mockClear()
    const dashboardCmd = commands.find((c) => c.id === 'settings.variant.dashboard')!
    await dashboardCmd.run()
    expect(setVariantMock).toHaveBeenCalledWith('dashboard')
  })

  it('toggle commands flip the corresponding setting', async () => {
    showFunctionsRef.value = false
    const commands = useSettingsCommands().value

    const toggleCmd = commands.find((c) => c.id === 'settings.toggle.functions')!
    await toggleCmd.run()
    expect(setShowFunctionsMock).toHaveBeenCalledWith(true)
  })

  it('open-page command pushes the settings route', async () => {
    const commands = useSettingsCommands().value
    const openPageCmd = commands.find((c) => c.id === 'settings.open-page')!
    await openPageCmd.run()
    expect(pushMock).toHaveBeenCalledWith({ name: 'settings' })
  })
})
