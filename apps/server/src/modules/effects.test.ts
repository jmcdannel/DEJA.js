import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock heavy dependencies before importing the module under test
// ---------------------------------------------------------------------------
const mockBatch = {
  set: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
}

const mockEffectDocs: Array<{ ref: object; data: () => object }> = []

const mockCollectionChain = {
  doc: vi.fn().mockReturnThis(),
  collection: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  get: vi.fn().mockResolvedValue({ empty: false, docs: mockEffectDocs }),
}

vi.mock('@repo/firebase-config/firebase-admin-node', () => ({
  db: {
    collection: vi.fn(() => mockCollectionChain),
    batch: vi.fn(() => mockBatch),
  },
}))

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TS') },
}))

vi.mock('../utils/logger', () => ({
  log: {
    star: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    note: vi.fn(),
    await: vi.fn(),
    complete: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    log: vi.fn(),
  },
}))

vi.mock('./layout', () => ({
  layout: { connections: vi.fn(() => ({})), devices: vi.fn(() => []) },
}))

vi.mock('../lib/dcc', () => ({
  dcc: { sendOutput: vi.fn(), sendToDevice: vi.fn() },
}))

vi.mock('../lib/sound', () => ({
  soundCommand: vi.fn(),
  playSound: vi.fn(),
  stopSound: vi.fn(),
}))

vi.mock('./wled', () => ({ default: { handleEffectChange: vi.fn() } }))

import { togglePowerEffects, getEffectCommand } from './effects'
import { db } from '@repo/firebase-config/firebase-admin-node'

// ---------------------------------------------------------------------------
// togglePowerEffects
// ---------------------------------------------------------------------------
describe('togglePowerEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEffectDocs.length = 0
    mockBatch.set.mockClear()
    mockBatch.commit.mockResolvedValue(undefined)
    mockCollectionChain.get.mockResolvedValue({ empty: false, docs: mockEffectDocs })
  })

  it('queries effects collection with type == power filter', async () => {
    mockCollectionChain.get.mockResolvedValueOnce({ empty: true, docs: [] })
    await togglePowerEffects(true)
    expect(db.collection).toHaveBeenCalledWith('layouts')
    expect(mockCollectionChain.where).toHaveBeenCalledWith('type', '==', 'power')
  })

  it('does nothing when no power effects exist', async () => {
    mockCollectionChain.get.mockResolvedValueOnce({ empty: true, docs: [] })
    await togglePowerEffects(true)
    expect(mockBatch.commit).not.toHaveBeenCalled()
  })

  it('sets state: true on each power effect when power is ON', async () => {
    const ref1 = { id: 'efx1' }
    const ref2 = { id: 'efx2' }
    mockEffectDocs.push({ ref: ref1, data: () => ({ type: 'power', state: false }) })
    mockEffectDocs.push({ ref: ref2, data: () => ({ type: 'power', state: false }) })

    await togglePowerEffects(true)

    expect(mockBatch.set).toHaveBeenCalledTimes(2)
    expect(mockBatch.set).toHaveBeenCalledWith(
      ref1,
      { state: true, timestamp: 'SERVER_TS' },
      { merge: true },
    )
    expect(mockBatch.set).toHaveBeenCalledWith(
      ref2,
      { state: true, timestamp: 'SERVER_TS' },
      { merge: true },
    )
    expect(mockBatch.commit).toHaveBeenCalledTimes(1)
  })

  it('sets state: false on each power effect when power is OFF', async () => {
    const ref1 = { id: 'efx1' }
    mockEffectDocs.push({ ref: ref1, data: () => ({ type: 'power', state: true }) })

    await togglePowerEffects(false)

    expect(mockBatch.set).toHaveBeenCalledWith(
      ref1,
      { state: false, timestamp: 'SERVER_TS' },
      { merge: true },
    )
    expect(mockBatch.commit).toHaveBeenCalledTimes(1)
  })

  it('logs an error and does not throw when Firestore query fails', async () => {
    const { log } = await import('../utils/logger')
    mockCollectionChain.get.mockRejectedValueOnce(new Error('Firestore error'))

    await expect(togglePowerEffects(true)).resolves.toBeUndefined()
    expect(log.error).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// getEffectCommand — power type should return a pin command
// ---------------------------------------------------------------------------
describe('getEffectCommand for power-type effects', () => {
  it('returns a pin command for power type', () => {
    const efx = { type: 'power', pin: 5, state: true, device: 'dev1' } as any
    const cmd = getEffectCommand(efx)
    expect(cmd).toMatchObject({
      action: 'pin',
      device: 'dev1',
      payload: { pin: '5', state: true },
    })
  })

  it('returns a pin command with state false when power is off', () => {
    const efx = { type: 'power', pin: 5, state: false, device: 'dev1' } as any
    const cmd = getEffectCommand(efx)
    expect(cmd).toMatchObject({
      action: 'pin',
      payload: { pin: '5', state: false },
    })
  })
})
