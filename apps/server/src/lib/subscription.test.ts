import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// --- Mock firebase-client (Client SDK wrapper) ---
//
// We control the signed-in user and the Firestore handle from the test
// instead of standing up a real Firebase app.
const mockGetCurrentUser = vi.fn()
const mockGetDb = vi.fn(() => ({} as unknown as object))

vi.mock('./firebase-client.js', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  getDb: () => mockGetDb(),
}))

// --- Mock firebase/firestore ---
//
// `subscription.ts` only uses `doc` and `getDoc` from firestore. We swap
// them with vi.fn()s so each test can control what `getDoc` returns.
const mockGetDoc = vi.fn()
const mockDoc = vi.fn(() => ({} as unknown as object))

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc.apply(null, args as []),
  getDoc: (...args: unknown[]) => mockGetDoc.apply(null, args as []),
}))

// Mock logger
vi.mock('../utils/logger.js', () => ({
  log: {
    start: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    fatal: vi.fn(),
    note: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    await: vi.fn(),
    complete: vi.fn(),
    star: vi.fn(),
  },
}))

import {
  readConfig,
  writeConfigCache,
  isStatusAllowed,
  checkSubscriptionStatus,
  isCacheValid,
  validateSubscription,
  SubscriptionError,
} from './subscription.js'

// --- Helpers ---

let dir: string
const configPath = () => join(dir, 'config.json')

function writeConfigFile(contents: unknown | string) {
  mkdirSync(dir, { recursive: true })
  const raw =
    typeof contents === 'string' ? contents : JSON.stringify(contents)
  writeFileSync(configPath(), raw)
}

function readConfigFile(): Record<string, unknown> {
  return JSON.parse(readFileSync(configPath(), 'utf8')) as Record<string, unknown>
}

function setSignedInUser(uid: string) {
  mockGetCurrentUser.mockReturnValue({ uid })
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'deja-subscription-test-'))
  process.env.DEJA_DIR = dir
  vi.clearAllMocks()
  // Default: a signed-in user is available
  setSignedInUser('user-123')
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
  delete process.env.DEJA_DIR
})

// --- Task 2: Config file read/write ---

describe('readConfig', () => {
  it('returns config when file exists and is valid', async () => {
    writeConfigFile({ uid: 'user-123', layoutId: 'my-layout' })
    const config = await readConfig()
    expect(config.uid).toBe('user-123')
    expect(config.layoutId).toBe('my-layout')
  })

  it('throws ConfigMissing when file does not exist', async () => {
    await expect(readConfig()).rejects.toMatchObject({ code: 'ConfigMissing' })
  })

  it('throws ConfigCorrupt when file contains invalid JSON', async () => {
    writeConfigFile('not json {{{')
    await expect(readConfig()).rejects.toMatchObject({ code: 'ConfigCorrupt' })
  })

  it('throws ConfigMissingUid when uid field is absent', async () => {
    writeConfigFile({ layoutId: 'x' })
    await expect(readConfig()).rejects.toMatchObject({ code: 'ConfigMissingUid' })
  })
})

describe('writeConfigCache', () => {
  it('writes subscription cache to existing config', async () => {
    writeConfigFile({ uid: 'user-123', layoutId: 'my-layout' })
    await writeConfigCache({
      status: 'active',
      plan: 'engineer',
      validatedAt: '2026-03-12T10:00:00Z',
    })
    const config = readConfigFile() as {
      subscription: { status: string; plan: string; validatedAt: string }
    }
    expect(config.subscription.status).toBe('active')
    expect(config.subscription.plan).toBe('engineer')
    expect(config.subscription.validatedAt).toBe('2026-03-12T10:00:00Z')
  })
})

// --- Task 3: Firestore subscription check ---

describe('isStatusAllowed', () => {
  it('allows active', () => expect(isStatusAllowed('active')).toBe(true))
  it('allows trialing', () => expect(isStatusAllowed('trialing')).toBe(true))
  it('allows past_due', () => expect(isStatusAllowed('past_due')).toBe(true))
  it('denies canceled', () => expect(isStatusAllowed('canceled')).toBe(false))
  it('denies unpaid', () => expect(isStatusAllowed('unpaid')).toBe(false))
  it('denies incomplete', () => expect(isStatusAllowed('incomplete')).toBe(false))
  it('denies incomplete_expired', () =>
    expect(isStatusAllowed('incomplete_expired')).toBe(false))
  it('denies undefined', () => expect(isStatusAllowed(undefined)).toBe(false))
})

describe('checkSubscriptionStatus', () => {
  it('returns allowed for active subscription', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        subscription: { status: 'active', plan: 'engineer' },
      }),
    })
    const result = await checkSubscriptionStatus('user-123')
    expect(result).toEqual({ allowed: true, status: 'active', plan: 'engineer' })
  })

  it('returns denied for canceled subscription', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        subscription: { status: 'canceled', plan: 'engineer' },
      }),
    })
    const result = await checkSubscriptionStatus('user-123')
    expect(result).toEqual({ allowed: false, status: 'canceled', plan: 'engineer' })
  })

  it('returns denied when user document does not exist', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false })
    const result = await checkSubscriptionStatus('user-123')
    expect(result).toEqual({ allowed: false, status: undefined, plan: undefined })
  })

  it('throws on network error', async () => {
    mockGetDoc.mockRejectedValue(new Error('Network error'))
    await expect(checkSubscriptionStatus('user-123')).rejects.toThrow()
  })

  it('throws a clear error when no user is signed in', async () => {
    mockGetCurrentUser.mockReturnValue(null)
    await expect(checkSubscriptionStatus('user-123')).rejects.toThrow(/not signed in/)
  })

  it('uses the signed-in user uid for the Firestore lookup', async () => {
    setSignedInUser('signed-in-uid')
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { status: 'active', plan: 'engineer' } }),
    })
    await checkSubscriptionStatus('ignored-uid')
    // doc(db, 'users', '<uid>') was called with the signed-in uid, not the arg
    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'users', 'signed-in-uid')
  })
})

// --- Task 4: Grace period ---

describe('isCacheValid', () => {
  it('returns true when cache is within grace period', () => {
    const recentTimestamp = new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    expect(isCacheValid(recentTimestamp)).toBe(true)
  })

  it('returns false when cache is older than 48 hours', () => {
    const oldTimestamp = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString() // 49 hours ago
    expect(isCacheValid(oldTimestamp)).toBe(false)
  })

  it('returns false for undefined timestamp', () => {
    expect(isCacheValid(undefined)).toBe(false)
  })

  it('returns false for invalid date string', () => {
    expect(isCacheValid('not-a-date')).toBe(false)
  })
})

// --- Task 5: validateSubscription orchestrator ---

describe('validateSubscription', () => {
  it('allows when Firestore returns active', async () => {
    writeConfigFile({ uid: 'user-123', layoutId: 'test' })
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { status: 'active', plan: 'engineer' } }),
    })
    await expect(validateSubscription()).resolves.not.toThrow()
  })

  it('exits with SubscriptionDenied when status is canceled', async () => {
    writeConfigFile({ uid: 'user-123', layoutId: 'test' })
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ subscription: { status: 'canceled', plan: 'engineer' } }),
    })
    await expect(validateSubscription()).rejects.toMatchObject({
      code: 'SubscriptionDenied',
    })
  })

  it('uses cache when Firestore is unreachable and cache is fresh', async () => {
    writeConfigFile({
      uid: 'user-123',
      layoutId: 'test',
      subscription: {
        status: 'active',
        plan: 'engineer',
        validatedAt: new Date().toISOString(),
      },
    })
    mockGetDoc.mockRejectedValue(new Error('Network error'))
    await expect(validateSubscription()).resolves.not.toThrow()
  })

  it('exits with GracePeriodExpired when cache is stale and Firestore is unreachable', async () => {
    writeConfigFile({
      uid: 'user-123',
      layoutId: 'test',
      subscription: {
        status: 'active',
        plan: 'engineer',
        validatedAt: new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString(),
      },
    })
    mockGetDoc.mockRejectedValue(new Error('Network error'))
    await expect(validateSubscription()).rejects.toMatchObject({
      code: 'GracePeriodExpired',
    })
  })

  it('throws GracePeriodExpired when cache has denied status and Firestore is unreachable', async () => {
    writeConfigFile({
      uid: 'user-123',
      layoutId: 'test',
      subscription: {
        status: 'canceled',
        plan: 'engineer',
        validatedAt: new Date().toISOString(), // fresh cache, but denied status
      },
    })
    mockGetDoc.mockRejectedValue(new Error('Network error'))
    // Even with fresh cache, denied status means no fallback
    await expect(validateSubscription()).rejects.toMatchObject({
      code: 'GracePeriodExpired',
    })
  })

  it('surfaces SubscriptionError for missing config without touching Firestore', async () => {
    // No config file written
    await expect(validateSubscription()).rejects.toBeInstanceOf(SubscriptionError)
    expect(mockGetDoc).not.toHaveBeenCalled()
  })
})
