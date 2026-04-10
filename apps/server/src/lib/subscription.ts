// apps/server/src/lib/subscription.ts
//
// Subscription validation for the DEJA.js server.
//
// Reads the user's subscription document from Firestore via the Firebase
// **Client** SDK as the signed-in user (the device's authenticated session).
// Caches the result in ~/.deja/config.json so the server can survive a
// 48-hour offline grace period before requiring re-validation.
//
// Replaces the older Admin-SDK-based check that ran with god-mode credentials.
import { doc, getDoc } from 'firebase/firestore'
import type { SubscriptionStatus } from '@repo/modules/plans/types'
import {
  createConfigStore,
  type DejaConfig as StoredDejaConfig,
} from './config-store.js'
import { getDb, getCurrentUser } from './firebase-client.js'
import { log } from '../utils/logger.js'

// --- Types ---

/**
 * Server-side view of `~/.deja/config.json`. Mirrors the shared
 * `DejaConfig` from `./config-store.js` but narrows `uid` to a required
 * string — `readConfig()` guarantees this by throwing
 * `ConfigMissingUid` otherwise.
 */
export interface DejaConfig extends StoredDejaConfig {
  uid: string
  layoutId: string
}

interface CachedSubscription {
  status: SubscriptionStatus | undefined
  plan: string | undefined
  validatedAt: string // ISO 8601
}

interface SubscriptionCheckResult {
  allowed: boolean
  status: SubscriptionStatus | undefined
  plan: string | undefined
}

// --- Constants ---

const ALLOWED_STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  'active',
  'trialing',
  'past_due',
])

const GRACE_PERIOD_MS = 48 * 60 * 60 * 1000 // 48 hours
const RECHECK_INTERVAL_MS = 6 * 60 * 60 * 1000 // 6 hours

// --- Custom Error Classes ---

export type SubscriptionErrorCode =
  | 'ConfigMissing'
  | 'ConfigCorrupt'
  | 'ConfigMissingUid'
  | 'SubscriptionDenied'
  | 'GracePeriodExpired'

export class SubscriptionError extends Error {
  code: SubscriptionErrorCode

  constructor(code: SubscriptionErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = code
  }
}

// --- Config File I/O ---
//
// All disk I/O is delegated to `createConfigStore()` so the layout of
// `~/.deja/config.json` stays consistent across the CLI, the server, and
// any other code that touches it. The store is created lazily so that
// tests using a non-default `DEJA_DIR` (set after import) still work.

function store() {
  return createConfigStore()
}

export async function readConfig(): Promise<DejaConfig> {
  const cs = store()
  let config: StoredDejaConfig | null
  try {
    config = cs.read()
  } catch (err) {
    // Parse failure from createConfigStore — surface as ConfigCorrupt
    throw new SubscriptionError(
      'ConfigCorrupt',
      `Config file at ${cs.path()} contains invalid JSON: ${(err as Error).message}`,
    )
  }

  if (!config) {
    throw new SubscriptionError(
      'ConfigMissing',
      `Config file not found at ${cs.path()}. Run the DEJA install script: curl -fsSL https://install.dejajs.com | bash`,
    )
  }

  if (typeof config.uid !== 'string' || config.uid.length === 0) {
    throw new SubscriptionError(
      'ConfigMissingUid',
      `Config file is missing "uid" field. Re-run the install script: curl -fsSL https://install.dejajs.com | bash`,
    )
  }

  // Narrow: at this point uid is a non-empty string. layoutId may still be
  // missing — older configs allowed it — fall back to empty string so the
  // typed shape is honored. Callers that need a real layoutId go through
  // server-config.ts which has env-var fallbacks.
  return {
    ...config,
    uid: config.uid,
    layoutId: config.layoutId ?? '',
  }
}

export async function writeConfigCache(
  subscription: CachedSubscription,
): Promise<void> {
  const cs = store()
  // The on-disk shape (`DejaSubscriptionCache`) types `status` as a plain
  // `string`; our richer in-memory shape allows `undefined` so we can
  // surface "no status returned by Firestore" in logs. Coerce here so the
  // store's type contract is satisfied.
  cs.update({
    subscription: {
      status: subscription.status ?? 'unknown',
      plan: subscription.plan,
      validatedAt: subscription.validatedAt,
    },
  })
}

// --- Subscription Status Check ---

export function isStatusAllowed(
  status: SubscriptionStatus | undefined,
): boolean {
  if (status === undefined) return false
  return ALLOWED_STATUSES.has(status)
}

/**
 * Read `users/{uid}.subscription` via the Firebase Client SDK as the
 * currently signed-in device user. The caller must have already run
 * `authenticateDevice` + `signInWithDeviceToken` (Tasks 11 & 14) so that
 * `getCurrentUser()` returns a non-null `User`.
 *
 * The `_uid` parameter is preserved purely for call-site compatibility
 * with the older Admin-SDK-based signature; the actual UID used for the
 * Firestore lookup is always taken from the signed-in client user.
 */
export async function checkSubscriptionStatus(
  _uid?: string,
): Promise<SubscriptionCheckResult> {
  const user = getCurrentUser()
  if (!user) {
    throw new Error(
      'subscription: not signed in — call authenticateDevice + signInWithDeviceToken first',
    )
  }

  const db = getDb()
  const ref = doc(db, 'users', user.uid)
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) {
    return { allowed: false, status: undefined, plan: undefined }
  }

  const data = snapshot.data() as
    | { subscription?: { status?: SubscriptionStatus; plan?: string } }
    | undefined
  const status = data?.subscription?.status as SubscriptionStatus | undefined
  const plan = data?.subscription?.plan as string | undefined

  return {
    allowed: isStatusAllowed(status),
    status,
    plan,
  }
}

// --- Grace Period ---

export function isCacheValid(validatedAt: string | undefined): boolean {
  if (!validatedAt) return false
  const timestamp = new Date(validatedAt).getTime()
  if (Number.isNaN(timestamp)) return false
  return Date.now() - timestamp < GRACE_PERIOD_MS
}

// --- Main Orchestrator ---

export async function validateSubscription(): Promise<void> {
  const config = await readConfig()

  try {
    const result = await checkSubscriptionStatus(config.uid)

    if (result.allowed) {
      const cache: CachedSubscription = {
        status: result.status,
        plan: result.plan,
        validatedAt: new Date().toISOString(),
      }
      await writeConfigCache(cache)
      log.success(`Subscription valid: ${result.status} (${result.plan})`)
      return
    }

    // Denied by Firestore
    throw new SubscriptionError(
      'SubscriptionDenied',
      `Subscription inactive (status: ${result.status ?? 'none'}). Visit https://dejajs.com to renew.`,
    )
  } catch (error) {
    // If it's our own error, re-throw
    if (error instanceof SubscriptionError) throw error

    // Network/Firebase failure — try cache fallback
    log.warn('Could not reach Firebase for subscription check — checking cache...')
    const cached = config.subscription as CachedSubscription | undefined

    if (cached && isStatusAllowed(cached.status) && isCacheValid(cached.validatedAt)) {
      log.info(`Using cached subscription: ${cached.status} (validated ${cached.validatedAt})`)
      return
    }

    throw new SubscriptionError(
      'GracePeriodExpired',
      'Cannot verify subscription: Firebase unreachable and cached validation has expired. Connect to the internet and restart.',
    )
  }
}

// --- Periodic Re-check ---

let recheckTimer: ReturnType<typeof setInterval> | null = null

export function startPeriodicRecheck(uid: string): void {
  if (recheckTimer) return

  recheckTimer = setInterval(async () => {
    try {
      const result = await checkSubscriptionStatus(uid)

      if (result.allowed) {
        const cache: CachedSubscription = {
          status: result.status,
          plan: result.plan,
          validatedAt: new Date().toISOString(),
        }
        await writeConfigCache(cache)
        log.info(`Subscription re-check passed: ${result.status}`)
      } else {
        // Denied — warn but do NOT shut down mid-session
        log.warn(
          `Subscription status changed to "${result.status}". ` +
            'Server will continue running but will block on next cold start. ' +
            'Visit https://dejajs.com to renew.',
        )
        await writeConfigCache({
          status: result.status,
          plan: result.plan,
          validatedAt: new Date().toISOString(),
        })
      }
    } catch {
      log.warn('Periodic subscription re-check failed (network error). Will retry in 6 hours.')
    }
  }, RECHECK_INTERVAL_MS)

  // Don't prevent process exit
  recheckTimer.unref()
}

export function stopPeriodicRecheck(): void {
  if (recheckTimer) {
    clearInterval(recheckTimer)
    recheckTimer = null
  }
}
