import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockExchange, mockInit, mockReadConfig, mockWriteConfigCache } = vi.hoisted(() => ({
  mockExchange: vi.fn(),
  mockInit: vi.fn(),
  mockReadConfig: vi.fn(),
  mockWriteConfigCache: vi.fn(),
}))

vi.mock('@repo/firebase-config/firebase-user-node', () => ({
  exchangeRefreshTokenForCustomToken: mockExchange,
  initFirebaseUserAuth: mockInit,
  AuthMissingError: class AuthMissingError extends Error {
    constructor(m: string) { super(m); this.name = 'AuthMissingError' }
  },
}))
vi.mock('./subscription.js', () => ({
  readConfig: mockReadConfig,
  writeConfigCache: mockWriteConfigCache,
}))

import { bootstrapAuth } from './auth-bootstrap.js'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.VITE_FIREBASE_API_KEY = 'k'
  process.env.VITE_FIREBASE_AUTH_DOMAIN = 'd'
  process.env.VITE_FIREBASE_DATABASE_URL = 'u'
  process.env.VITE_FIREBASE_PROJECT_ID = 'p'
  process.env.VITE_FIREBASE_STORAGE_BUCKET = 's'
  process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = 'm'
  process.env.VITE_FIREBASE_APP_ID = 'a'
})

describe('bootstrapAuth', () => {
  it('uses DEJA_REFRESH_TOKEN env var when present', async () => {
    process.env.DEJA_REFRESH_TOKEN = 'env-token'
    mockExchange.mockResolvedValueOnce({ customToken: 'ct', expiresIn: 3600, refreshToken: 'rt' })
    mockInit.mockResolvedValueOnce({ uid: 'u', refreshToken: 'rt' })
    await bootstrapAuth()
    expect(mockExchange).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'env-token' }),
    )
    delete process.env.DEJA_REFRESH_TOKEN
  })

  it('falls back to ~/.deja/config.json refreshToken', async () => {
    delete process.env.DEJA_REFRESH_TOKEN
    mockReadConfig.mockResolvedValueOnce({ uid: 'u', refreshToken: 'cfg-token' })
    mockExchange.mockResolvedValueOnce({ customToken: 'ct', expiresIn: 3600, refreshToken: 'rt' })
    mockInit.mockResolvedValueOnce({ uid: 'u', refreshToken: 'rt' })
    await bootstrapAuth()
    expect(mockExchange).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'cfg-token' }),
    )
  })

  it('persists rotated refreshToken back to config', async () => {
    delete process.env.DEJA_REFRESH_TOKEN
    mockReadConfig.mockResolvedValueOnce({ uid: 'u', refreshToken: 'old' })
    mockExchange.mockResolvedValueOnce({ customToken: 'ct', expiresIn: 3600, refreshToken: 'new-rt' })
    mockInit.mockResolvedValueOnce({ uid: 'u', refreshToken: 'new-rt' })
    await bootstrapAuth()
    expect(mockWriteConfigCache).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'new-rt' }),
    )
  })

  it('throws AuthMissingError when no refresh token anywhere', async () => {
    delete process.env.DEJA_REFRESH_TOKEN
    mockReadConfig.mockResolvedValueOnce({ uid: 'u' })
    await expect(bootstrapAuth()).rejects.toThrow(/refresh token/i)
  })
})
