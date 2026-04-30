import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const mockVerifyIdToken = vi.fn()
const mockCreateCustomToken = vi.fn()
const mockGet = vi.fn()
const mockUpdate = vi.fn()

vi.mock('./_lib/admin.js', () => ({
  getAdmin: () => ({
    auth: {
      verifyIdToken: mockVerifyIdToken,
      createCustomToken: mockCreateCustomToken,
    },
    db: {
      collection: () => ({
        doc: () => ({
          collection: () => ({
            doc: () => ({
              get: mockGet,
              update: mockUpdate,
            }),
          }),
        }),
      }),
    },
  }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import handler from './refresh.js'

function makeReq(body: unknown = { refreshToken: 'rt-abc' }): VercelRequest {
  return { method: 'POST', headers: {}, body } as unknown as VercelRequest
}

function makeRes(): VercelResponse & { _status: number; _body: unknown } {
  const res = {
    _status: 0,
    _body: undefined as unknown,
    setHeader: vi.fn(),
    status(code: number) { this._status = code; return this },
    json(body: unknown) { this._body = body; return this },
    end() { return this },
  }
  return res as unknown as VercelResponse & { _status: number; _body: unknown }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.FIREBASE_API_KEY = 'fake-api-key'
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      id_token: 'new-id-token',
      refresh_token: 'rotated-refresh-token',
      expires_in: '3600',
      user_id: 'user-123',
    }),
  })
  mockVerifyIdToken.mockResolvedValue({ uid: 'user-123', serverId: 'srv-1', kind: 'server' })
  mockCreateCustomToken.mockResolvedValue('new-custom-token')
  mockGet.mockResolvedValue({ exists: true, data: () => ({ revoked: false }) })
  mockUpdate.mockResolvedValue(undefined)
})

describe('POST /api/cli-auth/refresh', () => {
  it('returns 400 if refreshToken missing', async () => {
    const req = makeReq({})
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(400)
  })

  it('returns 401 when Firebase rejects the refresh token', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({}) })
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(401)
  })

  it('returns 401 when ID token has no serverId claim', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-123' })
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(401)
  })

  it('returns 403 when server is revoked in Firestore', async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ revoked: true }) })
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(403)
  })

  it('returns 403 when server doc does not exist (already deleted)', async () => {
    mockGet.mockResolvedValueOnce({ exists: false, data: () => undefined })
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(403)
  })

  it('updates lastSeenAt on success', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ lastSeenAt: expect.anything() })
    )
  })

  it('returns customToken, expiresIn, and rotated refreshToken on success', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(200)
    expect(res._body).toEqual({
      customToken: 'new-custom-token',
      expiresIn: 3600,
      refreshToken: 'rotated-refresh-token',
    })
  })

  it('mints custom token with the same serverId and kind=server claims', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(mockCreateCustomToken).toHaveBeenCalledWith('user-123', {
      serverId: 'srv-1',
      kind: 'server',
    })
  })

  it('returns 405 on non-POST', async () => {
    const req = { method: 'GET', headers: {}, body: {} } as unknown as VercelRequest
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(405)
  })
})
