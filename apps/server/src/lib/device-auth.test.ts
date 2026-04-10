import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authenticateDevice, DeviceAuthError } from './device-auth'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

const baseInput = {
  apiUrl: 'https://cloud.test',
  pairingId: 'p1',
  sessionSecret: 's1',
}

describe('device-auth', () => {
  beforeEach(() => fetchMock.mockReset())

  it('posts to /api/devices/auth and returns the result', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        customToken: 'ct',
        uid: 'u1',
        layoutId: 'l1',
        subscription: { status: 'active', plan: 'engineer' },
      }),
    })
    const result = await authenticateDevice(baseInput)
    expect(result.customToken).toBe('ct')
    expect(result.uid).toBe('u1')
    expect(result.layoutId).toBe('l1')
    expect(result.subscription.status).toBe('active')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://cloud.test/api/devices/auth',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairingId: 'p1', sessionSecret: 's1' }),
      }),
    )
  })

  it('throws DeviceAuthError with code unauthorized on 401', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid session secret' }),
    })
    await expect(authenticateDevice(baseInput)).rejects.toMatchObject({
      name: 'DeviceAuthError',
      code: 'unauthorized',
      status: 401,
    })
  })

  it('throws with code subscription_required on 402', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 402,
      json: async () => ({ error: 'Subscription not active' }),
    })
    await expect(authenticateDevice(baseInput)).rejects.toMatchObject({
      code: 'subscription_required',
      status: 402,
    })
  })

  it('throws with code revoked on 403', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Pairing revoked' }),
    })
    await expect(authenticateDevice(baseInput)).rejects.toMatchObject({ code: 'revoked' })
  })

  it('throws with code not_found on 404', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Pairing not found' }),
    })
    await expect(authenticateDevice(baseInput)).rejects.toMatchObject({ code: 'not_found' })
  })

  it('throws with code unknown on 500', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal' }),
    })
    await expect(authenticateDevice(baseInput)).rejects.toMatchObject({
      code: 'unknown',
      status: 500,
    })
  })

  it('throws with code network if fetch itself rejects', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'))
    await expect(authenticateDevice(baseInput)).rejects.toMatchObject({ code: 'network' })
  })

  it('handles JSON parse failure on error response gracefully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => {
        throw new Error('not json')
      },
    })
    await expect(authenticateDevice(baseInput)).rejects.toMatchObject({ code: 'unauthorized' })
  })
})
