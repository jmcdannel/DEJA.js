// apps/server/src/lib/subscription.ts
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { SubscriptionStatus } from '@repo/modules/plans/types'
import { db } from '@repo/firebase-config/firebase-user-node'
import { log } from '../utils/logger.js'

// --- Types ---

interface CachedSubscription {
  status: SubscriptionStatus | undefined
  plan: string | undefined
  validatedAt: string // ISO 8601
}

export interface DejaConfig {
  uid: string
  layoutId: string
  refreshToken?: string
  serverId?: string
  subscription?: CachedSubscription
  onboardingComplete?: boolean
  mqtt?: {
    enabled?: boolean
    broker?: string
    port?: number
  }
  ws?: {
    enabled?: boolean
    port?: number
    id?: string
  }
  cloud?: {
    enabled?: boolean
  }
  audio?: {
    cacheSizeMb?: number
    cacheDir?: string
  }
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

function getConfigPath(): string {
  return join(homedir(), '.deja', 'config.json')
}

// --- Custom Error Classes ---

export class SubscriptionError extends Error {
  code: 'ConfigMissing' | 'ConfigCorrupt' | 'ConfigMissingUid' | 'SubscriptionDenied' | 'GracePeriodExpired'

  constructor(
    code: 'ConfigMissing' | 'ConfigCorrupt' | 'ConfigMissingUid' | 'SubscriptionDenied' | 'GracePeriodExpired',
    message: string,
  ) {
    super(message)
    this.code = code
    this.name = code
  }
}

// --- Config File I/O ---

export async function readConfig(): Promise<DejaConfig> {
  const configPath = getConfigPath()

  if (!existsSync(configPath)) {
    throw new SubscriptionError(
      'ConfigMissing',
      `Config file not found at ${configPath}. Run the DEJA install script: curl -fsSL https://install.dejajs.com | bash`,
    )
  }

  let raw: string
  try {
    raw = await readFile(configPath, 'utf8')
  } catch {
    throw new SubscriptionError('ConfigMissing', `Cannot read config file at ${configPath}`)
  }

  let config: Record<string, unknown>
  try {
    config = JSON.parse(raw) as Record<string, unknown>
  } catch {
    throw new SubscriptionError('ConfigCorrupt', `Config file at ${configPath} contains invalid JSON`)
  }

  if (typeof config.uid !== 'string' || config.uid.length === 0) {
    throw new SubscriptionError(
      'ConfigMissingUid',
      `Config file is missing "uid" field. Re-run the install script: curl -fsSL https://install.dejajs.com | bash`,
    )
  }

  return config as unknown as DejaConfig
}

export async function writeConfigCache(subscription: CachedSubscription): Promise<void> {
  const configPath = getConfigPath()
  const raw = await readFile(configPath, 'utf8')
  const config = JSON.parse(raw) as DejaConfig
  config.subscription = subscription
  const dir = join(homedir(), '.deja')
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf8')
}

// --- Subscription Status Check ---

export function isStatusAllowed(status: SubscriptionStatus | undefined): boolean {
  if (status === undefined) return false
  return ALLOWED_STATUSES.has(status)
}

export async function checkSubscriptionStatus(uid: string): Promise<SubscriptionCheckResult> {
  const docRef = db.collection('users').doc(uid)
  const snapshot = await docRef.get()

  if (!snapshot.exists) {
    return { allowed: false, status: undefined, plan: undefined }
  }

  const data = snapshot.data()
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
    const cached = config.subscription

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
