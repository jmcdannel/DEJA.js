import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Effect } from '@repo/modules/effects'

const runEffectMock = vi.fn(async () => {})
const effectsRef = ref<Effect[]>([])

vi.mock('@repo/modules/effects', () => ({
  useEfx: () => ({
    getEffects: () => effectsRef,
    runEffect: runEffectMock,
  }),
}))

import { useEffectCommands } from './effects'

describe('useEffectCommands', () => {
  beforeEach(() => {
    runEffectMock.mockClear()
    effectsRef.value = []
  })

  it('produces one command per effect', () => {
    effectsRef.value = [
      { id: 'e1', name: 'Flicker Campfire', type: 'strobe', device: 'pico-1', state: false } as Effect,
      { id: 'e2', name: 'Station Lights',   type: 'onoff',  device: 'pico-1', state: true  } as Effect,
    ]
    const commands = useEffectCommands().value
    expect(commands).toHaveLength(2)
    expect(commands[0].title).toBe('Toggle Flicker Campfire')
    expect(commands[0].description).toBe('strobe · pico-1')
    expect(commands[1].title).toBe('Toggle Station Lights')
  })

  it('falls back to id when name is missing', () => {
    effectsRef.value = [{ id: 'e99', type: 'onoff', state: false } as Effect]
    const cmd = useEffectCommands().value[0]
    expect(cmd.title).toBe('Toggle e99')
  })

  it('handles missing device', () => {
    effectsRef.value = [{ id: 'e1', name: 'Horn', type: 'sound', state: false } as Effect]
    const cmd = useEffectCommands().value[0]
    expect(cmd.description).toBe('sound')
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
