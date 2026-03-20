# RTDB Log Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear stale RTDB logs (`dccLog`, `dccCommands`, `dejaCommands`) on server startup, and provide a Vercel cron endpoint for periodic cleanup.

**Architecture:** Two-pronged approach — (1) the DEJA server clears RTDB log paths on startup in `dejaCloud.connect()`, and (2) a new API route in `billing-api` (the existing Hono/Vercel app) handles cron-triggered cleanup of logs older than 24 hours. The billing-api already has Firebase Admin SDK configured.

**Tech Stack:** Firebase Admin RTDB, Hono (billing-api), Vercel Cron

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `apps/server/src/dejaCloud.ts` | Modify | Add `clearStaleLogs()` call during `connect()` |
| `apps/billing-api/src/routes/cleanup-logs.ts` | Create | Hono route: query RTDB, delete entries older than 24h |
| `apps/billing-api/src/index.ts` | Modify | Register the cleanup route |
| `apps/billing-api/vercel.json` | Modify | Add cron schedule |

---

## Chunk 1: Server Startup Log Clearing

### Task 1: Clear RTDB logs on server startup

**Files:**
- Modify: `apps/server/src/dejaCloud.ts:291-326` (the `connect()` function)

- [ ] **Step 1: Add `clearStaleLogs` function to `dejaCloud.ts`**

Add this function before the `connect()` export. It removes all entries from the three RTDB log/command paths for the current layout. This is safe because the server is just starting — any old commands are stale.

```typescript
/**
 * Clear stale RTDB logs and command queues on server startup.
 * Old entries are from previous sessions and should not be replayed.
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
      log.info(`[STARTUP] Cleared RTDB path: ${path}`)
    } catch (err) {
      log.warn(`[STARTUP] Failed to clear ${path}:`, err)
    }
  }
}
```

- [ ] **Step 2: Call `clearStaleLogs` in `connect()` before `listen()`**

In the `connect()` function, add the call right after the "Connecting" log line and before `listen()`:

```typescript
export async function connect(): Promise<boolean> {
  try {
    log.start('Connecting to DejaCloud', layoutId)
    await clearStaleLogs()   // <-- add this line
    await listen()
    await initialize()
    // ... rest unchanged
```

- [ ] **Step 3: Verify locally**

Run: `pnpm --filter=deja-serverts dev`

Expected: Console shows `[STARTUP] Cleared RTDB path: dccLog/...` lines during startup. The cloud app's DCC-EX terminal should start empty.

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/dejaCloud.ts
git commit -m "feat(server): clear stale RTDB logs on startup"
```

---

## Chunk 2: Vercel Cron Endpoint for Periodic Cleanup

### Task 2: Create the cleanup route in billing-api

**Files:**
- Create: `apps/billing-api/src/routes/cleanup-logs.ts`

- [ ] **Step 1: Create the cleanup route file**

This route queries each RTDB log path, iterates entries, and deletes any older than 24 hours. It's protected by a `CRON_SECRET` header that Vercel sends automatically for cron invocations.

```typescript
import { Hono } from 'hono'
import { rtdb } from '../lib/firebase'

const app = new Hono()

const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

app.post('/cleanup-logs', async (c) => {
  // Verify the request comes from Vercel Cron
  const authHeader = c.req.header('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const layoutId = process.env.LAYOUT_ID || 'betatrack'
  const cutoff = Date.now() - MAX_AGE_MS
  const paths = [`dccLog/${layoutId}`]
  const results: Record<string, number> = {}

  for (const path of paths) {
    let removed = 0
    try {
      const snapshot = await rtdb.ref(path)
        .orderByChild('timestamp')
        .endAt(cutoff)
        .once('value')

      const updates: Record<string, null> = {}
      snapshot.forEach((child) => {
        updates[child.key!] = null
        removed++
        return false // continue iterating
      })

      if (removed > 0) {
        await rtdb.ref(path).update(updates)
      }
    } catch (err) {
      console.error(`Failed to clean ${path}:`, err)
    }
    results[path] = removed
  }

  return c.json({ ok: true, removed: results })
})

export default app
```

- [ ] **Step 2: Commit**

```bash
git add apps/billing-api/src/routes/cleanup-logs.ts
git commit -m "feat(billing-api): add cleanup-logs cron route"
```

### Task 3: Register the route and configure cron

**Files:**
- Modify: `apps/billing-api/src/index.ts`
- Modify: `apps/billing-api/vercel.json`

- [ ] **Step 1: Register the route in `index.ts`**

Add the import and route registration alongside existing routes:

```typescript
import cleanupLogs from './routes/cleanup-logs'

// ... after existing app.route() calls:
app.route('/api', cleanupLogs)
```

- [ ] **Step 2: Add cron config to `vercel.json`**

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }],
  "crons": [
    {
      "path": "/api/cleanup-logs",
      "schedule": "0 4 * * *"
    }
  ]
}
```

This runs daily at 4:00 AM UTC.

- [ ] **Step 3: Document the required env var**

Add `CRON_SECRET` to `apps/billing-api/.env.example`:

```
CRON_SECRET=           # Vercel auto-sets this; for local testing use any value
```

- [ ] **Step 4: Commit**

```bash
git add apps/billing-api/src/index.ts apps/billing-api/vercel.json apps/billing-api/.env.example
git commit -m "feat(billing-api): register cleanup cron route, schedule daily at 4AM UTC"
```

---

## Vercel Cron Setup Instructions

After deploying, you need to:

1. **Set `CRON_SECRET`** — Vercel auto-generates this for Pro/Enterprise plans. For Hobby plans, cron jobs are limited to 1/day. Go to **Project Settings → Environment Variables** and add `CRON_SECRET` with a strong random value. Vercel sends this as `Authorization: Bearer <CRON_SECRET>` on cron requests.

2. **Set `LAYOUT_ID`** — Ensure `LAYOUT_ID` is set in the billing-api's Vercel environment variables (same value as your server's `LAYOUT_ID`).

3. **Verify after deploy** — Check the Vercel dashboard under **Settings → Crons** to confirm the job is registered. You can trigger it manually from the dashboard for testing.

4. **Multiple layouts** — If you run multiple layouts, either:
   - Modify the route to iterate all layouts (query `dccLog` children), or
   - Set up one cron per layout with a query param: `/api/cleanup-logs?layout=betatrack`
