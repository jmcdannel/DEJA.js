import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Loco, Throttle } from '@repo/modules/locos'

const pushMock = vi.fn()
const acquireThrottleMock = vi.fn(async () => {})
const setDocMock = vi.fn(async () => {})
const getDocMock = vi.fn(async () => ({ exists: () => false }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const locosRef = ref<Loco[]>([])
const throttlesRef = ref<Throttle[]>([])

vi.mock('@repo/modules/locos', () => ({
  useLocos: () => ({
    getLocos: () => locosRef,
    getThrottles: () => throttlesRef,
    acquireThrottle: acquireThrottleMock,
  }),
}))

vi.mock('@vueuse/core', () => ({
  useStorage: (key: string, initial: unknown) =>
    key === '@DEJA/layoutId' ? { value: 'layout-1' } : { value: initial },
}))

vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, path: string, id: string) => ({ path: `${path}/${id}` }),
  setDoc: (...args: unknown[]) => setDocMock(...(args as [])),
  getDoc: (...args: unknown[]) => getDocMock(...(args as [])),
  serverTimestamp: () => 'SERVER_TIMESTAMP',
}))

vi.mock('@repo/firebase-config', () => ({ db: { __type: 'db' } }))

import { useThrottleCommands } from './throttles'

describe('useThrottleCommands', () => {
  beforeEach(() => {
    pushMock.mockClear()
    acquireThrottleMock.mockClear()
    setDocMock.mockClear()
    locosRef.value = []
    throttlesRef.value = []
  })

  it('produces one command per roster loco', () => {
    locosRef.value = [
      { id: '3',  address: 3,  name: 'Loco 3', meta: { roadname: 'BNSF' } } as Loco,
      { id: '17', address: 17, name: 'GP38',  meta: { roadname: 'Cuyama' } } as Loco,
    ]
    const commands = useThrottleCommands().value
    const perLoco = commands.filter((c) => c.id.startsWith('throttle.loco.'))
    expect(perLoco).toHaveLength(2)
    expect(perLoco[0].title).toBe('Open throttle for Loco 3')
    expect(perLoco[0].description).toBe('#3 · BNSF')
    expect(perLoco[0].keywords).toEqual(['3', 'Loco 3', 'BNSF'])
    expect(perLoco[1].title).toBe('Open throttle for GP38')
  })

  it('always exposes a Stop all throttles command', () => {
    const commands = useThrottleCommands().value
    const stopAll = commands.find((c) => c.id === 'throttle.stop-all')
    expect(stopAll).toBeDefined()
    expect(stopAll!.title).toBe('Stop all throttles')
    expect(stopAll!.keywords).toContain('halt')
  })

  it('running a per-loco command acquires and navigates', async () => {
    locosRef.value = [{ id: '42', address: 42, name: 'Freight' } as Loco]
    const commands = useThrottleCommands().value
    const cmd = commands.find((c) => c.id === 'throttle.loco.42')!
    await cmd.run()
    expect(acquireThrottleMock).toHaveBeenCalledWith(42)
    expect(pushMock).toHaveBeenCalledWith({ name: 'throttle', params: { address: 42 } })
  })

  it('running Stop all writes speed 0 to every throttle doc', async () => {
    throttlesRef.value = [
      { address: 3,  speed: 30, direction: true } as Throttle,
      { address: 17, speed: 55, direction: false } as Throttle,
    ]
    const commands = useThrottleCommands().value
    const stopAll = commands.find((c) => c.id === 'throttle.stop-all')!
    await stopAll.run()
    expect(setDocMock).toHaveBeenCalledTimes(2)
    const payloads = setDocMock.mock.calls.map((c) => c[1])
    for (const p of payloads) {
      expect(p).toMatchObject({ speed: 0, direction: false, timestamp: 'SERVER_TIMESTAMP' })
    }
  })

  it('handles loco with no name and no roadname', () => {
    locosRef.value = [{ id: '99', address: 99 } as Loco]
    const commands = useThrottleCommands().value
    const cmd = commands.find((c) => c.id === 'throttle.loco.99')!
    expect(cmd.title).toBe('Open throttle for Loco 99')
    expect(cmd.description).toBe('#99')
  })
})
