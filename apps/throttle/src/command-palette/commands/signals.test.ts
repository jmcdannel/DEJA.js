import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Signal } from '@repo/modules/signals'

const setSignalAspectMock = vi.fn(async () => {})
const signalsRef = ref<Signal[]>([])

vi.mock('@repo/modules/signals', () => ({
  useSignals: () => ({
    getSignals: () => signalsRef,
    setSignalAspect: setSignalAspectMock,
  }),
}))

import { useSignalCommands } from './signals'

describe('useSignalCommands', () => {
  beforeEach(() => {
    setSignalAspectMock.mockClear()
    signalsRef.value = []
  })

  it('produces one command per signal', () => {
    signalsRef.value = [
      { id: 's1', name: 'Block West', device: 'pico-1', aspect: 'red' } as Signal,
      { id: 's2', name: 'Block East', device: 'pico-1', aspect: 'green' } as Signal,
    ]
    const commands = useSignalCommands().value
    expect(commands).toHaveLength(2)
    expect(commands[0].title).toBe('Set Block West')
    expect(commands[0].description).toBe('currently red')
    expect(commands[1].description).toBe('currently green')
  })

  it('signal command has children with 4 aspects', () => {
    signalsRef.value = [{ id: 's1', name: 'Block West', device: 'pico-1' } as Signal]
    const cmd = useSignalCommands().value[0]
    expect(cmd.children).toBeDefined()
    expect(cmd.children!.title).toBe('Set Block West ▸ aspect')
    expect(cmd.children!.commands).toHaveLength(4)
    const titles = cmd.children!.commands.map((c) => c.title)
    expect(titles).toEqual(['Red', 'Yellow', 'Green', 'Clear'])
  })

  it('each aspect child runs setSignalAspect with correct value', async () => {
    signalsRef.value = [{ id: 's1', name: 'Block West' } as Signal]
    const cmd = useSignalCommands().value[0]
    const children = cmd.children!.commands

    await children[0].run()
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'red')

    await children[1].run()
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'yellow')

    await children[2].run()
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'green')

    await children[3].run()
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', null)
  })

  it('top-level signal command run is a no-op', async () => {
    signalsRef.value = [{ id: 's1', name: 'Block West' } as Signal]
    const cmd = useSignalCommands().value[0]
    await cmd.run()
    expect(setSignalAspectMock).not.toHaveBeenCalled()
  })

  it('falls back to id when name missing', () => {
    signalsRef.value = [{ id: 's99' } as Signal]
    const cmd = useSignalCommands().value[0]
    expect(cmd.title).toBe('Set s99')
  })

  it('keywords include name, id, and device', () => {
    signalsRef.value = [{ id: 's1', name: 'Block West', device: 'pico-1' } as Signal]
    const cmd = useSignalCommands().value[0]
    expect(cmd.keywords).toEqual(['Block West', 's1', 'pico-1'])
  })
})
