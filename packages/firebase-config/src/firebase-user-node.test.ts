import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockSignInWithCustomToken,
  mockInitializeApp,
  mockInitializeAuth,
  mockInMemoryPersistence,
  mockGetFirestore,
  mockGetDatabase,
} = vi.hoisted(() => ({
  mockSignInWithCustomToken: vi.fn(),
  mockInitializeApp: vi.fn(() => ({})),
  mockInitializeAuth: vi.fn(() => ({ currentUser: null })),
  mockInMemoryPersistence: {},
  mockGetFirestore: vi.fn(() => ({})),
  mockGetDatabase: vi.fn(() => ({})),
}))

vi.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: () => [],
}))
vi.mock('firebase/auth', () => ({
  initializeAuth: mockInitializeAuth,
  inMemoryPersistence: mockInMemoryPersistence,
  signInWithCustomToken: mockSignInWithCustomToken,
}))
vi.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
}))
vi.mock('firebase/database', () => ({
  getDatabase: mockGetDatabase,
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { exchangeRefreshTokenForCustomToken, AuthMissingError } from './firebase-user-node.js'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.VITE_FIREBASE_API_KEY = 'fake-api-key'
  mockSignInWithCustomToken.mockResolvedValue({
    user: { uid: 'user-123', refreshToken: 'rt-rotated', email: 'test@example.com' },
  })
})

describe('exchangeRefreshTokenForCustomToken', () => {
  it('throws AuthMissingError when refresh token is missing', async () => {
    await expect(
      exchangeRefreshTokenForCustomToken({ refreshToken: '', refreshUrl: 'http://x' })
    ).rejects.toBeInstanceOf(AuthMissingError)
  })

  it('calls the refresh endpoint with the token in body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customToken: 'ct', expiresIn: 3600, refreshToken: 'rt2' }),
    })
    const result = await exchangeRefreshTokenForCustomToken({
      refreshToken: 'rt-1',
      refreshUrl: 'https://install.dejajs.com/api/cli-auth/refresh',
    })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://install.dejajs.com/api/cli-auth/refresh',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'rt-1' }),
      })
    )
    expect(result).toEqual({ customToken: 'ct', expiresIn: 3600, refreshToken: 'rt2' })
  })

  it('throws AuthMissingError on 401 (revoked or invalid)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'invalid' }),
    })
    await expect(
      exchangeRefreshTokenForCustomToken({
        refreshToken: 'rt-1',
        refreshUrl: 'http://x',
      })
    ).rejects.toBeInstanceOf(AuthMissingError)
  })

  it('throws regular Error on network failure (5xx, etc)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'oops' }),
    })
    await expect(
      exchangeRefreshTokenForCustomToken({
        refreshToken: 'rt-1',
        refreshUrl: 'http://x',
      })
    ).rejects.not.toBeInstanceOf(AuthMissingError)
  })
})
