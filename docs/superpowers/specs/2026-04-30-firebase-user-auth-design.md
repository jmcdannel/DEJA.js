# 🔐 Firebase User Auth for Distributed Server — Design Spec

**Date:** 2026-04-30
**Branch:** `feature/server-config`
**Status:** Approved (pending spec review)

---

## 🎯 Problem

The DEJA server (`apps/server`) currently authenticates with Firebase using a service account (`FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`) baked into `.env`. When the server is distributed to end users via the install script, this private key ships with it. Two concrete risks:

1. **Admin-key exposure** — the service account bypasses all Firestore + RTDB security rules. A user (or anyone who reads their `~/.deja/.env`) has god-mode access to *every* layout in the project, not just their own.
2. **No path to revoke or scope access** — there's no per-device credential, no way to see which servers are connected to an account, no way to disconnect a specific machine.

Additionally, **local development** currently relies on the same service-account pattern. The user wants a clean dev workflow that doesn't depend on service keys.

---

## 🎯 Goals

- 🚫 Remove the service account key from end-user machines entirely
- 👤 Each server authenticates as the user who owns the layout, with scoped credentials
- 🔄 Per-device credentials that can be individually revoked from a Settings UI
- 💻 Clean dev workflow — no service account needed for local dev
- 🤖 CI escape hatch — automated tests authenticate without interactive login

## 🚫 Non-Goals

- Multi-tenant access (one server, multiple users) — out of scope
- Tightening security rules to differentiate browser vs. server writes — possible future hardening, deferred
- Migrating the `promotions/` admin-only collection — separate scripts continue to use Admin SDK on developer machines, never distributed

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  apps/cloud (cloud.dejajs.com)           apps/install-api (Vercel)      │
│  ┌──────────────────────┐                ┌──────────────────────┐       │
│  │ Settings →           │   POST mint    │ /api/cli-auth/mint   │       │
│  │  CLI Auth view       │ ─────────────► │  (Admin SDK lives    │       │
│  │  · list servers      │                │   only here)         │       │
│  │  · connect new       │ ◄───────────── │  · createCustomToken │       │
│  │  · revoke            │  customToken   │  · write servers/{id}│       │
│  └──────────────────────┘                └──────────────────────┘       │
│         │                                                               │
│         │ (user copies)                                                 │
│         ▼                                                               │
│  ┌──────────────────────┐                                               │
│  │ Terminal             │                                               │
│  │  $ deja login --token│                                               │
│  │     <paste>          │                                               │
│  └──────────────────────┘                                               │
│         │                                                               │
│         │ signInWithCustomToken                                         │
│         ▼                                                               │
│  ┌──────────────────────┐                                               │
│  │ ~/.deja/config.json  │                                               │
│  │  { uid, serverId,    │                                               │
│  │    refreshToken, ...│                                                │
│  └──────────────────────┘                                               │
│         │                                                               │
│         │ on server start: refresh → ID token                           │
│         ▼                                                               │
│  ┌──────────────────────┐                                               │
│  │ apps/server          │  Firebase client SDK (user-authenticated)     │
│  │  · Firestore         │ ─────────► Firestore + RTDB security rules    │
│  │  · RTDB              │            enforce based on auth.token        │
│  │  · Auth              │                                               │
│  └──────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### What gets removed
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from `.env.example` and `ENV.md`
- `firebase-admin` runtime dependency in `apps/server` and `packages/firebase-config`
- `packages/firebase-config/src/firebase-admin-node.ts` (replaced by `firebase-user-node.ts`)

### What gets added
- `POST /api/cli-auth/mint` endpoint in `apps/install-api`
- `deja login` subcommand in `apps/cli`
- `firebase-user-node.ts` in `@repo/firebase-config` — client SDK with refresh-token-based auth bootstrap
- `users/{uid}/servers/{serverId}` Firestore subcollection
- "Connected Servers" view in `apps/cloud` Settings
- Updated Firestore security rules for the new subcollection + soft-revoke check
- `DEJA_REFRESH_TOKEN` env-var fallback for CI

### What stays the same
- `~/.deja/config.json` location and base schema (gains `serverId`, `refreshToken` fields)
- All call sites in `dejaCloud.ts`, `deja.ts`, `subscription.ts`, `modules/*.ts` — they import `db` and `rtdb` from a different path; the API surface is unchanged
- All Firestore + RTDB security rules for layout data — already structured around user auth
- Subscription validation logic (`validateSubscription`) — same flow, just runs against user-authenticated SDK

---

## 🔧 Component Design

### 1️⃣ Cloud Function: `POST /api/cli-auth/mint`

**Location:** `apps/install-api/app/api/cli-auth/mint/route.ts`

**Auth:** Requires `Authorization: Bearer <Firebase ID token>` from the logged-in browser session.

**Request:**
```json
{ "name": "Basement Pi" }
```

**Logic:**
1. Verify `Authorization` header → `admin.auth().verifyIdToken()` → extract `uid`
2. Validate `name` (1–60 chars, trim, fall back to `"My Server"`)
3. Generate `serverId` (ULID — sortable + url-safe)
4. Write `users/{uid}/servers/{serverId}` with `{ name, createdAt: serverTimestamp(), lastSeenAt: null, revoked: false }`
5. `admin.auth().createCustomToken(uid, { serverId, kind: 'server' })`
6. Return `{ customToken, serverId }`

**Response:**
```json
{ "customToken": "eyJhbGciOi...", "serverId": "01HK..." }
```

**Errors:**
- 401 if ID token missing/invalid
- 400 if name validation fails
- 500 with logged context on Admin SDK failures

---

### 2️⃣ CLI: `deja login` subcommand

**Location:** `apps/cli/src/commands/login.ts`

**Usage:**
```bash
deja login                       # interactive: prompts for token paste
deja login --token <customToken> # non-interactive (used by docs / CI bootstrap)
```

**Logic:**
1. Read `customToken` (from `--token` flag or interactive prompt)
2. Initialize Firebase client SDK (`initializeApp` + `initializeAuth` with `inMemoryPersistence`)
3. Call `signInWithCustomToken(auth, customToken)` → `userCredential`
4. Capture `userCredential.user.uid` and `userCredential.user.refreshToken`
5. Read existing `~/.deja/config.json` (or create new), merge in:
   ```json
   {
     "uid": "...",
     "serverId": "<from custom token claim>",
     "refreshToken": "...",
     "name": "...",
     "layoutId": "..."
   }
   ```
6. Print `✅ Logged in as <email>. Server: <name>`

**`serverId` extraction:** decode the custom token JWT (no verification needed — it's our own token) to read the `serverId` claim and persist it. Used for `lastSeenAt` updates and revocation lookup.

**Errors:**
- Custom token expired (Firebase tokens expire 1h after mint) → suggest user generate a new one
- Network failure → retry hint
- Invalid token format → clear error message

---

### 3️⃣ Server-side auth: `firebase-user-node.ts`

**Location:** `packages/firebase-config/src/firebase-user-node.ts`

**Exports:** `firebaseApp`, `db`, `rtdb`, `auth` — same shape as the existing `firebase-admin-node.ts` so call sites only change their import path.

**Initialization flow:**
1. Read config: `refreshToken` from `~/.deja/config.json` OR `DEJA_REFRESH_TOKEN` env var
2. If neither present → throw `AuthMissingError` with instruction `Run "deja login" first.`
3. Exchange refresh token → ID token via `POST https://securetoken.googleapis.com/v1/token?key=<API_KEY>`
   - Body: `{ grant_type: 'refresh_token', refresh_token: <token> }`
   - Response: `{ id_token, refresh_token, expires_in, user_id }`
4. Persist any rotated `refresh_token` back to `~/.deja/config.json` (Firebase rotates on use)
5. Initialize Firebase client SDK: `initializeApp` + `initializeAuth({ persistence: inMemoryPersistence })`
6. Sign in: use `signInWithCustomToken` after fetching a fresh custom token via the install-api endpoint... 

> **🔬 Spike required:** The Firebase JS SDK's Node.js auth module supports `signInWithCustomToken` (public API), but doesn't have a public `signInWithIdToken` or `signInWithRefreshToken`. Two viable implementation paths:
>
> - **Path A:** Add a `POST /api/cli-auth/refresh` endpoint that takes the user's refresh token, exchanges via Admin SDK token verification, and mints a fresh custom token. Server calls this on every startup. Adds a network round-trip but uses 100% public APIs.
> - **Path B:** Use the Firebase Auth REST API directly for token exchange + the Firestore/RTDB REST APIs for all reads/writes (skip the JS client SDK for runtime). More refactoring (rewrite `dejaCloud.ts` listeners as RTDB SSE streams), but no Cloud Function dependency at runtime.
>
> Implementation phase will spike Path A first (less code change). If `signInWithIdToken` proves stable as an internal API, that's a Path C shortcut.

7. Set up auto-refresh: timer at `expires_in - 5min` to repeat steps 3–4 (transparently rotates the SDK's auth state)

**`lastSeenAt` update:** On successful startup, write `users/{uid}/servers/{serverId}.lastSeenAt = serverTimestamp()`. Best-effort — failure is logged but doesn't block startup.

---

### 4️⃣ Settings UI: Connected Servers view

**Location:** `apps/cloud/src/Settings/CliAuthView.vue` (or similar — fits existing Settings structure)

**Route:** `/settings/cli-auth` (or `/settings/servers` — match existing settings naming pattern)

**Data binding:** `useCollection(collection(db, 'users', uid, 'servers'))` — VueFire reactive list.

**Layout:**

```
┌─ Connected Servers ────────────────────────────────────┐
│                                                        │
│  🟢 Basement Pi                                        │
│  Connected 3 hours ago · Created Apr 12                │
│  [ Revoke ]                                            │
│                                                        │
│  ⚪ Garage Mac mini                                    │
│  Never connected · Created Apr 28                      │
│  [ Revoke ]                                            │
│                                                        │
│  ────────────────────────────────────────────────      │
│                                                        │
│  [ + Connect a new server ]                            │
└────────────────────────────────────────────────────────┘
```

**"Connect a new server" dialog:**
1. Step 1 — `v-text-field` for server name, default placeholder "My Server"
2. Submit → `POST /api/cli-auth/mint` with the user's current ID token
3. Step 2 — show command:
   ```
   deja login --token eyJhbGciOi...
   ```
   With `[ Copy command ]` button. Warning copy: "This token can't be retrieved again. If you lose it, generate a new one."
4. `[ Done ]` closes the dialog

**Revoke flow:**
1. Click "Revoke" → confirmation: `Revoke "Basement Pi"? This server will lose write access within seconds.`
2. Confirm → update `users/{uid}/servers/{serverId}.revoked = true` (direct Firestore write from browser, allowed by rules)
3. Entry shows "Revoked" badge and changes to `[ Delete ]` button
4. Delete removes the document entirely

**Status indicators:**
- 🟢 Connected within last 5 min (live)
- 🟡 Connected within last hour
- ⚪ Never / older / revoked

---

### 5️⃣ Firestore schema additions

```
users/{uid}/
  servers/{serverId}
    name: string                  # user-supplied label (max 60 chars)
    createdAt: timestamp
    lastSeenAt: timestamp | null  # updated by server on each cold start
    revoked: boolean              # toggle from Settings UI
```

`serverId` is a ULID (sortable, url-safe, generated by the mint endpoint).

---

### 6️⃣ Security rules updates

**`firestore.rules` — additions:**

```javascript
// Servers subcollection (per-user)
match /users/{userId}/servers/{serverId} {
  allow read, write: if isAuth() && request.auth.uid == userId;
}

// Helper for soft-revoke check
function isServerRevoked() {
  return request.auth.token.serverId != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)/servers/$(request.auth.token.serverId)).data.revoked == true;
}
```

**Update existing layout subcollection write rules** to add `&& !isServerRevoked()`. Apply to:
- `layouts/{layoutId}` — update, delete
- `layouts/{layoutId}/throttles/{throttleId}` — write
- `layouts/{layoutId}/turnouts/{turnoutId}` — write
- `layouts/{layoutId}/effects/{effectId}` — create, update, delete
- `layouts/{layoutId}/devices/{deviceId}` — write
- (and other subcollections currently restricted to layout owner)

**Browser writes are unaffected** — `request.auth.token.serverId` is only set on server-minted custom tokens. Browser auth tokens have no `serverId` claim, so `isServerRevoked()` returns false, and rules behave as today.

**RTDB rules — no revocation enforcement in v1.** RTDB writes are mostly DCC commands; effects of a revoked server are bounded since it can't update Firestore-backed config. Adding a server-revocation lookup to RTDB requires duplicating the `users/{uid}/servers` path into RTDB, which is more migration work than it's worth for v1.

---

### 7️⃣ Migration story

**v1.8.0 (this release): graceful overlap**
- Server prefers new auth (`refreshToken` in `~/.deja/config.json`)
- Falls back to legacy service account (`FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` in `.env`) if `refreshToken` is missing
- On legacy fallback, prints clear warning at startup:
  ```
  ⚠️ Using legacy service-account auth. Run "deja login" to upgrade.
  Service-account support will be removed in v1.9.0.
  ```
- Install script unchanged (no auto-login)

**v1.9.0 (next release): legacy removed**
- Server refuses to start without `refreshToken`
- Service-account env vars completely ignored (and removed from `.env.example`)
- `firebase-admin` removed from `apps/server` dependencies

**Communication:** Changeset in this release notes the migration; release notes link to a `deja login` walkthrough.

---

### 8️⃣ Local dev workflow

**For the developer (Josh):**
1. Run `deja login` once on dev machine — populates `~/.deja/config.json`
2. `pnpm dev` works as today (server uses `~/.deja/config.json` regardless of working directory)
3. Service-account env vars can be deleted from local `.env` after migration
4. Same flow on staging worktree, since `~/.deja/config.json` is per-machine, not per-checkout

**For CI:**
- `DEJA_REFRESH_TOKEN` env var (CI secret) — bypasses `~/.deja/config.json` entirely
- Dedicated CI Firebase user account with a long-lived refresh token (generated once via `deja login --output-token` or similar)

**For tests** (`apps/server` Vitest suite):
- `subscription.test.ts` and others that mock the Firebase Admin SDK → update to mock the new `firebase-user-node.ts` exports
- API surface unchanged → mocks just rebind to new module paths

---

### 9️⃣ Install script integration

**Install script changes:** None (or minimal).

**Post-install message:**
```
✅ DEJA installed at ~/.deja/

Next: log in to your DEJA account:
  $ deja login

(Then start the server with: deja start)
```

**`deja start` (and equivalent server-launch commands):** check for valid auth before booting.
- If `refreshToken` missing AND legacy service account missing → exit cleanly: `Not logged in. Run "deja login" first.`
- If `refreshToken` invalid (expired, revoked) → exit with: `Auth invalid. Run "deja login" again to reconnect.`

---

## 🧪 Testing Strategy

### Unit tests
- `firebase-user-node.ts` — token exchange, refresh timer, error paths (mock `fetch` for the Firebase REST endpoint)
- `deja login` command — token decode, config write, error messages
- `/api/cli-auth/mint` — auth verification, name validation, custom-token claims

### Integration tests
- End-to-end: mint custom token → CLI exchange → server startup → Firestore read with that auth → verify rules enforce as the user
- Revocation: mint → connect → revoke → verify next write fails with permission denied

### Manual test plan
1. Fresh `deja login` on a clean machine → server starts → reads layout → writes a throttle command
2. Revoke server in Settings → wait <60s → server's next write fails with permission error in logs
3. Restart server after revocation → cleanly errors with `Auth invalid`
4. Legacy fallback: with only `.env` service account, no `refreshToken` → server starts with warning
5. CI path: `DEJA_REFRESH_TOKEN` env var set, no config file → server starts

---

## 📦 Deliverables

1. `apps/install-api/app/api/cli-auth/mint/route.ts` — Cloud Function endpoint
2. `apps/cli/src/commands/login.ts` — `deja login` subcommand
3. `packages/firebase-config/src/firebase-user-node.ts` — new server-side auth module
4. `apps/cloud/src/Settings/CliAuthView.vue` (and route) — Settings UI
5. Updated `firestore.rules` with new subcollection rules + `isServerRevoked()` helper
6. Updated `.env.example` removing service-account vars (with migration note)
7. Updated `apps/server/index.ts` startup flow to support both auth paths during overlap
8. Migration changeset describing the user-facing change
9. Update to README / docs explaining `deja login`

---

## 🚧 Open Implementation Questions

These will be resolved during the implementation spike — flagging now:

1. **Firebase JS SDK auth-state restoration on Node.js across cold starts.** The recommended path (`signInWithCustomToken` only, with refresh via a new Cloud Function) is robust but adds a network round-trip per server start. Alternative paths (REST APIs, internal SDK methods) trade complexity for fewer dependencies. Pick after a 1-day spike at the start of implementation.

2. **CI refresh-token generation tooling.** Does `deja login --output-token` write the token to stdout (for piping into a CI secret)? Or use a separate `deja auth export` command? Decide during CLI implementation.

3. **Whether the cloud app already has a `/settings` route structure.** If yes, slot the new view in. If no, this design adds the structure.

---

## ✅ Approval Status

- Section 1 (Architecture overview): ✅ approved
- Section 2 (`deja login` flow): ✅ approved
- Section 3 (Server-side auth module): ✅ approved
- Section 4 (Cloud Function in `apps/install-api`): ✅ approved
- Section 5 (Settings UI in `apps/cloud`): ✅ approved
- Section 6 (Security rules + soft-revoke): ✅ approved
- Section 7 (Migration overlap v1.8 → v1.9): ✅ approved
- Section 8 (Dev workflow): ✅ approved
- Section 9 (Install script messaging): ✅ approved

Ready to transition to writing-plans for the implementation plan.
