# Cloud Operations API — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vercel serverless operations endpoints (log cleanup + diagnostics) to the cloud app, and add server startup RTDB cleanup.

**Architecture:** Raw `@vercel/node` serverless functions in `apps/cloud/api/`, using Firebase Admin SDK to access RTDB. A shared auth helper validates `CRON_SECRET` bearer tokens. Server startup cleanup in `apps/server/src/dejaCloud.ts` clears RTDB queues on boot.

**Tech Stack:** TypeScript, `@vercel/node`, `firebase-admin`, Vercel Cron

**Spec:** `docs/superpowers/specs/2026-03-13-cloud-operations-api-design.md`

**Note:** PR #166 (`claude/funny-stonebraker`) is still open and should be closed after this work merges — this supersedes it.

---

## Chunk 1: Shared Libraries & Config

### Task 1: Add `firebase-admin` dependency to cloud app

**Files:**
- Modify: `apps/cloud/package.json`

- [ ] **Step 1: Install firebase-admin**

Run: `pnpm --filter=deja-cloud add firebase-admin`

- [ ] **Step 2: Verify it was added to dependencies (not devDependencies)**

Run: `grep -A1 '"firebase-admin"' apps/cloud/package.json`
Expected: appears under `"dependencies"`

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/package.json pnpm-lock.yaml
git commit -m "feat(cloud): add firebase-admin dependency for serverless API"
```

---

### Task 2: Create shared Firebase Admin initializer

**Files:**
- Create: `apps/cloud/api/lib/firebase.ts`

- [ ] **Step 1: Create the file**

```typescript
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

const serviceAccount = {
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

const databaseURL =
  process.env.VITE_FIREBASE_DATABASE_URL ||
  `https://${process.env.VITE_FIREBASE_PROJECT_ID || 'demo'}-default-rtdb.firebaseio.com`

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount), databaseURL })
}

export const rtdb = getDatabase()
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/api/lib/firebase.ts
git commit -m "feat(cloud): add Firebase Admin RTDB initializer for serverless functions"
```

---

### Task 3: Create shared auth helper

**Files:**
- Create: `apps/cloud/api/lib/verifyAuth.ts`

- [ ] **Step 1: Create the file**

```typescript
import type { VercelRequest } from '@vercel/node'

interface AuthResult {
  valid: boolean
  status?: number
  message?: string
}

export function verifyAuth(req: VercelRequest): AuthResult {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return { valid: false, status: 500, message: 'CRON_SECRET not configured' }
  }

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ') || header.slice(7) !== cronSecret) {
    return { valid: false, status: 401, message: 'Unauthorized' }
  }

  return { valid: true }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/api/lib/verifyAuth.ts
git commit -m "feat(cloud): add CRON_SECRET auth helper for serverless endpoints"
```

---

### Task 4: Update cloud vercel.json with cron config

**Files:**
- Modify: `apps/cloud/vercel.json`

- [ ] **Step 1: Add crons config**

Add the `crons` key to the existing `vercel.json`, preserving all existing config (`rewrites`, `env`):

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/" }
  ],
  "env": {
    "BLOB_READ_WRITE_TOKEN": "vercel_blob_rw_xNDOZJM68szqABqe_KEdeLVsr36pBcvelnNxQX8gjJzBEFV"
  },
  "crons": [
    { "path": "/api/cleanup-logs", "schedule": "0 3 * * *" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/vercel.json
git commit -m "feat(cloud): add Vercel cron config for daily log cleanup at 3 AM UTC"
```

---

## Chunk 2: API Endpoints

### Task 5: Create cleanup-logs endpoint

**Files:**
- Create: `apps/cloud/api/cleanup-logs.ts`

- [ ] **Step 1: Create the endpoint**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyAuth } from './lib/verifyAuth'
import { rtdb } from './lib/firebase'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

const LOG_PATHS = ['dccLog', 'dccCommands', 'dejaCommands'] as const

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = verifyAuth(req)
  if (!auth.valid) {
    return res.status(auth.status!).json({ error: auth.message })
  }

  const cutoff = Date.now() - TWENTY_FOUR_HOURS_MS
  let totalDeleted = 0

  try {
    for (const path of LOG_PATHS) {
      const rootRef = rtdb.ref(path)
      const layoutsSnapshot = await rootRef.once('value')

      if (!layoutsSnapshot.exists()) {
        continue
      }

      const layouts = layoutsSnapshot.val() as Record<
        string,
        Record<string, { timestamp?: number }>
      >

      for (const layoutId of Object.keys(layouts)) {
        const entries = layouts[layoutId]
        if (!entries || typeof entries !== 'object') continue

        const keysToDelete: string[] = []

        for (const [key, entry] of Object.entries(entries)) {
          if (
            !entry ||
            typeof entry !== 'object' ||
            !entry.timestamp ||
            entry.timestamp < cutoff
          ) {
            keysToDelete.push(key)
          }
        }

        if (keysToDelete.length > 0) {
          const updates: Record<string, null> = {}
          for (const key of keysToDelete) {
            updates[`${path}/${layoutId}/${key}`] = null
          }
          await rtdb.ref().update(updates)
          totalDeleted += keysToDelete.length
        }
      }
    }

    return res.status(200).json({ status: 'ok', deleted: totalDeleted })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: 'Cleanup failed', details: message })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/api/cleanup-logs.ts
git commit -m "feat(cloud): add cleanup-logs serverless endpoint for RTDB log pruning"
```

---

### Task 6: Create diagnostics endpoint

**Files:**
- Create: `apps/cloud/api/diagnostics.ts`

- [ ] **Step 1: Create the endpoint**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyAuth } from './lib/verifyAuth'
import { rtdb } from './lib/firebase'

const LOG_PATHS = ['dccLog', 'dccCommands', 'dejaCommands'] as const

interface PathStats {
  count: number
  oldest?: number
  newest?: number
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = verifyAuth(req)
  if (!auth.valid) {
    return res.status(auth.status!).json({ error: auth.message })
  }

  try {
    const layouts: Record<string, Record<string, PathStats>> = {}

    for (const path of LOG_PATHS) {
      const rootRef = rtdb.ref(path)
      const layoutsSnapshot = await rootRef.once('value')

      if (!layoutsSnapshot.exists()) {
        continue
      }

      const data = layoutsSnapshot.val() as Record<
        string,
        Record<string, { timestamp?: number }>
      >

      for (const layoutId of Object.keys(data)) {
        if (!layouts[layoutId]) {
          layouts[layoutId] = {}
        }

        const entries = data[layoutId]
        if (!entries || typeof entries !== 'object') {
          layouts[layoutId][path] = { count: 0 }
          continue
        }

        const timestamps: number[] = []
        for (const entry of Object.values(entries)) {
          if (entry?.timestamp) {
            timestamps.push(entry.timestamp)
          }
        }

        const stats: PathStats = { count: Object.keys(entries).length }
        if (timestamps.length > 0) {
          stats.oldest = Math.min(...timestamps)
          stats.newest = Math.max(...timestamps)
        }

        layouts[layoutId][path] = stats
      }
    }

    // Ensure all layouts have all paths represented
    for (const layoutId of Object.keys(layouts)) {
      for (const path of LOG_PATHS) {
        if (!layouts[layoutId][path]) {
          layouts[layoutId][path] = { count: 0 }
        }
      }
    }

    return res.status(200).json({ layouts })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res
      .status(500)
      .json({ error: 'Diagnostics failed', details: message })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/api/diagnostics.ts
git commit -m "feat(cloud): add diagnostics serverless endpoint for RTDB queue stats"
```

---

## Chunk 3: Server Startup Cleanup, Config & Changeset

### Task 7: Add clearStaleLogs to server dejaCloud.ts

**Files:**
- Modify: `apps/server/src/dejaCloud.ts`

- [ ] **Step 1: Read the current file to find the right insertion point**

Read `apps/server/src/dejaCloud.ts` and locate:
- The `monitorConnectivity()` function (insert `clearStaleLogs` after it)
- The `connect()` export function (add `await clearStaleLogs()` as the first line after the `log.start` call)
- The `rtdb` import and `layoutId` variable (needed by `clearStaleLogs`)

- [ ] **Step 2: Add the clearStaleLogs function**

Insert after the `monitorConnectivity()` function:

```typescript
/**
 * Remove stale entries from RTDB command/log queues for the current layout.
 * Called on server startup to prevent replaying old commands.
 */
async function clearStaleLogs(): Promise<void> {
  const paths = [
    `dccLog/${layoutId}`,
    `dccCommands/${layoutId}`,
    `dejaCommands/${layoutId}`,
  ]

  for (const path of paths) {
    try {
      await rtdb.ref(path).remove()
      log.success(`[CLEANUP] Cleared stale entries from ${path}`)
    } catch (error) {
      log.error(`[CLEANUP] Failed to clear ${path}:`, error)
    }
  }
}
```

- [ ] **Step 3: Call clearStaleLogs in the connect function**

In the `connect()` function, add `await clearStaleLogs()` right after the `log.start('Connecting to DejaCloud', layoutId)` line and before `await listen()`:

```typescript
export async function connect(): Promise<boolean> {
  try {
    log.start('Connecting to DejaCloud', layoutId)
    await clearStaleLogs()
    await listen()
    await initialize()
```

- [ ] **Step 4: Verify the server still type-checks**

Run: `pnpm --filter=deja-serverts type-check` (or `pnpm --filter=deja-serverts check-types`)
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/dejaCloud.ts
git commit -m "feat(server): clear stale RTDB queues on startup to prevent command replay"
```

---

### Task 8: Create cloud app .env.example

**Files:**
- Create: `apps/cloud/.env.example`

- [ ] **Step 1: Create the file**

The cloud app has no `.env.example`. Create one with the env vars needed for the serverless API:

```
# Serverless API (Vercel Functions)
CRON_SECRET=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Note: `VITE_FIREBASE_PROJECT_ID` is already available via the root `.env` and Vite config. `VITE_FIREBASE_DATABASE_URL` is optional (derived from project ID if missing).

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/.env.example
git commit -m "chore(cloud): add .env.example with serverless API env vars"
```

---

### Task 9: Create changeset

**Files:**
- Create: `.changeset/<generated-name>.md`

- [ ] **Step 1: Create the changeset file**

Use the `/changelog` skill, or create manually:

```markdown
---
"deja-cloud": patch
"deja-serverts": patch
---

added: **[cloud]** Vercel serverless `/api/cleanup-logs` endpoint — deletes RTDB log entries older than 24 hours, runs daily at 3 AM UTC via Vercel Cron

added: **[cloud]** Vercel serverless `/api/diagnostics` endpoint — returns RTDB queue sizes and timestamp ranges per layout

added: **[server]** Clear stale RTDB log/command queues (`dccLog`, `dccCommands`, `dejaCommands`) on server startup to prevent replaying old commands
```

- [ ] **Step 2: Commit**

```bash
git add .changeset/
git commit -m "chore: add changeset for cloud operations API and server startup cleanup"
```

---

### Task 10: Lint and type-check

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 2: Run type-check**

Run: `pnpm check-types`
Expected: No errors

- [ ] **Step 3: Fix any issues found, then re-run and commit fixes**

---

## File Summary

| Action | Path | Purpose |
|--------|------|---------|
| Create | `apps/cloud/api/lib/firebase.ts` | Firebase Admin SDK + RTDB init |
| Create | `apps/cloud/api/lib/verifyAuth.ts` | CRON_SECRET bearer auth helper |
| Create | `apps/cloud/api/cleanup-logs.ts` | POST endpoint — prune old RTDB entries |
| Create | `apps/cloud/api/diagnostics.ts` | GET endpoint — RTDB queue stats |
| Modify | `apps/cloud/vercel.json` | Add crons config |
| Modify | `apps/cloud/package.json` | Add firebase-admin dependency |
| Modify | `apps/server/src/dejaCloud.ts` | Add clearStaleLogs on startup |
| Create | `.changeset/*.md` | Changeset for PR |

**After merge:** Close PR #166 (`claude/funny-stonebraker`) — this work supersedes it.
