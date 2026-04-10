// apps/server/src/lib/bootstrap-auth.ts
//
// Startup auth bootstrap for the DEJA.js server.
//
// Reads pairing credentials from ~/.deja/config.json, exchanges them for a
// Firebase custom token via the DEJA Cloud API, and signs in via the
// Firebase Client SDK so all subsequent Firestore/RTDB access runs as the
// user (with Firestore security rules enforced).
//
// Supports a 48-hour offline grace period: if the network is unreachable
// but a recent cached subscription exists, the server boots in degraded
// mode without Firebase (WS only).

import {
  createConfigStore,
  type DejaConfig,
} from './config-store.js'
import {
  authenticateDevice,
  DeviceAuthError,
  type DeviceAuthResult,
} from './device-auth.js'
import {
  initFirebaseClient,
  signInWithDeviceToken,
} from './firebase-client.js'
import { checkSubscriptionStatus } from './subscription.js'
import { log } from '../utils/logger.js'

const GRACE_PERIOD_MS = 48 * 60 * 60 * 1000 // 48 hours

export interface BootstrapAuthResult {
  /** True if the server is running in the offline degraded mode (no Firebase). */
  offline: boolean
  uid: string
  layoutId: string
}

export interface BootstrapAuthDeps {
  /** Override the config store (for testing). */
  configStore?: ReturnType<typeof createConfigStore>
  /** Override authenticateDevice (for testing). */
  authenticate?: typeof authenticateDevice
  /** Override initFirebaseClient (for testing). */
  initClient?: typeof initFirebaseClient
  /** Override signInWithDeviceToken (for testing). */
  signIn?: typeof signInWithDeviceToken
  /** Override checkSubscriptionStatus (for testing). */
  checkSubscription?: typeof checkSubscriptionStatus
  /** Exit function (for testing — defaults to process.exit). */
  exit?: (code: number) => never
}

/** Fatal — log and exit. In tests, `exit` is swapped for a throwing fn. */
function die(exitFn: (code: number) => never, message: string): never {
  log.fatal(message)
  return exitFn(1)
}

function getFirebaseClientConfigFromEnv(): {
  apiKey: string
  authDomain: string
  projectId: string
  databaseURL: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
} {
  const apiKey = process.env.VITE_FIREBASE_API_KEY
  const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID
  const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL

  if (!apiKey || !authDomain || !projectId || !databaseURL) {
    throw new Error(
      'Missing Firebase client config env vars: ' +
        'VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ' +
        'VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_DATABASE_URL are required.',
    )
  }

  return {
    apiKey,
    authDomain,
    projectId,
    databaseURL,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  }
}

/**
 * Run the device-pairing bootstrap. On success, the Firebase Client SDK is
 * initialized and the user is signed in — callers can immediately use
 * `getDb()` / `getRtdb()`. On offline-grace-path success, Firebase is NOT
 * initialized; the caller must guard any cloud-dependent subsystems with
 * `if (!result.offline)`.
 *
 * All unrecoverable error paths call `exit(1)` (overridable for tests).
 */
export async function bootstrapAuth(
  deps: BootstrapAuthDeps = {},
): Promise<BootstrapAuthResult> {
  const {
    configStore = createConfigStore(),
    authenticate = authenticateDevice,
    initClient = initFirebaseClient,
    signIn = signInWithDeviceToken,
    checkSubscription = checkSubscriptionStatus,
    exit = ((code: number) => process.exit(code)) as (code: number) => never,
  } = deps

  log.start('[AUTH] Bootstrapping device authentication...')

  // --- 1. Read config ---
  let config: DejaConfig | null
  try {
    config = configStore.read()
  } catch (err) {
    return die(
      exit,
      `[AUTH] Failed to read ${configStore.path()}: ${(err as Error).message}`,
    )
  }

  if (!config) {
    return die(
      exit,
      `[AUTH] No config file at ${configStore.path()}. Run \`deja login\` to pair this device.`,
    )
  }

  const pairingId = config.auth?.pairingId
  const sessionSecret = config.auth?.sessionSecret
  if (!pairingId || !sessionSecret) {
    return die(
      exit,
      '[AUTH] Device pairing credentials missing from config.json. Run `deja login` to pair this device.',
    )
  }

  const apiUrl = process.env.DEJA_CLOUD_API_URL ?? 'https://cloud.dejajs.com'
  log.info(`[AUTH] Exchanging pairing credentials with ${apiUrl}...`)

  // --- 2. Exchange session secret for custom token ---
  let result: DeviceAuthResult
  try {
    result = await authenticate({ apiUrl, pairingId, sessionSecret })
  } catch (err) {
    if (err instanceof DeviceAuthError) {
      switch (err.code) {
        case 'revoked':
          return die(
            exit,
            '[AUTH] This device pairing has been revoked. Run `deja login` to re-pair.',
          )
        case 'subscription_required':
          return die(
            exit,
            '[AUTH] Subscription is not active. Visit https://cloud.dejajs.com/settings/billing',
          )
        case 'unauthorized':
        case 'not_found':
          return die(
            exit,
            '[AUTH] Device pairing credentials are invalid. Run `deja login` to re-pair.',
          )
        case 'network':
          // Fall through to offline grace path
          return handleOfflineGrace(config, err, exit)
        case 'unknown':
        default:
          return die(exit, `[AUTH] Device authentication failed: ${err.message}`)
      }
    }
    // Non-DeviceAuthError — treat as fatal
    return die(
      exit,
      `[AUTH] Unexpected error during device authentication: ${(err as Error).message}`,
    )
  }

  // --- 3. Init Firebase Client + sign in ---
  try {
    initClient(getFirebaseClientConfigFromEnv())
  } catch (err) {
    return die(
      exit,
      `[AUTH] Failed to initialize Firebase client: ${(err as Error).message}`,
    )
  }

  try {
    await signIn(result.customToken)
  } catch (err) {
    return die(
      exit,
      `[AUTH] Failed to sign in with device token: ${(err as Error).message}`,
    )
  }

  log.success(`[AUTH] Signed in as ${result.uid}`)

  // --- 4. Update cached config ---
  const now = new Date().toISOString()
  try {
    configStore.update({
      uid: result.uid,
      layoutId: result.layoutId ?? config.layoutId,
      subscription: {
        status: result.subscription.status,
        plan: result.subscription.plan ?? undefined,
        validatedAt: now,
      },
    })
  } catch (err) {
    log.warn(
      `[AUTH] Failed to update config cache: ${(err as Error).message}`,
    )
  }

  // --- 5. Refresh subscription cache via Firestore (cross-check + grace bookkeeping) ---
  try {
    const check = await checkSubscription()
    log.info(
      `[AUTH] Subscription check: allowed=${check.allowed} status=${check.status ?? 'unknown'}`,
    )
  } catch (err) {
    log.warn(
      `[AUTH] Subscription post-check failed (non-fatal): ${(err as Error).message}`,
    )
  }

  const layoutId = result.layoutId ?? config.layoutId ?? ''
  return {
    offline: false,
    uid: result.uid,
    layoutId,
  }
}

/**
 * Offline grace path: called when `authenticateDevice` fails with a network
 * error. If we have a recent cached subscription, boot in degraded mode.
 */
function handleOfflineGrace(
  config: DejaConfig,
  err: DeviceAuthError,
  exit: (code: number) => never,
): BootstrapAuthResult {
  log.warn(`[AUTH] Network unreachable: ${err.message}`)

  const cached = config.subscription
  if (!cached) {
    return die(
      exit,
      '[AUTH] No cached subscription available — connect to network and retry.',
    )
  }

  const validatedAtMs = Date.parse(cached.validatedAt)
  if (Number.isNaN(validatedAtMs)) {
    return die(
      exit,
      '[AUTH] Cached subscription has an invalid validatedAt timestamp. Connect to network and retry.',
    )
  }

  const ageMs = Date.now() - validatedAtMs
  if (ageMs > GRACE_PERIOD_MS) {
    return die(
      exit,
      '[AUTH] Cached subscription expired (>48h). Connect to network and retry.',
    )
  }

  const ageHours = (ageMs / (60 * 60 * 1000)).toFixed(1)
  log.warn(
    `[AUTH] Running in offline grace mode. Cached subscription is ${ageHours}h old ` +
      '(expires at 48h). Cloud features disabled until network recovers.',
  )

  const uid = config.uid
  if (!uid) {
    return die(
      exit,
      '[AUTH] Cached config has no uid — cannot run in offline mode. Connect to network and retry.',
    )
  }

  return {
    offline: true,
    uid,
    layoutId: config.layoutId ?? '',
  }
}
