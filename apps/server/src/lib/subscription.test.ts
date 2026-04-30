import { describe, it, expect, vi, beforeEach } from 'vitest'
import { vol } from 'memfs'

// Mock node:fs/promises and node:fs with memfs
vi.mock('node:fs/promises', async () => {
  const memfs = await import('memfs')
  return memfs.fs.promises
})
vi.mock('node:fs', async () => {
  const memfs = await import('memfs')
  return memfs.fs
})

// Mock homedir to a predictable path
vi.mock('node:os', () => ({
  homedir: () => '/home/testuser',
}))

// Mock Firebase Admin SDK
vi.mock('@repo/firebase-config/firebase-user-node', () => ({
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
      })),
    })),
  },
}))

// Mock logger
vi.mock('../utils/logger', () => ({
  log: {
    start: vi.fn(), success: vi.fn(), error: vi.fn(), warn: vi.fn(),
    fatal: vi.fn(), note: vi.fn(), info: vi.fn(), debug: vi.fn(),
    await: vi.fn(), complete: vi.fn(), star: vi.fn(),
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
} from './subscription'
import { db } from '@repo/firebase-config/firebase-user-node'

// --- Task 2: Config file read/write ---

describe('readConfig', () => {
  beforeEach(() => { vol.reset() })

  it('returns config when file exists and is valid', async () => {
    vol.fromJSON({
      '/home/testuser/.deja/config.json': JSON.stringify({
        uid: 'user-123',
        layoutId: 'my-layout',
      }),
    })
    const config = await readConfig()
    expect(config.uid).toBe('user-123')
    expect(config.layoutId).toBe('my-layout')
  })

  it('throws ConfigMissing when file does not exist', async () => {
    vol.fromJSON({})
    await expect(readConfig()).rejects.toMatchObject({ code: 'ConfigMissing' })
  })

  it('throws ConfigCorrupt when file contains invalid JSON', async () => {
    vol.fromJSON({
      '/home/testuser/.deja/config.json': 'not json {{{',
    })
    await expect(readConfig()).rejects.toMatchObject({ code: 'ConfigCorrupt' })
  })

  it('throws ConfigMissingUid when uid field is absent', async () => {
    vol.fromJSON({
      '/home/testuser/.deja/config.json': JSON.stringify({ layoutId: 'x' }),
    })
    await expect(readConfig()).rejects.toMatchObject({ code: 'ConfigMissingUid' })
  })
})

describe('writeConfigCache', () => {
  beforeEach(() => { vol.reset() })

  it('writes subscription cache to existing config', async () => {
    vol.fromJSON({
      '/home/testuser/.deja/config.json': JSON.stringify({
        uid: 'user-123',
        layoutId: 'my-layout',
      }),
    })
    await writeConfigCache({ subscription: { status: 'active', plan: 'engineer', validatedAt: '2026-03-12T10:00:00Z' } })
    const raw = vol.readFileSync('/home/testuser/.deja/config.json', 'utf8') as string
    const config = JSON.parse(raw)
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
  it('denies incomplete_expired', () => expect(isStatusAllowed('incomplete_expired')).toBe(false))
  it('denies undefined', () => expect(isStatusAllowed(undefined)).toBe(false))
})

describe('checkSubscriptionStatus', () => {
  it('returns allowed for active subscription', async () => {
    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        subscription: { status: 'active', plan: 'engineer' },
      }),
    })
    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    } as any)

    const result = await checkSubscriptionStatus('user-123')
    expect(result).toEqual({ allowed: true, status: 'active', plan: 'engineer' })
  })

  it('returns denied for canceled subscription', async () => {
    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        subscription: { status: 'canceled', plan: 'engineer' },
      }),
    })
    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    } as any)

    const result = await checkSubscriptionStatus('user-123')
    expect(result).toEqual({ allowed: false, status: 'canceled', plan: 'engineer' })
  })

  it('returns denied when user document does not exist', async () => {
    const mockGet = vi.fn().mockResolvedValue({ exists: false })
    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    } as any)

    const result = await checkSubscriptionStatus('user-123')
    expect(result).toEqual({ allowed: false, status: undefined, plan: undefined })
  })

  it('throws on network error', async () => {
    const mockGet = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    } as any)

    // Raw Error propagation (not SubscriptionError) — don't match on message string
    await expect(checkSubscriptionStatus('user-123')).rejects.toThrow()
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
  beforeEach(() => { vol.reset() })

  it('allows when Firestore returns active', async () => {
    vol.fromJSON({
      '/home/testuser/.deja/config.json': JSON.stringify({ uid: 'user-123', layoutId: 'test' }),
    })
    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ subscription: { status: 'active', plan: 'engineer' } }),
    })
    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    } as any)

    await expect(validateSubscription()).resolves.not.toThrow()
  })

  it('exits with SubscriptionDenied when status is canceled', async () => {
    vol.fromJSON({
      '/home/testuser/.deja/config.json': JSON.stringify({ uid: 'user-123', layoutId: 'test' }),
    })
    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ subscription: { status: 'canceled', plan: 'engineer' } }),
    })
    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    } as any)

    await expect(validateSubscription()).rejects.toMatchObject({ code: 'SubscriptionDenied' })
  })

  it('uses cache when Firestore is unreachable and cache is fresh', async () => {
    vol.fromJSON({
      '/home/testuser/.deja/config.json': JSON.stringify({
        uid: 'user-123',
        layoutId: 'test',
        subscription: {
          status: 'active',
          plan: 'engineer',
          validatedAt: new Date().toISOString(),
        },
      }),
    })
    const mockGet = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    } as any)

    await expect(validateSubscription()).resolves.not.toThrow()
  })

  it('exits with GracePeriodExpired when cache is stale and Firestore is unreachable', async () => {
    vol.fromJSON({
      '/home/testuser/.deja/config.json': JSON.stringify({
        uid: 'user-123',
        layoutId: 'test',
        subscription: {
          status: 'active',
          plan: 'engineer',
          validatedAt: new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString(),
        },
      }),
    })
    const mockGet = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    } as any)

    await expect(validateSubscription()).rejects.toMatchObject({ code: 'GracePeriodExpired' })
  })

  it('throws GracePeriodExpired when cache has denied status and Firestore is unreachable', async () => {
    vol.fromJSON({
      '/home/testuser/.deja/config.json': JSON.stringify({
        uid: 'user-123',
        layoutId: 'test',
        subscription: {
          status: 'canceled',
          plan: 'engineer',
          validatedAt: new Date().toISOString(), // fresh cache, but denied status
        },
      }),
    })
    const mockGet = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    } as any)

    // Even with fresh cache, denied status means no fallback
    await expect(validateSubscription()).rejects.toMatchObject({ code: 'GracePeriodExpired' })
  })
})
