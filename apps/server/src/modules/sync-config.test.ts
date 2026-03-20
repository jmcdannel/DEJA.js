import { describe, it, expect, vi, beforeEach } from 'vitest'
import { startDeviceConfigSync, stopDeviceConfigSync } from './sync-config'
import { db } from '@repo/firebase-config/firebase-admin-node'
import { layout } from './layout'

// Mock dependencies
vi.mock('@repo/firebase-config/firebase-admin-node', () => ({
  db: {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    onSnapshot: vi.fn()
  }
}))

vi.mock('./layout', () => ({
  layout: {
    connections: vi.fn()
  }
}))

describe('Device Config Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stopDeviceConfigSync()
  })

  it('should setup firestore listener on start', () => {
    startDeviceConfigSync()
    expect(db.collection).toHaveBeenCalledWith('layouts')
    expect(db.collection('layouts').doc('x').collection).toHaveBeenCalledWith('devices')
    expect(db.collection('layouts').doc('x').collection('devices').onSnapshot).toHaveBeenCalled()
  })

  it('should write payload to serial port when config is modified', () => {
    // Setup fake connection
    const mockWrite = vi.fn()
    vi.mocked(layout.connections).mockReturnValue({
      'device123': {
        isConnected: true,
        port: { write: mockWrite } as any
      }
    })

    // Capture the onSnapshot callback
    let snapshotCallback: any
    vi.mocked(db.collection('layouts').doc('x').collection('devices').onSnapshot).mockImplementation((cb: any) => {
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
          config: { '2': 'input_pullup', '4': 'servo' }
        })
      }
    }
    
    snapshotCallback({
      docChanges: () => [fakeChange]
    })

    // Verify it called write with correct JSON structure
    expect(mockWrite).toHaveBeenCalled()
    const payload = JSON.parse(mockWrite.mock.calls[0][0])
    expect(payload.command).toBe('setConfig')
    expect(payload.config['2']).toBe('input_pullup')
  })
})
