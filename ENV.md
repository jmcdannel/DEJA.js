# 🔐 Environment Variables Guide

How `.env` files and `~/.deja/config.json` work in the DEJA.js monorepo.

## Quick Start

```bash
# 1. Copy the template
cp .env.example .env

# 2. Fill in your values (ask the team for secrets)

# 3. Copy to app directories (required — Vite loads .env from each app's dir)
for app in throttle cloud monitor tour server; do
  cp .env apps/$app/.env
done
```

## Architecture

```
.env                    ← 🏠 Root: canonical source of truth (Turborepo cache hashing)
.env.example            ← 📋 Template: committed to git, safe to share
apps/throttle/.env      ← 🚂 Per-app copy (Vite loads from here)
apps/cloud/.env         ← ☁️  Per-app copy
apps/monitor/.env       ← 📊 Per-app copy
apps/tour/.env          ← 🗺️  Per-app copy
apps/server/.env        ← 🖥️  Per-app copy
~/.deja/config.json     ← 🏗️  End-user server config (production only)
```

### Why per-app copies?

Vite loads `.env` from the **app directory** (where `vite.config.ts` lives), not the monorepo root. Turborepo uses the root `.env` for cache key hashing via `globalDependencies`.

### Loading precedence (Vite)

```
.env               ← loaded first (lowest priority)
.env.local          ← loaded second (overrides .env)
.env.[mode]         ← loaded third
.env.[mode].local   ← loaded last (highest priority)
```

Use `.env.local` for personal overrides (e.g., a different `LAYOUT_ID` for your test layout). It's gitignored and won't affect anyone else.

## `~/.deja/config.json` — End-User Server Config

End users running the DEJA server CLI don't use `.env` files. Their configuration lives at `~/.deja/config.json`, written during installation.

```json
{
  "uid": "firebase-user-id",
  "layoutId": "my-layout",
  "subscription": { "status": "active", "plan": "engineer", "validatedAt": "..." },
  "onboardingComplete": true,
  "mqtt": { "enabled": true, "broker": "mqtt://localhost", "port": 1883 },
  "ws": { "enabled": true, "port": 8082, "id": "DEJA.js" },
  "cloud": { "enabled": true },
  "audio": { "cacheSizeMb": 200, "cacheDir": "~/.deja/audio-cache" }
}
```

### Config.json → env var mapping

| config.json path | env var fallback | Default |
|---|---|---|
| `layoutId` | `LAYOUT_ID` | `betatrack` |
| `mqtt.enabled` | `ENABLE_MQTT` | `false` |
| `mqtt.broker` | `MQTT_BROKER` | `mqtt://localhost` |
| `mqtt.port` | `MQTT_PORT` | `1883` |
| `ws.enabled` | `ENABLE_WS` | `true` |
| `ws.port` | `VITE_WS_PORT` | `8082` |
| `ws.id` | `WS_ID` | `DEJA.js` |
| `cloud.enabled` | `ENABLE_DEJACLOUD` | `false` |
| `audio.cacheSizeMb` | `AUDIO_CACHE_SIZE_MB` | `200` |
| `audio.cacheDir` | `AUDIO_CACHE_DIR` | `temp-sounds-cache` |

**Priority:** `config.json` values take precedence. Env vars are the dev-time fallback. The server also bridges config.json values into `process.env` so all module-level reads work transparently.

## Git Worktree Setup

Worktrees don't inherit `.env` files. **Always copy** (don't symlink — symlinks fail in some environments):

> This repo uses a bare-repo + sibling-worktrees layout: bare at `/Users/jmcdannel/TTT/DEJA.js.git/.bare`, worktrees are siblings inside `/Users/jmcdannel/TTT/DEJA.js.git/`.

```bash
PREVIEW=/Users/jmcdannel/TTT/DEJA.js.git/preview
WT=/Users/jmcdannel/TTT/DEJA.js.git/<your-worktree>

# Root (for Turborepo)
cp "$PREVIEW/.env" "$WT/.env"

# Per-app (for Vite)
for app in throttle cloud monitor tour server; do
  cp "$PREVIEW/.env" "$WT/apps/$app/.env"
done
```

> ⚠️ Vite does **not** hot-reload env vars. If you change `.env`, kill and restart the dev server.

## Variable Reference

### 🏗️ Layout

| Variable | Used By | Description |
|----------|---------|-------------|
| `LAYOUT_ID` | server, config.json | Layout identifier (Firebase collection). End users set in `config.json`. |

### 🔥 Firebase (Client)

| Variable | Used By | Description |
|----------|---------|-------------|
| `VITE_FIREBASE_API_KEY` | all apps | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | all apps | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | all apps, io scripts | Firebase project ID |
| `VITE_FIREBASE_DATABASE_URL` | cloud API, server, scripts | Realtime Database URL |
| `VITE_FIREBASE_STORAGE_BUCKET` | all apps | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | all apps | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | all apps | Firebase app ID |

> These are **public** Firebase client config values. They're protected by Firebase Security Rules, not by being secret.

### 🔑 Firebase (Admin)

| Variable | Used By | Description |
|----------|---------|-------------|
| `FIREBASE_CLIENT_EMAIL` | cloud API, server, io scripts | Service account email |
| `FIREBASE_PRIVATE_KEY` | cloud API, server, io scripts | Service account private key |

> ⚠️ **Secret!** These grant server-side admin access. Never expose to the client. On Vercel, set these as environment variables in the dashboard.

### 📡 MQTT & WebSocket

| Variable | Used By | Description |
|----------|---------|-------------|
| `MQTT_BROKER` | server, io scripts | MQTT broker URL (default: `mqtt://localhost`) |
| `MQTT_PORT` | server | MQTT port (default: `1883`) |
| `ENABLE_MQTT` | server | Toggle MQTT connection (`true`/`false`) |
| `ENABLE_WS` | server | Toggle WebSocket server (`true`/`false`) |
| `ENABLE_DEJACLOUD` | server | Toggle Firebase cloud sync (`true`/`false`) |
| `VITE_WS_PORT` | cloud dashboard, server | WebSocket port (default: `8082`) |
| `WS_ID` | server | WebSocket server ID (default: `DEJA.js`) |

> `VITE_WS_PORT` keeps the `VITE_` prefix because the cloud dashboard reads it client-side to connect to the WebSocket server.

### 📊 Sentry

| Variable | Used By | Description |
|----------|---------|-------------|
| `VITE_SENTRY_DSN` | throttle, cloud, monitor, tour | Client-side Sentry DSN |
| `SENTRY_DSN` | server | Server-side Sentry DSN (same value, no `VITE_` prefix) |

### 💳 Stripe

| Variable | Used By | Description |
|----------|---------|-------------|
| `VITE_BILLING_API_URL` | monitor, throttle settings | Billing API endpoint |
| `VITE_STRIPE_PUBLISHABLE_KEY` | cloud (payments) | Stripe publishable key (test or live) |
| `STRIPE_SECRET_KEY` | cloud API | Stripe secret key (Vercel env var only) |
| `STRIPE_WEBHOOK_SECRET` | cloud API | Webhook signature secret (Vercel env var only) |
| `STRIPE_PRICE_*` | cloud API | Plan price IDs (Vercel env vars only) |

> Stripe server-side vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`) are set in **Vercel dashboard only**, not in `.env`.

### 🧪 Demo / Dev

| Variable | Used By | Description |
|----------|---------|-------------|
| `VITE_DEMO_EMAIL` | throttle "Try Demo" button, `dev:demo` auto-login | Demo account email (default: `demo@dejajs.com`) |
| `VITE_DEMO_PASSWORD` | throttle "Try Demo" button, `dev:demo` auto-login | Demo account password |
| `VITE_AUTO_LOGIN` | all app routers | Set automatically by `pnpm dev:demo` — do **not** add to `.env` |
| `VITE_DEV_FEATURES` | feature flags, routers | Enable dev-only features |

> **`pnpm dev:demo`** starts all apps with auto-login using `VITE_DEMO_EMAIL`/`VITE_DEMO_PASSWORD`. Uses real Firebase auth and real data — not a mock.
>
> The throttle app always shows a "Try Demo" button on its login page (no env var needed). Other apps do not have demo mode.

### 📝 Sanity CMS

| Variable | Used By | Description |
|----------|---------|-------------|
| `SANITY_API_TOKEN` | dejajs-www scripts | Write token for seeding/pushing content |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | dejajs-www | Sanity project ID (default: `c6pxffpo`) |
| `NEXT_PUBLIC_SANITY_DATASET` | dejajs-www | Dataset name (default: `production`) |

### ☁️ Cloudflare Tunnel

| Variable | Used By | Description |
|----------|---------|-------------|
| `CLOUDFLARE_TUNNEL_TOKEN` | server scripts | Named tunnel token. Leave empty for quick tunnels. |

### 📦 Vercel Blob

| Variable | Used By | Description |
|----------|---------|-------------|
| `BLOB_READ_WRITE_TOKEN` | blob-assets, sounds packages | Token for `pnpm upload-assets` / sound uploads |

### 🔧 Vercel-Only (set in dashboard, not in `.env`)

| Variable | Project | Description |
|----------|---------|-------------|
| `CRON_SECRET` | cloud | Bearer token for cron job auth |
| `STRIPE_SECRET_KEY` | cloud | Stripe server-side secret |
| `STRIPE_WEBHOOK_SECRET` | cloud | Stripe webhook verification |
| `STRIPE_PRICE_ENGINEER_MONTHLY` | cloud | Stripe price ID |
| `STRIPE_PRICE_ENGINEER_ANNUAL` | cloud | Stripe price ID |
| `STRIPE_PRICE_CONDUCTOR_MONTHLY` | cloud | Stripe price ID |
| `STRIPE_PRICE_CONDUCTOR_ANNUAL` | cloud | Stripe price ID |
| `UPLOAD_SECRET` | install-api | Upload endpoint auth |

## Naming Conventions

| Prefix | Meaning | Access |
|--------|---------|--------|
| `VITE_` | Exposed to client via `import.meta.env.VITE_*` | ⚠️ Public in browser |
| `NEXT_PUBLIC_` | Exposed to client in Next.js apps (dejajs-www) | ⚠️ Public in browser |
| _(no prefix)_ | Server-only, accessed via `process.env.*` | 🔒 Not in client bundle |
| `ENABLE_` | Boolean feature toggles for the server | 🔒 Server-only |

> **Rule of thumb:** If it's a secret, it must NOT have the `VITE_` or `NEXT_PUBLIC_` prefix. Firebase client config is the exception — it's designed to be public.

## Per-App Overrides

If an app needs a different value than the root `.env`, create an `.env.local` in that app's directory:

```bash
# Example: apps/throttle/.env.local
VITE_DEV_FEATURES=true    # Enable dev-only features locally
```

## Adding a New Env Var

1. Add it to `.env.example` with a comment
2. Add it to `turbo.json` → `globalEnv` if it affects build output
3. Add it to this file's variable reference table
4. If it's a server-only per-user setting, add it to the `DejaConfig` interface in `apps/server/src/lib/subscription.ts` and handle it in `apps/server/src/lib/server-config.ts`

## Turborepo Cache

`turbo.json` lists all env vars in `globalEnv` that affect build output. If you add a new `VITE_*` variable that changes what gets bundled, add it to `globalEnv` so Turborepo invalidates the cache correctly.
