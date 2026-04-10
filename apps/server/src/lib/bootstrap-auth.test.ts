import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock logger before importing bootstrap-auth
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

import { bootstrapAuth } from './bootstrap-auth.js'
import { DeviceAuthError, type DeviceAuthResult } from './device-auth.js'
import type { DejaConfig } from './config-store.js'
import type { SubscriptionStatus } from '@repo/modules/plans/types'

// --- Helpers to build dep overrides ---

interface MockDeps {
  config: DejaConfig | null
  authResult?: DeviceAuthResult
  authError?: DeviceAuthError | Error
  checkSubscriptionResult?: { allowed: boolean; status: SubscriptionStatus | undefined; plan: string | undefined }
  checkSubscriptionError?: Error
}

class ExitCalled extends Error {
  code: number
  constructor(code: number) {
    super(`process.exit(${code})`)
    this.code = code
  }
}

function makeDeps(mock: MockDeps) {
  const updateFn = vi.fn()
  const writeFn = vi.fn()
  const readFn = vi.fn(() => mock.config)

  const configStore = {
    read: readFn,
    write: writeFn,
    update: updateFn,
    path: () => '/tmp/fake/config.json',
  }

  const authenticate = vi.fn(async () => {
    if (mock.authError) throw mock.authError
    return mock.authResult!
  })

  const initClient = vi.fn()
  const signIn = vi.fn(async () => ({} as never))

  const checkSubscription = vi.fn(async () => {
    if (mock.checkSubscriptionError) throw mock.checkSubscriptionError
    return (
      mock.checkSubscriptionResult ?? {
        allowed: true,
        status: 'active' as SubscriptionStatus,
        plan: 'pro' as string | undefined,
      }
    )
  })

  const exit = vi.fn((code: number) => {
    throw new ExitCalled(code)
  }) as unknown as (code: number) => never

  return {
    deps: { configStore, authenticate, initClient, signIn, checkSubscription, exit },
    spies: { updateFn, authenticate, initClient, signIn, checkSubscription, exit },
  }
}

const FRESH_CACHE = {
  status: 'active',
  plan: 'pro',
  validatedAt: new Date().toISOString(),
}

const STALE_CACHE = {
  status: 'active',
  plan: 'pro',
  validatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 72h old
}

const VALID_AUTH_CONFIG: DejaConfig = {
  uid: 'cached-uid',
  layoutId: 'cached-layout',
  auth: {
    pairingId: 'pair-1',
    sessionSecret: 'secret-1',
  },
}

// --- Env setup ---
beforeEach(() => {
  process.env.VITE_FIREBASE_API_KEY = 'fake-api-key'
  process.env.VITE_FIREBASE_AUTH_DOMAIN = 'fake.firebaseapp.com'
  process.env.VITE_FIREBASE_PROJECT_ID = 'fake-project'
  process.env.VITE_FIREBASE_DATABASE_URL = 'https://fake.firebaseio.com'
  process.env.DEJA_CLOUD_API_URL = 'https://cloud.test.dejajs.com'
  vi.clearAllMocks()
})

describe('bootstrapAuth', () => {
  // --- Fatal error branches ---

  it('exits fatal when no config file exists', async () => {
    const { deps, spies } = makeDeps({ config: null })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
    expect(spies.authenticate).not.toHaveBeenCalled()
  })

  it('exits fatal when pairing credentials are missing', async () => {
    const { deps, spies } = makeDeps({
      config: { uid: 'x', layoutId: 'y' }, // no auth field
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
    expect(spies.authenticate).not.toHaveBeenCalled()
  })

  it('exits fatal on `revoked` error code', async () => {
    const { deps, spies } = makeDeps({
      config: VALID_AUTH_CONFIG,
      authError: new DeviceAuthError('revoked', 'revoked', 403),
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
    expect(spies.initClient).not.toHaveBeenCalled()
  })

  it('exits fatal on `unauthorized` error code', async () => {
    const { deps, spies } = makeDeps({
      config: VALID_AUTH_CONFIG,
      authError: new DeviceAuthError('bad creds', 'unauthorized', 401),
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
    expect(spies.initClient).not.toHaveBeenCalled()
  })

  it('exits fatal on `not_found` error code', async () => {
    const { deps, spies } = makeDeps({
      config: VALID_AUTH_CONFIG,
      authError: new DeviceAuthError('nope', 'not_found', 404),
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
    expect(spies.initClient).not.toHaveBeenCalled()
  })

  it('exits fatal on `subscription_required` error code', async () => {
    const { deps, spies } = makeDeps({
      config: VALID_AUTH_CONFIG,
      authError: new DeviceAuthError('billing', 'subscription_required', 402),
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
    expect(spies.initClient).not.toHaveBeenCalled()
  })

  it('exits fatal on `unknown` error code', async () => {
    const { deps, spies } = makeDeps({
      config: VALID_AUTH_CONFIG,
      authError: new DeviceAuthError('boom', 'unknown', 500),
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
    expect(spies.initClient).not.toHaveBeenCalled()
  })

  // --- Network / offline grace path ---

  it('exits fatal on network error with no cached subscription', async () => {
    const { deps, spies } = makeDeps({
      config: VALID_AUTH_CONFIG, // no subscription field
      authError: new DeviceAuthError('offline', 'network'),
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
  })

  it('exits fatal on network error with stale cached subscription (>48h)', async () => {
    const { deps, spies } = makeDeps({
      config: { ...VALID_AUTH_CONFIG, subscription: STALE_CACHE },
      authError: new DeviceAuthError('offline', 'network'),
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
  })

  it('returns offline=true on network error with fresh cached subscription', async () => {
    const { deps, spies } = makeDeps({
      config: { ...VALID_AUTH_CONFIG, subscription: FRESH_CACHE },
      authError: new DeviceAuthError('offline', 'network'),
    })
    const result = await bootstrapAuth(deps)
    expect(result.offline).toBe(true)
    expect(result.uid).toBe('cached-uid')
    expect(result.layoutId).toBe('cached-layout')
    expect(spies.initClient).not.toHaveBeenCalled()
    expect(spies.signIn).not.toHaveBeenCalled()
  })

  it('exits fatal on offline grace with cached subscription but no cached uid', async () => {
    const { deps, spies } = makeDeps({
      config: {
        layoutId: 'x',
        auth: VALID_AUTH_CONFIG.auth,
        subscription: FRESH_CACHE,
      },
      authError: new DeviceAuthError('offline', 'network'),
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
  })

  // --- Happy path ---

  it('returns offline=false and signs in on successful auth', async () => {
    const { deps, spies } = makeDeps({
      config: VALID_AUTH_CONFIG,
      authResult: {
        customToken: 'tok-123',
        uid: 'new-uid',
        layoutId: 'new-layout',
        subscription: { status: 'active', plan: 'pro' },
      },
    })
    const result = await bootstrapAuth(deps)

    expect(result.offline).toBe(false)
    expect(result.uid).toBe('new-uid')
    expect(result.layoutId).toBe('new-layout')

    expect(spies.authenticate).toHaveBeenCalledWith({
      apiUrl: 'https://cloud.test.dejajs.com',
      pairingId: 'pair-1',
      sessionSecret: 'secret-1',
    })
    expect(spies.initClient).toHaveBeenCalledOnce()
    expect(spies.signIn).toHaveBeenCalledWith('tok-123')
    expect(spies.checkSubscription).toHaveBeenCalled()

    // Config cache was updated with new uid + layoutId + subscription
    expect(spies.updateFn).toHaveBeenCalledOnce()
    const updatePayload = spies.updateFn.mock.calls[0][0] as DejaConfig
    expect(updatePayload.uid).toBe('new-uid')
    expect(updatePayload.layoutId).toBe('new-layout')
    expect(updatePayload.subscription?.status).toBe('active')
  })

  it('happy path tolerates null layoutId from auth result', async () => {
    const { deps } = makeDeps({
      config: VALID_AUTH_CONFIG,
      authResult: {
        customToken: 'tok',
        uid: 'uid',
        layoutId: null,
        subscription: { status: 'trialing' },
      },
    })
    const result = await bootstrapAuth(deps)
    expect(result.offline).toBe(false)
    // Falls back to cached layoutId
    expect(result.layoutId).toBe('cached-layout')
  })

  it('happy path proceeds even if post-auth subscription check throws', async () => {
    const { deps, spies } = makeDeps({
      config: VALID_AUTH_CONFIG,
      authResult: {
        customToken: 'tok',
        uid: 'uid',
        layoutId: 'layout',
        subscription: { status: 'active', plan: 'pro' },
      },
      checkSubscriptionError: new Error('firestore unreachable'),
    })
    const result = await bootstrapAuth(deps)
    expect(result.offline).toBe(false)
    expect(spies.checkSubscription).toHaveBeenCalled()
  })

  it('exits fatal when Firebase env vars are missing', async () => {
    delete process.env.VITE_FIREBASE_API_KEY
    const { deps, spies } = makeDeps({
      config: VALID_AUTH_CONFIG,
      authResult: {
        customToken: 'tok',
        uid: 'uid',
        layoutId: 'layout',
        subscription: { status: 'active', plan: 'pro' },
      },
    })
    await expect(bootstrapAuth(deps)).rejects.toBeInstanceOf(ExitCalled)
    expect(spies.exit).toHaveBeenCalledWith(1)
  })
})
