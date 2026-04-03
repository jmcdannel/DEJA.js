# 🔐 Environment Variables — Developer Guide

## Prefix Rules

| Prefix | Meaning | Access | Example |
|--------|---------|--------|---------|
| `VITE_` | Bundled into client JS | ⚠️ Public in browser | `VITE_FIREBASE_API_KEY` |
| `NEXT_PUBLIC_` | Bundled into Next.js client | ⚠️ Public in browser | `NEXT_PUBLIC_SANITY_PROJECT_ID` |
| _(none)_ | Server-only | 🔒 Never in client | `MQTT_BROKER`, `FIREBASE_PRIVATE_KEY` |
| `ENABLE_` | Server boolean toggle | 🔒 Server-only | `ENABLE_MQTT` |

> **Rule:** If it's a secret, it MUST NOT have `VITE_` or `NEXT_PUBLIC_` prefix.

## Dev Setup

```bash
# 1. Copy template
cp .env.example .env

# 2. Fill in values (ask team for Firebase keys)

# 3. Copy to app directories (Vite loads .env from each app's dir)
for app in throttle cloud monitor tour server; do
  cp .env apps/$app/.env
done
```

> ⚠️ Vite does **not** hot-reload env vars. Restart the dev server after changes.

## End-User Server Config

End users running the DEJA server CLI don't use `.env` files. Their config lives at `~/.deja/config.json`:

```json
{
  "uid": "firebase-user-id",
  "layoutId": "my-layout",
  "mqtt": { "enabled": true, "broker": "mqtt://localhost", "port": 1883 },
  "ws": { "enabled": true, "port": 8082, "id": "DEJA.js" },
  "cloud": { "enabled": true },
  "audio": { "cacheSizeMb": 200, "cacheDir": "~/.deja/audio-cache" }
}
```

The server reads `config.json` first, then falls back to env vars for any missing fields. This means `.env` works for dev and `config.json` works for production.

## Variable Quick Reference

See [ENV.md](./ENV.md) for the full reference with per-app breakdowns.

### Layout
| Variable | Used By | Notes |
|----------|---------|-------|
| `LAYOUT_ID` | server | Firebase collection ID. End users: set in `config.json` |

### Firebase (Client — public)
| Variable | Used By |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | all Vite apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | all Vite apps |
| `VITE_FIREBASE_PROJECT_ID` | all Vite apps, io scripts |
| `VITE_FIREBASE_DATABASE_URL` | cloud API, server |
| `VITE_FIREBASE_STORAGE_BUCKET` | all Vite apps |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | all Vite apps |
| `VITE_FIREBASE_APP_ID` | all Vite apps |

### Firebase (Admin — 🔒 secret)
| Variable | Used By |
|----------|---------|
| `FIREBASE_CLIENT_EMAIL` | server, cloud API |
| `FIREBASE_PRIVATE_KEY` | server, cloud API |

### MQTT & WebSocket (Server)
| Variable | Used By | Default |
|----------|---------|---------|
| `MQTT_BROKER` | server, io scripts | `mqtt://localhost` |
| `MQTT_PORT` | server | `1883` |
| `ENABLE_MQTT` | server | `false` |
| `ENABLE_WS` | server | `true` |
| `VITE_WS_PORT` | server + cloud dashboard | `8082` |
| `WS_ID` | server | `DEJA.js` |
| `ENABLE_DEJACLOUD` | server | `false` |

### Error Tracking & Billing
| Variable | Used By |
|----------|---------|
| `VITE_SENTRY_DSN` | all Vite apps |
| `SENTRY_DSN` | server (same value) |
| `VITE_BILLING_API_URL` | monitor, throttle |
| `VITE_STRIPE_PUBLISHABLE_KEY` | cloud |

### Dev-Only
| Variable | Used By | Notes |
|----------|---------|-------|
| `VITE_DEMO_MODE` | tour | Bypass auth |
| `VITE_DEV_AUTO_LOGIN` | all apps | ⚠️ Never in production |
| `VITE_DEV_FEATURES` | feature flags | Dev-only features |

## Adding a New Env Var

1. Add it to `.env.example` with a comment
2. Add it to `turbo.json` → `globalEnv` if it affects build output
3. Add it to `ENV.md` variable reference table
4. If it's a server-only per-user setting, add it to the `DejaConfig` interface in `apps/server/src/lib/subscription.ts` and handle it in `apps/server/src/lib/server-config.ts`
