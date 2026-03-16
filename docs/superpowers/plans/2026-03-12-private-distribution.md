# Private Distribution Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the DEJA.js server from source distribution to private Docker image distribution with subscription validation, install scripts, and CI/CD.

**Architecture:** The server validates subscriptions via Firebase Admin SDK on startup and periodically, caches results locally with a 48-hour grace period, and runs as a Docker container pulled from private GHCR. Users install via a curl one-liner that handles Docker setup, auth, and serial port detection.

**Tech Stack:** Docker (multi-arch), tsup (ESM bundler), Firebase Admin SDK, GitHub Container Registry, GitHub Actions (Buildx + QEMU), Bash (install script)

**Spec:** `docs/superpowers/specs/2026-03-12-private-distribution-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `apps/server/src/lib/subscription.ts` | Subscription validation, config file I/O, caching, grace period, periodic re-check |
| `apps/server/src/lib/subscription.test.ts` | Unit tests for subscription module |
| `apps/server/tsup.config.ts` | tsup bundler configuration for standalone ESM output |
| `apps/server/Dockerfile` | Multi-stage Docker build (build → runtime) |
| `.dockerignore` | Docker build context exclusions (at repo root, not apps/server/) |
| `scripts/install.sh` | User-facing install script (platform detection, Docker, auth, serial) |
| `scripts/deja-cli.sh` | CLI wrapper (`deja update`, `deja logs`, `deja status`, etc.) |
| `.github/workflows/release-server.yml` | CI: build + push multi-arch Docker image on tag |

### Modified Files

| File | Change |
|------|--------|
| `apps/server/index.ts` | Add subscription validation call before subsystem startup; fix `ENABLE_WS` bug |
| `apps/server/package.json` | Move `firebase-admin` and `mqtt` from devDependencies to dependencies; add `tsup` dev dependency; add `build:docker` script |
| `packages/modules/package.json` | Add `"./plans/types"` export so server can import `SubscriptionStatus` without pulling in Vue deps |

---

## Chunk 1: Server Subscription Validation

### Task 1: Create subscription types and config interfaces

**Files:**
- Modify: `packages/modules/package.json` (add plans/types export)
- Create: `apps/server/src/lib/subscription.ts`
- Test: `apps/server/src/lib/subscription.test.ts`

- [ ] **Step 0: Add `./plans/types` export to `@repo/modules`**

In `packages/modules/package.json`, add to the `exports` field:

```json
"./plans/types": "./plans/types.ts"
```

This allows the server to import `SubscriptionStatus` without pulling in the full `@repo/modules` root (which re-exports Vue composables like `useSubscription` that depend on `vue`, `vuefire`, etc. and would break in a Node-only context).

- [ ] **Step 1: Create the subscription module with types and constants**

```typescript
// apps/server/src/lib/subscription.ts
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { SubscriptionStatus } from '@repo/modules/plans/types'
import { log } from '../utils/logger.js'

// --- Types ---

interface CachedSubscription {
  status: SubscriptionStatus | undefined
  plan: string | undefined
  validatedAt: string // ISO 8601
}

interface DejaConfig {
  uid: string
  layoutId: string
  subscription?: CachedSubscription
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
```

- [ ] **Step 2: Commit types and constants skeleton**

```bash
git add packages/modules/package.json apps/server/src/lib/subscription.ts
git commit -m "feat(server): add subscription module skeleton with types and constants"
```

---

### Task 2: Config file read/write with validation

**Files:**
- Modify: `apps/server/src/lib/subscription.ts`
- Create: `apps/server/src/lib/subscription.test.ts`

- [ ] **Step 3: Write failing tests for config file operations**

```typescript
// apps/server/src/lib/subscription.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
vi.mock('@repo/firebase-config/firebase-admin-node', () => ({
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

import { readConfig, writeConfigCache } from './subscription'

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
    await writeConfigCache({ status: 'active', plan: 'engineer', validatedAt: '2026-03-12T10:00:00Z' })
    const raw = vol.readFileSync('/home/testuser/.deja/config.json', 'utf8') as string
    const config = JSON.parse(raw)
    expect(config.subscription.status).toBe('active')
    expect(config.subscription.plan).toBe('engineer')
    expect(config.subscription.validatedAt).toBe('2026-03-12T10:00:00Z')
  })
})
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd apps/server && pnpm vitest run src/lib/subscription.test.ts`
Expected: FAIL — `readConfig` and `writeConfigCache` not exported yet

- [ ] **Step 5: Add memfs dev dependency**

Run: `cd apps/server && pnpm add -D memfs`

- [ ] **Step 6: Implement readConfig and writeConfigCache**

Add to `apps/server/src/lib/subscription.ts`:

```typescript
// --- Custom Error Classes ---

export class SubscriptionError extends Error {
  constructor(
    public code: 'ConfigMissing' | 'ConfigCorrupt' | 'ConfigMissingUid' | 'SubscriptionDenied' | 'GracePeriodExpired',
    message: string,
  ) {
    super(message)
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
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd apps/server && pnpm vitest run src/lib/subscription.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add apps/server/src/lib/subscription.ts apps/server/src/lib/subscription.test.ts apps/server/package.json
git commit -m "feat(server): add config file read/write with validation and tests"
```

---

### Task 3: Firestore subscription check

**Files:**
- Modify: `apps/server/src/lib/subscription.ts`
- Modify: `apps/server/src/lib/subscription.test.ts`

- [ ] **Step 9: Write failing tests for Firestore validation**

Add to `apps/server/src/lib/subscription.test.ts`:

```typescript
import { db } from '@repo/firebase-config/firebase-admin-node'
import { checkSubscriptionStatus, isStatusAllowed } from './subscription'

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
```

- [ ] **Step 10: Run tests to verify they fail**

Run: `cd apps/server && pnpm vitest run src/lib/subscription.test.ts`
Expected: FAIL — `checkSubscriptionStatus` and `isStatusAllowed` not exported

- [ ] **Step 11: Implement Firestore subscription check**

Add to `apps/server/src/lib/subscription.ts`:

```typescript
import { db } from '@repo/firebase-config/firebase-admin-node'

interface SubscriptionCheckResult {
  allowed: boolean
  status: SubscriptionStatus | undefined
  plan: string | undefined
}

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
```

- [ ] **Step 12: Run tests to verify they pass**

Run: `cd apps/server && pnpm vitest run src/lib/subscription.test.ts`
Expected: PASS

- [ ] **Step 13: Commit**

```bash
git add apps/server/src/lib/subscription.ts apps/server/src/lib/subscription.test.ts
git commit -m "feat(server): add Firestore subscription status check with tests"
```

---

### Task 4: Grace period and cache fallback logic

**Files:**
- Modify: `apps/server/src/lib/subscription.ts`
- Modify: `apps/server/src/lib/subscription.test.ts`

- [ ] **Step 14: Write failing tests for grace period**

Add to `apps/server/src/lib/subscription.test.ts`:

```typescript
import { isCacheValid } from './subscription'

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
```

- [ ] **Step 15: Run tests to verify they fail**

Run: `cd apps/server && pnpm vitest run src/lib/subscription.test.ts`
Expected: FAIL — `isCacheValid` not exported

- [ ] **Step 16: Implement grace period check**

Add to `apps/server/src/lib/subscription.ts`:

```typescript
export function isCacheValid(validatedAt: string | undefined): boolean {
  if (!validatedAt) return false
  const timestamp = new Date(validatedAt).getTime()
  if (Number.isNaN(timestamp)) return false
  return Date.now() - timestamp < GRACE_PERIOD_MS
}
```

- [ ] **Step 17: Run tests to verify they pass**

Run: `cd apps/server && pnpm vitest run src/lib/subscription.test.ts`
Expected: PASS

- [ ] **Step 18: Commit**

```bash
git add apps/server/src/lib/subscription.ts apps/server/src/lib/subscription.test.ts
git commit -m "feat(server): add grace period cache validation"
```

---

### Task 5: Main validateSubscription orchestrator

**Files:**
- Modify: `apps/server/src/lib/subscription.ts`
- Modify: `apps/server/src/lib/subscription.test.ts`

- [ ] **Step 19: Write failing tests for validateSubscription**

Add to `apps/server/src/lib/subscription.test.ts`:

```typescript
import { validateSubscription, SubscriptionError } from './subscription'

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
```

- [ ] **Step 20: Run tests to verify they fail**

Run: `cd apps/server && pnpm vitest run src/lib/subscription.test.ts`
Expected: FAIL — `validateSubscription` not exported

- [ ] **Step 21: Implement validateSubscription**

Add to `apps/server/src/lib/subscription.ts`:

```typescript
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
```

- [ ] **Step 22: Run tests to verify they pass**

Run: `cd apps/server && pnpm vitest run src/lib/subscription.test.ts`
Expected: PASS

- [ ] **Step 23: Commit**

```bash
git add apps/server/src/lib/subscription.ts apps/server/src/lib/subscription.test.ts
git commit -m "feat(server): add validateSubscription orchestrator with cache fallback"
```

---

### Task 6: Periodic re-check timer

**Files:**
- Modify: `apps/server/src/lib/subscription.ts`

- [ ] **Step 24: Add startPeriodicRecheck and stopPeriodicRecheck**

Add to `apps/server/src/lib/subscription.ts`:

```typescript
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
```

- [ ] **Step 25: Commit**

```bash
git add apps/server/src/lib/subscription.ts
git commit -m "feat(server): add periodic subscription re-check timer (6-hour interval)"
```

---

### Task 7: Integrate subscription check into server startup

**Files:**
- Modify: `apps/server/index.ts`

- [ ] **Step 26: Fix the ENABLE_WS bug**

In `apps/server/index.ts`, change line 19:

Before:
```typescript
const ENABLE_WS = process.env.ENABLE_WS === 'true' || true
```

After:
```typescript
const ENABLE_WS = process.env.ENABLE_WS !== 'false'
```

- [ ] **Step 27: Add subscription validation to main()**

In `apps/server/index.ts`, add import at line 9 (after other lib imports):

```typescript
import { validateSubscription, startPeriodicRecheck, stopPeriodicRecheck, readConfig, SubscriptionError } from './src/lib/subscription.js'
```

Then modify the `main()` function to validate before subsystem startup. Replace lines 27-67:

```typescript
async function main(): Promise<void> {
  try {
    log.start('Running', '[MAIN]')

    // --- Subscription gate (before any subsystem starts) ---
    try {
      await validateSubscription()
      const config = await readConfig()
      startPeriodicRecheck(config.uid)
    } catch (error) {
      if (error instanceof SubscriptionError) {
        log.fatal(`[SUBSCRIPTION] ${error.message}`)
        process.exit(1)
      }
      throw error
    }

    log.note('ENABLE_MQTT', ENABLE_MQTT)
    log.note('ENABLE_WS', ENABLE_WS)
    log.note('ENABLE_DEJACLOUD', ENABLE_DEJACLOUD)

    if (ENABLE_DEJACLOUD) {
      try {
        await dejaCloud.connect()
        log.start('DEJA Cloud connected')
      } catch (err) {
        log.error('DEJA Cloud connection failed:', err)
      }
    }

    if (ENABLE_MQTT) {
      try {
        await mqtt.connect()
        log.start('MQTT initialized')
      } catch (err) {
        log.error('MQTT connection failed:', err)
        log.note('To disable MQTT, set ENABLE_MQTT=false in your .env file')
      }
    }

    if (ENABLE_WS) {
      try {
        await wsServer.connect()
        log.start('WebSocket server started')
      } catch (err) {
        log.error('WebSocket server failed:', err)
      }
    }

    log.start('DEJA.js Server is running!')

  } catch (err) {
    log.fatal('Fatal error in main:', err)
  }
}
```

Add `stopPeriodicRecheck()` to the shutdown function, after line 87 (inside the try block, before step 1):

```typescript
    // 0. Stop subscription re-check timer
    stopPeriodicRecheck()
```

- [ ] **Step 28: Run existing server tests to verify nothing broke**

Run: `cd apps/server && pnpm vitest run`
Expected: All existing tests pass (dcc.test.ts, serial.test.ts)

- [ ] **Step 29: Run type check**

Run: `cd apps/server && pnpm type-check`
Expected: No type errors

- [ ] **Step 30: Commit**

```bash
git add apps/server/index.ts
git commit -m "feat(server): integrate subscription validation into startup, fix ENABLE_WS bug"
```

---

## Chunk 2: Docker Build with tsup Bundling

### Task 8: Add tsup and create bundle configuration

**Files:**
- Create: `apps/server/tsup.config.ts`
- Modify: `apps/server/package.json`

- [ ] **Step 31a: Move `firebase-admin` and `mqtt` from devDependencies to dependencies**

These packages are marked as `external` in the tsup config, meaning they are NOT bundled — they must exist in `node_modules` at runtime. Currently they are in `devDependencies` which means `pnpm deploy --prod` (used in the Docker build) would exclude them, crashing the server.

Run:
```bash
cd apps/server
pnpm remove firebase-admin mqtt
pnpm add firebase-admin mqtt
```

Verify: In `apps/server/package.json`, both should now appear under `dependencies`, not `devDependencies`.

- [ ] **Step 31b: Install tsup**

Run: `cd apps/server && pnpm add -D tsup`

- [ ] **Step 32: Create tsup config**

```typescript
// apps/server/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: false,
  // Native modules and runtime deps that cannot/should not be bundled.
  // These are resolved from node_modules at runtime.
  external: [
    // Native/binary modules
    'serialport',
    '@serialport/parser-readline',
    // Firebase Admin SDK (native grpc bindings)
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/firestore',
    'firebase-admin/database',
    // Firebase browser SDK — type-only import in @repo/modules/plans/types.ts
    // tsup erases `import type` but may still resolve the specifier; keep external
    'firebase',
    'firebase/firestore',
    // Vue ecosystem — pulled in transitively via @repo/modules root re-export
    // of useSubscription. These are dead code at runtime (server never calls
    // Vue composables) but must be external so tsup doesn't try to bundle them.
    'vue',
    'vuefire',
    '@vueuse/core',
    // Runtime deps with native optional bindings or dynamic requires
    'ws',
    'signale',
    'dotenv',
    'dotenv/config',
    'wait-on',
    // Other runtime deps
    '@sentry/node',
    'play-sound',
    'mqtt',
  ],
  // Workspace packages to inline (resolve at build time, not runtime).
  // These are bundled into the output so they don't need workspace resolution at runtime.
  noExternal: [
    '@repo/modules',
    '@repo/sounds',
    // @repo/firebase-config is inlined; its firebase-admin/* imports stay external
    '@repo/firebase-config',
  ],
  banner: {
    js: [
      '// DEJA.js Server — Bundled with tsup',
      '// https://dejajs.com',
    ].join('\n'),
  },
})
```

- [ ] **Step 33: Add build:docker script to package.json**

In `apps/server/package.json`, add to the `scripts` object:

```json
"build:docker": "tsup"
```

- [ ] **Step 34: Test the tsup build locally**

Run: `cd apps/server && pnpm build:docker`
Expected: Creates `apps/server/dist/index.mjs` (single bundled file)

**Troubleshooting:** If tsup fails resolving `@repo/firebase-config`, add it to `noExternal` but verify the output does NOT contain the `firebase-admin` module code (it should remain an import statement). If `@repo/firebase-config` causes browser Firebase SDK to be pulled in, keep it out of `noExternal` and instead update the server's imports to use `@repo/firebase-config/firebase-admin-node.js` directly (which tsup can resolve via the workspace).

- [ ] **Step 35: Verify the bundle is clean**

Run: `cd apps/server && grep -c 'from "vue"' dist/index.mjs || echo "0"`
Expected: `0` — the bundle should NOT contain any imports from `vue`, `vuefire`, or `@vueuse/core`. If these appear, they were not properly externalized.

Run: `cd apps/server && node dist/index.mjs`
Expected: Server starts without "Cannot find module" errors. It may fail to connect to Firebase/serial — that's OK, we're checking that the bundle loads and all imports resolve.

Press Ctrl+C to stop.

**Note on double dotenv:** The bundled output will contain `import 'dotenv/config'` (from `index.ts` line 1) AND `dotenv.config()` (from the inlined `@repo/firebase-config/firebase-admin-node.ts`). Calling `dotenv.config()` twice is idempotent and harmless.

- [ ] **Step 36: Commit**

```bash
git add apps/server/tsup.config.ts apps/server/package.json
git commit -m "feat(server): add tsup bundler config for standalone Docker builds"
```

---

### Task 9: Create the Dockerfile

**Files:**
- Create: `apps/server/Dockerfile`
- Create: `.dockerignore` (at repo root)

- [ ] **Step 37: Create `.dockerignore` at the repo root**

The `.dockerignore` must be at the repo root because the Docker build context is `.` (the repo root). Docker ignores `.dockerignore` files not at the context root.

```
# .dockerignore (repo root)
# Ignore everything not needed for the server Docker build
.git
.github
docs
io
apps/cloud
apps/monitor
apps/throttle
apps/tour
apps/sound-api
**/node_modules
**/dist
**/.env
**/.env.local
**/*.test.ts
**/vitest.config.ts
.changeset
.claude
```

- [ ] **Step 38: Create the multi-stage Dockerfile**

```dockerfile
# apps/server/Dockerfile
# ============================================================
# Stage 1: Build — bundle the server into a standalone artifact
# ============================================================
FROM node:20-slim AS build

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace root files needed for install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./

# Copy all packages and apps (pnpm needs full workspace for resolution)
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install all dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Bundle server + workspace deps into standalone ESM output
RUN cd apps/server && pnpm build:docker

# Deploy production dependencies to an isolated directory
# pnpm deploy resolves workspace deps correctly (unlike pnpm prune in workspaces)
RUN pnpm --filter=deja-serverts deploy --prod /app/deploy

# ============================================================
# Stage 2: Runtime — minimal image with bundled output
# ============================================================
FROM node:20-slim AS runtime

# System deps for serialport native bindings
RUN apt-get update && \
    apt-get install -y --no-install-recommends libudev-dev && \
    rm -rf /var/lib/apt/lists/*

# Run as non-root user
USER node
WORKDIR /home/node/app

# Copy bundled output
COPY --from=build --chown=node:node /app/apps/server/dist ./dist/

# Copy production node_modules from pnpm deploy output (native/external deps only)
COPY --from=build --chown=node:node /app/deploy/node_modules ./node_modules/

# Config directory mount point
VOLUME ["/home/node/.deja"]

# WebSocket port
EXPOSE 8082

# Disable sound playback in Docker (no host audio)
ENV ENABLE_SOUND=false

ENTRYPOINT ["node", "dist/index.mjs"]
```

- [ ] **Step 39: Test Docker build locally (single arch)**

Run: `docker build -f apps/server/Dockerfile -t deja-server:local .`
Expected: Build succeeds. Image is created.

Note: Run from the repo root (the Dockerfile copies workspace files from `.`).

- [ ] **Step 40: Test the Docker image runs**

Run:
```bash
docker run --rm -it \
  -v ~/.deja:/home/node/.deja \
  -p 8082:8082 \
  --env-file .env \
  deja-server:local
```
Expected: Server starts, logs subscription check (may fail without valid config — that's expected).

Press Ctrl+C to stop.

- [ ] **Step 41: Commit**

```bash
git add apps/server/Dockerfile .dockerignore
git commit -m "feat(server): add multi-stage Dockerfile for Docker distribution"
```

---

## Chunk 3: Install Script & CLI

### Task 10: Create the deja CLI wrapper

**Files:**
- Create: `scripts/deja-cli.sh`

- [ ] **Step 42: Write the deja CLI script**

```bash
#!/usr/bin/env bash
# scripts/deja-cli.sh
# DEJA.js CLI — manages the Docker-based DEJA Server
# Installed to ~/.deja/bin/deja by the install script

set -euo pipefail

DEJA_DIR="${HOME}/.deja"
COMPOSE_FILE="${DEJA_DIR}/docker-compose.yml"

usage() {
  echo "Usage: deja <command>"
  echo ""
  echo "Commands:"
  echo "  status    Show server status, subscription, and serial connection"
  echo "  logs      View server logs (pass -f to follow)"
  echo "  update    Pull latest server image and restart"
  echo "  restart   Restart the server"
  echo "  stop      Stop the server"
  echo "  start     Start the server"
  echo ""
}

require_compose() {
  if [ ! -f "${COMPOSE_FILE}" ]; then
    echo "Error: ${COMPOSE_FILE} not found."
    echo "Run the install script first: curl -fsSL https://install.dejajs.com | bash"
    exit 1
  fi
}

cmd_status() {
  require_compose
  echo "=== DEJA.js Server Status ==="
  echo ""

  # Container state (filter by service name to handle multi-service compose files)
  local state
  state=$(docker compose -f "${COMPOSE_FILE}" ps deja-server --format '{{.State}}' 2>/dev/null | head -1 || echo "not running")
  echo "Container:    ${state}"

  # Image version
  local image
  image=$(docker compose -f "${COMPOSE_FILE}" images deja-server --format '{{.Tag}}' 2>/dev/null | head -1 || echo "unknown")
  echo "Image:        ghcr.io/jmcdannel/deja-server:${image}"

  # Subscription info from config.json (using grep/sed — no python3 or jq dependency)
  if [ -f "${DEJA_DIR}/config.json" ]; then
    local sub_status sub_plan
    sub_status=$(grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' "${DEJA_DIR}/config.json" | head -1 | sed 's/.*"status"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null || echo "unknown")
    sub_plan=$(grep -o '"plan"[[:space:]]*:[[:space:]]*"[^"]*"' "${DEJA_DIR}/config.json" | head -1 | sed 's/.*"plan"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null || echo "unknown")
    echo "Subscription: ${sub_status} (${sub_plan})"
  fi

  # Serial devices (check compose file for mapped devices + host existence)
  local serial_device
  serial_device=$(grep -o '/dev/tty[^:]*' "${COMPOSE_FILE}" 2>/dev/null | head -1 || echo "none")
  if [ "${serial_device}" != "none" ] && [ -e "${serial_device}" ]; then
    echo "Serial:       ${serial_device} (connected)"
  elif [ "${serial_device}" != "none" ]; then
    echo "Serial:       ${serial_device} (not found on host)"
  else
    echo "Serial:       none configured"
  fi

  # WebSocket port
  echo "WebSocket:    ws://localhost:8082"
  echo ""
}

cmd_logs() {
  require_compose
  docker compose -f "${COMPOSE_FILE}" logs "$@"
}

cmd_update() {
  require_compose
  echo "Pulling latest DEJA Server image..."
  docker compose -f "${COMPOSE_FILE}" pull
  echo "Restarting server..."
  docker compose -f "${COMPOSE_FILE}" up -d
  echo "Update complete."
}

cmd_restart() {
  require_compose
  docker compose -f "${COMPOSE_FILE}" restart
}

cmd_stop() {
  require_compose
  docker compose -f "${COMPOSE_FILE}" stop
}

cmd_start() {
  require_compose
  docker compose -f "${COMPOSE_FILE}" up -d
}

# --- Main ---

if [ $# -eq 0 ]; then
  usage
  exit 0
fi

case "$1" in
  status)  cmd_status ;;
  logs)    shift; cmd_logs "$@" ;;
  update)  cmd_update ;;
  restart) cmd_restart ;;
  stop)    cmd_stop ;;
  start)   cmd_start ;;
  help|-h|--help) usage ;;
  *)
    echo "Unknown command: $1"
    usage
    exit 1
    ;;
esac
```

- [ ] **Step 43: Make executable and commit**

```bash
chmod +x scripts/deja-cli.sh
git add scripts/deja-cli.sh
git commit -m "feat(scripts): add deja CLI wrapper for Docker server management"
```

---

### Task 11: Create the install script

**Files:**
- Create: `scripts/install.sh`

- [ ] **Step 44: Write the install script**

```bash
#!/usr/bin/env bash
# scripts/install.sh
# DEJA.js Install Script
# Usage: curl -fsSL https://install.dejajs.com | bash

set -euo pipefail

DEJA_DIR="${HOME}/.deja"
DEJA_BIN="${DEJA_DIR}/bin"
COMPOSE_FILE="${DEJA_DIR}/docker-compose.yml"
CONFIG_FILE="${DEJA_DIR}/config.json"
ENV_FILE="${DEJA_DIR}/.env"
IMAGE="ghcr.io/jmcdannel/deja-server:latest"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ======================================================================
# Step 1: Platform detection
# ======================================================================
detect_platform() {
  info "Detecting platform..."
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "${OS}" in
    Linux*)  PLATFORM="linux" ;;
    Darwin*) PLATFORM="macos" ;;
    *)       err "Unsupported OS: ${OS}. Windows users: install via WSL."; exit 1 ;;
  esac

  case "${ARCH}" in
    x86_64|amd64) DOCKER_ARCH="amd64" ;;
    aarch64|arm64) DOCKER_ARCH="arm64" ;;
    *)             err "Unsupported architecture: ${ARCH}"; exit 1 ;;
  esac

  ok "Platform: ${PLATFORM} (${DOCKER_ARCH})"
}

# ======================================================================
# Step 2: Check/install Docker
# ======================================================================
check_docker() {
  if command -v docker &>/dev/null; then
    ok "Docker found: $(docker --version)"
    return
  fi

  if [ "${PLATFORM}" = "linux" ]; then
    info "Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "${USER}"
    ok "Docker installed. You may need to log out and back in for group changes."
  else
    err "Docker not found. Install Docker Desktop: https://docs.docker.com/get-docker/"
    exit 1
  fi
}

check_docker_compose() {
  if docker compose version &>/dev/null; then
    ok "Docker Compose found"
    return
  fi
  err "Docker Compose not found. Install Docker Desktop or docker-compose-plugin."
  exit 1
}

# ======================================================================
# Step 3: Docker login to GHCR
# ======================================================================
docker_login() {
  # Accept token as argument or prompt
  local token="${GHCR_TOKEN:-}"

  if [ -z "${token}" ]; then
    echo ""
    info "You need a GitHub Container Registry token to pull the DEJA Server image."
    info "Find your token at: https://cloud.dejajs.com → Settings → Install"
    echo ""
    read -rp "GHCR Token: " token
  fi

  if [ -z "${token}" ]; then
    err "No token provided."
    exit 1
  fi

  echo "${token}" | docker login ghcr.io -u deja-user --password-stdin
  ok "Logged in to GHCR"
}

# ======================================================================
# Step 4: Account linking
# ======================================================================
link_account() {
  mkdir -p "${DEJA_DIR}"

  # Skip if valid config already exists
  if [ -f "${CONFIG_FILE}" ]; then
    local existing_uid
    existing_uid=$(grep -o '"uid"[[:space:]]*:[[:space:]]*"[^"]*"' "${CONFIG_FILE}" | sed 's/.*"uid"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null || echo "")
    if [ -n "${existing_uid}" ]; then
      ok "Existing account found (UID: ${existing_uid})"
      return
    fi
  fi

  local uid="${DEJA_UID:-}"
  local layout_id="${DEJA_LAYOUT_ID:-}"

  if [ -z "${uid}" ]; then
    echo ""
    info "Link your DEJA.js account."
    info "Find your UID and Layout ID at: https://cloud.dejajs.com → Settings → Install"
    echo ""
    read -rp "Your UID: " uid
  fi

  if [ -z "${layout_id}" ]; then
    read -rp "Your Layout ID: " layout_id
  fi

  if [ -z "${uid}" ] || [ -z "${layout_id}" ]; then
    err "UID and Layout ID are both required."
    exit 1
  fi

  cat > "${CONFIG_FILE}" <<JSONEOF
{
  "uid": "${uid}",
  "layoutId": "${layout_id}"
}
JSONEOF

  chmod 600 "${CONFIG_FILE}"
  ok "Account linked (UID: ${uid}, Layout: ${layout_id})"
}

# ======================================================================
# Step 5: Environment setup
# ======================================================================
setup_environment() {
  if [ -f "${ENV_FILE}" ]; then
    ok "Environment file exists (${ENV_FILE})"
    return
  fi

  local layout_id
  layout_id=$(grep -o '"layoutId"[[:space:]]*:[[:space:]]*"[^"]*"' "${CONFIG_FILE}" | sed 's/.*"layoutId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null)

  echo ""
  info "Enter your Firebase configuration (from https://cloud.dejajs.com → Settings → Install)"
  echo ""

  read -rp "VITE_FIREBASE_API_KEY: " fb_api_key
  read -rp "VITE_FIREBASE_AUTH_DOMAIN: " fb_auth_domain
  read -rp "VITE_FIREBASE_PROJECT_ID: " fb_project_id
  read -rp "VITE_FIREBASE_DATABASE_URL: " fb_database_url
  read -rp "VITE_FIREBASE_STORAGE_BUCKET: " fb_storage_bucket
  read -rp "VITE_FIREBASE_MESSAGING_SENDER_ID: " fb_messaging_id
  read -rp "VITE_FIREBASE_APP_ID: " fb_app_id
  read -rp "FIREBASE_CLIENT_EMAIL (service account): " fb_client_email
  read -rp "FIREBASE_PRIVATE_KEY (service account, paste full key): " fb_private_key

  cat > "${ENV_FILE}" <<ENVEOF
LAYOUT_ID=${layout_id}
ENABLE_DEJACLOUD=true
ENABLE_WS=true
ENABLE_MQTT=false
ENABLE_SOUND=false
VITE_WS_PORT=8082
VITE_WS_ID=DEJA.js

VITE_FIREBASE_API_KEY=${fb_api_key}
VITE_FIREBASE_AUTH_DOMAIN=${fb_auth_domain}
VITE_FIREBASE_PROJECT_ID=${fb_project_id}
VITE_FIREBASE_DATABASE_URL=${fb_database_url}
VITE_FIREBASE_STORAGE_BUCKET=${fb_storage_bucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${fb_messaging_id}
VITE_FIREBASE_APP_ID=${fb_app_id}
FIREBASE_CLIENT_EMAIL=${fb_client_email}
FIREBASE_PRIVATE_KEY=${fb_private_key}
ENVEOF

  chmod 600 "${ENV_FILE}"
  ok "Environment file created"
}

# ======================================================================
# Step 6: Serial port detection & Docker Compose generation
# ======================================================================
detect_serial_and_generate_compose() {
  local device_line=""

  if [ "${PLATFORM}" = "linux" ]; then
    # Check dialout group
    if ! groups "${USER}" | grep -q dialout; then
      warn "User '${USER}' is not in the 'dialout' group. Serial access may fail."
      warn "Fix: sudo usermod -aG dialout ${USER} && logout"
    fi
  fi

  # Detect serial ports
  local ports=()
  for p in /dev/ttyUSB* /dev/ttyACM* /dev/ttyAMA* /dev/tty.usbmodem* /dev/tty.usbserial*; do
    [ -e "${p}" ] && ports+=("${p}")
  done

  if [ ${#ports[@]} -gt 0 ]; then
    echo ""
    info "Detected serial ports:"
    for i in "${!ports[@]}"; do
      echo "  $((i + 1)). ${ports[$i]}"
    done
    echo "  0. Skip (configure later)"
    echo ""
    read -rp "Select port for DCC-EX CommandStation [1]: " choice
    choice="${choice:-1}"

    if [ "${choice}" != "0" ] && [ "${choice}" -le "${#ports[@]}" ] 2>/dev/null; then
      local selected="${ports[$((choice - 1))]}"
      device_line="    devices:
      - ${selected}:${selected}"
      ok "Using serial port: ${selected}"
    else
      warn "No serial port selected. Edit ${COMPOSE_FILE} later to add one."
    fi
  else
    warn "No serial ports detected. Edit ${COMPOSE_FILE} later to add your device."
  fi

  # Generate docker-compose.yml
  cat > "${COMPOSE_FILE}" <<COMPOSEEOF
services:
  deja-server:
    image: ${IMAGE}
${device_line}
    volumes:
      - ${DEJA_DIR}:/home/node/.deja
    ports:
      - "8082:8082"
    env_file: .env
    restart: unless-stopped
COMPOSEEOF

  ok "Docker Compose file generated"
}

# ======================================================================
# Step 7: Install CLI & pull image
# ======================================================================
install_cli() {
  mkdir -p "${DEJA_BIN}"

  # Download the CLI script from the release assets
  # The CI workflow uploads deja-cli.sh alongside the Docker image
  curl -fsSL "https://raw.githubusercontent.com/jmcdannel/DEJA.js/main/scripts/deja-cli.sh" \
    -o "${DEJA_BIN}/deja" 2>/dev/null || {
    err "Failed to download DEJA CLI. Check your internet connection."
    exit 1
  }

  chmod +x "${DEJA_BIN}/deja"

  # Add to PATH if not already present
  if ! echo "${PATH}" | grep -q "${DEJA_BIN}"; then
    local shell_rc=""
    if [ -f "${HOME}/.zshrc" ]; then
      shell_rc="${HOME}/.zshrc"
    elif [ -f "${HOME}/.bashrc" ]; then
      shell_rc="${HOME}/.bashrc"
    fi

    if [ -n "${shell_rc}" ]; then
      echo 'export PATH="${HOME}/.deja/bin:${PATH}"' >> "${shell_rc}"
      info "Added ${DEJA_BIN} to PATH in ${shell_rc}"
      info "Run: source ${shell_rc} (or open a new terminal)"
    else
      warn "Add ${DEJA_BIN} to your PATH manually."
    fi
  fi

  ok "DEJA CLI installed at ${DEJA_BIN}/deja"
}

pull_and_start() {
  info "Pulling DEJA Server image..."
  docker compose -f "${COMPOSE_FILE}" pull
  ok "Image pulled"

  info "Starting DEJA Server..."
  docker compose -f "${COMPOSE_FILE}" up -d
  ok "Server started"
}

# ======================================================================
# Step 8: Verification
# ======================================================================
verify() {
  echo ""
  info "Waiting for server to start..."
  local attempts=0
  while [ ${attempts} -lt 15 ]; do
    # Check container health via docker compose (server is WebSocket-only, not HTTP)
    local state
    state=$(docker compose -f "${COMPOSE_FILE}" ps --format '{{.State}}' 2>/dev/null || echo "")
    if [ "${state}" = "running" ]; then
      ok "Server container is running"
      break
    fi
    sleep 2
    attempts=$((attempts + 1))
  done

  if [ ${attempts} -ge 15 ]; then
    warn "Server did not start in time. Check logs: deja logs -f"
  fi

  echo ""
  echo "========================================"
  echo -e "${GREEN}  DEJA.js Server installed!${NC}"
  echo "========================================"
  echo ""
  echo "  Server:   ws://localhost:8082"
  echo "  Config:   ${DEJA_DIR}/"
  echo "  Logs:     deja logs -f"
  echo "  Status:   deja status"
  echo ""
  echo "  Next steps:"
  echo "    1. Open https://monitor.dejajs.com to verify connection"
  echo "    2. Open https://throttle.dejajs.com to drive trains"
  echo ""
}

# ======================================================================
# Main
# ======================================================================
main() {
  echo ""
  echo "========================================"
  echo "  DEJA.js Server Installer"
  echo "========================================"
  echo ""

  detect_platform
  check_docker
  check_docker_compose
  docker_login
  link_account
  setup_environment
  detect_serial_and_generate_compose
  install_cli
  pull_and_start
  verify
}

# Parse arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --token=*) GHCR_TOKEN="${1#*=}" ;;
    --uid=*)   DEJA_UID="${1#*=}" ;;
    --layout=*) DEJA_LAYOUT_ID="${1#*=}" ;;
    *) ;;
  esac
  shift
done

main
```

Note: The install script downloads the CLI from the main branch on GitHub. Once the repo goes private, this URL will require authentication — at that point, switch to downloading from a public CDN (e.g., `cli.dejajs.com/deja`) or embed the CLI content inline during a build step.

- [ ] **Step 45: Make executable and commit**

```bash
chmod +x scripts/install.sh
git add scripts/install.sh
git commit -m "feat(scripts): add install script for Docker-based server deployment"
```

---

## Chunk 4: CI/CD & Release Workflow

### Task 12: Create the release-server GitHub Actions workflow

**Files:**
- Create: `.github/workflows/release-server.yml`

- [ ] **Step 46: Write the workflow file**

```yaml
# .github/workflows/release-server.yml
name: Release Server Docker Image

on:
  push:
    tags:
      - 'v*.*.*'

permissions:
  contents: read
  packages: write

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up QEMU (for multi-arch)
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract version from tag
        id: version
        run: echo "version=${GITHUB_REF_NAME}" >> "$GITHUB_OUTPUT"

      - name: Build and push multi-arch image
        uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/server/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ghcr.io/jmcdannel/deja-server:${{ steps.version.outputs.version }}
            ghcr.io/jmcdannel/deja-server:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

- [ ] **Step 47: Commit**

```bash
git add .github/workflows/release-server.yml
git commit -m "ci: add release-server workflow for multi-arch Docker builds on tag push"
```

---

### Task 13: Fix pre-existing security issues

**Files:**
- Modify: `apps/sound-api/vercel.json` (if hardcoded tokens exist)
- Modify: `apps/cloud/vercel.json` (if hardcoded tokens exist)

- [ ] **Step 48: Check for hardcoded Vercel Blob tokens**

Run: `grep -r "BLOB_READ_WRITE_TOKEN" apps/sound-api/vercel.json apps/cloud/vercel.json 2>/dev/null || echo "No hardcoded tokens found"`

If tokens are found, remove them from `vercel.json` files and note that they should be set as Vercel environment variables in the Vercel dashboard.

- [ ] **Step 49: Commit if changes were made**

```bash
git add apps/sound-api/vercel.json apps/cloud/vercel.json 2>/dev/null
git commit -m "security: remove hardcoded Vercel Blob tokens from vercel.json files" 2>/dev/null || echo "No security changes needed"
```

---

### Task 14: Run full test suite and type checks

- [ ] **Step 50: Run all server tests**

Run: `cd apps/server && pnpm vitest run`
Expected: All tests pass (including new subscription tests)

- [ ] **Step 51: Run type check across monorepo**

Run: `pnpm check-types`
Expected: No type errors

- [ ] **Step 52: Run lint**

Run: `pnpm lint`
Expected: No lint errors (or only pre-existing ones)

---

### Task 15: Final commit and summary

- [ ] **Step 53: Review all changes**

Run: `git log --oneline main..HEAD`
Expected: Clean commit history showing incremental feature additions

- [ ] **Step 54: Create changeset**

Run: `/changelog`

The changeset should describe:
- Server subscription validation with Firebase Admin SDK
- 48-hour grace period for offline operation
- tsup bundler for standalone Docker builds
- Multi-stage Dockerfile
- Install script and deja CLI
- GitHub Actions workflow for multi-arch image releases
- Fixed ENABLE_WS env var bug

---

## Post-Implementation: Manual Steps (Not Automated)

These steps require manual action outside of code:

1. **Make repo private:** GitHub Settings → Change visibility to private
2. **Set up GHCR:** Verify private image registry is accessible with PAT
3. **Create robot GitHub account:** For distributing read-only PATs (or use personal PAT for MVP)
4. **Host install script:** Deploy `scripts/install.sh` to `install.dejajs.com` (Vercel Edge Function or static file). Consider adding a CI step to the release workflow that copies install.sh to the CDN on tag push.
5. **Host CLI script:** Once repo is private, `scripts/deja-cli.sh` won't be accessible via raw.githubusercontent.com. Deploy it alongside the install script at `cli.dejajs.com/deja` or embed it inline during a build step.
6. **Add Install page to DEJA Cloud:** Show UID, Layout ID, and GHCR token on the dashboard's Settings page
7. **Test on Raspberry Pi:** Pull image on ARM64 hardware, verify serial port access
8. **Update Vercel environment variables:** Move any hardcoded Blob tokens to Vercel dashboard
9. **Consider @sentry/node inclusion:** If Sentry is used for error tracking, ensure it's in the Docker image's dependencies and tsup externals. If not currently used, remove it from the tsup externals list.
