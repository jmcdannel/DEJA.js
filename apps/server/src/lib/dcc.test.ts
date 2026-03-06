import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock heavy dependencies before importing the module under test so that
// vitest doesn't try to load Firebase Admin, SerialPort, etc.
// ---------------------------------------------------------------------------
vi.mock('@repo/firebase-config/firebase-admin-node', () => ({
  rtdb: { ref: vi.fn(() => ({ remove: vi.fn() })) },
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        set: vi.fn(),
      })),
    })),
  },
}))

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn() },
}))

vi.mock('serialport', () => ({
  SerialPort: { list: vi.fn(async () => []) },
}))

vi.mock('./serial', () => ({
  serial: { connect: vi.fn(), send: vi.fn(), disconnect: vi.fn(), disconnectAll: vi.fn() },
}))

vi.mock('../broadcast', () => ({
  broadcast: vi.fn(),
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
  },
}))

import { isPowerCommand, dcc } from './dcc'
import { serial } from './serial'
import { broadcast } from '../broadcast'

// ---------------------------------------------------------------------------
// isPowerCommand — pure function, no mocking needed
// ---------------------------------------------------------------------------
describe('isPowerCommand', () => {
  it('matches "1" (power on)', () => {
    expect(isPowerCommand('1')).toBe(true)
  })

  it('matches "0" (power off)', () => {
    expect(isPowerCommand('0')).toBe(true)
  })

  it('matches "1 MAIN"', () => {
    expect(isPowerCommand('1 MAIN')).toBe(true)
  })

  it('matches "0 MAIN"', () => {
    expect(isPowerCommand('0 MAIN')).toBe(true)
  })

  it('matches "1 PROG"', () => {
    expect(isPowerCommand('1 PROG')).toBe(true)
  })

  it('matches "0 PROG"', () => {
    expect(isPowerCommand('0 PROG')).toBe(true)
  })

  it('accepts surrounding whitespace', () => {
    expect(isPowerCommand('  1  ')).toBe(true)
    expect(isPowerCommand('  0 MAIN  ')).toBe(true)
  })

  it('rejects "2" (invalid digit)', () => {
    expect(isPowerCommand('2')).toBe(false)
  })

  it('rejects a throttle command', () => {
    expect(isPowerCommand('t 3 50 1')).toBe(false)
  })

  it('rejects a turnout command', () => {
    expect(isPowerCommand('T 1 1')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isPowerCommand('')).toBe(false)
  })

  it('rejects "1 INVALID"', () => {
    expect(isPowerCommand('1 INVALID')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// DCC command builders — assert the correct DCC command string is assembled
// ---------------------------------------------------------------------------
describe('dcc.sendSpeed', () => {
  beforeEach(() => {
    vi.mocked(serial.send).mockClear()
    vi.mocked(broadcast).mockClear()
  })

  it('sends forward command when speed is positive', async () => {
    await dcc.sendSpeed({ address: 3, speed: 50 })
    expect(serial.send).toHaveBeenCalledWith(
      expect.anything(),
      '<t 3 50 1>\n'
    )
  })

  it('sends reverse command when speed is negative', async () => {
    await dcc.sendSpeed({ address: 3, speed: -50 })
    expect(serial.send).toHaveBeenCalledWith(
      expect.anything(),
      '<t 3 50 0>\n'
    )
  })

  it('sends stop command when speed is zero', async () => {
    await dcc.sendSpeed({ address: 3, speed: 0 })
    expect(serial.send).toHaveBeenCalledWith(
      expect.anything(),
      '<t 3 0 0>\n'
    )
  })
})

describe('dcc.sendTurnout', () => {
  beforeEach(() => {
    vi.mocked(serial.send).mockClear()
  })

  it('sends thrown command when state is true', async () => {
    await dcc.sendTurnout({ turnoutIdx: 1, state: true })
    expect(serial.send).toHaveBeenCalledWith(expect.anything(), '<T 1 1>\n')
  })

  it('sends closed command when state is false', async () => {
    await dcc.sendTurnout({ turnoutIdx: 1, state: false })
    expect(serial.send).toHaveBeenCalledWith(expect.anything(), '<T 1 0>\n')
  })
})

describe('dcc.sendOutput', () => {
  beforeEach(() => {
    vi.mocked(serial.send).mockClear()
  })

  it('sends output on command', async () => {
    await dcc.sendOutput({ pin: 4, state: true })
    expect(serial.send).toHaveBeenCalledWith(expect.anything(), '<Z 4 1>\n')
  })

  it('sends output off command', async () => {
    await dcc.sendOutput({ pin: 4, state: false })
    expect(serial.send).toHaveBeenCalledWith(expect.anything(), '<Z 4 0>\n')
  })
})

describe('dcc.handleMessage', () => {
  beforeEach(() => {
    vi.mocked(broadcast).mockClear()
  })

  it('calls broadcast on getStatus action', async () => {
    await dcc.handleMessage(JSON.stringify({ action: 'getStatus', payload: null }))
    expect(broadcast).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'status' })
    )
  })

  it('calls broadcast on ping action', async () => {
    await dcc.handleMessage(JSON.stringify({ action: 'ping', payload: null }))
    expect(broadcast).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'status' })
    )
  })

  it('logs a warning for unknown actions', async () => {
    const { log } = await import('../utils/logger')
    await dcc.handleMessage(JSON.stringify({ action: 'unknownAction', payload: null }))
    expect(log.warn).toHaveBeenCalled()
  })
})
