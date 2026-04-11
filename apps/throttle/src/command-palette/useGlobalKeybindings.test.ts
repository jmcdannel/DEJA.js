import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

const pushMock = vi.fn()
const paletteOpenMock = vi.fn()
const paletteCloseMock = vi.fn()
const palettePopMock = vi.fn()
const paletteIsOpen = { value: false }
const paletteStack = { value: [] as unknown[] }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('./useCommandPalette', () => ({
  useCommandPalette: () => ({
    isOpen: paletteIsOpen,
    stack: paletteStack,
    open: paletteOpenMock,
    close: paletteCloseMock,
    pop: palettePopMock,
  }),
}))

import { useGlobalKeybindings, chordKey } from './useGlobalKeybindings'

const Host = defineComponent({
  setup() {
    useGlobalKeybindings()
    return () => null
  },
})

function dispatchKey(
  key: string,
  mods: { meta?: boolean; ctrl?: boolean; alt?: boolean; shift?: boolean } = {},
  target?: EventTarget,
) {
  const ev = new KeyboardEvent('keydown', {
    key,
    metaKey: !!mods.meta,
    ctrlKey: !!mods.ctrl,
    altKey: !!mods.alt,
    shiftKey: !!mods.shift,
    bubbles: true,
    cancelable: true,
  })
  if (target) {
    Object.defineProperty(ev, 'target', { value: target, enumerable: true })
    target.dispatchEvent(ev)
  } else {
    window.dispatchEvent(ev)
  }
  return ev
}

describe('useGlobalKeybindings', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    vi.useFakeTimers()
    pushMock.mockClear()
    paletteOpenMock.mockClear()
    paletteCloseMock.mockClear()
    palettePopMock.mockClear()
    paletteIsOpen.value = false
    paletteStack.value = []
    chordKey.value = null
    wrapper = mount(Host)
  })

  afterEach(() => {
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('⌘K opens the palette', () => {
    dispatchKey('k', { meta: true })
    expect(paletteOpenMock).toHaveBeenCalledTimes(1)
  })

  it('Ctrl+K opens the palette', () => {
    dispatchKey('k', { ctrl: true })
    expect(paletteOpenMock).toHaveBeenCalledTimes(1)
  })

  it('⌘K fires even when focus is on an input', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    dispatchKey('k', { meta: true }, input)
    expect(paletteOpenMock).toHaveBeenCalledTimes(1)
    document.body.removeChild(input)
  })

  it('Esc closes the palette when at root level', () => {
    paletteIsOpen.value = true
    paletteStack.value = []
    dispatchKey('Escape')
    expect(paletteCloseMock).toHaveBeenCalledTimes(1)
    expect(palettePopMock).not.toHaveBeenCalled()
  })

  it('Esc pops the stack when non-empty', () => {
    paletteIsOpen.value = true
    paletteStack.value = [{ title: 'aspect', commands: [] }]
    dispatchKey('Escape')
    expect(palettePopMock).toHaveBeenCalledTimes(1)
    expect(paletteCloseMock).not.toHaveBeenCalled()
  })

  it('Esc does nothing when palette is closed', () => {
    paletteIsOpen.value = false
    dispatchKey('Escape')
    expect(paletteCloseMock).not.toHaveBeenCalled()
    expect(palettePopMock).not.toHaveBeenCalled()
  })

  it('g r navigates to roster', async () => {
    dispatchKey('g')
    expect(chordKey.value).toBe('g')
    dispatchKey('r')
    expect(pushMock).toHaveBeenCalledWith({ name: 'roster' })
    expect(chordKey.value).toBeNull()
  })

  it('g t navigates to throttles', () => {
    dispatchKey('g')
    dispatchKey('t')
    expect(pushMock).toHaveBeenCalledWith({ name: 'throttles' })
  })

  it('g c navigates to conductor', () => {
    dispatchKey('g')
    dispatchKey('c')
    expect(pushMock).toHaveBeenCalledWith({ name: 'conductor' })
  })

  it('g u navigates to turnouts', () => {
    dispatchKey('g')
    dispatchKey('u')
    expect(pushMock).toHaveBeenCalledWith({ name: 'turnouts' })
  })

  it('g s navigates to signals', () => {
    dispatchKey('g')
    dispatchKey('s')
    expect(pushMock).toHaveBeenCalledWith({ name: 'signals' })
  })

  it('g e navigates to effects', () => {
    dispatchKey('g')
    dispatchKey('e')
    expect(pushMock).toHaveBeenCalledWith({ name: 'effects' })
  })

  it('g , navigates to settings', () => {
    dispatchKey('g')
    dispatchKey(',')
    expect(pushMock).toHaveBeenCalledWith({ name: 'settings' })
  })

  it('g followed by invalid key clears chord without action', () => {
    dispatchKey('g')
    dispatchKey('z')
    expect(pushMock).not.toHaveBeenCalled()
    expect(chordKey.value).toBeNull()
  })

  it('g alone times out after 1000ms', () => {
    dispatchKey('g')
    expect(chordKey.value).toBe('g')
    vi.advanceTimersByTime(1000)
    expect(chordKey.value).toBeNull()
  })

  it('chord suppressed inside a focused INPUT', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    dispatchKey('g', {}, input)
    expect(chordKey.value).toBeNull()
    expect(pushMock).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('chord suppressed inside a focused TEXTAREA', () => {
    const ta = document.createElement('textarea')
    document.body.appendChild(ta)
    dispatchKey('g', {}, ta)
    expect(chordKey.value).toBeNull()
    document.body.removeChild(ta)
  })

  it('chord suppressed inside a focused SELECT', () => {
    const sel = document.createElement('select')
    document.body.appendChild(sel)
    dispatchKey('g', {}, sel)
    expect(chordKey.value).toBeNull()
    document.body.removeChild(sel)
  })

  it('modifier-held g does not start a chord', () => {
    dispatchKey('g', { alt: true })
    expect(chordKey.value).toBeNull()
  })
})
