import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Turnout } from '@repo/modules/turnouts'

const setTurnoutMock = vi.fn(async () => true)
const turnoutsRef = ref<Turnout[]>([])

vi.mock('@repo/modules/turnouts', () => ({
  useTurnouts: () => ({
    getTurnouts: () => turnoutsRef,
    setTurnout: setTurnoutMock,
  }),
}))

import { useTurnoutCommands } from './turnouts'

describe('useTurnoutCommands', () => {
  beforeEach(() => {
    setTurnoutMock.mockClear()
    turnoutsRef.value = []
  })

  it('produces two commands (throw + close) per turnout', () => {
    turnoutsRef.value = [
      { id: 't1', name: 'Main Yard', device: 'dccex-1', state: false, type: 'kato' } as Turnout,
      { id: 't2', name: 'East Siding', device: 'dccex-1', state: true,  type: 'kato' } as Turnout,
    ]
    const commands = useTurnoutCommands().value
    expect(commands).toHaveLength(4)
    const titles = commands.map((c) => c.title)
    expect(titles).toContain('Throw Main Yard')
    expect(titles).toContain('Close Main Yard')
    expect(titles).toContain('Throw East Siding')
    expect(titles).toContain('Close East Siding')
  })

  it('throw command calls setTurnout with state: true', async () => {
    turnoutsRef.value = [{ id: 't1', name: 'Main Yard', device: 'dccex-1', state: false, type: 'kato' } as Turnout]
    const cmd = useTurnoutCommands().value.find((c) => c.id === 'turnout.throw.t1')!
    await cmd.run()
    expect(setTurnoutMock).toHaveBeenCalledWith('t1', { state: true })
  })

  it('close command calls setTurnout with state: false', async () => {
    turnoutsRef.value = [{ id: 't1', name: 'Main Yard', device: 'dccex-1', state: true, type: 'kato' } as Turnout]
    const cmd = useTurnoutCommands().value.find((c) => c.id === 'turnout.close.t1')!
    await cmd.run()
    expect(setTurnoutMock).toHaveBeenCalledWith('t1', { state: false })
  })

  it('falls back to id when name is missing', () => {
    turnoutsRef.value = [{ id: 't99', device: 'dccex-1', state: false, type: 'kato' } as unknown as Turnout]
    const cmd = useTurnoutCommands().value.find((c) => c.id === 'turnout.throw.t99')!
    expect(cmd.title).toBe('Throw t99')
  })

  it('keywords include name, id, device, and tags', () => {
    turnoutsRef.value = [{
      id: 't1',
      name: 'Main Yard',
      device: 'dccex-1',
      state: false,
      type: 'kato',
      tags: ['yard', 'main'],
    } as Turnout]
    const cmd = useTurnoutCommands().value.find((c) => c.id === 'turnout.throw.t1')!
    expect(cmd.keywords).toEqual(['Main Yard', 't1', 'dccex-1', 'yard', 'main'])
  })

  it('returns empty array when no turnouts', () => {
    turnoutsRef.value = []
    expect(useTurnoutCommands().value).toEqual([])
  })
})
