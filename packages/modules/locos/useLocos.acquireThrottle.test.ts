import { describe, it, expect, vi, beforeEach } from 'vitest'

const { setDocMock, getDocMock, docFnMock } = vi.hoisted(() => ({
  setDocMock: vi.fn().mockResolvedValue(undefined),
  getDocMock: vi.fn(),
  docFnMock: vi.fn(() => ({ __type: 'docRef' })),
}))

vi.mock('firebase/firestore', () => ({
  doc: docFnMock,
  collection: vi.fn(() => ({ __type: 'collection' })),
  getDoc: getDocMock,
  getDocs: vi.fn(),
  setDoc: setDocMock,
  deleteDoc: vi.fn(),
  where: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: () => 'SERVER_TIMESTAMP',
}))

vi.mock('@repo/firebase-config', () => ({ db: { __type: 'db' } }))

vi.mock('vuefire', () => ({
  useCollection: () => ({ value: [] }),
  useDocument: () => ({ value: null }),
}))

vi.mock('@vueuse/core', () => ({
  useStorage: (key: string, initial: unknown) =>
    key === '@DEJA/layoutId' ? { value: 'layout-1' } : { value: initial },
}))

vi.mock('@repo/utils', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}))

import { useLocos } from './useLocos'

describe('acquireThrottle', () => {
  beforeEach(() => {
    setDocMock.mockClear()
    getDocMock.mockClear()
    docFnMock.mockClear()
  })

  it('creates a new throttle with speed 0 / direction false when doc does not exist', async () => {
    getDocMock.mockResolvedValueOnce({ exists: () => false })
    const { acquireThrottle } = useLocos()
    await acquireThrottle(42)

    expect(setDocMock).toHaveBeenCalledTimes(1)
    const [, data, options] = setDocMock.mock.calls[0]
    expect(data).toMatchObject({ address: 42, speed: 0, direction: false })
    expect(options).toEqual({ merge: true })
  })

  it('preserves existing speed and direction on re-acquire', async () => {
    getDocMock.mockResolvedValueOnce({ exists: () => true })
    const { acquireThrottle } = useLocos()
    await acquireThrottle(42)

    expect(setDocMock).toHaveBeenCalledTimes(1)
    const [, data, options] = setDocMock.mock.calls[0]
    expect(data).toMatchObject({ address: 42 })
    expect(data).not.toHaveProperty('speed')
    expect(data).not.toHaveProperty('direction')
    expect(data).toHaveProperty('timestamp', 'SERVER_TIMESTAMP')
    expect(options).toEqual({ merge: true })
  })

  it('no-ops when address is falsy', async () => {
    const { acquireThrottle } = useLocos()
    await acquireThrottle(0)
    expect(setDocMock).not.toHaveBeenCalled()
    expect(getDocMock).not.toHaveBeenCalled()
  })
})
