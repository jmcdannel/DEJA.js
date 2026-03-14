# Private Distribution Design — DEJA.js

**Date:** 2026-03-12
**Status:** Draft
**Scope:** Move DEJA.js to private repo with subscription-gated Docker distribution

---

## Context

DEJA.js is transitioning from an open-source project to a subscription-based product. Users pay for `engineer` or `conductor` plans via Stripe (billing API already exists). The server needs to be distributed as a private artifact, with an install script that makes setup easy for model railroad hobbyists running on Raspberry Pi or desktop machines.

### Decisions Made

| Decision | Choice |
|----------|--------|
| Distribution method | Install scripts + private Docker images |
| Feature gating | At Firebase/app level — single full server artifact for all tiers |
| Target platforms | Multi-arch: ARM64 (Raspberry Pi) + AMD64 (desktop) |
| Subscription validation | Firebase Auth token → Firestore subscription check |
| Offline behavior | 48-hour grace period with cached last-known subscription status |
| Image registry | GitHub Container Registry (GHCR), private |
| Repo visibility | Fully private |

---

## 1. Server Subscription Validation

### New Module: `apps/server/src/lib/subscription.ts`

Validates that the running server instance belongs to an active subscriber.

### Startup Flow

1. Server reads `~/.deja/config.json` containing the user's `uid` (and optionally a cached subscription status)
2. Using the existing **Firebase Admin SDK** (service account credentials via `@repo/firebase-config/firebase-admin-node`), reads the Firestore document at `users/{uid}` and checks the `subscription` field
3. Checks subscription status against the allow/deny table below
4. **Allowed** → server starts normally, caches validation result with timestamp to `~/.deja/config.json`
5. **Denied** → logs clear message ("Subscription inactive — visit dejajs.com to renew"), exits with code 1
6. **Network failure** → falls back to cached result (see grace period)

### Subscription Status Mapping

The `subscription.status` field on the `users/{uid}` Firestore document uses the `SubscriptionStatus` type from `@repo/modules/plans/types.ts`:

| Status | Server Behavior | Rationale |
|--------|----------------|-----------|
| `active` | **Allow** | Paid and current |
| `trialing` | **Allow** | Free trial period |
| `past_due` | **Allow** | Stripe retries payment; user still has access during retry window |
| `incomplete` | **Deny** | Initial payment never completed |
| `incomplete_expired` | **Deny** | Initial payment window expired |
| `unpaid` | **Deny** | All Stripe retry attempts exhausted |
| `canceled` | **Deny** | User or system canceled |
| missing/undefined | **Deny** | No subscription record exists |

### Periodic Re-check

- Every **6 hours** while running, server re-validates subscription against Firestore
- On success with active status: updates cached timestamp
- On success with denied status (e.g., `canceled`, `unpaid`): **logs a warning but does NOT shut down mid-session**. Updates the cached status so the next cold start will enforce the block. Never interrupt a running layout.
- On network failure: continues using cached result

### Grace Period

- If cached validation is **< 48 hours old**, server runs normally even without network
- If cached validation is **> 48 hours old** and Firebase is unreachable, server shuts down gracefully with a clear log message
- Grace period resets on every successful validation

### Local Config File: `~/.deja/config.json`

```json
{
  "uid": "firebase-user-uid",
  "layoutId": "layout-id",
  "subscription": {
    "status": "active",
    "plan": "engineer",
    "validatedAt": "2026-03-12T10:00:00Z"
  }
}
```

**Note:** The server uses the **Firebase Admin SDK** (service account), not a user refresh token. The Admin SDK can read any Firestore document directly. The `uid` in config.json identifies which user document to check — it is obtained during the install script's authentication step and stored locally. No user refresh token is needed server-side.

### Config File Validation

- If `config.json` is **missing**: server exits with a message directing user to run the install script
- If `config.json` is **corrupt** (invalid JSON): server exits with a parse error message
- If `uid` field is **missing**: server exits with a message to re-run the install script
- If `subscription` cache is **missing or stale but `uid` is present**: server attempts live Firestore validation (no cached fallback available)
- **No cryptographic signing** of the cached status — a determined user could edit the file. This is acceptable per the "Out of Scope" section (no DRM). The value proposition is the subscription service (updates, Firebase infrastructure, support), not tamper-proof enforcement.

### Changes to Existing Code

| File | Change |
|------|--------|
| `apps/server/src/lib/subscription.ts` | **New** — validation, caching, grace period logic |
| `apps/server/index.ts` | Call `validateSubscription()` before starting any subsystem |

### What Does NOT Change

- Frontend apps remain on Vercel, gated by Firebase Auth
- Billing API stays as-is (Stripe webhooks update Firestore)
- Feature gating remains at Firebase/app level — server does not check plan tier
- All existing server subsystems (WS, MQTT, Firebase listeners) unchanged

---

## 2. Docker Image Build & Distribution

### Dockerfile: `apps/server/Dockerfile`

Multi-stage build targeting `node:20-slim`:

**Stage 1 — Build:**
- Install pnpm
- Copy full monorepo
- `pnpm install --frozen-lockfile`
- Bundle server + all workspace dependencies using **tsup** (esbuild-based bundler) into a single self-contained output
- tsup resolves all `@repo/*` workspace imports at build time, producing a standalone bundle that does not depend on workspace package resolution at runtime
- Native modules (`serialport`, `firebase-admin` grpc bindings) are marked as externals and kept in `node_modules`
- Prune to production dependencies only

**Stage 2 — Runtime:**
- `node:20-slim` base
- Copy bundled output + production `node_modules` (native deps only) from build stage
- Install system dependencies: `libudev-dev` (for `serialport`), `libc6` (for native modules)
- **No `play-sound`** in Docker — sound playback requires host audio hardware; disable via `ENABLE_SOUND=false` env var (sound effects are handled by IO devices via MQTT, not the server container)
- No source maps, no dev tooling, no tsx
- Entrypoint: `node dist/index.mjs`

**Build tooling note:** The server currently uses `tsc` for its build script, which outputs individual `.js` files that still depend on workspace package resolution. This does not produce a runnable standalone artifact. The Docker build will use **tsup** (added as a dev dependency) to create a self-contained ESM bundle. This is new build infrastructure that needs to be created and tested as part of this work.

### Image Details

| Property | Value |
|----------|-------|
| Registry | `ghcr.io/jmcdannel/deja-server` |
| Platforms | `linux/amd64`, `linux/arm64` |
| Tags | `v{semver}` (from git tag) + `latest` |
| Exposed port | 8082 (WebSocket) |
| Mount: serial | `/dev/ttyUSB0` or `/dev/ttyACM0` |
| Mount: config | `~/.deja/` → `/home/node/.deja` |
| Visibility | Private (inherits from private GitHub repo) |

### Docker Compose: `docker-compose.yml`

**Generated dynamically** by the install script based on detected hardware. The install script detects available serial ports and writes the correct device path. Example output:

```yaml
services:
  deja-server:
    image: ghcr.io/jmcdannel/deja-server:latest
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0   # Set by install script based on detection
    volumes:
      - ~/.deja:/home/node/.deja
    ports:
      - "8082:8082"
    env_file: .env
    restart: unless-stopped
```

**Serial device notes:**
- Common paths: `/dev/ttyUSB0`, `/dev/ttyACM0` (USB), `/dev/ttyS0`, `/dev/ttyAMA0` (Pi built-in UART)
- Install script scans `/dev/tty*` for likely DCC-EX devices and prompts user to confirm
- Users with multiple serial devices can edit the compose file to add additional device mappings
- The `dialout` group permission is required on Linux; install script checks and advises

### Build Considerations

- `serialport` requires native compilation — the Docker build handles this per-architecture
- The monorepo workspace dependencies (`@repo/modules`, `@repo/dccex`, `@repo/firebase-config`, etc.) are compiled and included in the image
- No source code is exposed in the final image — only compiled JavaScript

---

## 3. Install Script & User Experience

### End-to-End User Journey

1. User signs up at dejajs.com, picks a plan, pays via Stripe
2. Account dashboard shows an "Install" page with:
   - One-liner: `curl -fsSL https://install.dejajs.com | bash`
   - Their GHCR pull token
3. User runs the install script on their Pi or desktop

### Install Script Behavior

**Step 1 — Platform detection:**
- Detects OS (Linux, macOS, Windows via WSL)
- Detects architecture (amd64, arm64)
- Checks for Docker; installs on Linux if missing, prompts user on macOS/Windows

**Step 2 — Docker login:**
- Prompts for GHCR token (or accepts as argument: `curl ... | bash -s -- --token=ghp_xxx`)
- Runs `docker login ghcr.io` with the token

**Step 3 — Account linking:**
- **Option A (recommended for all platforms):** User copies their UID and GHCR token from the dejajs.com account dashboard "Install" page. The install script prompts for both values. Simple, works on headless Pi, no OAuth flow needed.
- **Option B (desktop with browser):** Install script opens `dejajs.com/activate?redirect=local` which authenticates the user and redirects back with their UID as a URL parameter to a local HTTP listener the script starts temporarily.
- Stores `uid` in `~/.deja/config.json`

**Note:** Firebase device code flow is not natively supported. Option A (copy-paste from dashboard) is the simplest approach that works everywhere, including headless Pi. Option B is a convenience for desktop users but is not required for MVP.

**Step 4 — Layout selection:**
- Queries Firebase for user's available layouts
- Lets user pick one (or creates a default)
- Stores layout ID in config

**Step 5 — Environment setup:**
- Generates `~/.deja/.env` with layout ID, Firebase config, sensible defaults
- Detects serial ports, suggests the right `/dev/tty*` device

**Step 6 — Pull and start:**
- `docker compose pull && docker compose up -d`

**Step 7 — Verification:**
- Waits for server to start (polls WebSocket health)
- Prints success message with local URL and next steps

### Update Command

A small shell script installed at `~/.deja/bin/deja`:

```bash
# deja update
docker compose -f ~/.deja/docker-compose.yml pull
docker compose -f ~/.deja/docker-compose.yml up -d
```

Also supports `deja logs`, `deja stop`, `deja restart`, `deja status`.

`deja status` shows: container state (running/stopped), image version, subscription status + plan from `config.json`, serial device connectivity, and WebSocket port.

### Idempotency

The install script can be re-run safely:
- Detects existing `~/.deja/config.json` and skips auth if valid
- Detects existing Docker login and skips
- Always pulls latest image

### File Structure on User's Machine

```
~/.deja/
├── config.json          # User UID, layout ID, cached subscription
├── docker-compose.yml   # Generated compose file
├── .env                 # Generated environment variables
└── bin/
    └── deja             # CLI wrapper (update, logs, stop, restart)
```

### Install Script Hosting

- Hosted at `install.dejajs.com` (public URL — Vercel Edge Function or static file)
- The script itself is not sensitive — it orchestrates Docker + auth
- The private artifact is the Docker image behind GHCR authentication

---

## 4. CI/CD & Release Workflow

### New Workflow: `.github/workflows/release-server.yml`

**Trigger:** Push of semver tag (`v*.*.*`)

**Steps:**

1. **Checkout** repo at tagged commit
2. **Set up** Docker Buildx + QEMU (for multi-arch)
3. **Login** to GHCR with `GITHUB_TOKEN`
4. **Build & push** multi-arch image:
   - `ghcr.io/jmcdannel/deja-server:v1.3.0`
   - `ghcr.io/jmcdannel/deja-server:latest`
5. **Deploy** install script to hosting (if changed)

### Release Process (Developer Workflow)

1. Make changes, merge to main
2. Create changeset, update changelog (existing workflow)
3. Tag a release: `git tag v1.3.0 && git push --tags` — image tag is derived from the **git tag**, not `package.json` version. Ensure both are synced as part of the release process.
4. CI builds and pushes Docker image automatically
5. Users run `deja update` to pull the new version

### No Automatic Updates

Updates are user-initiated only. Model railroaders may be mid-session at a train show — never interrupt a running layout.

---

## 5. Repo Privacy Migration

### Steps

1. **GitHub Settings** → Change repo visibility to private
2. **GHCR** → Automatically inherits private visibility
3. **Vercel** → Continues working (uses its own Git integration token)
4. **GitHub Actions** → Continue working (run in-repo)

### What Breaks

| Item | Impact | Fix |
|------|--------|-----|
| Public links to repo | 404 for external visitors | Update marketing site, READMEs, docs to remove GitHub links |
| Existing forks | Become read-only archives | No action needed — forks won't get updates |
| Public clones | Won't be able to pull | Expected — users migrate to Docker distribution |
| Community contributions | No more public PRs | Accept feedback via support channels, not GitHub |

### What Keeps Working

- Vercel deployments (all frontend apps)
- GitHub Actions CI/CD
- Claude Code integration (`claude.yml`)
- Dependabot / dependency updates
- GHCR image publishing

---

## Security Considerations

- **`~/.deja/config.json`** (contains UID and cached subscription data) should have restrictive file permissions (`chmod 600`)
- **GHCR PATs** are scoped to `read:packages` only — cannot push or access source
- **No source code** in the Docker image — only compiled JavaScript
- **Subscription validation** prevents running without an active account
- **Grace period** prevents denial-of-service if Firebase has an outage
- **Hardcoded Vercel Blob tokens** in `vercel.json` files should be moved to Vercel environment variables (pre-existing security issue, not caused by this change)

---

## Out of Scope

These are explicitly NOT part of this design:

- **Feature gating by plan tier** — already handled at Firebase/app level
- **Frontend app distribution changes** — stay on Vercel with Firebase Auth
- **Billing API changes** — stays as-is on Vercel (separate service, not included in Docker image), Stripe webhooks update Firestore
- **MQTT broker distribution** — users run their own Mosquitto (documented separately)
- **Per-user GHCR PAT automation** — manual for now, can add GitHub App later
- **Windows native support** — Windows users use WSL or Docker Desktop
- **Obfuscation/DRM** — compiled JS is sufficient; determined attackers can always reverse-engineer, and the value is in the subscription service (updates, support, Firebase infrastructure)

---

## Pre-existing Issues to Fix

These are not caused by this design but should be addressed during implementation:

- **`ENABLE_WS` bug** in `apps/server/index.ts`: `process.env.ENABLE_WS === 'true' || true` always evaluates to `true`. Docker users rely on env vars for configuration — this should be fixed to `process.env.ENABLE_WS !== 'false'` (default to enabled, but allow disabling).
- **Hardcoded Vercel Blob tokens** in `vercel.json` files (`apps/sound-api/vercel.json`, `apps/cloud/vercel.json`) should be moved to Vercel environment variables.
