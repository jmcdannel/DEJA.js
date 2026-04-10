import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createHmac } from 'node:crypto'
import { signInstallJwt, verifyInstallJwt } from './installJwt'

const ORIGINAL_SECRET = process.env.INSTALL_JWT_SECRET

beforeAll(() => { process.env.INSTALL_JWT_SECRET = 'test-secret-for-unit-tests-only' })
afterAll(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.INSTALL_JWT_SECRET
  else process.env.INSTALL_JWT_SECRET = ORIGINAL_SECRET
})

describe('installJwt', () => {
  it('signs and verifies round-trip', () => {
    const token = signInstallJwt({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: 'l1' })
    const payload = verifyInstallJwt(token)
    expect(payload?.pairingId).toBe('p1')
    expect(payload?.sessionSecret).toBe('s1')
    expect(payload?.uid).toBe('u1')
    expect(payload?.layoutId).toBe('l1')
    expect(typeof payload?.iat).toBe('number')
    expect(typeof payload?.exp).toBe('number')
    expect(payload!.exp).toBeGreaterThan(payload!.iat)
  })

  it('round-trips a null layoutId', () => {
    const token = signInstallJwt({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: null })
    const payload = verifyInstallJwt(token)
    expect(payload?.layoutId).toBeNull()
  })

  it('rejects a tampered signature', () => {
    const token = signInstallJwt({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: null })
    const parts = token.split('.')
    const tampered = `${parts[0]}.${parts[1]}.AAAA${parts[2].slice(4)}`
    expect(verifyInstallJwt(tampered)).toBeNull()
  })

  it('rejects a tampered payload (sig becomes invalid)', () => {
    const token = signInstallJwt({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: null })
    const parts = token.split('.')
    const evilPayload = Buffer.from(JSON.stringify({ pairingId: 'evil', sessionSecret: 's1', uid: 'u1', layoutId: null, iat: 0, exp: 9999999999 })).toString('base64url')
    const tampered = `${parts[0]}.${evilPayload}.${parts[2]}`
    expect(verifyInstallJwt(tampered)).toBeNull()
  })

  it('rejects malformed token (too few segments)', () => {
    expect(verifyInstallJwt('only-one-part')).toBeNull()
    expect(verifyInstallJwt('a.b')).toBeNull()
    expect(verifyInstallJwt('')).toBeNull()
  })

  it('rejects a token signed with a different secret', () => {
    const token = signInstallJwt({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: null })
    process.env.INSTALL_JWT_SECRET = 'different-secret'
    expect(verifyInstallJwt(token)).toBeNull()
    process.env.INSTALL_JWT_SECRET = 'test-secret-for-unit-tests-only'
  })

  it('rejects an expired token', () => {
    // Forge an expired token manually
    const parts = signInstallJwt({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: null }).split('.')
    const expiredBody = Buffer.from(JSON.stringify({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: null, iat: 1000, exp: 2000 })).toString('base64url')
    // Need to re-sign with the expired body
    const sig = createHmac('sha256', process.env.INSTALL_JWT_SECRET!).update(`${parts[0]}.${expiredBody}`).digest('base64url')
    const expired = `${parts[0]}.${expiredBody}.${sig}`
    expect(verifyInstallJwt(expired)).toBeNull()
  })

  it('throws at sign time if secret is not set', () => {
    const saved = process.env.INSTALL_JWT_SECRET
    delete process.env.INSTALL_JWT_SECRET
    expect(() => signInstallJwt({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: null })).toThrow(/INSTALL_JWT_SECRET/)
    process.env.INSTALL_JWT_SECRET = saved
  })
})
