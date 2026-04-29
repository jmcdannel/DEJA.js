import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Hoisted mocks — vi.hoisted runs before vi.mock factories so these refs
// can be safely used inside factory closures.
// ---------------------------------------------------------------------------

const { mockSet, mockDb, mockConnections, mockDevices, mockSendTurnout } = vi.hoisted(() => {
  // Must be set before the module loads — turnouts.ts reads LAYOUT_ID as a top-level constant.
  process.env.LAYOUT_ID = 'layout-test'

  const mockSet = vi.fn().mockResolvedValue(undefined)
  const mockEffectsDoc = vi.fn(() => ({ set: mockSet }))
  const mockEffectsCollection = vi.fn(() => ({ doc: mockEffectsDoc }))
  const mockLayoutDoc = vi.fn(() => ({ collection: mockEffectsCollection }))
  const mockDb = { collection: vi.fn(() => ({ doc: mockLayoutDoc })) }
  const mockConnections = vi.fn()
  const mockDevices = vi.fn()
  const mockSendTurnout = vi.fn().mockResolvedValue(undefined)
  return { mockSet, mockDb, mockConnections, mockDevices, mockSendTurnout }
})

vi.mock('@repo/firebase-config/firebase-admin-node', () => ({ db: mockDb }))

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TS') },
}))

vi.mock('../utils/logger.js', () => ({
  log: {
    log: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('../lib/dcc.js', () => ({
  dcc: { sendTurnout: mockSendTurnout },
}))

vi.mock('./layout.js', () => ({
  layout: { connections: mockConnections, devices: mockDevices },
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { turnoutCommand, handleTurnout, handleTurnoutChange } from './turnouts.js'
import { log } from '../utils/logger.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSnapshot(changes: Array<{ type: 'added' | 'modified'; id: string; data: Record<string, unknown> }>) {
  return {
    docChanges: () =>
      changes.map((c) => ({
        type: c.type,
        doc: { id: c.id, data: () => c.data },
      })),
  }
}

/** Flush all pending microtasks from async-in-forEach callbacks. */
async function flush() {
  await new Promise<void>((r) => setTimeout(r, 0))
}

// ---------------------------------------------------------------------------
// turnoutCommand — pure, no mocking needed
// ---------------------------------------------------------------------------

describe('turnoutCommand', () => {
  const base = { id: 't1', name: 'Main Yard', device: 'dev-1', state: false }

  it('returns undefined for unknown type', () => {
    expect(turnoutCommand({ ...base, type: 'unknown' as never })).toBeUndefined()
  })

  describe('kato', () => {
    it('builds a kato command with state and turnoutIdx', () => {
      const cmd = turnoutCommand({ ...base, type: 'kato', turnoutIdx: 3 })
      expect(cmd).toEqual({
        action: 'turnout',
        device: 'dev-1',
        payload: { state: false, turnout: 3 },
      })
    })

    it('reflects thrown state', () => {
      const cmd = turnoutCommand({ ...base, type: 'kato', state: true, turnoutIdx: 3 })
      expect((cmd as { payload: { state: boolean } }).payload.state).toBe(true)
    })
  })

  describe('servo', () => {
    const servo = { ...base, type: 'servo' as const, straight: 0, divergent: 90, turnoutIdx: 2 }

    it('builds a servo command selecting straight position when closed', () => {
      const cmd = turnoutCommand({ ...servo, state: false }) as { payload: { current: number; value: number } }
      expect(cmd.payload.current).toBe(0)   // straight
      expect(cmd.payload.value).toBe(90)    // divergent (target on next throw)
    })

    it('builds a servo command selecting divergent position when thrown', () => {
      const cmd = turnoutCommand({ ...servo, state: true }) as { payload: { current: number; value: number } }
      expect(cmd.payload.current).toBe(90)  // divergent
      expect(cmd.payload.value).toBe(0)     // straight (target on next close)
    })

    it('returns undefined when straight === divergent', () => {
      expect(turnoutCommand({ ...servo, straight: 45, divergent: 45 })).toBeUndefined()
    })

    it('returns undefined when values exceed 180', () => {
      expect(turnoutCommand({ ...servo, straight: 0, divergent: 200 })).toBeUndefined()
    })

    it('returns undefined when values are negative', () => {
      expect(turnoutCommand({ ...servo, straight: -10, divergent: 90 })).toBeUndefined()
    })

    it('returns undefined when turnoutIdx is missing', () => {
      const { turnoutIdx: _, ...noIdx } = servo
      expect(turnoutCommand(noIdx as never)).toBeUndefined()
    })

    it('returns undefined when straight is undefined', () => {
      const { straight: _, ...noStraight } = servo
      expect(turnoutCommand(noStraight as never)).toBeUndefined()
    })
  })
})

// ---------------------------------------------------------------------------
// handleTurnoutChange — state tracking + effect triggering
// ---------------------------------------------------------------------------

describe('handleTurnoutChange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Device not connected → handleTurnout exits early without DCC commands
    mockConnections.mockReturnValue({})
    mockDevices.mockReturnValue([])
  })

  it('records initial state on "added" and does not call handleTurnout', async () => {
    await handleTurnoutChange(makeSnapshot([
      { type: 'added', id: 'ta1', data: { state: false, device: 'd1', type: 'kato' } },
    ]))
    await flush()
    expect(mockSendTurnout).not.toHaveBeenCalled()
  })

  it('calls handleTurnout when state changes on "modified"', async () => {
    // Seed initial state
    await handleTurnoutChange(makeSnapshot([
      { type: 'added', id: 'tb1', data: { state: false, device: 'd1', type: 'kato' } },
    ]))
    await flush()

    // Simulate state flip — device IS connected for this one to reach dcc.sendTurnout
    mockConnections.mockReturnValue({
      d1: { isConnected: true, topic: 'deja/d1', publish: vi.fn().mockResolvedValue(undefined) },
    })
    mockDevices.mockReturnValue([{ id: 'd1', type: 'kato', connection: 'wifi' }])

    await handleTurnoutChange(makeSnapshot([
      { type: 'modified', id: 'tb1', data: { id: 'tb1', state: true, device: 'd1', type: 'kato', turnoutIdx: 1 } },
    ]))
    await flush()

    // Connection publish was invoked (handleTurnout reached device command path)
    const conn = mockConnections()['d1']
    expect(conn.publish).toHaveBeenCalled()
  })

  it('does NOT call handleTurnout when state is unchanged', async () => {
    await handleTurnoutChange(makeSnapshot([
      { type: 'added', id: 'tc1', data: { state: true, device: 'd1', type: 'kato' } },
    ]))
    await flush()

    await handleTurnoutChange(makeSnapshot([
      { type: 'modified', id: 'tc1', data: { id: 'tc1', state: true, device: 'd1', type: 'kato' } },
    ]))
    await flush()

    expect(mockSendTurnout).not.toHaveBeenCalled()
    // db.collection should not have been called for effects either
    expect(mockSet).not.toHaveBeenCalled()
  })

  it('triggers linked effect when effectId is set and state changes', async () => {
    await handleTurnoutChange(makeSnapshot([
      { type: 'added', id: 'td1', data: { state: false, device: 'd1', type: 'kato' } },
    ]))
    await flush()

    await handleTurnoutChange(makeSnapshot([
      {
        type: 'modified',
        id: 'td1',
        data: { id: 'td1', state: true, device: 'd1', type: 'kato', effectId: 'whistle-sound' },
      },
    ]))
    await flush()

    expect(mockDb.collection).toHaveBeenCalledWith('layouts')
    expect(mockSet).toHaveBeenCalledWith(
      { state: true, timestamp: 'SERVER_TS' },
      { merge: true },
    )
    expect(log.success).toHaveBeenCalledWith(
      expect.stringContaining('whistle-sound'),
    )
  })

  it('does NOT trigger an effect when effectId is absent', async () => {
    await handleTurnoutChange(makeSnapshot([
      { type: 'added', id: 'te1', data: { state: false, device: 'd1', type: 'kato' } },
    ]))
    await flush()

    await handleTurnoutChange(makeSnapshot([
      { type: 'modified', id: 'te1', data: { id: 'te1', state: true, device: 'd1', type: 'kato' } },
    ]))
    await flush()

    expect(mockSet).not.toHaveBeenCalled()
  })

  it('logs an error and continues when the effect write fails', async () => {
    mockSet.mockRejectedValueOnce(new Error('Firestore unavailable'))

    await handleTurnoutChange(makeSnapshot([
      { type: 'added', id: 'tf1', data: { state: false, device: 'd1', type: 'kato' } },
    ]))
    await flush()

    await handleTurnoutChange(makeSnapshot([
      {
        type: 'modified',
        id: 'tf1',
        data: { id: 'tf1', state: true, device: 'd1', type: 'kato', effectId: 'horn-effect' },
      },
    ]))
    await flush()

    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining('tf1'),
      expect.any(Error),
    )
  })

  it('inverts the effect state when invertEffect is true', async () => {
    await handleTurnoutChange(makeSnapshot([
      { type: 'added', id: 'th1', data: { state: false, device: 'd1', type: 'kato' } },
    ]))
    await flush()

    await handleTurnoutChange(makeSnapshot([
      {
        type: 'modified',
        id: 'th1',
        data: { id: 'th1', state: true, device: 'd1', type: 'kato', effectId: 'horn', invertEffect: true },
      },
    ]))
    await flush()

    // turnout thrown (true) → invertEffect → effect state should be false
    expect(mockSet).toHaveBeenCalledWith(
      { state: false, timestamp: 'SERVER_TS' },
      { merge: true },
    )
  })

  it('passes the turnout state (false) to the effect when closing', async () => {
    await handleTurnoutChange(makeSnapshot([
      { type: 'added', id: 'tg1', data: { state: true, device: 'd1', type: 'kato' } },
    ]))
    await flush()

    await handleTurnoutChange(makeSnapshot([
      {
        type: 'modified',
        id: 'tg1',
        data: { id: 'tg1', state: false, device: 'd1', type: 'kato', effectId: 'bell-effect' },
      },
    ]))
    await flush()

    expect(mockSet).toHaveBeenCalledWith(
      { state: false, timestamp: 'SERVER_TS' },
      { merge: true },
    )
  })
})

// ---------------------------------------------------------------------------
// handleTurnout — device routing (unit-level, device not connected)
// ---------------------------------------------------------------------------

describe('handleTurnout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConnections.mockReturnValue({})
    mockDevices.mockReturnValue([])
  })


  it('exits early when device is not connected', async () => {
    await handleTurnout({ id: 't1', device: 'missing', state: true, type: 'kato', name: 'T1' })
    expect(mockSendTurnout).not.toHaveBeenCalled()
    expect(log.error).toHaveBeenCalledWith('Device not connected', 'missing')
  })

  it('sends DCC-EX serial command for dcc-ex device type', async () => {
    mockConnections.mockReturnValue({ 'dccex-1': { isConnected: true } })
    mockDevices.mockReturnValue([{ id: 'dccex-1', type: 'dcc-ex' }])

    await handleTurnout({ id: 't1', device: 'dccex-1', state: true, type: 'kato', name: 'T1', turnoutIdx: 5 })
    expect(mockSendTurnout).toHaveBeenCalledWith({ state: true, turnoutIdx: 5 }, 'dccex-1')
  })
})
