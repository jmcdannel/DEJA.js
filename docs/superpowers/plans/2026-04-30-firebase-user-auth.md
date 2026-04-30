# 🔐 Firebase User Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the distributed Firebase service-account credential with per-device user auth (Option A+ flow): Cloud Function mints a custom token, CLI exchanges it for a refresh token via `signInWithCustomToken`, server uses Firebase client SDK with user auth, and security rules enforce soft-revoke.

**Architecture:** Two new Vercel-style endpoints in `apps/install-api` (`/api/cli-auth/mint`, `/api/cli-auth/refresh`). New `@repo/firebase-config/firebase-user-node` module replaces `firebase-admin-node` in the server (same export shape). New `deja login` bash subcommand delegating to a Node helper. New `ConnectedServers.vue` card in `apps/cloud/src/Settings/Settings.vue`. Updated Firestore rules with `isServerRevoked()` helper and a per-user `servers` subcollection.

**Tech Stack:** TypeScript, Vue 3 + Vuetify (cloud), Node.js + Vercel Functions (install-api), bash (CLI dispatch) + Node ESM helpers, Vitest, Firebase JS SDK v10 (client) + `firebase-admin` (Cloud Functions only).

**Spec:** `docs/superpowers/specs/2026-04-30-firebase-user-auth-design.md`

---

## File Map

### Files created
- `apps/install-api/api/cli-auth/mint.ts` — Cloud Function: mint custom token + write `users/{uid}/servers/{id}`
- `apps/install-api/api/cli-auth/refresh.ts` — Cloud Function: refresh token → custom token re-mint
- `apps/install-api/api/cli-auth/_lib/admin.ts` — shared firebase-admin init (lazy, cached)
- `apps/install-api/api/cli-auth/_lib/cors.ts` — shared CORS preflight handler
- `apps/install-api/api/cli-auth/mint.test.ts` — unit tests for mint endpoint
- `apps/install-api/api/cli-auth/refresh.test.ts` — unit tests for refresh endpoint
- `packages/firebase-config/src/firebase-user-node.ts` — server-side user-auth firebase init
- `packages/firebase-config/src/firebase-user-node.test.ts` — unit tests
- `apps/cli/tui/lib/login.mjs` — Node helper called by `deja login`
- `apps/cloud/src/Settings/ConnectedServers.vue` — Settings card component
- `apps/cloud/src/Settings/ConnectServerDialog.vue` — modal dialog for connecting a new server
- `packages/modules/src/servers/types.ts` — `ServerRecord` type
- `packages/modules/src/servers/index.ts` — re-export
- `.changeset/firebase-user-auth.md` — release changeset

### Files modified
- `firestore.rules` — add `users/{uid}/servers` rules + `isServerRevoked()` helper, gate layout writes
- `apps/install-api/package.json` — add `firebase-admin` dependency
- `packages/firebase-config/package.json` — add `firebase-user-node` to exports
- `apps/server/index.ts` — call new auth bootstrap; gracefully fall back to legacy if env vars present
- `apps/server/src/lib/subscription.ts` — switch import to `firebase-user-node`
- `apps/server/src/lib/dcc.ts` — switch import
- `apps/server/src/lib/deja.ts` — switch import
- `apps/server/src/lib/onboarding.ts` — switch import
- `apps/server/src/dejaCloud.ts` — switch import
- `apps/server/src/modules/roster.ts` — switch import
- `apps/server/src/modules/blocks.ts` — switch import
- `apps/server/src/modules/sync-config.ts` — switch import
- `apps/server/src/scripts/migrate-routes.ts` — switch import
- `apps/server/src/scripts/migrate-signals.ts` — switch import
- `apps/server/src/lib/dcc.test.ts` — update mock path
- `apps/server/src/lib/subscription.test.ts` — update mock path
- `apps/server/src/modules/sync-config.test.ts` — update mock path
- `apps/cli/deja` (bash) — add `cmd_login` function and dispatch case
- `apps/cloud/src/Settings/Settings.vue` — mount `<ConnectedServers />` card
- `packages/modules/src/index.ts` — export `servers` module
- `.env.example` — annotate `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` as deprecated for v1.9
- `ENV.md` — document new auth flow

---

## Phase 1: Foundation (schema types + security rules)

### Task 1: Add `ServerRecord` type to `@repo/modules`

**Files:**
- Create: `packages/modules/src/servers/types.ts`
- Create: `packages/modules/src/servers/index.ts`
- Modify: `packages/modules/src/index.ts`

- [ ] **Step 1: Create the types file**

```typescript
// packages/modules/src/servers/types.ts
import type { Timestamp } from 'firebase/firestore'

export interface ServerRecord {
  /** User-supplied label, e.g. "Basement Pi". 1–60 chars. */
  name: string
  /** Server creation timestamp. */
  createdAt: Timestamp
  /** Updated by the server on every cold start. Null until first connection. */
  lastSeenAt: Timestamp | null
  /** Soft-revoke flag — toggled from the Settings UI. */
  revoked: boolean
}

export interface ServerRecordWithId extends ServerRecord {
  /** ULID (Firestore doc id). */
  id: string
}
```

- [ ] **Step 2: Create the index re-export**

```typescript
// packages/modules/src/servers/index.ts
export * from './types'
```

- [ ] **Step 3: Wire into the package barrel**

In `packages/modules/src/index.ts`, add to the existing exports:

```typescript
export * from './servers'
```

- [ ] **Step 4: Type-check**

Run: `pnpm --filter=@repo/modules check-types`
Expected: PASS (no errors)

- [ ] **Step 5: Commit**

```bash
git add packages/modules/src/servers/ packages/modules/src/index.ts
git commit -m "feat(modules): add ServerRecord type for connected server tracking 🖥️"
```

---

### Task 2: Add Firestore security rules for `users/{uid}/servers`

**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: Add the `servers` subcollection rule and `isServerRevoked()` helper**

Read `firestore.rules` and locate the `match /users/{userId}` block. Insert the `servers` subcollection rule as a child match. Then add `isServerRevoked()` to the top-level helper functions block. Final additions:

```javascript
// Inside service cloud.firestore { match /databases/{database}/documents { ... }
// Add to the helper functions block:
function isServerRevoked() {
  return request.auth.token.serverId != null &&
    exists(/databases/$(database)/documents/users/$(request.auth.uid)/servers/$(request.auth.token.serverId)) &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)/servers/$(request.auth.token.serverId)).data.revoked == true;
}

// Inside match /users/{userId} { ... } add this nested block:
match /servers/{serverId} {
  allow read, write: if isAuth() && request.auth.uid == userId;
}
```

- [ ] **Step 2: Gate layout subcollection writes with `!isServerRevoked()`**

For every existing rule in `firestore.rules` that uses `isLayoutOwner(layoutId)` for writes (locos, throttles, turnouts, signals, effects, routes, devices, tags, trackDiagrams, sensors, blocks, automations), add `&& !isServerRevoked()` to the write rule. Example:

Before:
```javascript
match /throttles/{throttleId} {
  allow read, write: if isLayoutOwner(layoutId);
}
```

After:
```javascript
match /throttles/{throttleId} {
  allow read: if isLayoutOwner(layoutId);
  allow write: if isLayoutOwner(layoutId) && !isServerRevoked();
}
```

Apply the same split to all listed subcollections. Don't gate **read** rules — only writes.

- [ ] **Step 3: Lint the rules locally**

Run: `npx firebase emulators:exec --only firestore "echo rules-ok"`
Expected: rules compile and emulator boots without syntax errors. (If the user doesn't have firebase-tools installed, skip and rely on deploy-time check.)

- [ ] **Step 4: Commit**

```bash
git add firestore.rules
git commit -m "feat(rules): gate server writes via isServerRevoked() helper 🔐"
```

---

## Phase 2: Cloud Functions in `apps/install-api`

### Task 3: Add `firebase-admin` dependency and shared admin init helper

**Files:**
- Modify: `apps/install-api/package.json`
- Create: `apps/install-api/api/cli-auth/_lib/admin.ts`

- [ ] **Step 1: Add `firebase-admin` to install-api dependencies**

In `apps/install-api/package.json`, add to the `dependencies` block:

```json
"firebase-admin": "^13.4.0"
```

- [ ] **Step 2: Install**

Run: `pnpm install`
Expected: install completes without errors.

- [ ] **Step 3: Create the shared admin init helper**

```typescript
// apps/install-api/api/cli-auth/_lib/admin.ts
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let cached: { auth: Auth; db: Firestore } | null = null

/**
 * Lazy-init firebase-admin from env vars. Cached across warm invocations.
 * Throws a clear error if required env vars are missing.
 */
export function getAdmin(): { auth: Auth; db: Firestore } {
  if (cached) return cached

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env vars'
    )
  }

  const app = getApps()[0] ?? initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })

  cached = {
    auth: getAuth(app),
    db: getFirestore(app),
  }
  return cached
}
```

- [ ] **Step 4: Type-check**

Run: `pnpm --filter=install-api type-check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/install-api/package.json apps/install-api/api/cli-auth/_lib/admin.ts pnpm-lock.yaml
git commit -m "feat(install-api): add firebase-admin and shared admin init helper 🔧"
```

---

### Task 4: Create CORS helper for cli-auth endpoints

**Files:**
- Create: `apps/install-api/api/cli-auth/_lib/cors.ts`

- [ ] **Step 1: Write the CORS helper**

```typescript
// apps/install-api/api/cli-auth/_lib/cors.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_ORIGINS = [
  'https://cloud.dejajs.com',
  'https://staging-cloud.dejajs.com',
  'http://localhost:5174',
  'http://localhost:3011',
]

/**
 * Apply CORS headers and handle the OPTIONS preflight.
 * Returns true if the request was handled (caller should return early).
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/install-api/api/cli-auth/_lib/cors.ts
git commit -m "feat(install-api): add CORS helper for cli-auth endpoints 🌐"
```

---

### Task 5: Implement `POST /api/cli-auth/mint` (TDD)

**Files:**
- Create: `apps/install-api/api/cli-auth/mint.test.ts`
- Create: `apps/install-api/api/cli-auth/mint.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/install-api/api/cli-auth/mint.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const mockVerifyIdToken = vi.fn()
const mockCreateCustomToken = vi.fn()
const mockSet = vi.fn()
const mockDoc = vi.fn(() => ({ set: mockSet }))
const mockCollection = vi.fn(() => ({ doc: mockDoc }))

vi.mock('./_lib/admin.js', () => ({
  getAdmin: () => ({
    auth: {
      verifyIdToken: mockVerifyIdToken,
      createCustomToken: mockCreateCustomToken,
    },
    db: {
      collection: (path: string) => {
        mockCollection(path)
        return {
          doc: (uid: string) => ({
            collection: (sub: string) => {
              mockCollection(sub)
              return { doc: mockDoc }
            },
          }),
        }
      },
    },
  }),
}))

import handler from './mint.js'

function makeReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: { authorization: 'Bearer fake-id-token' },
    body: { name: 'Basement Pi' },
    ...overrides,
  } as VercelRequest
}

function makeRes(): VercelResponse & { _status: number; _body: unknown } {
  const res = {
    _status: 0,
    _body: undefined as unknown,
    setHeader: vi.fn(),
    status(code: number) { this._status = code; return this },
    json(body: unknown) { this._body = body; return this },
    end() { return this },
  }
  return res as unknown as VercelResponse & { _status: number; _body: unknown }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockVerifyIdToken.mockResolvedValue({ uid: 'user-123' })
  mockCreateCustomToken.mockResolvedValue('custom-token-abc')
  mockSet.mockResolvedValue(undefined)
})

describe('POST /api/cli-auth/mint', () => {
  it('returns 401 when authorization header is missing', async () => {
    const req = makeReq({ headers: {} })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(401)
  })

  it('returns 401 when ID token verification fails', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('expired'))
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(401)
  })

  it('returns 400 when name is missing or invalid', async () => {
    const req = makeReq({ body: { name: '' } })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(400)
  })

  it('mints a custom token with serverId and kind=server claims', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(200)
    expect(mockCreateCustomToken).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({ kind: 'server', serverId: expect.any(String) })
    )
    const body = res._body as { customToken: string; serverId: string }
    expect(body.customToken).toBe('custom-token-abc')
    expect(body.serverId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/) // ULID format
  })

  it('writes a server doc with name, createdAt, lastSeenAt=null, revoked=false', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Basement Pi',
        lastSeenAt: null,
        revoked: false,
      })
    )
  })

  it('truncates names longer than 60 chars', async () => {
    const longName = 'x'.repeat(80)
    const req = makeReq({ body: { name: longName } })
    const res = makeRes()
    await handler(req, res)
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'x'.repeat(60) })
    )
  })

  it('returns 405 on non-POST methods', async () => {
    const req = makeReq({ method: 'GET' })
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(405)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter=install-api exec vitest run api/cli-auth/mint.test.ts`
Expected: FAIL — `Cannot find module './mint.js'`

- [ ] **Step 3: Implement the handler**

```typescript
// apps/install-api/api/cli-auth/mint.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdmin } from './_lib/admin.js'
import { applyCors } from './_lib/cors.js'

/** Crockford base32 alphabet for ULID. */
const ULID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function generateUlid(): string {
  const time = Date.now()
  const timeChars: string[] = []
  let t = time
  for (let i = 0; i < 10; i++) {
    timeChars.unshift(ULID_ALPHABET[t % 32]!)
    t = Math.floor(t / 32)
  }
  const randChars: string[] = []
  for (let i = 0; i < 16; i++) {
    randChars.push(ULID_ALPHABET[Math.floor(Math.random() * 32)]!)
  }
  return timeChars.join('') + randChars.join('')
}

function normalizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  return trimmed.slice(0, 60)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return res.status(401).json({ error: 'Missing Authorization Bearer token' })

  const { auth, db } = getAdmin()

  let uid: string
  try {
    const decoded = await auth.verifyIdToken(idToken)
    uid = decoded.uid
  } catch {
    return res.status(401).json({ error: 'Invalid or expired ID token' })
  }

  const name = normalizeName((req.body as { name?: unknown } | null)?.name)
  if (!name) return res.status(400).json({ error: 'name is required (1-60 chars)' })

  const serverId = generateUlid()

  try {
    await db
      .collection('users').doc(uid)
      .collection('servers').doc(serverId)
      .set({
        name,
        createdAt: FieldValue.serverTimestamp(),
        lastSeenAt: null,
        revoked: false,
      })

    const customToken = await auth.createCustomToken(uid, {
      serverId,
      kind: 'server',
    })

    return res.status(200).json({ customToken, serverId })
  } catch (err) {
    console.error('cli-auth/mint failed:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter=install-api exec vitest run api/cli-auth/mint.test.ts`
Expected: PASS — all 7 tests green.

- [ ] **Step 5: Commit**

```bash
git add apps/install-api/api/cli-auth/mint.ts apps/install-api/api/cli-auth/mint.test.ts
git commit -m "feat(install-api): add /api/cli-auth/mint endpoint 🔑"
```

---

### Task 6: Implement `POST /api/cli-auth/refresh` (TDD)

**Files:**
- Create: `apps/install-api/api/cli-auth/refresh.test.ts`
- Create: `apps/install-api/api/cli-auth/refresh.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/install-api/api/cli-auth/refresh.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const mockVerifyIdToken = vi.fn()
const mockCreateCustomToken = vi.fn()
const mockGet = vi.fn()
const mockUpdate = vi.fn()

vi.mock('./_lib/admin.js', () => ({
  getAdmin: () => ({
    auth: {
      verifyIdToken: mockVerifyIdToken,
      createCustomToken: mockCreateCustomToken,
    },
    db: {
      collection: () => ({
        doc: () => ({
          collection: () => ({
            doc: () => ({
              get: mockGet,
              update: mockUpdate,
            }),
          }),
        }),
      }),
    },
  }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import handler from './refresh.js'

function makeReq(body: unknown = { refreshToken: 'rt-abc' }): VercelRequest {
  return { method: 'POST', headers: {}, body } as unknown as VercelRequest
}

function makeRes(): VercelResponse & { _status: number; _body: unknown } {
  const res = {
    _status: 0,
    _body: undefined as unknown,
    setHeader: vi.fn(),
    status(code: number) { this._status = code; return this },
    json(body: unknown) { this._body = body; return this },
    end() { return this },
  }
  return res as unknown as VercelResponse & { _status: number; _body: unknown }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.FIREBASE_API_KEY = 'fake-api-key'
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      id_token: 'new-id-token',
      refresh_token: 'rotated-refresh-token',
      expires_in: '3600',
      user_id: 'user-123',
    }),
  })
  mockVerifyIdToken.mockResolvedValue({ uid: 'user-123', serverId: 'srv-1', kind: 'server' })
  mockCreateCustomToken.mockResolvedValue('new-custom-token')
  mockGet.mockResolvedValue({ exists: true, data: () => ({ revoked: false }) })
  mockUpdate.mockResolvedValue(undefined)
})

describe('POST /api/cli-auth/refresh', () => {
  it('returns 400 if refreshToken missing', async () => {
    const req = makeReq({})
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(400)
  })

  it('returns 401 when Firebase rejects the refresh token', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({}) })
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(401)
  })

  it('returns 401 when ID token has no serverId claim', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-123' }) // no serverId
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(401)
  })

  it('returns 403 when server is revoked in Firestore', async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ revoked: true }) })
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(403)
  })

  it('returns 403 when server doc does not exist (already deleted)', async () => {
    mockGet.mockResolvedValueOnce({ exists: false, data: () => undefined })
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(403)
  })

  it('updates lastSeenAt on success', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ lastSeenAt: expect.anything() })
    )
  })

  it('returns customToken, expiresIn, and rotated refreshToken on success', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(200)
    expect(res._body).toEqual({
      customToken: 'new-custom-token',
      expiresIn: 3600,
      refreshToken: 'rotated-refresh-token',
    })
  })

  it('mints custom token with the same serverId and kind=server claims', async () => {
    const req = makeReq()
    const res = makeRes()
    await handler(req, res)
    expect(mockCreateCustomToken).toHaveBeenCalledWith('user-123', {
      serverId: 'srv-1',
      kind: 'server',
    })
  })

  it('returns 405 on non-POST', async () => {
    const req = { method: 'GET', headers: {}, body: {} } as unknown as VercelRequest
    const res = makeRes()
    await handler(req, res)
    expect(res._status).toBe(405)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter=install-api exec vitest run api/cli-auth/refresh.test.ts`
Expected: FAIL — `Cannot find module './refresh.js'`

- [ ] **Step 3: Implement the handler**

```typescript
// apps/install-api/api/cli-auth/refresh.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdmin } from './_lib/admin.js'
import { applyCors } from './_lib/cors.js'

interface SecureTokenResponse {
  id_token: string
  refresh_token: string
  expires_in: string
  user_id: string
}

async function exchangeRefreshToken(
  refreshToken: string,
  apiKey: string,
): Promise<SecureTokenResponse | null> {
  const url = `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  })
  if (!res.ok) return null
  return (await res.json()) as SecureTokenResponse
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body as { refreshToken?: unknown } | null
  const refreshToken = typeof body?.refreshToken === 'string' ? body.refreshToken : null
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' })

  const apiKey = process.env.FIREBASE_API_KEY
  if (!apiKey) {
    console.error('FIREBASE_API_KEY env var missing')
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const tokenResp = await exchangeRefreshToken(refreshToken, apiKey)
  if (!tokenResp) {
    return res.status(401).json({ error: 'Refresh token invalid or revoked. Run "deja login" again.' })
  }

  const { auth, db } = getAdmin()

  let decoded: { uid: string; serverId?: string; kind?: string }
  try {
    decoded = (await auth.verifyIdToken(tokenResp.id_token)) as typeof decoded
  } catch {
    return res.status(401).json({ error: 'ID token verification failed' })
  }

  if (!decoded.serverId || decoded.kind !== 'server') {
    return res.status(401).json({ error: 'Token is not a server credential' })
  }

  const serverDocRef = db
    .collection('users').doc(decoded.uid)
    .collection('servers').doc(decoded.serverId)

  const snap = await serverDocRef.get()
  if (!snap.exists) {
    return res.status(403).json({ error: 'Server credential has been deleted' })
  }
  if (snap.data()?.revoked === true) {
    return res.status(403).json({ error: 'Server credential has been revoked' })
  }

  // Best-effort lastSeenAt update — don't fail the request if this errors.
  try {
    await serverDocRef.update({ lastSeenAt: FieldValue.serverTimestamp() })
  } catch (err) {
    console.warn('lastSeenAt update failed (non-fatal):', err)
  }

  let customToken: string
  try {
    customToken = await auth.createCustomToken(decoded.uid, {
      serverId: decoded.serverId,
      kind: 'server',
    })
  } catch (err) {
    console.error('createCustomToken failed:', err)
    return res.status(500).json({ error: 'Failed to mint custom token' })
  }

  return res.status(200).json({
    customToken,
    expiresIn: parseInt(tokenResp.expires_in, 10),
    refreshToken: tokenResp.refresh_token,
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter=install-api exec vitest run api/cli-auth/refresh.test.ts`
Expected: PASS — all 9 tests green.

- [ ] **Step 5: Commit**

```bash
git add apps/install-api/api/cli-auth/refresh.ts apps/install-api/api/cli-auth/refresh.test.ts
git commit -m "feat(install-api): add /api/cli-auth/refresh endpoint 🔄"
```

---

## Phase 3: Server-side auth module

### Task 7: Add `firebase-user-node` to package exports

**Files:**
- Modify: `packages/firebase-config/package.json`

- [ ] **Step 1: Add the new export path**

In `packages/firebase-config/package.json`, update the `exports` field:

```json
"exports": {
  ".": "./src/index.ts",
  "./firebase": "./src/firebase.ts",
  "./firebase-node": "./src/firebase-node.ts",
  "./firebase-admin-node": "./src/firebase-admin-node.ts",
  "./firebase-user-node": "./src/firebase-user-node.ts"
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/firebase-config/package.json
git commit -m "feat(firebase-config): add firebase-user-node export path 📦"
```

---

### Task 8: Implement `firebase-user-node.ts` token exchange + sign-in (TDD)

**Files:**
- Create: `packages/firebase-config/src/firebase-user-node.test.ts`
- Create: `packages/firebase-config/src/firebase-user-node.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/firebase-config/src/firebase-user-node.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignInWithCustomToken = vi.fn()
const mockInitializeApp = vi.fn(() => ({}))
const mockInitializeAuth = vi.fn(() => ({ currentUser: null }))
const mockInMemoryPersistence = {}
const mockGetFirestore = vi.fn(() => ({}))
const mockGetDatabase = vi.fn(() => ({}))

vi.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: () => [],
}))
vi.mock('firebase/auth', () => ({
  initializeAuth: mockInitializeAuth,
  inMemoryPersistence: mockInMemoryPersistence,
  signInWithCustomToken: mockSignInWithCustomToken,
}))
vi.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
}))
vi.mock('firebase/database', () => ({
  getDatabase: mockGetDatabase,
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { exchangeRefreshTokenForCustomToken, AuthMissingError } from './firebase-user-node.js'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.VITE_FIREBASE_API_KEY = 'fake-api-key'
  mockSignInWithCustomToken.mockResolvedValue({
    user: { uid: 'user-123', refreshToken: 'rt-rotated', email: 'test@example.com' },
  })
})

describe('exchangeRefreshTokenForCustomToken', () => {
  it('throws AuthMissingError when refresh token is missing', async () => {
    await expect(
      exchangeRefreshTokenForCustomToken({ refreshToken: '', refreshUrl: 'http://x' })
    ).rejects.toBeInstanceOf(AuthMissingError)
  })

  it('calls the refresh endpoint with the token in body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customToken: 'ct', expiresIn: 3600, refreshToken: 'rt2' }),
    })
    const result = await exchangeRefreshTokenForCustomToken({
      refreshToken: 'rt-1',
      refreshUrl: 'https://install.dejajs.com/api/cli-auth/refresh',
    })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://install.dejajs.com/api/cli-auth/refresh',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'rt-1' }),
      })
    )
    expect(result).toEqual({ customToken: 'ct', expiresIn: 3600, refreshToken: 'rt2' })
  })

  it('throws AuthMissingError on 401 (revoked or invalid)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'invalid' }),
    })
    await expect(
      exchangeRefreshTokenForCustomToken({
        refreshToken: 'rt-1',
        refreshUrl: 'http://x',
      })
    ).rejects.toBeInstanceOf(AuthMissingError)
  })

  it('throws regular Error on network failure (5xx, etc)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'oops' }),
    })
    await expect(
      exchangeRefreshTokenForCustomToken({
        refreshToken: 'rt-1',
        refreshUrl: 'http://x',
      })
    ).rejects.not.toBeInstanceOf(AuthMissingError)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter=@repo/firebase-config exec vitest run src/firebase-user-node.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the module**

```typescript
// packages/firebase-config/src/firebase-user-node.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  initializeAuth,
  inMemoryPersistence,
  signInWithCustomToken,
  type Auth,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getDatabase, type Database } from 'firebase/database'

/**
 * Thrown when the server cannot authenticate. The CLI / server entry point
 * should print "Run 'deja login' first." and exit cleanly when seeing this.
 */
export class AuthMissingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthMissingError'
  }
}

interface RefreshResponse {
  customToken: string
  expiresIn: number
  refreshToken: string
}

/**
 * POST the stored refresh token to /api/cli-auth/refresh and receive a fresh
 * Firebase custom token suitable for `signInWithCustomToken`.
 */
export async function exchangeRefreshTokenForCustomToken(opts: {
  refreshToken: string
  refreshUrl: string
}): Promise<RefreshResponse> {
  if (!opts.refreshToken) {
    throw new AuthMissingError('No refresh token available. Run "deja login" first.')
  }
  const res = await fetch(opts.refreshUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: opts.refreshToken }),
  })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new AuthMissingError(
        'Server credential is invalid or revoked. Run "deja login" again to reconnect.',
      )
    }
    throw new Error(`Refresh failed with status ${res.status}`)
  }
  return (await res.json()) as RefreshResponse
}

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let rtdb: Database | null = null

interface InitOptions {
  /** Firebase web config object (apiKey, authDomain, etc.) */
  config: {
    apiKey: string
    authDomain: string
    databaseURL: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
  /** Custom token to sign in with (already obtained via /api/cli-auth/refresh). */
  customToken: string
}

/**
 * One-time initialization: create the Firebase app, sign in with the custom
 * token, and cache the authenticated SDK instances. Call exactly once at startup.
 */
export async function initFirebaseUserAuth(opts: InitOptions): Promise<{
  firebaseApp: FirebaseApp
  auth: Auth
  db: Firestore
  rtdb: Database
  uid: string
  refreshToken: string
}> {
  if (firebaseApp) {
    throw new Error('initFirebaseUserAuth already called — Firebase app is already initialized')
  }

  const existingApps = getApps()
  firebaseApp = existingApps[0] ?? initializeApp(opts.config)
  auth = initializeAuth(firebaseApp, { persistence: inMemoryPersistence })

  const credential = await signInWithCustomToken(auth, opts.customToken)
  if (!credential.user) {
    throw new Error('signInWithCustomToken returned no user')
  }

  db = getFirestore(firebaseApp)
  rtdb = getDatabase(firebaseApp)

  return {
    firebaseApp,
    auth,
    db,
    rtdb,
    uid: credential.user.uid,
    refreshToken: credential.user.refreshToken,
  }
}

/** Accessors — throw if init hasn't run yet. */
export function getDb(): Firestore {
  if (!db) throw new Error('Firebase user auth not initialized — call initFirebaseUserAuth first')
  return db
}

export function getRtdb(): Database {
  if (!rtdb) throw new Error('Firebase user auth not initialized — call initFirebaseUserAuth first')
  return rtdb
}

export function getAuthInstance(): Auth {
  if (!auth) throw new Error('Firebase user auth not initialized — call initFirebaseUserAuth first')
  return auth
}
```

> **⚠️ Note for the implementer:** This module exports `getDb()` / `getRtdb()` accessors instead of top-level `db` / `rtdb` constants because Firestore/RTDB cannot be created until after sign-in. Consumers will need to call the accessors (or import after init). Task 11 handles consumer migration with a thin compatibility shim that exposes `db` / `rtdb` after init.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter=@repo/firebase-config exec vitest run src/firebase-user-node.test.ts`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Type-check**

Run: `pnpm --filter=@repo/firebase-config check-types`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/firebase-config/src/firebase-user-node.ts packages/firebase-config/src/firebase-user-node.test.ts
git commit -m "feat(firebase-config): add firebase-user-node module with refresh-token auth 🔐"
```

---

### Task 9: Add compatibility shim — top-level `db` / `rtdb` exports backed by accessors

**Files:**
- Modify: `packages/firebase-config/src/firebase-user-node.ts`

The current admin-node module exports top-level `db` and `rtdb` constants that are imported widely (`import { db, rtdb } from '@repo/firebase-config/firebase-admin-node'`). To avoid changing every call site signature, expose `db` / `rtdb` as proxies that resolve lazily.

- [ ] **Step 1: Add proxy exports at the bottom of `firebase-user-node.ts`**

Append to the file:

```typescript
/**
 * Lazy proxy: forwards property access to the live Firestore instance once
 * `initFirebaseUserAuth` has run. Throws on access before init.
 *
 * This exists so existing call sites can keep `import { db, rtdb }` syntax.
 */
export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const target = getDb() as unknown as Record<string | symbol, unknown>
    const value = target[prop]
    return typeof value === 'function' ? value.bind(target) : value
  },
})

export const rtdb: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const target = getRtdb() as unknown as Record<string | symbol, unknown>
    const value = target[prop]
    return typeof value === 'function' ? value.bind(target) : value
  },
})
```

- [ ] **Step 2: Add a test for the proxy behavior**

Append to `firebase-user-node.test.ts`:

```typescript
describe('db / rtdb proxy exports', () => {
  it('throws if accessed before init', async () => {
    // dynamic import to get a fresh module state
    vi.resetModules()
    const { db: freshDb } = await import('./firebase-user-node.js')
    expect(() => (freshDb as unknown as { collection: unknown }).collection).toThrow(
      /not initialized/,
    )
  })
})
```

- [ ] **Step 3: Run tests**

Run: `pnpm --filter=@repo/firebase-config exec vitest run src/firebase-user-node.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 4: Commit**

```bash
git add packages/firebase-config/src/firebase-user-node.ts packages/firebase-config/src/firebase-user-node.test.ts
git commit -m "feat(firebase-config): add lazy db/rtdb proxies for legacy import shape ♻️"
```

---

## Phase 4: CLI — `deja login`

### Task 10: Implement `tui/lib/login.mjs` Node helper

**Files:**
- Create: `apps/cli/tui/lib/login.mjs`

- [ ] **Step 1: Write the helper script**

```javascript
// apps/cli/tui/lib/login.mjs
/**
 * deja login — exchange a custom token for a long-lived refresh token, then
 * persist it to ~/.deja/config.json.
 *
 * Modes:
 *   default       interactive: read custom token from stdin
 *   --token <t>   non-interactive
 *   --output-token   prints the resulting refresh token to stdout (no config write)
 *
 * Loaded by ~/.deja/bin/deja → cmd_login.
 */

import { initializeApp, getApps } from 'firebase/app'
import { initializeAuth, inMemoryPersistence, signInWithCustomToken } from 'firebase/auth'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout, stderr, argv, exit } from 'node:process'

const DEJA_DIR = process.env.DEJA_DIR || join(homedir(), '.deja')
const CONFIG_FILE = join(DEJA_DIR, 'config.json')
const ENV_FILE = join(DEJA_DIR, '.env')

function loadEnv() {
  if (!existsSync(ENV_FILE)) return
  for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

function parseArgs(args) {
  const result = { token: null, outputToken: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--token') result.token = args[i + 1] ?? null
    else if (args[i] === '--output-token') result.outputToken = true
  }
  return result
}

function decodeJwtPayload(jwt) {
  try {
    const parts = jwt.split('.')
    if (parts.length !== 3) return null
    const json = Buffer.from(parts[1], 'base64url').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function readTokenFromStdin() {
  const rl = createInterface({ input: stdin, output: stderr }) // prompt to stderr so it doesn't pollute stdout
  const answer = await rl.question('Paste your custom token: ')
  rl.close()
  return answer.trim()
}

function readConfig() {
  try { return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) }
  catch { return {} }
}

function writeConfig(updates) {
  const merged = { ...readConfig(), ...updates }
  if (!existsSync(dirname(CONFIG_FILE))) mkdirSync(dirname(CONFIG_FILE), { recursive: true })
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2))
}

async function main() {
  loadEnv()
  const { token: tokenArg, outputToken } = parseArgs(argv.slice(2))

  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY
  if (!apiKey) {
    stderr.write('❌ Missing VITE_FIREBASE_API_KEY in ~/.deja/.env\n')
    exit(1)
  }

  const customToken = tokenArg || (await readTokenFromStdin())
  if (!customToken) {
    stderr.write('❌ No custom token provided.\n')
    exit(1)
  }

  const claims = decodeJwtPayload(customToken)
  const serverId = claims?.claims?.serverId ?? claims?.serverId
  if (!serverId) {
    stderr.write('❌ Token has no serverId claim — was it minted by /api/cli-auth/mint?\n')
    exit(1)
  }

  const config = {
    apiKey,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  }

  const app = getApps()[0] ?? initializeApp(config)
  const auth = initializeAuth(app, { persistence: inMemoryPersistence })

  let credential
  try {
    credential = await signInWithCustomToken(auth, customToken)
  } catch (err) {
    stderr.write(`❌ Sign-in failed: ${err.message}\n`)
    if (err.code === 'auth/invalid-custom-token' || err.code === 'auth/custom-token-mismatch') {
      stderr.write('   Tokens expire 1 hour after generation. Generate a new one and try again.\n')
    }
    exit(1)
  }

  const { uid, refreshToken } = credential.user
  if (!refreshToken) {
    stderr.write('❌ Sign-in succeeded but no refresh token returned.\n')
    exit(1)
  }

  if (outputToken) {
    stdout.write(refreshToken + '\n')
    stderr.write(`✅ Logged in as ${credential.user.email ?? uid}. Refresh token printed to stdout.\n`)
    exit(0)
  }

  writeConfig({ uid, serverId, refreshToken })
  stderr.write(`✅ Logged in as ${credential.user.email ?? uid}. Server: ${serverId}\n`)
}

main().catch((err) => {
  stderr.write(`❌ Unexpected error: ${err.message}\n`)
  exit(1)
})
```

- [ ] **Step 2: Manually run a smoke test (offline-friendly)**

```bash
node apps/cli/tui/lib/login.mjs --token bogus
```
Expected: prints `❌ Token has no serverId claim` and exits 1 (verifies decode/dispatch logic without needing a real token).

- [ ] **Step 3: Commit**

```bash
git add apps/cli/tui/lib/login.mjs
git commit -m "feat(cli): add login.mjs helper for custom-token sign-in 🔑"
```

---

### Task 11: Wire `cmd_login` into the bash CLI dispatcher

**Files:**
- Modify: `apps/cli/deja`

- [ ] **Step 1: Add `cmd_login` function**

In `apps/cli/deja`, find the `# Main` section near the bottom (around line 746–774). Insert this function definition above the `case` block:

```bash
cmd_login() {
  local node_helper="${SERVER_DIR}/login.mjs"
  if [ ! -f "${node_helper}" ]; then
    # During development, the helper lives in the source repo.
    node_helper="$(dirname "$0")/../tui/lib/login.mjs"
  fi
  if [ ! -f "${node_helper}" ]; then
    err "login.mjs helper not found"
    return 1
  fi
  print_banner
  echo ""
  info "🔑 Connect this server to your DEJA account"
  info "   1. Visit https://cloud.dejajs.com/settings"
  info "   2. Click 'Connect a new server'"
  info "   3. Copy the token and paste below"
  echo ""
  node "${node_helper}" "$@"
}
```

- [ ] **Step 2: Add `login` to the dispatch case**

In the `case "${1:-}"` block at the bottom of the file, add the `login` case immediately after the `update` line:

```bash
  login)    shift; cmd_login "$@" ;;
```

The block should now read (in order): `start`, `stop`, `restart`, `status`, `logs`, `update`, `login`, `tunnel`, `deploy`, `--version`, `--help`, ...

- [ ] **Step 3: Update `cmd_help` to list the new command**

Search for the `cmd_help()` function and add a line for `login`. The exact format depends on the existing help text — match the `update` line's style. Example:

```bash
  echo -e "  ${BOLD}deja login${NC}       🔑 Connect this server to your DEJA account"
```

- [ ] **Step 4: Smoke test**

```bash
chmod +x apps/cli/deja
DEJA_DIR=/tmp/deja-test apps/cli/deja login --token bogus
```
Expected: prints the banner + info lines + error message about invalid token.

- [ ] **Step 5: Commit**

```bash
git add apps/cli/deja
git commit -m "feat(cli): add 'deja login' subcommand 🔑"
```

---

## Phase 5: Server-side wiring

### Task 12: Update server entry to bootstrap user auth (with legacy fallback)

**Files:**
- Modify: `apps/server/index.ts`
- Create: `apps/server/src/lib/auth-bootstrap.ts`
- Create: `apps/server/src/lib/auth-bootstrap.test.ts`

- [ ] **Step 1: Write the failing test for auth-bootstrap**

```typescript
// apps/server/src/lib/auth-bootstrap.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockExchange = vi.fn()
const mockInit = vi.fn()
const mockReadConfig = vi.fn()
const mockWriteConfigCache = vi.fn()

vi.mock('@repo/firebase-config/firebase-user-node', () => ({
  exchangeRefreshTokenForCustomToken: mockExchange,
  initFirebaseUserAuth: mockInit,
  AuthMissingError: class AuthMissingError extends Error {
    constructor(m: string) { super(m); this.name = 'AuthMissingError' }
  },
}))
vi.mock('./subscription.js', () => ({
  readConfig: mockReadConfig,
  writeConfigCache: mockWriteConfigCache,
}))

import { bootstrapAuth } from './auth-bootstrap.js'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.VITE_FIREBASE_API_KEY = 'k'
  process.env.VITE_FIREBASE_AUTH_DOMAIN = 'd'
  process.env.VITE_FIREBASE_DATABASE_URL = 'u'
  process.env.VITE_FIREBASE_PROJECT_ID = 'p'
  process.env.VITE_FIREBASE_STORAGE_BUCKET = 's'
  process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = 'm'
  process.env.VITE_FIREBASE_APP_ID = 'a'
})

describe('bootstrapAuth', () => {
  it('uses DEJA_REFRESH_TOKEN env var when present', async () => {
    process.env.DEJA_REFRESH_TOKEN = 'env-token'
    mockExchange.mockResolvedValueOnce({ customToken: 'ct', expiresIn: 3600, refreshToken: 'rt' })
    mockInit.mockResolvedValueOnce({ uid: 'u', refreshToken: 'rt' })
    await bootstrapAuth()
    expect(mockExchange).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'env-token' }),
    )
    delete process.env.DEJA_REFRESH_TOKEN
  })

  it('falls back to ~/.deja/config.json refreshToken', async () => {
    delete process.env.DEJA_REFRESH_TOKEN
    mockReadConfig.mockResolvedValueOnce({ uid: 'u', refreshToken: 'cfg-token' })
    mockExchange.mockResolvedValueOnce({ customToken: 'ct', expiresIn: 3600, refreshToken: 'rt' })
    mockInit.mockResolvedValueOnce({ uid: 'u', refreshToken: 'rt' })
    await bootstrapAuth()
    expect(mockExchange).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'cfg-token' }),
    )
  })

  it('persists rotated refreshToken back to config', async () => {
    delete process.env.DEJA_REFRESH_TOKEN
    mockReadConfig.mockResolvedValueOnce({ uid: 'u', refreshToken: 'old' })
    mockExchange.mockResolvedValueOnce({ customToken: 'ct', expiresIn: 3600, refreshToken: 'new-rt' })
    mockInit.mockResolvedValueOnce({ uid: 'u', refreshToken: 'new-rt' })
    await bootstrapAuth()
    expect(mockWriteConfigCache).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'new-rt' }),
    )
  })

  it('throws AuthMissingError when no refresh token anywhere', async () => {
    delete process.env.DEJA_REFRESH_TOKEN
    mockReadConfig.mockResolvedValueOnce({ uid: 'u' }) // no refreshToken
    await expect(bootstrapAuth()).rejects.toThrow(/refresh token/i)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter=deja-serverts exec vitest run src/lib/auth-bootstrap.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `auth-bootstrap.ts`**

```typescript
// apps/server/src/lib/auth-bootstrap.ts
import {
  exchangeRefreshTokenForCustomToken,
  initFirebaseUserAuth,
  AuthMissingError,
} from '@repo/firebase-config/firebase-user-node'
import { readConfig, writeConfigCache } from './subscription.js'
import { log } from '../utils/logger.js'

const REFRESH_URL =
  process.env.DEJA_INSTALL_API_BASE
    ? `${process.env.DEJA_INSTALL_API_BASE}/api/cli-auth/refresh`
    : 'https://install.dejajs.com/api/cli-auth/refresh'

const REFRESH_BUFFER_MS = 5 * 60 * 1000 // refresh 5 min before expiry

let refreshTimer: ReturnType<typeof setTimeout> | null = null

function getFirebaseConfigFromEnv() {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ] as const
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`)
    }
  }
  return {
    apiKey: process.env.VITE_FIREBASE_API_KEY!,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN!,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL!,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.VITE_FIREBASE_APP_ID!,
  }
}

async function getStoredRefreshToken(): Promise<string | null> {
  if (process.env.DEJA_REFRESH_TOKEN) return process.env.DEJA_REFRESH_TOKEN
  try {
    const cfg = await readConfig()
    return (cfg as { refreshToken?: string }).refreshToken ?? null
  } catch {
    return null
  }
}

/**
 * One-shot startup auth: exchange refresh token → custom token → sign in.
 * Schedules an auto-refresh timer.
 */
export async function bootstrapAuth(): Promise<{ uid: string }> {
  const refreshToken = await getStoredRefreshToken()
  if (!refreshToken) {
    throw new AuthMissingError(
      'No refresh token found in ~/.deja/config.json or DEJA_REFRESH_TOKEN env var. Run "deja login" first.',
    )
  }

  const { customToken, expiresIn, refreshToken: rotated } =
    await exchangeRefreshTokenForCustomToken({
      refreshToken,
      refreshUrl: REFRESH_URL,
    })

  // Persist any rotated refresh token back to config (idempotent if same).
  if (rotated && rotated !== refreshToken) {
    try {
      await writeConfigCache({ refreshToken: rotated } as never)
    } catch (err) {
      log.warn('Failed to persist rotated refresh token (non-fatal):', err)
    }
  }

  const result = await initFirebaseUserAuth({
    config: getFirebaseConfigFromEnv(),
    customToken,
  })

  scheduleNextRefresh(expiresIn)
  log.success(`[AUTH] Authenticated as ${result.uid}`)
  return { uid: result.uid }
}

function scheduleNextRefresh(expiresInSec: number): void {
  if (refreshTimer) clearTimeout(refreshTimer)
  const delayMs = Math.max(60_000, expiresInSec * 1000 - REFRESH_BUFFER_MS)
  refreshTimer = setTimeout(() => {
    bootstrapAuth().catch((err) => {
      log.error('[AUTH] Auto-refresh failed; existing session continues until ID token expiry:', err)
      // Try again in 5 minutes
      scheduleNextRefresh(300)
    })
  }, delayMs)
  refreshTimer.unref?.()
}

export function stopAuthRefresh(): void {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = null
}
```

- [ ] **Step 4: Add `writeConfigCache` overload for refreshToken**

In `apps/server/src/lib/subscription.ts`, the existing `writeConfigCache` only persists subscription data. Generalize it to accept any partial config update. Locate the function and replace with:

```typescript
export async function writeConfigCache(updates: Partial<DejaConfig>): Promise<void> {
  const configPath = getConfigPath()
  const raw = await readFile(configPath, 'utf8')
  const config = JSON.parse(raw) as DejaConfig
  Object.assign(config, updates)
  const dir = join(homedir(), '.deja')
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf8')
}
```

Also extend `DejaConfig` interface to include the new field:

```typescript
export interface DejaConfig {
  uid: string
  layoutId: string
  refreshToken?: string  // ← ADD THIS
  serverId?: string      // ← AND THIS
  subscription?: CachedSubscription
  onboardingComplete?: boolean
  // ... existing fields
}
```

Existing call sites of `writeConfigCache(subscription)` need a one-line tweak — change them to `writeConfigCache({ subscription })`. Locate all call sites (likely 2–3 in `subscription.ts` itself):

```bash
grep -n "writeConfigCache(" apps/server/src/lib/subscription.ts
```

Update each call: `writeConfigCache(cache)` → `writeConfigCache({ subscription: cache })`.

- [ ] **Step 5: Run tests**

Run: `pnpm --filter=deja-serverts exec vitest run src/lib/auth-bootstrap.test.ts src/lib/subscription.test.ts`
Expected: PASS — 4 new + existing subscription tests still green. (If `subscription.test.ts` fails on the writeConfigCache signature, update mocks and assertions there to match the new shape.)

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/lib/auth-bootstrap.ts apps/server/src/lib/auth-bootstrap.test.ts apps/server/src/lib/subscription.ts
git commit -m "feat(server): add auth-bootstrap for refresh-token sign-in 🔐"
```

---

### Task 13: Migrate server import sites from `firebase-admin-node` to `firebase-user-node`

**Files:**
- Modify: 9 files in `apps/server/src` (see list below)

The new module exports `db` and `rtdb` with the same shape, so the migration is a mechanical import-path swap. The Admin SDK's `FieldValue` and `ServerValue` need replacement too.

| Admin SDK | Client SDK equivalent |
|-----------|-----------------------|
| `import { FieldValue } from 'firebase-admin/firestore'` | `import { serverTimestamp, deleteField, increment, arrayUnion, arrayRemove } from 'firebase/firestore'` |
| `FieldValue.serverTimestamp()` | `serverTimestamp()` |
| `FieldValue.delete()` | `deleteField()` |
| `FieldValue.increment(n)` | `increment(n)` |
| `FieldValue.arrayUnion(x)` | `arrayUnion(x)` |
| `FieldValue.arrayRemove(x)` | `arrayRemove(x)` |
| `import { ServerValue } from 'firebase-admin/database'` | `import { serverTimestamp as rtdbServerTimestamp } from 'firebase/database'` |
| `ServerValue.TIMESTAMP` | `rtdbServerTimestamp()` |

Also: client SDK `getDoc(ref)` returns a `DocumentSnapshot` that has `data()` (same as admin), and `setDoc` / `updateDoc` are the equivalents of admin's `.set()` / `.update()`. The admin SDK uses chained methods (`db.collection(x).doc(y).set(...)`); the client SDK uses standalone functions (`setDoc(doc(db, x, y), ...)`). **Caution:** this is a meaningful API surface change.

> **🚨 Important:** Step 1 below addresses this API surface mismatch. Skipping it will break every call site.

- [ ] **Step 1: Add a thin chained-API compat layer to `firebase-user-node.ts`**

To minimize call-site churn during the v1.8 release, add admin-SDK-shaped helpers that wrap the client SDK. Append to `firebase-user-node.ts`:

```typescript
import {
  doc as fsDoc,
  collection as fsCollection,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp as fsServerTimestamp,
  type Firestore as FsFirestore,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore'
import { ref as rtdbRef, get as rtdbGet, set as rtdbSet, update as rtdbUpdate, serverTimestamp as rtdbServerTimestamp, push as rtdbPush, remove as rtdbRemove, type Database as DbType } from 'firebase/database'

/** Admin-SDK-shaped Firestore wrapper for backward compatibility. */
export interface AdminLikeFirestore {
  collection(path: string): AdminLikeCollection
}
export interface AdminLikeCollection {
  doc(id: string): AdminLikeDocRef
  add(data: object): Promise<AdminLikeDocRef>
}
export interface AdminLikeDocRef {
  collection(path: string): AdminLikeCollection
  get(): Promise<{ exists: boolean; data: () => unknown | undefined }>
  set(data: object, options?: { merge?: boolean }): Promise<void>
  update(data: object): Promise<void>
  delete(): Promise<void>
}

function wrapDocRef(ref: DocumentReference): AdminLikeDocRef {
  return {
    collection(path) { return wrapCollection(fsCollection(ref, path)) },
    async get() {
      const snap = await getDoc(ref)
      return { exists: snap.exists(), data: () => snap.data() }
    },
    async set(data, options) { await setDoc(ref, data, options ?? {}) },
    async update(data) { await updateDoc(ref, data as never) },
    async delete() { await deleteDoc(ref) },
  }
}

function wrapCollection(coll: CollectionReference): AdminLikeCollection {
  return {
    doc(id) { return wrapDocRef(fsDoc(coll, id)) },
    async add(data) {
      // Mirror admin's .add() — generate id client-side
      const newRef = fsDoc(coll)
      await setDoc(newRef, data)
      return wrapDocRef(newRef)
    },
  }
}

function makeAdminLikeDb(fs: FsFirestore): AdminLikeFirestore {
  return { collection(path) { return wrapCollection(fsCollection(fs, path)) } }
}

// Re-export under the admin-SDK names that existing call sites expect.
// `db` and `rtdb` proxies above stay unchanged — but they wrap the admin-like shape.
```

> **⚠️ This compat layer covers the Firestore methods used in the existing server code. RTDB is largely already compatible since the modular `firebase/database` API is similar. The implementation will likely require expanding this shim incrementally as call sites trigger missing methods.**

**Pragmatic path for the implementer:** rather than expand the shim ahead of time, do step 2 below and run the type checker. Each error message will name a specific method needed; add it to the shim as you go.

- [ ] **Step 2: Replace import paths in all 9 server files**

For each file in this list, change the import path from `firebase-admin-node` to `firebase-user-node`, and update `FieldValue`/`ServerValue` imports per the table above:

```
apps/server/src/dejaCloud.ts
apps/server/src/lib/dcc.ts
apps/server/src/lib/deja.ts
apps/server/src/lib/onboarding.ts
apps/server/src/lib/subscription.ts
apps/server/src/modules/roster.ts
apps/server/src/modules/blocks.ts
apps/server/src/modules/sync-config.ts
```

Also the migration scripts (these are developer-only one-off scripts; they may legitimately need admin privileges to operate cross-user):
```
apps/server/src/scripts/migrate-routes.ts
apps/server/src/scripts/migrate-signals.ts
```

> **Note:** if these scripts perform writes that the running user wouldn't have permission for (e.g., writing to other users' layouts), keep them on `firebase-admin-node` and only migrate the runtime code. The admin SDK module stays available for developer scripts even though end-user servers no longer use it.

- [ ] **Step 3: Update test mock paths**

In each test file, replace mocks of `@repo/firebase-config/firebase-admin-node` with `@repo/firebase-config/firebase-user-node`:

```
apps/server/src/lib/dcc.test.ts
apps/server/src/lib/subscription.test.ts
apps/server/src/modules/sync-config.test.ts
```

- [ ] **Step 4: Iteratively type-check + fix**

Run: `pnpm --filter=deja-serverts type-check`

Expect compile errors. For each error, either:
- Add the missing method to the compat shim in `firebase-user-node.ts` (Task 13 step 1)
- OR update the call site to use the new client-SDK API directly (`setDoc`, `getDoc`, etc.) — preferred for new code, but discouraged here to limit scope.

Repeat until type-check passes.

- [ ] **Step 5: Run tests**

Run: `pnpm --filter=deja-serverts test`
Expected: PASS (with mocks updated to new path).

- [ ] **Step 6: Commit**

```bash
git add apps/server/src packages/firebase-config/src
git commit -m "refactor(server): migrate server imports to firebase-user-node ♻️"
```

---

### Task 14: Wire `bootstrapAuth` into `apps/server/index.ts` startup

**Files:**
- Modify: `apps/server/index.ts`

- [ ] **Step 1: Insert auth bootstrap before subscription validation**

In `apps/server/index.ts`, locate the `main()` function. The current flow is:
1. `validateSubscription()`
2. `readConfig()`
3. `startPeriodicRecheck(config.uid)`

The new flow must auth FIRST so `validateSubscription` uses the user-authenticated SDK:

```typescript
// Near the top:
import { bootstrapAuth, stopAuthRefresh } from './src/lib/auth-bootstrap.js'
import { AuthMissingError } from '@repo/firebase-config/firebase-user-node'

// Inside main(), BEFORE validateSubscription:
try {
  await bootstrapAuth()
} catch (err) {
  if (err instanceof AuthMissingError) {
    log.fatal(`[AUTH] ${err.message}`)
    process.exit(1)
  }
  throw err
}

// Then proceed with the existing subscription gate, etc.
```

- [ ] **Step 2: Stop the refresh timer on shutdown**

In the existing graceful-shutdown handler (search for `isShuttingDown` and the `SIGTERM` / `SIGINT` handlers), add `stopAuthRefresh()` to the cleanup list alongside `stopPeriodicRecheck()`.

- [ ] **Step 3: Manually verify the dev path works**

Prerequisite: have run `deja login` once on the dev machine (or set `DEJA_REFRESH_TOKEN`).

Run: `pnpm --filter=deja-serverts dev`
Expected: server logs `[AUTH] Authenticated as <uid>` before the subscription check, and continues normal startup.

- [ ] **Step 4: Commit**

```bash
git add apps/server/index.ts
git commit -m "feat(server): bootstrap user auth on startup before subscription check 🚀"
```

---

## Phase 6: Settings UI in `apps/cloud`

### Task 15: Create `ConnectedServers.vue` card

**Files:**
- Create: `apps/cloud/src/Settings/ConnectedServers.vue`

- [ ] **Step 1: Write the component**

```vue
<!-- apps/cloud/src/Settings/ConnectedServers.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser, useCollection } from 'vuefire'
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase-node'
import type { ServerRecordWithId } from '@repo/modules'
import ConnectServerDialog from './ConnectServerDialog.vue'

const user = useCurrentUser()

const serversRef = computed(() =>
  user.value ? collection(db, 'users', user.value.uid, 'servers') : null,
)
const servers = useCollection<ServerRecordWithId>(serversRef)

const dialogOpen = ref(false)

function statusOf(server: ServerRecordWithId): { color: string; label: string } {
  if (server.revoked) return { color: 'error', label: 'Revoked' }
  if (!server.lastSeenAt) return { color: 'grey', label: 'Never connected' }
  const ageMs = Date.now() - server.lastSeenAt.toDate().getTime()
  if (ageMs < 5 * 60_000) return { color: 'success', label: 'Connected' }
  if (ageMs < 60 * 60_000) return { color: 'warning', label: 'Idle' }
  return { color: 'grey', label: 'Offline' }
}

function lastSeenLabel(server: ServerRecordWithId): string {
  if (!server.lastSeenAt) return 'Never connected'
  return `Last seen ${server.lastSeenAt.toDate().toLocaleString()}`
}

async function revokeServer(server: ServerRecordWithId) {
  if (!user.value) return
  if (!confirm(`Revoke "${server.name}"? This server will lose write access within seconds.`)) return
  await updateDoc(doc(db, 'users', user.value.uid, 'servers', server.id), { revoked: true })
}

async function deleteServer(server: ServerRecordWithId) {
  if (!user.value) return
  if (!confirm(`Permanently delete "${server.name}"? This cannot be undone.`)) return
  await deleteDoc(doc(db, 'users', user.value.uid, 'servers', server.id))
}
</script>

<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-server-network" class="mr-2" />
      Connected Servers
    </v-card-title>
    <v-card-text>
      <v-list v-if="servers && servers.length > 0">
        <v-list-item v-for="server in servers" :key="server.id" lines="two">
          <template #prepend>
            <v-icon :color="statusOf(server).color" icon="mdi-circle" size="small" />
          </template>
          <v-list-item-title>{{ server.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ statusOf(server).label }} · {{ lastSeenLabel(server) }}
          </v-list-item-subtitle>
          <template #append>
            <v-btn
              v-if="!server.revoked"
              variant="text"
              size="small"
              color="warning"
              @click="revokeServer(server)"
            >
              Revoke
            </v-btn>
            <v-btn
              v-else
              variant="text"
              size="small"
              color="error"
              @click="deleteServer(server)"
            >
              Delete
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
      <v-alert v-else type="info" variant="tonal" class="mb-4">
        No servers connected yet. Click below to connect your first server.
      </v-alert>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="dialogOpen = true"
      >
        Connect a new server
      </v-btn>
    </v-card-text>
    <ConnectServerDialog v-model="dialogOpen" />
  </v-card>
</template>
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter=deja-cloud check-types`
Expected: PASS (will fail until `ConnectServerDialog` exists in Task 16; that's fine — Task 16 lands the dialog).

- [ ] **Step 3: Commit (will stage with Task 16's commit; do not commit yet)**

Stage only:
```bash
git add apps/cloud/src/Settings/ConnectedServers.vue
```

---

### Task 16: Create `ConnectServerDialog.vue` modal

**Files:**
- Create: `apps/cloud/src/Settings/ConnectServerDialog.vue`

- [ ] **Step 1: Write the dialog**

```vue
<!-- apps/cloud/src/Settings/ConnectServerDialog.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCurrentUser } from 'vuefire'
import { getIdToken } from 'firebase/auth'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const user = useCurrentUser()

const step = ref<1 | 2>(1)
const name = ref('My Server')
const customToken = ref('')
const loading = ref(false)
const errorMsg = ref('')

const apiBase = import.meta.env.VITE_INSTALL_API_BASE || 'https://install.dejajs.com'

watch(() => props.modelValue, (open) => {
  if (open) {
    step.value = 1
    name.value = 'My Server'
    customToken.value = ''
    errorMsg.value = ''
  }
})

async function generate() {
  if (!user.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const idToken = await getIdToken(user.value)
    const res = await fetch(`${apiBase}/api/cli-auth/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ name: name.value }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? `Server returned ${res.status}`)
    }
    const data = (await res.json()) as { customToken: string; serverId: string }
    customToken.value = data.customToken
    step.value = 2
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const cliCommand = () => `deja login --token ${customToken.value}`

async function copyCommand() {
  await navigator.clipboard.writeText(cliCommand())
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="close"
    max-width="600"
  >
    <v-card>
      <v-card-title>
        {{ step === 1 ? 'Connect a new server' : 'Run this on your server' }}
      </v-card-title>
      <v-card-text>
        <template v-if="step === 1">
          <v-text-field
            v-model="name"
            label="Server name"
            placeholder="e.g. Basement Pi"
            :counter="60"
            maxlength="60"
            autofocus
          />
          <v-alert v-if="errorMsg" type="error" variant="tonal" class="mt-2">
            {{ errorMsg }}
          </v-alert>
        </template>
        <template v-else>
          <p class="mb-2">Paste this command into your server's terminal:</p>
          <v-textarea
            :model-value="cliCommand()"
            readonly
            rows="3"
            variant="outlined"
            class="font-mono"
          />
          <v-alert type="warning" variant="tonal" class="mt-2">
            This token can't be retrieved again. If you lose it, generate a new server credential.
          </v-alert>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <template v-if="step === 1">
          <v-btn variant="text" @click="close">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="!name.trim()"
            @click="generate"
          >
            Generate
          </v-btn>
        </template>
        <template v-else>
          <v-btn variant="text" @click="copyCommand">Copy command</v-btn>
          <v-btn color="primary" @click="close">Done</v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter=deja-cloud check-types`
Expected: PASS.

- [ ] **Step 3: Commit (Task 15 + 16 together)**

```bash
git add apps/cloud/src/Settings/ConnectedServers.vue apps/cloud/src/Settings/ConnectServerDialog.vue
git commit -m "feat(cloud): add Connected Servers settings card 🖥️"
```

---

### Task 17: Mount `<ConnectedServers />` in `Settings.vue`

**Files:**
- Modify: `apps/cloud/src/Settings/Settings.vue`

- [ ] **Step 1: Import and mount the component**

In `apps/cloud/src/Settings/Settings.vue`:

1. Add to the `<script setup>` imports:
   ```typescript
   import ConnectedServers from './ConnectedServers.vue'
   ```
2. In the `<template>`, place `<ConnectedServers />` near the existing settings cards. A reasonable spot is just before the layout/server-setup card. Locate that card and insert above:
   ```vue
   <ConnectedServers />
   ```

- [ ] **Step 2: Manual smoke test**

Start dev: `pnpm --filter=deja-cloud dev`
Open the cloud app at `http://localhost:5174/settings`. The "Connected Servers" card should render below the existing settings (likely empty state initially).

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Settings/Settings.vue
git commit -m "feat(cloud): mount Connected Servers card in Settings 🖥️"
```

---

## Phase 7: Migration messaging + docs

### Task 18: Annotate deprecated env vars in `.env.example` and `ENV.md`

**Files:**
- Modify: `.env.example`
- Modify: `ENV.md`

- [ ] **Step 1: Add deprecation note in `.env.example`**

Replace the `# ── Firebase (Admin — secret, server/cloud API only) ────` block with:

```bash
# ── Firebase (Admin SDK — DEPRECATED for end users; will be removed in v1.9) ────
# Required for: install-api Cloud Functions only.
# End users should use `deja login` instead — these vars are not needed on user machines.
# Dev fallback: if set, the server still uses these to authenticate (legacy path).
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

- [ ] **Step 2: Add `deja login` documentation block in `ENV.md`**

Find the section in `ENV.md` describing the Firebase env vars. Add a callout above the `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` entries:

```markdown
> **🔐 As of v1.8: end users no longer need service-account credentials.**
> Run `deja login` on your server to authenticate with your DEJA account. The
> service-account env vars below are deprecated for user installs and will be
> removed in v1.9. Cloud Functions (apps/install-api) still use them.
```

- [ ] **Step 3: Commit**

```bash
git add .env.example ENV.md
git commit -m "docs: deprecate service-account env vars for v1.8 → v1.9 migration 📋"
```

---

### Task 19: Update install script's post-install message

**Files:**
- Modify: `install.sh`

- [ ] **Step 1: Find the existing post-install summary**

Run: `grep -n "Installation complete\|installed at\|Next steps\|deja start" install.sh`

- [ ] **Step 2: Update the message to mention `deja login` BEFORE `deja start`**

Locate the post-install summary and change the suggested next step from `deja start` to `deja login` first. Example replacement:

```bash
echo ""
echo -e "  ${GREEN}✅ DEJA installed at ~/.deja/${NC}"
echo ""
echo -e "  ${BOLD}Next: log in to your DEJA account${NC}"
echo -e "    ${CYAN}deja login${NC}"
echo ""
echo -e "  Then start the server:"
echo -e "    ${CYAN}deja start${NC}"
echo ""
```

(Adjust the variable names and color codes to match the existing script's conventions.)

- [ ] **Step 3: Smoke test the install script with shellcheck**

Run: `shellcheck install.sh || true`
Expected: no new errors introduced (existing warnings are fine).

- [ ] **Step 4: Commit**

```bash
git add install.sh
git commit -m "docs(install): prompt 'deja login' as the first post-install step 🔐"
```

---

### Task 20: Add changeset

**Files:**
- Create: `.changeset/firebase-user-auth.md`

- [ ] **Step 1: Write the changeset**

```markdown
---
"deja-serverts": major
"deja-cli": minor
"deja-cloud": minor
"install-api": minor
"@repo/firebase-config": major
"@repo/modules": patch
---

added: **[server-auth]** Per-device user authentication via `deja login` 🔐

Replaces the distributed Firebase service-account credential with per-device
user auth. Each server is connected to a user's account through the new
"Connected Servers" UI in Settings, which mints a one-time custom token. The
CLI exchanges that token for a long-lived refresh token stored in
`~/.deja/config.json`, and the server signs in via Firebase client SDK on
each cold start.

⚠️ **Breaking change for end users:** after upgrading, run `deja login` to
authenticate this server with your DEJA account. The previous service-account
auth path has been removed.

**For developers:** run `deja login` once on each dev machine. Service-account
env vars (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) are no longer
required for the server. They remain required only for `apps/install-api`
(Cloud Functions).

**For CI:** set `DEJA_REFRESH_TOKEN` from a CI-dedicated user via
`deja login --output-token`.
```

- [ ] **Step 2: Commit**

```bash
git add .changeset/firebase-user-auth.md
git commit -m "chore: add changeset for firebase user-auth migration 📋"
```

---

## Phase 8: Verification

### Task 21: Full lint + type-check + test pass

- [ ] **Step 1: Lint**

Run: `pnpm lint`
Expected: PASS or only pre-existing warnings.

- [ ] **Step 2: Type-check**

Run: `pnpm check-types`
Expected: PASS.

- [ ] **Step 3: Run all tests**

Run: `pnpm --filter=deja-serverts test && pnpm --filter=install-api exec vitest run && pnpm --filter=@repo/firebase-config exec vitest run`
Expected: PASS.

- [ ] **Step 4: Manual end-to-end smoke test (requires staging Firebase)**

1. Open `http://localhost:5174/settings` in the cloud app
2. Click "Connect a new server" → enter "Test Server" → Generate
3. Copy the `deja login --token <ct>` command
4. In a separate terminal: run the command → expect `✅ Logged in as <email>. Server: ...`
5. Verify `~/.deja/config.json` contains `uid`, `serverId`, `refreshToken`
6. Start the server: `pnpm --filter=deja-serverts dev`
7. Server logs should show `[AUTH] Authenticated as <uid>` before the subscription check
8. Back in cloud app Settings: the new server entry should show "Connected" status (green)
9. Click Revoke → confirm → wait ~60 seconds
10. Trigger a server-side write (e.g., move a throttle in the throttle app) — server logs should show a permission-denied error
11. Restart the server — should fail with `Server credential has been revoked. Run "deja login" again.`

---

## Self-Review Checklist

After completing all tasks:

- [ ] All 9 server import sites migrated (Task 13)
- [ ] All 3 test mock paths updated (Task 13)
- [ ] Firestore rules deploy cleanly (Task 2)
- [ ] Both endpoints tested (Tasks 5, 6)
- [ ] Auth bootstrap tested (Task 12)
- [ ] CLI smoke-tests pass (Tasks 10, 11)
- [ ] UI renders + revokes work (Tasks 15–17, 21)
- [ ] Changeset describes the migration accurately (Task 20)
- [ ] No `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` references in `apps/server/src/**` after migration (`grep -r FIREBASE_PRIVATE_KEY apps/server/src` should return nothing)
- [ ] Manual E2E (Task 21 step 4) passes

---

## ⚠️ Deviation From Spec — Migration Strategy

The spec calls for v1.8 to support BOTH new user-auth AND legacy service-account auth, with the new path preferred and legacy as a fallback. This plan **simplifies that to a clean migration in v1.8** — no runtime fallback.

**Reason:** Implementing the dual-path fallback requires a runtime SDK selector that wraps both `firebase-admin` and `firebase` client SDK behind a unified shape. The two SDKs have meaningfully different chained APIs (admin uses `db.collection().doc()` natively; client uses standalone `doc()`/`getDoc()` functions). Building and testing a faithful compatibility layer for both is significant additional work that isn't proportionate to the migration cost — running `deja login` is one CLI command.

**Mitigations to keep the migration safe:**

1. Pre-release email or in-app notification to existing users instructing them to run `deja login` after upgrade
2. Server prints a clear, actionable error on missing refresh token: `Run "deja login" to connect this server to your account`
3. The `deja update` CLI step automatically prompts for `deja login` if `~/.deja/config.json` is missing `refreshToken`
4. Changeset (Task 20) prominently documents the migration step

**If the user wants the dual-path fallback re-added:** insert it as a follow-up task after the clean migration ships. The shape would be a new `initFirebaseLegacyAdminAuth()` in `firebase-user-node.ts` that uses the admin SDK but populates the same lazy proxies. `bootstrapAuth` selects between user-auth and legacy-admin based on whether a refresh token is present.

---

## Rollback Plan

If a critical issue surfaces post-merge:

1. Revert the changeset → release a v1.8.1 patch
2. Users who run into auth failures can downgrade to v1.7 via `deja update --version v1.7.x` while a fix is prepared
3. Web app revert: cherry-pick a Settings.vue revert to remove the Connected Servers card temporarily

Since v1.8 is a clean break, there's no automatic legacy fallback — but the upgrade path is reversible at the install-script level.
