import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Turnout } from '@repo/modules/turnouts'
import { useTurnoutCommands, useTurnoutBrowseCommand } from './turnouts'

const setTurnoutMock = vi.fn(async () => true)
const turnoutsRef = ref<Turnout[]>([])

vi.mock('@repo/modules/turnouts', () => ({
  useTurnouts: () => ({
    getTurnouts: () => turnoutsRef,
    setTurnout: setTurnoutMock,
  }),
}))

// useBrowseGroups pulls from @repo/modules — mock the bits it needs.
const devicesRef = ref<Array<{ id: string; name?: string }>>([
  { id: 'dccex-1', name: 'Main Command Station' },
])
const effectsRef = ref<unknown[]>([])
const signalsRef = ref<unknown[]>([])
const locosRef = ref<unknown[]>([])
const throttlesRef = ref<Array<{ address: number }>>([])

vi.mock('@repo/modules', () => ({
  useTurnouts: () => ({
    getTurnouts: () => turnoutsRef,
    setTurnout: setTurnoutMock,
  }),
  useEfx: () => ({ getEffects: () => effectsRef }),
  useSignals: () => ({ getSignals: () => signalsRef }),
  useLocos: () => ({
    getLocos: () => locosRef,
    getThrottles: () => throttlesRef,
  }),
  useLayout: () => ({ getDevices: () => devicesRef }),
}))

describe('useTurnoutCommands', () => {
  beforeEach(() => {
    setTurnoutMock.mockClear()
    turnoutsRef.value = []
  })

  it('produces a single toggle command per turnout', () => {
    turnoutsRef.value = [
      { id: 't1', name: 'Main Yard',   device: 'dccex-1', state: false, type: 'kato' } as Turnout,
      { id: 't2', name: 'East Siding', device: 'dccex-1', state: true,  type: 'kato' } as Turnout,
    ]
    const commands = useTurnoutCommands().value
    expect(commands).toHaveLength(2)
    // Titles reflect the next action (live state).
    expect(commands.find((c) => c.id === 'turnout.toggle.t1')!.title).toBe('Throw Main Yard')
    expect(commands.find((c) => c.id === 'turnout.toggle.t2')!.title).toBe('Close East Siding')
  })

  it('toggle command sets keepOpen and flips state on run', async () => {
    turnoutsRef.value = [
      { id: 't1', name: 'Main Yard', device: 'dccex-1', state: false, type: 'kato' } as Turnout,
    ]
    const cmd = useTurnoutCommands().value[0]
    expect(cmd.keepOpen).toBe(true)
    await cmd.run()
    expect(setTurnoutMock).toHaveBeenCalledWith('t1', { state: true })
  })

  it('toggle command from a thrown turnout flips to closed', async () => {
    turnoutsRef.value = [
      { id: 't1', name: 'Main Yard', device: 'dccex-1', state: true, type: 'kato' } as Turnout,
    ]
    const cmd = useTurnoutCommands().value[0]
    await cmd.run()
    expect(setTurnoutMock).toHaveBeenCalledWith('t1', { state: false })
  })

  it('falls back to id when name is missing', () => {
    turnoutsRef.value = [{ id: 't99', device: 'dccex-1', state: false, type: 'kato' } as unknown as Turnout]
    const cmd = useTurnoutCommands().value[0]
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
    const cmd = useTurnoutCommands().value[0]
    expect(cmd.keywords).toEqual(['Main Yard', 't1', 'dccex-1', 'yard', 'main'])
  })

  it('returns empty array when no turnouts', () => {
    turnoutsRef.value = []
    expect(useTurnoutCommands().value).toEqual([])
  })
})

describe('useTurnoutBrowseCommand', () => {
  beforeEach(() => {
    setTurnoutMock.mockClear()
    turnoutsRef.value = []
  })

  it('returns null when there are no turnouts', () => {
    turnoutsRef.value = []
    expect(useTurnoutBrowseCommand().value).toBeNull()
  })

  it('produces a single Turnouts browse card with 4 facet children', () => {
    turnoutsRef.value = [
      { id: 't1', name: 'Main Yard',   device: 'dccex-1', state: false, type: 'kato',   tags: ['yard'] } as Turnout,
      { id: 't2', name: 'East Siding', device: 'dccex-1', state: true,  type: 'kato',   tags: ['main'] } as Turnout,
      { id: 't3', name: 'Servo One',   device: 'pico-1',  state: false, type: 'servo' } as Turnout,
    ]
    const cmd = useTurnoutBrowseCommand().value!
    expect(cmd).not.toBeNull()
    expect(cmd.title).toBe('Turnouts')
    expect(cmd.children).toBeDefined()
    const facetTitles = cmd.children!.commands.map((c) => c.title)
    expect(facetTitles).toEqual(['By Device', 'By Tag', 'Labels', 'View All'])
  })

  it('By Device resolves device labels via useLayout.getDevices', () => {
    turnoutsRef.value = [
      { id: 't1', name: 'A', device: 'dccex-1', state: false, type: 'kato' } as Turnout,
      { id: 't2', name: 'B', device: 'dccex-1', state: false, type: 'kato' } as Turnout,
    ]
    const cmd = useTurnoutBrowseCommand().value!
    const byDevice = cmd.children!.commands.find((c) => c.id === 'browse.turnouts.by-device')!
    const devGroup = byDevice.children!.commands[0]
    expect(devGroup.title).toBe('Main Command Station')
    // leaf level has one toggle per turnout
    expect(devGroup.children!.commands).toHaveLength(2)
  })

  it('View All leaf toggles turnout state on run and sets keepOpen', async () => {
    turnoutsRef.value = [
      { id: 't1', name: 'Main', device: 'dccex-1', state: false, type: 'kato' } as Turnout,
    ]
    const cmd = useTurnoutBrowseCommand().value!
    const viewAll = cmd.children!.commands.find((c) => c.id === 'browse.turnouts.all')!
    const leaf = viewAll.children!.commands[0]
    expect(leaf.keepOpen).toBe(true)
    expect(leaf.title).toBe('Throw Main')
    await leaf.run()
    expect(setTurnoutMock).toHaveBeenCalledWith('t1', { state: true })
  })

  it('By Tag lists groups for each tag', () => {
    turnoutsRef.value = [
      { id: 't1', name: 'A', device: 'dccex-1', state: false, type: 'kato', tags: ['yard'] } as Turnout,
      { id: 't2', name: 'B', device: 'dccex-1', state: false, type: 'kato', tags: ['yard', 'main'] } as Turnout,
    ]
    const cmd = useTurnoutBrowseCommand().value!
    const byTag = cmd.children!.commands.find((c) => c.id === 'browse.turnouts.by-tag')!
    const titles = byTag.children!.commands.map((c) => c.title)
    expect(titles).toEqual(['main', 'yard'])
  })
})
