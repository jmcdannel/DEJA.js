import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Loco } from '@repo/modules/locos'
import { useLocoBrowseCommand } from './locos'

const pushMock = vi.fn()
const acquireThrottleMock = vi.fn(async () => {})

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const locosRef = ref<Loco[]>([])
const throttlesRef = ref<Array<{ address: number }>>([])

vi.mock('@repo/modules/locos', () => ({
  useLocos: () => ({
    getLocos: () => locosRef,
    getThrottles: () => throttlesRef,
    acquireThrottle: acquireThrottleMock,
  }),
}))

// useBrowseGroups dependencies
const devicesRef = ref<Array<{ id: string; name?: string }>>([])
const effectsRef = ref<unknown[]>([])
const turnoutsRef = ref<unknown[]>([])
const signalsRef = ref<unknown[]>([])

vi.mock('@repo/modules', () => ({
  useLocos: () => ({
    getLocos: () => locosRef,
    getThrottles: () => throttlesRef,
    acquireThrottle: acquireThrottleMock,
  }),
  useEfx: () => ({ getEffects: () => effectsRef }),
  useTurnouts: () => ({ getTurnouts: () => turnoutsRef }),
  useSignals: () => ({ getSignals: () => signalsRef }),
  useLayout: () => ({ getDevices: () => devicesRef }),
}))

describe('useLocoBrowseCommand', () => {
  beforeEach(() => {
    pushMock.mockClear()
    acquireThrottleMock.mockClear()
    locosRef.value = []
    throttlesRef.value = []
  })

  it('returns null when there are no locos', () => {
    locosRef.value = []
    expect(useLocoBrowseCommand().value).toBeNull()
  })

  it('produces a Locos browse card with 3 facet children', () => {
    locosRef.value = [
      { id: '3', address: 3, name: 'BNSF 3', meta: { roadname: 'BNSF' } } as Loco,
      { id: '7', address: 7, name: 'Cuyama', meta: { roadname: 'Cuyama' } } as Loco,
    ]
    const cmd = useLocoBrowseCommand().value!
    expect(cmd).not.toBeNull()
    expect(cmd.title).toBe('Locos')
    const facets = cmd.children!.commands.map((c) => c.title)
    expect(facets).toEqual(['By Roadname', 'Active', 'View All'])
  })

  it('By Roadname groups by meta.roadname', () => {
    locosRef.value = [
      { id: '3', address: 3, name: 'A', meta: { roadname: 'BNSF' } } as Loco,
      { id: '4', address: 4, name: 'B', meta: { roadname: 'BNSF' } } as Loco,
      { id: '7', address: 7, name: 'C', meta: { roadname: 'UP' } } as Loco,
    ]
    const cmd = useLocoBrowseCommand().value!
    const byRoad = cmd.children!.commands.find((c) => c.id === 'browse.locos.by-roadname')!
    const groupTitles = byRoad.children!.commands.map((c) => c.title)
    expect(groupTitles).toEqual(['BNSF', 'UP'])
    const bnsf = byRoad.children!.commands.find((c) => c.id === 'browse.locos.by-roadname.BNSF')!
    expect(bnsf.children!.commands).toHaveLength(2)
  })

  it('Active subset only includes locos with an active throttle', () => {
    locosRef.value = [
      { id: '3', address: 3, name: 'A' } as Loco,
      { id: '7', address: 7, name: 'B' } as Loco,
    ]
    throttlesRef.value = [{ address: 7 }]
    const cmd = useLocoBrowseCommand().value!
    const active = cmd.children!.commands.find((c) => c.id === 'browse.locos.active')!
    expect(active.children!.commands).toHaveLength(1)
    expect(active.children!.commands[0].title).toBe('B')
  })

  it('View All leaf acquires throttle and navigates on run', async () => {
    locosRef.value = [{ id: '42', address: 42, name: 'Freight' } as Loco]
    const cmd = useLocoBrowseCommand().value!
    const all = cmd.children!.commands.find((c) => c.id === 'browse.locos.all')!
    const leaf = all.children!.commands[0]
    await leaf.run()
    expect(acquireThrottleMock).toHaveBeenCalledWith(42)
    expect(pushMock).toHaveBeenCalledWith({ name: 'throttle', params: { address: 42 } })
  })

  it('leaf commands fall back to `Loco <address>` when name missing', () => {
    locosRef.value = [{ id: '9', address: 9 } as Loco]
    const cmd = useLocoBrowseCommand().value!
    const all = cmd.children!.commands.find((c) => c.id === 'browse.locos.all')!
    expect(all.children!.commands[0].title).toBe('Loco 9')
  })
})
