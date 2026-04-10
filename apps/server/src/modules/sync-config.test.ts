import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase-client to avoid initializing the real client SDK
vi.mock('../lib/firebase-client', () => ({
  getDb: vi.fn(() => ({ __type: 'mock-firestore' })),
}))

// Mock firebase/firestore to spy on collection() / onSnapshot()
const onSnapshotMock = vi.fn()
const collectionMock = vi.fn((db: unknown, path: string) => ({ __type: 'collection-ref', path }))
vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => collectionMock(...(args as [unknown, string])),
  onSnapshot: (...args: unknown[]) => onSnapshotMock(...args),
}))

vi.mock('./layout', () => ({
  layout: {
    connections: vi.fn(),
  },
}))

import { startDeviceConfigSync, stopDeviceConfigSync } from './sync-config'
import { layout } from './layout'

describe('Device Config Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stopDeviceConfigSync()
  })

  it('should setup firestore listener on start', () => {
    onSnapshotMock.mockReturnValue(vi.fn())
    startDeviceConfigSync()
    expect(collectionMock).toHaveBeenCalledWith(
      expect.anything(),
      'layouts/betatrack/devices',
    )
    expect(onSnapshotMock).toHaveBeenCalled()
  })

  it('should write payload to serial port when config is modified', () => {
    // Setup fake connection
    const mockWrite = vi.fn()
    vi.mocked(layout.connections).mockReturnValue({
      device123: {
        isConnected: true,
        port: { write: mockWrite } as any,
      },
    })

    // Capture the onSnapshot callback
    let snapshotCallback: any
    onSnapshotMock.mockImplementation((_ref: unknown, cb: any) => {
      snapshotCallback = cb
      return vi.fn() // unsubscribe mock
    })

    startDeviceConfigSync()

    // Simulate firestore doc modified event
    const fakeChange = {
      type: 'modified',
      doc: {
        id: 'device123',
        data: () => ({
          config: { '2': 'input_pullup', '4': 'servo' },
        }),
      },
    }

    snapshotCallback({
      docChanges: () => [fakeChange],
    })

    // Verify it called write with correct JSON structure
    expect(mockWrite).toHaveBeenCalled()
    const payload = JSON.parse(mockWrite.mock.calls[0][0])
    expect(payload.command).toBe('setConfig')
    expect(payload.config['2']).toBe('input_pullup')
  })
})
