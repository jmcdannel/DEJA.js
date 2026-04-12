import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Signal } from '@repo/modules/signals'
import { useSignalCommands, useSignalBrowseCommand } from './signals'

const setSignalAspectMock = vi.fn(async () => {})
const signalsRef = ref<Signal[]>([])

vi.mock('@repo/modules/signals', () => ({
  useSignals: () => ({
    getSignals: () => signalsRef,
    setSignalAspect: setSignalAspectMock,
  }),
}))

// Shared mocks for useBrowseGroups.
const devicesRef = ref<Array<{ id: string; name?: string }>>([
  { id: 'pico-1', name: 'Pico One' },
])
const turnoutsRef = ref<unknown[]>([])
const effectsRef = ref<unknown[]>([])
const locosRef = ref<unknown[]>([])
const throttlesRef = ref<Array<{ address: number }>>([])

vi.mock('@repo/modules', () => ({
  useSignals: () => ({
    getSignals: () => signalsRef,
    setSignalAspect: setSignalAspectMock,
  }),
  useTurnouts: () => ({ getTurnouts: () => turnoutsRef }),
  useEfx: () => ({ getEffects: () => effectsRef }),
  useLocos: () => ({
    getLocos: () => locosRef,
    getThrottles: () => throttlesRef,
  }),
  useLayout: () => ({ getDevices: () => devicesRef }),
}))

describe('useSignalCommands', () => {
  beforeEach(() => {
    setSignalAspectMock.mockClear()
    signalsRef.value = []
  })

  it('produces one command per signal with 4 inline aspect actions', () => {
    signalsRef.value = [
      { id: 's1', name: 'Block West', device: 'pico-1', aspect: 'red' } as Signal,
      { id: 's2', name: 'Block East', device: 'pico-1', aspect: 'green' } as Signal,
    ]
    const commands = useSignalCommands().value
    expect(commands).toHaveLength(2)
    expect(commands[0].title).toBe('Block West')
    expect(commands[0].description).toBe('currently red')
    expect(commands[0].actions).toBeDefined()
    expect(commands[0].actions!.map((a) => a.label)).toEqual(['R', 'Y', 'G', '○'])
    expect(commands[0].keepOpen).toBe(true)
  })

  it('each inline action calls setSignalAspect with the correct value', async () => {
    signalsRef.value = [{ id: 's1', name: 'Block West' } as Signal]
    const cmd = useSignalCommands().value[0]
    const actions = cmd.actions!

    await actions[0].run() // R
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'red')

    await actions[1].run() // Y
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'yellow')

    await actions[2].run() // G
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'green')

    await actions[3].run() // clear
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', null)
  })

  it('top-level signal command run is a no-op', async () => {
    signalsRef.value = [{ id: 's1', name: 'Block West' } as Signal]
    const cmd = useSignalCommands().value[0]
    await cmd.run()
    expect(setSignalAspectMock).not.toHaveBeenCalled()
  })

  it('has no children — interaction is via inline actions', () => {
    signalsRef.value = [{ id: 's1', name: 'Block West' } as Signal]
    const cmd = useSignalCommands().value[0]
    expect(cmd.children).toBeUndefined()
  })

  it('falls back to id when name missing', () => {
    signalsRef.value = [{ id: 's99' } as Signal]
    const cmd = useSignalCommands().value[0]
    expect(cmd.title).toBe('s99')
  })

  it('keywords include name, id, device, and tags', () => {
    signalsRef.value = [{ id: 's1', name: 'Block West', device: 'pico-1', tags: ['main'] } as Signal]
    const cmd = useSignalCommands().value[0]
    expect(cmd.keywords).toEqual(['Block West', 's1', 'pico-1', 'main'])
  })
})

describe('useSignalBrowseCommand', () => {
  beforeEach(() => {
    setSignalAspectMock.mockClear()
    signalsRef.value = []
  })

  it('returns null when there are no signals', () => {
    signalsRef.value = []
    expect(useSignalBrowseCommand().value).toBeNull()
  })

  it('produces a Signals browse card with 3 facets (By Device / By Tag / All)', () => {
    signalsRef.value = [
      { id: 's1', name: 'West', device: 'pico-1', aspect: 'red', tags: ['main'] } as Signal,
      { id: 's2', name: 'East', device: 'pico-1', aspect: 'green' } as Signal,
    ]
    const cmd = useSignalBrowseCommand().value!
    expect(cmd.title).toBe('Signals')
    const facets = cmd.children!.commands.map((c) => c.title)
    expect(facets).toEqual(['By Device', 'By Tag', 'All'])
  })

  it('By Device resolves device labels via useLayout.getDevices', () => {
    signalsRef.value = [
      { id: 's1', name: 'A', device: 'pico-1' } as Signal,
      { id: 's2', name: 'B', device: 'pico-1' } as Signal,
    ]
    const cmd = useSignalBrowseCommand().value!
    const byDevice = cmd.children!.commands.find((c) => c.id === 'browse.signals.by-device')!
    const devGroup = byDevice.children!.commands[0]
    expect(devGroup.title).toBe('Pico One')
    expect(devGroup.children!.commands).toHaveLength(2)
  })

  it('By Tag groups signals by tag', () => {
    signalsRef.value = [
      { id: 's1', name: 'A', device: 'pico-1', tags: ['main'] } as Signal,
      { id: 's2', name: 'B', device: 'pico-1', tags: ['main', 'yard'] } as Signal,
      { id: 's3', name: 'C', device: 'pico-1', tags: ['yard'] } as Signal,
    ]
    const cmd = useSignalBrowseCommand().value!
    const byTag = cmd.children!.commands.find((c) => c.id === 'browse.signals.by-tag')!
    const titles = byTag.children!.commands.map((c) => c.title)
    expect(titles).toEqual(['main', 'yard'])
  })

  it('All leaves expose inline actions that call setSignalAspect', async () => {
    signalsRef.value = [{ id: 's1', name: 'West', device: 'pico-1' } as Signal]
    const cmd = useSignalBrowseCommand().value!
    const all = cmd.children!.commands.find((c) => c.id === 'browse.signals.all')!
    const leaf = all.children!.commands[0]
    expect(leaf.title).toBe('West')
    expect(leaf.children).toBeUndefined()
    expect(leaf.actions).toHaveLength(4)
    await leaf.actions![2].run() // G
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'green')
  })
})
