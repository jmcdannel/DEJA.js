import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Effect } from '@repo/modules/effects'
import { useEffectCommands, useEffectBrowseCommand } from './effects'

const runEffectMock = vi.fn(async () => {})
const effectsRef = ref<Effect[]>([])

vi.mock('@repo/modules/effects', () => ({
  useEfx: () => ({
    getEffects: () => effectsRef,
    runEffect: runEffectMock,
  }),
}))

// Shared mocks for useBrowseGroups (pulls from @repo/modules aggregate).
const devicesRef = ref<Array<{ id: string; name?: string }>>([
  { id: 'pico-1', name: 'Pico One' },
])
const turnoutsRef = ref<unknown[]>([])
const signalsRef = ref<unknown[]>([])
const locosRef = ref<unknown[]>([])
const throttlesRef = ref<Array<{ address: number }>>([])

vi.mock('@repo/modules', () => ({
  useEfx: () => ({
    getEffects: () => effectsRef,
    runEffect: runEffectMock,
  }),
  useTurnouts: () => ({ getTurnouts: () => turnoutsRef }),
  useSignals: () => ({ getSignals: () => signalsRef }),
  useLocos: () => ({
    getLocos: () => locosRef,
    getThrottles: () => throttlesRef,
  }),
  useLayout: () => ({ getDevices: () => devicesRef }),
}))

describe('useEffectCommands', () => {
  beforeEach(() => {
    runEffectMock.mockClear()
    effectsRef.value = []
  })

  it('produces one toggle command per effect with keepOpen', () => {
    effectsRef.value = [
      { id: 'e1', name: 'Flicker Campfire', type: 'strobe', device: 'pico-1', state: false } as Effect,
      { id: 'e2', name: 'Station Lights',   type: 'onoff',  device: 'pico-1', state: true  } as Effect,
    ]
    const commands = useEffectCommands().value
    expect(commands).toHaveLength(2)
    expect(commands[0].title).toBe('Turn on Flicker Campfire')
    expect(commands[0].keepOpen).toBe(true)
    expect(commands[1].title).toBe('Turn off Station Lights')
  })

  it('falls back to id when name is missing', () => {
    effectsRef.value = [{ id: 'e99', type: 'onoff', state: false } as Effect]
    const cmd = useEffectCommands().value[0]
    expect(cmd.title).toBe('Turn on e99')
  })

  it('running an effect command calls runEffect with flipped state', async () => {
    effectsRef.value = [{
      id: 'e1',
      name: 'Flicker',
      type: 'strobe',
      device: 'pico-1',
      state: false,
    } as Effect]
    const cmd = useEffectCommands().value[0]
    await cmd.run()
    expect(runEffectMock).toHaveBeenCalledTimes(1)
    const arg = (runEffectMock.mock.calls[0] as unknown as [Effect])[0]
    expect(arg.id).toBe('e1')
    expect(arg.state).toBe(true)
  })

  it('running a turned-on effect command flips it off', async () => {
    effectsRef.value = [{
      id: 'e1',
      name: 'Flicker',
      type: 'strobe',
      device: 'pico-1',
      state: true,
    } as Effect]
    const cmd = useEffectCommands().value[0]
    await cmd.run()
    const arg = (runEffectMock.mock.calls[0] as unknown as [Effect])[0]
    expect(arg.state).toBe(false)
  })

  it('keywords include name, id, type, device, and tags', () => {
    effectsRef.value = [{
      id: 'e1',
      name: 'Horn',
      type: 'sound',
      device: 'pico-1',
      state: false,
      tags: ['loud', 'train'],
    } as Effect]
    const cmd = useEffectCommands().value[0]
    expect(cmd.keywords).toEqual(['Horn', 'e1', 'sound', 'pico-1', 'loud', 'train'])
  })

  it('returns empty array when no effects', () => {
    expect(useEffectCommands().value).toEqual([])
  })
})

describe('useEffectBrowseCommand', () => {
  beforeEach(() => {
    runEffectMock.mockClear()
    effectsRef.value = []
  })

  it('returns null when there are no effects', () => {
    effectsRef.value = []
    expect(useEffectBrowseCommand().value).toBeNull()
  })

  it('produces a single Effects browse card with 4 facet children', () => {
    effectsRef.value = [
      { id: 'e1', name: 'Horn',    type: 'sound',  device: 'pico-1', state: false, tags: ['loud'] } as Effect,
      { id: 'e2', name: 'Lights',  type: 'onoff',  device: 'pico-1', state: true } as Effect,
    ]
    const cmd = useEffectBrowseCommand().value!
    expect(cmd.title).toBe('Effects')
    const facets = cmd.children!.commands.map((c) => c.title)
    expect(facets).toEqual(['By Device', 'By Type', 'By Tag', 'View All'])
  })

  it('By Type groups by e.type and leaf toggles state with keepOpen', async () => {
    effectsRef.value = [
      { id: 'e1', name: 'Horn',    type: 'sound', device: 'pico-1', state: false } as Effect,
      { id: 'e2', name: 'Whistle', type: 'sound', device: 'pico-1', state: false } as Effect,
      { id: 'e3', name: 'Lamps',   type: 'onoff', device: 'pico-1', state: true  } as Effect,
    ]
    const cmd = useEffectBrowseCommand().value!
    const byType = cmd.children!.commands.find((c) => c.id === 'browse.effects.by-type')!
    const groupTitles = byType.children!.commands.map((c) => c.title)
    expect(groupTitles).toEqual(['onoff', 'sound'])
    const soundGroup = byType.children!.commands.find((c) => c.id === 'browse.effects.by-type.sound')!
    expect(soundGroup.children!.commands).toHaveLength(2)
    const leaf = soundGroup.children!.commands[0]
    expect(leaf.keepOpen).toBe(true)
    await leaf.run()
    expect(runEffectMock).toHaveBeenCalledTimes(1)
    const arg = (runEffectMock.mock.calls[0] as unknown as [Effect])[0]
    expect(arg.state).toBe(true) // flipped from false
  })

  it('View All lists every effect', () => {
    effectsRef.value = [
      { id: 'e1', name: 'Horn',   type: 'sound', state: false } as Effect,
      { id: 'e2', name: 'Lights', type: 'onoff', state: true  } as Effect,
    ]
    const cmd = useEffectBrowseCommand().value!
    const all = cmd.children!.commands.find((c) => c.id === 'browse.effects.all')!
    expect(all.children!.commands).toHaveLength(2)
  })
})
