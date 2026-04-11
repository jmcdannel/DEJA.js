import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref } from 'vue'

const adjustSpeedMock = vi.fn()
const setSpeedMock = vi.fn()
const stopMock = vi.fn()
const currentSpeedRef = ref(0)
const directionRef = ref(true)
const locoRef = ref<{ name?: string } | undefined>({ name: 'Test Loco' })

vi.mock('@/throttle/useThrottle', () => ({
  useThrottle: () => ({
    currentSpeed: currentSpeedRef,
    direction: directionRef,
    loco: locoRef,
    adjustSpeed: adjustSpeedMock,
    setSpeed: setSpeedMock,
    stop: stopMock,
  }),
}))

import MiniThrottleInPalette from './MiniThrottleInPalette.vue'

const vuetify = createVuetify({ components, directives })

function makeWrapper() {
  return mount(MiniThrottleInPalette, {
    props: { address: 42 },
    global: { plugins: [vuetify] },
  })
}

function dispatchKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

describe('MiniThrottleInPalette', () => {
  beforeEach(() => {
    adjustSpeedMock.mockClear()
    setSpeedMock.mockClear()
    stopMock.mockClear()
    currentSpeedRef.value = 0
    directionRef.value = true
  })

  it('W key adjusts speed up by 5', () => {
    const w = makeWrapper()
    dispatchKey('w')
    expect(adjustSpeedMock).toHaveBeenCalledWith(5)
    w.unmount()
  })

  it('S key adjusts speed down by 5', () => {
    const w = makeWrapper()
    dispatchKey('s')
    expect(adjustSpeedMock).toHaveBeenCalledWith(-5)
    w.unmount()
  })

  it('X key calls stop', () => {
    const w = makeWrapper()
    dispatchKey('x')
    expect(stopMock).toHaveBeenCalledTimes(1)
    w.unmount()
  })

  it('A key calls setSpeed with negative absolute speed', () => {
    currentSpeedRef.value = 30
    const w = makeWrapper()
    dispatchKey('a')
    expect(setSpeedMock).toHaveBeenCalledWith(-30)
    w.unmount()
  })

  it('D key calls setSpeed with positive absolute speed', () => {
    currentSpeedRef.value = -30
    const w = makeWrapper()
    dispatchKey('d')
    expect(setSpeedMock).toHaveBeenCalledWith(30)
    w.unmount()
  })

  it('unrecognized keys do nothing', () => {
    const w = makeWrapper()
    dispatchKey('z')
    expect(adjustSpeedMock).not.toHaveBeenCalled()
    expect(setSpeedMock).not.toHaveBeenCalled()
    expect(stopMock).not.toHaveBeenCalled()
    w.unmount()
  })

  it('case-insensitive (uppercase W works)', () => {
    const w = makeWrapper()
    dispatchKey('W')
    expect(adjustSpeedMock).toHaveBeenCalledWith(5)
    w.unmount()
  })

  it('keyboard listener removed on unmount', () => {
    const w = makeWrapper()
    w.unmount()
    dispatchKey('w')
    expect(adjustSpeedMock).not.toHaveBeenCalled()
  })

  it('displays loco name in header', () => {
    const w = makeWrapper()
    expect(w.text()).toContain('Test Loco')
    w.unmount()
  })

  it('falls back to "Loco <address>" when loco is undefined', () => {
    locoRef.value = undefined
    const w = makeWrapper()
    expect(w.text()).toContain('Loco 42')
    w.unmount()
    locoRef.value = { name: 'Test Loco' }
  })
})
