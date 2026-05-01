import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const mockVerifyIdToken = vi.fn()
const mockCreateCustomToken = vi.fn()
const mockSet = vi.fn()
const mockDoc = vi.fn(() => ({ set: mockSet }))
const mockCollection = vi.fn(() => ({ doc: mockDoc }))

vi.mock('./_lib/admin.js', () => ({
  getAdmin: () => ({
    auth: {
      verifyIdToken: mockVerifyIdToken,
      createCustomToken: mockCreateCustomToken,
    },
    db: {
      collection: (path: string) => {
        mockCollection(path)
        return {
          doc: (uid: string) => ({
            collection: (sub: string) => {
              mockCollection(sub)
              return { doc: mockDoc }
            },
          }),
        }
      },
    },
  }),
}))

import handler from './mint.js'

function makeReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: { authorization: 'Bearer fake-id-token' },
    body: { name: 'Basement Pi', layoutId: 'my-layout' },
    ...overrides,
  } as VercelRequest
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
  mockVerifyIdToken.mockResolvedValue({ uid: 'user-123' })
  mockCreateCustomToken.mockResolvedValue('custom-token-abc')
  mockSet.mockResolvedValue(undefined)
})

describe('POST /api/cli-auth/mint', () => {
  it('returns 401 when authorization header is missing', async () => {
    const req = makeReq({ headers: {} })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(401)
  })

  it('returns 401 when ID token verification fails', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('expired'))
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(401)
  })

  it('returns 400 when name is missing or invalid', async () => {
    const req = makeReq({ body: { name: '', layoutId: 'my-layout' } })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(400)
  })

  it('returns 400 when layoutId is missing', async () => {
    const req = makeReq({ body: { name: 'Test' } })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(400)
    expect((res._body as { error: string }).error).toContain('layoutId')
  })

  it('mints a custom token with serverId and kind=server claims', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(200)
    expect(mockCreateCustomToken).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({ kind: 'server', serverId: expect.any(String) })
    )
    const body = res._body as { customToken: string; serverId: string }
    expect(body.customToken).toBe('custom-token-abc')
    expect(body.serverId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  })

  it('writes a server doc with name, layoutId, createdAt, lastSeenAt=null, revoked=false', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Basement Pi',
        layoutId: 'my-layout',
        lastSeenAt: null,
        revoked: false,
      })
    )
  })

  it('truncates names longer than 60 chars', async () => {
    const longName = 'x'.repeat(80)
    const req = makeReq({ body: { name: longName, layoutId: 'my-layout' } })
    const res = makeRes()
    await handler(req, res)
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'x'.repeat(60) })
    )
  })

  it('returns 405 on non-POST methods', async () => {
    const req = makeReq({ method: 'GET' })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(405)
  })
})
