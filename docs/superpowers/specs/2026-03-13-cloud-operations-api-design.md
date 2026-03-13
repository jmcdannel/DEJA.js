# Cloud Operations API — Design Spec

**Date:** 2026-03-13
**Status:** Draft
**PR Context:** Moves operations endpoints from `apps/billing-api` (PR #166) to `apps/cloud/api/`

---

## Problem

PR #166 added an RTDB log cleanup cron endpoint to `apps/billing-api`. This is a server/operations concern, not a billing concern. The cleanup logic should live closer to the app that manages layouts and devices — the cloud app.

Additionally, there's no way for the cloud or monitor apps to view RTDB diagnostics (queue sizes, stale entries) without opening the Firebase console.

## Solution

Add Vercel serverless functions to `apps/cloud/api/` providing operations endpoints: log cleanup (cron + manual) and RTDB diagnostics. Auth uses a shared `CRON_SECRET` bearer token.

---

## Architecture

### File Structure

```
apps/cloud/api/
├── cleanup-logs.ts       # POST — delete RTDB entries older than 24h
├── diagnostics.ts        # GET — RTDB queue sizes and timestamps per layout
└── lib/
    ├── firebase.ts       # Firebase Admin SDK + RTDB initialization
    └── verifyAuth.ts     # CRON_SECRET bearer token validation
```

### Why Vercel Serverless Functions

- The cloud app is already deployed to Vercel with `/api/*` rewrites configured in `vercel.json`
- `@vercel/node` is already a dependency
- File-based routing — each `.ts` file in `api/` becomes an endpoint automatically
- No extra framework needed (no Hono, no Express)
- The server app (PM2) can't host serverless functions; it runs on local hardware with serial connections

### Why Not a Status/Connection Endpoint

Firebase is the source of truth for device connection status (`serverStatus/{layoutId}`, `layouts/{layoutId}/devices`). The Vue apps use VueFire for reactive bindings, so the UI already updates automatically when status changes. A REST endpoint would be redundant.

---

## Endpoints

### POST `/api/cleanup-logs`

Deletes RTDB log/command entries older than 24 hours across all layouts.

**RTDB paths cleaned:**
- `dccLog/{layoutId}/*`
- `dccCommands/{layoutId}/*`
- `dejaCommands/{layoutId}/*`

**Logic:**
1. For each path, fetch all layouts
2. For each layout, iterate entries
3. Delete entries where `timestamp` is older than 24 hours, or where `timestamp` is missing
4. Use batched `rtdb.ref().update()` with null values for efficient deletion

**Request:**
```
POST /api/cleanup-logs
Authorization: Bearer <CRON_SECRET>
```

**Response (200):**
```json
{ "status": "ok", "deleted": 47 }
```

**Error responses:**
- `401` — Missing or invalid bearer token
- `500` — `CRON_SECRET` not configured, or cleanup failed

**Cron schedule:** Daily at 3:00 AM UTC (configured in `vercel.json`).

### GET `/api/diagnostics`

Returns RTDB queue sizes and timestamp ranges per layout, per path.

**Request:**
```
GET /api/diagnostics
Authorization: Bearer <CRON_SECRET>
```

**Response (200):**
```json
{
  "layouts": {
    "layout-abc": {
      "dccLog": { "count": 142, "oldest": 1710000000000, "newest": 1710300000000 },
      "dccCommands": { "count": 3, "oldest": 1710290000000, "newest": 1710300000000 },
      "dejaCommands": { "count": 0 }
    },
    "layout-xyz": {
      "dccLog": { "count": 0 },
      "dccCommands": { "count": 0 },
      "dejaCommands": { "count": 0 }
    }
  }
}
```

**Error responses:**
- `401` — Missing or invalid bearer token
- `500` — Diagnostics fetch failed

---

## Shared Modules

### `api/lib/verifyAuth.ts`

Extracts and validates the `CRON_SECRET` bearer token from the `Authorization` header. Returns an error response if invalid, or `null` if valid (allowing the handler to proceed).

```typescript
// Usage in endpoint:
const authError = verifyAuth(req)
if (authError) return authError
```

### `api/lib/firebase.ts`

Initializes Firebase Admin SDK with RTDB support. Same pattern as `apps/billing-api/src/lib/firebase.ts`:
- Uses `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `VITE_FIREBASE_PROJECT_ID` env vars
- Exports `db` (Firestore), `rtdb` (Realtime Database)
- Guards against double-initialization with `getApps()` check

---

## Changes to Existing Code

### Remove from `apps/billing-api` (PR #166 rollback)

- Delete `src/routes/cleanup-logs.ts`
- Remove cleanup route registration from `src/index.ts`
- Remove RTDB import (`getDatabase`) and `rtdb` export from `src/lib/firebase.ts`
- Remove `databaseURL` from Firebase init
- Remove `CRON_SECRET` from `.env.example`
- Remove `crons` config from `vercel.json`

### Keep in `apps/server` (from PR #166)

- `clearStaleLogs()` in `src/dejaCloud.ts` — server startup cleanup stays. This serves a different purpose (immediate queue clearing on boot) vs. the cron (periodic old-entry pruning).

### Add to `apps/cloud`

- `firebase-admin` as a dependency in `package.json`
- `CRON_SECRET` in `.env.example`
- `api/` directory with endpoints and shared libs
- Cron config in `vercel.json`

### Changeset

Update the existing `.changeset/rtdb-log-cleanup.md` to reflect the move from billing-api to cloud.

---

## Configuration

### Environment Variables (cloud app)

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Bearer token for API auth (Vercel cron + manual calls) |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID (already present) |
| `VITE_FIREBASE_DATABASE_URL` | Firebase RTDB URL (optional, derived from project ID if missing) |

### Vercel Config (`apps/cloud/vercel.json`)

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/" }
  ],
  "crons": [
    { "path": "/api/cleanup-logs", "schedule": "0 3 * * *" }
  ]
}
```

---

## Non-Goals

- **Device connection status API** — Firebase + VueFire handles this reactively; a REST endpoint is redundant
- **UI for diagnostics in cloud/monitor** — Future work; this spec covers the API only
- **Replacing server startup cleanup** — `clearStaleLogs()` in `dejaCloud.ts` serves a different purpose (boot-time queue clearing) and stays
