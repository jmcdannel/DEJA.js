import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createConfigStore, type DejaConfig } from './config-store'

describe('config-store', () => {
  let dir: string
  let store: ReturnType<typeof createConfigStore>

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'deja-config-test-'))
    store = createConfigStore(dir)
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('returns null when no config file exists', () => {
    expect(store.read()).toBeNull()
  })

  it('writes and reads a config round-trip', () => {
    const config: DejaConfig = {
      uid: 'u1',
      layoutId: 'l1',
      auth: { pairingId: 'p1', sessionSecret: 's1' },
    }
    store.write(config)
    expect(store.read()).toEqual(config)
  })

  it('writes the file with 0600 permissions', () => {
    store.write({ uid: 'u1', layoutId: 'l1' })
    const mode = statSync(join(dir, 'config.json')).mode & 0o777
    expect(mode).toBe(0o600)
  })

  it('atomic write replaces previous file', () => {
    store.write({ uid: 'u1', layoutId: 'l1' })
    store.write({ uid: 'u1', layoutId: 'l2' })
    expect(store.read()?.layoutId).toBe('l2')
  })

  it('update merges partial changes onto existing config', () => {
    store.write({ uid: 'u1', layoutId: 'l1' })
    store.update({ layoutId: 'l2' })
    const result = store.read()
    expect(result?.layoutId).toBe('l2')
    expect(result?.uid).toBe('u1')
  })

  it('update creates the file if none exists', () => {
    store.update({ uid: 'u1' })
    expect(existsSync(join(dir, 'config.json'))).toBe(true)
    expect(store.read()?.uid).toBe('u1')
  })

  it('throws a clear error on malformed JSON', () => {
    const fs = require('node:fs') as typeof import('node:fs')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(join(dir, 'config.json'), '{not valid json')
    expect(() => store.read()).toThrow(/config-store: failed to parse/)
  })

  it('exposes path()', () => {
    expect(store.path()).toBe(join(dir, 'config.json'))
  })
})
