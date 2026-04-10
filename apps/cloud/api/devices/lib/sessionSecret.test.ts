import { describe, it, expect } from 'vitest'
import { generateSessionSecret, hashSessionSecret, verifySessionSecret } from './sessionSecret'

describe('sessionSecret', () => {
  it('generates distinct secrets', () => {
    expect(generateSessionSecret()).not.toBe(generateSessionSecret())
  })

  it('generates base64url-safe secrets (no +/= chars)', () => {
    const s = generateSessionSecret()
    expect(s).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('verifies a correct secret against its hash', () => {
    const s = generateSessionSecret()
    const h = hashSessionSecret(s)
    expect(verifySessionSecret(s, h)).toBe(true)
  })

  it('rejects an incorrect secret', () => {
    const s = generateSessionSecret()
    const h = hashSessionSecret(s)
    expect(verifySessionSecret('wrong-secret', h)).toBe(false)
  })

  it('rejects empty string against a real hash', () => {
    const h = hashSessionSecret(generateSessionSecret())
    expect(verifySessionSecret('', h)).toBe(false)
  })

  it('rejects mismatched-length hashes (defense in depth)', () => {
    expect(verifySessionSecret('anything', 'abc')).toBe(false)
  })

  it('hashSessionSecret is deterministic', () => {
    const s = 'test-input'
    expect(hashSessionSecret(s)).toBe(hashSessionSecret(s))
  })
})
