import { describe, it, expect, beforeEach } from 'vitest'
import {
  initFirebaseClient,
  getDb,
  getRtdb,
  getCurrentUser,
  __resetForTests,
} from './firebase-client'

const validConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'fake.firebaseapp.com',
  projectId: 'fake-project',
  databaseURL: 'https://fake-default-rtdb.firebaseio.com',
}

describe('firebase-client', () => {
  beforeEach(() => __resetForTests())

  it('throws when getDb is called before init', () => {
    expect(() => getDb()).toThrow(/not initialized/)
  })

  it('throws when getRtdb is called before init', () => {
    expect(() => getRtdb()).toThrow(/not initialized/)
  })

  it('returns null currentUser before sign-in', () => {
    expect(getCurrentUser()).toBeNull()
  })

  it('exposes Firestore and Database instances after init', () => {
    initFirebaseClient(validConfig)
    expect(getDb()).toBeDefined()
    expect(getRtdb()).toBeDefined()
  })

  it('throws if init is called twice', () => {
    initFirebaseClient(validConfig)
    expect(() => initFirebaseClient(validConfig)).toThrow(/already initialized/)
  })
})
