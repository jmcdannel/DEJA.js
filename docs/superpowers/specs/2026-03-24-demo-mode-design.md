# 🚂 DEJA.js Demo Mode — Design Spec

**Date:** 2026-03-24
**Branch:** `feature/demo-mode`
**Status:** Approved

---

## Overview

Add a "demo mode" to the DEJA.js platform (throttle, cloud, monitor, tour apps) that allows:

1. **Local dev mode** — Auto-login with a demo account for quick feature demos during development
2. **Public demo mode** — Online users can try DEJA.js without creating an account via a "Try Demo" button or direct `/try-demo` URL

Demo mode uses a real Firebase demo account, a static snapshot of the betatrack layout, and a mock hardware layer that simulates DCC-EX responses so the experience feels like a connected system.

> **Note:** The tour app already has `VITE_DEMO_MODE` support (skips auth guards). This spec integrates that existing behavior into the unified demo system.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth approach | Real Firebase account (`demo@dejajs.com`) | Same code paths as real app; minimal changes |
| Data source | Static snapshot of betatrack, seeded to Firestore | Predictable, resettable, works without your live data |
| Hardware simulation | Mock at command layer (`@repo/mock-hardware`) | Apps don't know they're in demo mode — exercises real UI code |
| Multi-user isolation | Single-tenant (deferred) | Keep v1 simple |
| Entry points | Env var + login button + `/try-demo` route | Covers local dev, discoverability, and shareable URLs (uses `/try-demo` to avoid collision with monitor's existing `/demo` route) |
| Replaces | `VITE_DEV_AUTO_LOGIN`, `CLAUDE_TEST_EMAIL/PASSWORD` | Consolidates into one mechanism |

---

## 1. Demo Account & Data Seeding

### Firebase Account

- Create `demo@dejajs.com` in Firebase Auth (manual, via Firebase console)
- Known password stored in env vars: `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`
- Firestore user document at `users/{demoUid}`:
  ```json
  {
    "role": "demo",
    "subscription": { "status": "active", "plan": "pro" }
  }
  ```
- **`UserRole` type update:** Add `'demo'` to the `UserRole` union in `packages/modules/features/types.ts` and add a `STAGE_ACCESS['demo']` entry in `packages/modules/features/flags.ts` (same access level as `'admin'` so all features are accessible in demo)

### Static Data Snapshot

- Export betatrack layout + all sub-collections (locos, turnouts, effects, routes, signals, devices, tags, trackDiagrams) to `scripts/demo/seed-data.json`
- Seed script at `scripts/demo/seed-firestore.ts`:
  1. Authenticates with Firebase Admin SDK
  2. Writes layout doc to `layouts/demo-betatrack` with `owner: 'demo@dejajs.com'` (required — `requireOnboarding` and `requireLayout` guards query layouts by `where('owner', '==', currentUser.email)`)
  3. Writes all sub-collection docs
  4. Idempotent — can be re-run to reset demo data to clean state
- Layout ID: `demo-betatrack` (distinct from real `betatrack`)

### Data Export Instructions

```bash
# Use Firebase Admin SDK or console to export:
# - layouts/betatrack (document)
# - layouts/betatrack/locos/* (sub-collection)
# - layouts/betatrack/turnouts/* (sub-collection)
# - layouts/betatrack/effects/* (sub-collection)
# - layouts/betatrack/routes/* (sub-collection)
# - layouts/betatrack/signals/* (sub-collection)
# - layouts/betatrack/devices/* (sub-collection)
# - layouts/betatrack/tags/* (sub-collection)
# - layouts/betatrack/trackDiagrams/* (sub-collection)
```

---

## 2. Demo Mode Activation

### Three Entry Points, One Mechanism

All entry points converge on the same flow:

```
Entry → Firebase signIn(demo@dejajs.com, password) → set layoutId = "demo-betatrack" → redirect to app home
```

### Environment Variable (`VITE_DEMO_MODE`)

- `VITE_DEMO_MODE=true` → auto-login on app load (local dev use case)
- Replaces `VITE_DEV_AUTO_LOGIN` entirely
- Credentials from `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`

### Login Page "Try Demo" Button

- Added to `@repo/auth`'s `Login.vue`
- Styled as secondary/outlined button, visually distinct from real login
- Calls `useDemoAuth()` composable
- Demo credentials bundled in the app for public mode

### `/try-demo` Route

- Each app (throttle, cloud, monitor) gets a `/try-demo` route (not `/demo` — monitor already uses `/demo` for its `DeviceSerialMonitorDemo` component)
- Triggers demo sign-in flow, then redirects to app home with demo layout selected
- Shareable URLs: `throttle.dejajs.com/try-demo`, `cloud.dejajs.com/try-demo`, `monitor.dejajs.com/try-demo`

---

## 3. Mock Hardware Layer

### Extending `@repo/dccex` with Mock Mode

Rather than creating a new package, extend the existing `isEmulated` flag in `useDcc.ts` (`packages/dccex/useDcc.ts`) to provide full mock responses. The `isEmulated` code path already short-circuits command sending — we expand it to return simulated responses.

> **Why not a new `@repo/mock-hardware` package?** The `useDcc` composable is the primary command sender used by throttle, cloud, and monitor. It already has an `isEmulated` flag. Extending this existing mechanism is simpler and avoids two parallel interception points.

### Command Interception Points

Commands flow through **two** composables:
- **`@repo/dccex` (`useDcc`)** — Primary command sender. Used directly by monitor (`App.vue`), cloud (`CommandGrid.vue`, `LcdTerminal.vue`, `Roster.vue`, `EditLoco.vue`), and by throttle
- **`@repo/deja` (`useDejaJS`)** — Writes commands to Firebase RTDB command queue. Used by cloud (`Dashboard.vue`, `PortList.vue`)

In demo mode, both composables need to route to the mock:
- `useDcc`: Extend `isEmulated` → when `VITE_DEMO_MODE=true`, activate emulation and add response simulation
- `useDejaJS`: When `VITE_DEMO_MODE=true`, skip writing to Firebase RTDB command queue and echo the command back as a mock response

### Mocked Systems

| System | Behavior |
|--------|----------|
| 🚂 Throttle | Set speed → returns speed feedback with slight delay (simulating momentum). Loco state updates in Firestore. |
| 🔀 Turnouts | Throw/close → returns confirmation after ~300ms delay. Visual state toggles. |
| 🚦 Signals | Set aspect → returns confirmation. |
| 🎵 Effects | Trigger → returns acknowledgment. Sounds play client-side from Blob storage. |
| 📊 Telemetry | Periodic fake current draw, voltage, track status for monitor app. |
| 📺 LCD | Simulates DCC-EX LCD output lines. |

### Activation

- `VITE_DEMO_MODE=true` → `useDcc` activates `isEmulated` mode with mock responses; `useDejaJS` skips RTDB command queue
- Mock response logic lives in a new file `packages/dccex/mockResponses.ts` (keeps mock logic separate from real command handling)
- Responses include realistic, configurable delays

---

## 4. Router & Auth Guard Changes

### `@repo/auth` Changes

- **`Login.vue`** — Add "Try Demo" button below login form
- **New `useDemoAuth.ts` composable** at `packages/auth/src/useDemoAuth.ts` (flat, matching existing package conventions — no `composables/` subdirectory):
  - `signInWithEmailAndPassword(auth, demoEmail, demoPassword)`
  - `localStorage['@DEJA/layoutId'] = 'demo-betatrack'`
  - Redirect to app home
- **Auto-login on boot** — When `VITE_DEMO_MODE=true`, calls `useDemoAuth()` before router guards

### App Router Changes

> **Important:** The three apps use different guard architectures:
> - **Cloud & Throttle:** Centralized `beforeEach` guard with route `meta` flags (guard logic inlined in router file)
> - **Monitor:** Per-route `beforeEnter` arrays importing guards from `@repo/auth`
>
> Demo-mode bypass must be implemented in both patterns.

- **Throttle, Cloud, Monitor** — Add `/try-demo` route → triggers `useDemoAuth()` → redirects to `/`
- **`requireDccEx` guard** — Add `isDemoMode` check to skip (no real device in demo)
- **`requireAuth` guard** — Replace existing `VITE_DEV_AUTO_LOGIN` bypass with `VITE_DEMO_MODE` check. Keep the `import.meta.env.DEV` gate: this bypass is only needed for the local-dev auto-login timing window (sign-in hasn't completed before the first guard fires). In production demo mode, the "Try Demo" button performs a real `signInWithEmailAndPassword` before navigation, so `getCurrentUser()` returns the demo user and the guard passes normally — no bypass needed.
- **Throttle & Cloud router `beforeEach`** — Both inline a `VITE_DEV_AUTO_LOGIN` bypass in `beforeEach`. Replace with `VITE_DEMO_MODE` check (same `DEV` gate preserved).
- **Monitor `App.vue`** — Template-level conditional `v-if="user || isDevAutoLogin"` controls whether Login or main app renders. Replace `isDevAutoLogin` with `isDemoMode` check.
- **`requireLayout`** — Two paths depending on entry point:
  - **Local dev** (`VITE_DEMO_MODE=true`): Set `VITE_LAYOUT_ID=demo-betatrack` in `.env.local` so the guard auto-selects via the env var fallback (already built into `requireLayout`)
  - **Production demo** (Try Demo button / `/try-demo`): `useDemoAuth()` sets `localStorage['@DEJA/layoutId'] = 'demo-betatrack'` after sign-in, which the guard reads on next navigation
- **`requireOnboarding`** — No changes needed (demo layout has `owner: 'demo@dejajs.com'`, satisfies the ownership query)
- **`requireFeature`** — Demo user `role: 'demo'` treated same as paid for feature access (requires `UserRole` type update, see Section 1)
- **Tour app** — Already uses `VITE_DEMO_MODE` to skip auth guards. Ensure compatibility: tour's existing `isDemoMode` check continues to work, and add `/try-demo` route for consistency.

### Removed Code (`VITE_DEV_AUTO_LOGIN` Cleanup)

References found in ~11 files across the codebase:
- `packages/auth/src/guards/requireAuth.ts` — bypass check
- `apps/throttle/src/router.ts` — `beforeEach` bypass
- `apps/cloud/src/router.ts` — `beforeEach` bypass
- `apps/monitor/src/App.vue` — template conditional
- `apps/monitor/src/router.ts` — guard config
- `.env.example` — variable documentation
- `CLAUDE.md` — dev workflow docs
- Various skill/doc files referencing the env var

### Screenshot Script

`scripts/capture-screenshots.mjs` has its own hardcoded test credentials (`claude-screenshots@dejajs.test`). This is a separate concern from demo mode. The script can either:
- Switch to using the demo account (simpler, one less account to manage)
- Keep its own account (more isolated)

Decision deferred to implementation — either works.

---

## 5. Firestore Security & Demo User Constraints

### Security Rules

- No special Firestore rules needed — demo user owns `layouts/demo-betatrack` legitimately
- Normal owner-based read/write applies
- If data gets corrupted, re-run seed script

### `demo` Role — Future Use (Not v1)

- Feature gating: `requireFeature` can check `role !== 'demo'` for restricted features
- Analytics: filter out demo usage from real metrics
- Rate limiting: throttle demo abuse if needed
- Multi-tenant isolation: role identifies demo sessions for sandboxing

### Data Reset

- v1: Manual — `pnpm run demo:seed`
- Later: "Reset Demo" button or auto-reset on session end

---

## 6. Environment Variables & Configuration

### New Env Vars (`.env.example`)

```bash
# Demo Mode
VITE_DEMO_MODE=false              # 'true' to auto-login as demo user
VITE_DEMO_EMAIL=demo@dejajs.com   # Demo account email
VITE_DEMO_PASSWORD=               # Demo account password (set in .env.local)
```

### Local Dev (`.env.local`)

```bash
VITE_DEMO_MODE=true
VITE_DEMO_EMAIL=demo@dejajs.com
VITE_DEMO_PASSWORD=<actual password>
```

### Production/Staging (Vercel)

```bash
VITE_DEMO_MODE=false              # Demo button visible, but no auto-login
VITE_DEMO_EMAIL=demo@dejajs.com
VITE_DEMO_PASSWORD=<actual password>
```

### Security Note

`VITE_` prefixed vars are bundled into the client JS. The demo password will be visible in built output. This is acceptable because:
- Demo account has **no billing info**
- Demo layout contains **only seed data** (no personal info)
- Demo password must be **unique** — not shared with any other account or service
- Future option: move to serverless function returning Firebase custom token (no password exposed)

### Removed Env Vars

- `VITE_DEV_AUTO_LOGIN` — replaced by `VITE_DEMO_MODE`
- `CLAUDE_TEST_EMAIL` / `CLAUDE_TEST_PASSWORD` — consolidated into `VITE_DEMO_*`

### New npm Scripts (root `package.json`)

```bash
pnpm demo:seed        # Seed/reset demo data in Firestore
pnpm dev:demo         # Shortcut: VITE_DEMO_MODE=true pnpm dev
```

---

## Files Changed (Summary)

| Area | Files |
|------|-------|
| Mock responses | `packages/dccex/mockResponses.ts` — mock DCC-EX response logic |
| DCC-EX composable | `packages/dccex/useDcc.ts` — extend `isEmulated` for demo mode |
| DEJA composable | `packages/deja/useDejaJS.ts` — skip RTDB command queue in demo mode |
| Auth package | `packages/auth/src/Login.vue` — "Try Demo" button |
| Auth package | `packages/auth/src/useDemoAuth.ts` — demo login composable |
| Auth guards | `packages/auth/src/guards/requireAuth.ts` — replace `VITE_DEV_AUTO_LOGIN` with `VITE_DEMO_MODE` |
| Auth guards | `packages/auth/src/guards/requireDccEx.ts` — skip in demo mode |
| Feature types | `packages/modules/features/types.ts` — add `'demo'` to `UserRole` |
| Feature flags | `packages/modules/features/flags.ts` — add `STAGE_ACCESS['demo']` |
| App routers | `apps/throttle/src/router.ts`, `apps/cloud/src/router.ts`, `apps/monitor/src/router.ts` — `/try-demo` route + `VITE_DEV_AUTO_LOGIN` cleanup |
| Monitor app | `apps/monitor/src/App.vue` — replace `isDevAutoLogin` with `isDemoMode` |
| Tour app | `apps/tour/src/router/index.ts` — add `/try-demo` route, verify existing `VITE_DEMO_MODE` compatibility |
| Seed script | `scripts/demo/seed-firestore.ts` — Firestore data seeder |
| Seed data | `scripts/demo/seed-data.json` — static betatrack snapshot |
| Config | `.env.example` — new demo vars, remove `VITE_DEV_AUTO_LOGIN` |
| Config | Root `package.json` — `demo:seed`, `dev:demo` scripts |
| Docs | `CLAUDE.md` and related docs — update `VITE_DEV_AUTO_LOGIN` references |
| Cleanup | Remove `VITE_DEV_AUTO_LOGIN` references (~11 files across codebase) |
