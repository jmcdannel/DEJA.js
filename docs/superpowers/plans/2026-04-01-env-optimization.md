# 🔧 Environment Variable Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `~/.deja/config.json` with all per-user server settings, rename misleading `VITE_` prefixes on server-only vars, remove `VITE_LAYOUT_ID` from client apps, de-dupe `.env` files, and document the result.

**Architecture:** The server reads config from `~/.deja/config.json` (production/distribution) with `process.env` fallback (dev). Three server-only env vars (`VITE_MQTT_BROKER`, `VITE_MQTT_PORT`, `VITE_WS_ID`) lose their `VITE_` prefix. `VITE_LAYOUT_ID` is removed entirely — all client apps already use `useStorage('@DEJA/layoutId')` with Firestore auto-selection as fallback.

**Tech Stack:** TypeScript, Node.js, Vue 3, Vite, Turborepo, pnpm

---

## File Structure

### New files
- `apps/server/src/lib/server-config.ts` — Reads `~/.deja/config.json` and merges with env var fallbacks. Single source of truth for all server runtime config.
- `apps/server/src/lib/server-config.test.ts` — Unit tests for the config loader.
- `ENV-README.md` (root) — Developer-facing guide to the env var process.

### Modified files

**Config & env:**
- `.env.example` — Remove `VITE_LAYOUT_ID`, rename `VITE_MQTT_BROKER` → `MQTT_BROKER`, `VITE_MQTT_PORT` → `MQTT_PORT`, `VITE_WS_ID` → `WS_ID`
- `turbo.json` — Update `globalEnv` to match new names, remove `VITE_LAYOUT_ID`
- `apps/server/setup-env.sh` — Use new var names
- `ENV.md` — Full rewrite to reflect new structure

**Server code (rename env vars + config.json support):**
- `apps/server/src/lib/subscription.ts` — Expand `DejaConfig` interface with nested `mqtt`, `ws`, `cloud`, `audio` fields
- `apps/server/index.ts` — Read toggles from `getServerConfig()` instead of raw `process.env`
- `apps/server/src/lib/mqtt.ts` — Read broker/port from config
- `apps/server/src/lib/ws-server.ts` — Read port/id from config
- `apps/server/src/lib/AudioCacheService.ts` — Read cache settings from config
- `apps/server/src/dejaCloud.ts` — Read layoutId from config
- `apps/server/src/lib/dcc.ts` — Read layoutId from config
- `apps/server/src/lib/deja.ts` — Read layoutId from config
- `apps/server/src/modules/effects.ts` — Read layoutId from config
- `apps/server/src/modules/throttles.ts` — Read layoutId from config
- `apps/server/src/modules/roster.ts` — Read layoutId from config
- `apps/server/src/modules/sync-config.ts` — Read layoutId from config
- `apps/server/src/modules/sensors.ts` — Read layoutId from config
- `apps/server/src/modules/turnouts.ts` — Read layoutId from config
- `apps/server/src/modules/layout.ts` — Read layoutId from config
- `apps/server/src/modules/blocks.ts` — Read layoutId from config
- `apps/server/src/modules/trackOutputs.ts` — Read layoutId from config
- `apps/server/src/scripts/gen-route-styles.ts` — Read layoutId from config
- `apps/server/src/scripts/start-mqtt.ts` — Use new var names
- `apps/server/src/scripts/check-mqtt.ts` — Use new var name

**Client code (remove VITE_LAYOUT_ID):**
- `packages/auth/src/guards/requireLayout.ts` — Remove `VITE_LAYOUT_ID` fallback, use empty string default
- `apps/tour/src/stores/tour.ts` — Remove `VITE_LAYOUT_ID` fallback, use `null` default

**IO scripts (rename VITE_MQTT_BROKER):**
- `io/scripts/build.ts` — Change `VITE_MQTT_BROKER` fallback to `MQTT_BROKER`
- `io/scripts/lib/prompts.ts` — Change `VITE_MQTT_BROKER` fallback to `MQTT_BROKER`

**Per-app .env files (de-dupe):**
- `apps/server/.env` — Remove vars now in config.json, use new names
- `apps/throttle/.env` — Remove `VITE_LAYOUT_ID`
- `apps/cloud/.env` — Remove `VITE_LAYOUT_ID`
- `apps/monitor/.env` — Remove `VITE_LAYOUT_ID`
- `apps/tour/.env` — Remove `VITE_LAYOUT_ID`

**Documentation:**
- `CLAUDE.md` — Update env var tables to match new names

---

## Task 1: Expand `DejaConfig` and create `getServerConfig()`

**Files:**
- Modify: `apps/server/src/lib/subscription.ts` (lines 18-22, `DejaConfig` interface)
- Create: `apps/server/src/lib/server-config.ts`
- Create: `apps/server/src/lib/server-config.test.ts`

### Steps

- [ ] **Step 1.1: Expand `DejaConfig` interface in subscription.ts**

In `apps/server/src/lib/subscription.ts`, replace the `DejaConfig` interface:

```typescript
export interface DejaConfig {
  uid: string
  layoutId: string
  subscription?: CachedSubscription
  onboardingComplete?: boolean
  mqtt?: {
    enabled?: boolean
    broker?: string
    port?: number
  }
  ws?: {
    enabled?: boolean
    port?: number
    id?: string
  }
  cloud?: {
    enabled?: boolean
  }
  audio?: {
    cacheSizeMb?: number
    cacheDir?: string
  }
}
```

All new fields are optional so existing `config.json` files continue to work.

- [ ] **Step 1.2: Create `server-config.ts`**

Create `apps/server/src/lib/server-config.ts`:

```typescript
// apps/server/src/lib/server-config.ts
import { readConfig } from './subscription.js'
import type { DejaConfig } from './subscription.js'
import { log } from '../utils/logger.js'

export interface ServerConfig {
  layoutId: string
  mqtt: {
    enabled: boolean
    broker: string
    port: number
  }
  ws: {
    enabled: boolean
    port: number
    id: string
  }
  cloud: {
    enabled: boolean
  }
  audio: {
    cacheSizeMb: number
    cacheDir: string
  }
}

let cachedConfig: ServerConfig | null = null

/**
 * Load server configuration from ~/.deja/config.json with process.env fallback.
 * Config.json values take priority; env vars are the dev-time fallback.
 * Result is cached — call once at startup.
 */
export async function getServerConfig(): Promise<ServerConfig> {
  if (cachedConfig) return cachedConfig

  let fileConfig: DejaConfig | null = null
  try {
    fileConfig = await readConfig()
  } catch {
    log.info('No ~/.deja/config.json found, using environment variables only')
  }

  cachedConfig = {
    layoutId: fileConfig?.layoutId
      || process.env.LAYOUT_ID
      || 'betatrack',

    mqtt: {
      enabled: fileConfig?.mqtt?.enabled
        ?? (process.env.ENABLE_MQTT === 'true'),
      broker: fileConfig?.mqtt?.broker
        || process.env.MQTT_BROKER
        || process.env.VITE_MQTT_BROKER  // legacy fallback
        || 'mqtt://localhost',
      port: fileConfig?.mqtt?.port
        ?? parseInt(process.env.MQTT_PORT || process.env.VITE_MQTT_PORT || '1883'),
    },

    ws: {
      enabled: fileConfig?.ws?.enabled
        ?? (process.env.ENABLE_WS !== 'false'),
      port: fileConfig?.ws?.port
        ?? parseInt(process.env.VITE_WS_PORT || '8082'),
      id: fileConfig?.ws?.id
        || process.env.WS_ID
        || process.env.VITE_WS_ID  // legacy fallback
        || 'DEJA.js',
    },

    cloud: {
      enabled: fileConfig?.cloud?.enabled
        ?? (process.env.ENABLE_DEJACLOUD === 'true'),
    },

    audio: {
      cacheSizeMb: fileConfig?.audio?.cacheSizeMb
        ?? parseInt(process.env.AUDIO_CACHE_SIZE_MB || '200'),
      cacheDir: fileConfig?.audio?.cacheDir
        || process.env.AUDIO_CACHE_DIR
        || 'temp-sounds-cache',
    },
  }

  log.info('Server config loaded', {
    layoutId: cachedConfig.layoutId,
    mqtt: cachedConfig.mqtt.enabled,
    ws: cachedConfig.ws.enabled,
    cloud: cachedConfig.cloud.enabled,
  })

  return cachedConfig
}

/** Reset cached config (for testing). */
export function resetServerConfig(): void {
  cachedConfig = null
}
```

- [ ] **Step 1.3: Write tests for `server-config.ts`**

Create `apps/server/src/lib/server-config.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock subscription module before importing server-config
vi.mock('./subscription.js', () => ({
  readConfig: vi.fn(),
}))

// Mock logger
vi.mock('../utils/logger.js', () => ({
  log: { info: vi.fn(), warn: vi.fn() },
}))

import { getServerConfig, resetServerConfig } from './server-config.js'
import { readConfig } from './subscription.js'

const mockedReadConfig = vi.mocked(readConfig)

describe('getServerConfig', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    resetServerConfig()
    vi.clearAllMocks()
    // Clear relevant env vars
    delete process.env.LAYOUT_ID
    delete process.env.ENABLE_MQTT
    delete process.env.MQTT_BROKER
    delete process.env.VITE_MQTT_BROKER
    delete process.env.MQTT_PORT
    delete process.env.VITE_MQTT_PORT
    delete process.env.ENABLE_WS
    delete process.env.VITE_WS_PORT
    delete process.env.WS_ID
    delete process.env.VITE_WS_ID
    delete process.env.ENABLE_DEJACLOUD
    delete process.env.AUDIO_CACHE_SIZE_MB
    delete process.env.AUDIO_CACHE_DIR
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns defaults when no config file and no env vars', async () => {
    mockedReadConfig.mockRejectedValue(new Error('not found'))
    const config = await getServerConfig()
    expect(config.layoutId).toBe('betatrack')
    expect(config.mqtt).toEqual({ enabled: false, broker: 'mqtt://localhost', port: 1883 })
    expect(config.ws).toEqual({ enabled: true, port: 8082, id: 'DEJA.js' })
    expect(config.cloud).toEqual({ enabled: false })
    expect(config.audio).toEqual({ cacheSizeMb: 200, cacheDir: 'temp-sounds-cache' })
  })

  it('reads from config.json when available', async () => {
    mockedReadConfig.mockResolvedValue({
      uid: 'user-1',
      layoutId: 'my-layout',
      mqtt: { enabled: true, broker: 'mqtt://pi.local', port: 1884 },
      ws: { enabled: true, port: 9090, id: 'MyServer' },
      cloud: { enabled: true },
      audio: { cacheSizeMb: 500, cacheDir: '/tmp/audio' },
    })
    const config = await getServerConfig()
    expect(config.layoutId).toBe('my-layout')
    expect(config.mqtt.broker).toBe('mqtt://pi.local')
    expect(config.mqtt.port).toBe(1884)
    expect(config.ws.port).toBe(9090)
    expect(config.ws.id).toBe('MyServer')
    expect(config.audio.cacheSizeMb).toBe(500)
  })

  it('falls back to env vars when config.json fields are missing', async () => {
    mockedReadConfig.mockResolvedValue({
      uid: 'user-1',
      layoutId: 'from-config',
    })
    process.env.MQTT_BROKER = 'mqtt://env-broker'
    process.env.ENABLE_MQTT = 'true'
    const config = await getServerConfig()
    expect(config.layoutId).toBe('from-config')
    expect(config.mqtt.enabled).toBe(true)
    expect(config.mqtt.broker).toBe('mqtt://env-broker')
  })

  it('supports legacy VITE_ prefixed env vars as fallback', async () => {
    mockedReadConfig.mockRejectedValue(new Error('not found'))
    process.env.VITE_MQTT_BROKER = 'mqtt://legacy'
    process.env.VITE_MQTT_PORT = '1885'
    process.env.VITE_WS_ID = 'LegacyServer'
    const config = await getServerConfig()
    expect(config.mqtt.broker).toBe('mqtt://legacy')
    expect(config.mqtt.port).toBe(1885)
    expect(config.ws.id).toBe('LegacyServer')
  })

  it('caches the config on subsequent calls', async () => {
    mockedReadConfig.mockResolvedValue({ uid: 'u', layoutId: 'cached' })
    const first = await getServerConfig()
    const second = await getServerConfig()
    expect(first).toBe(second)
    expect(mockedReadConfig).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 1.4: Run the tests**

Run: `cd /Users/jmcdannel/TTT/worktrees/preview && pnpm --filter=deja-serverts exec vitest run src/lib/server-config.test.ts`

If vitest is not configured for the server app, run: `cd apps/server && npx vitest run src/lib/server-config.test.ts`

Expected: All 5 tests pass.

- [ ] **Step 1.5: Commit**

```bash
git add apps/server/src/lib/server-config.ts apps/server/src/lib/server-config.test.ts apps/server/src/lib/subscription.ts
git commit -m "feat(server): add server-config loader with ~/.deja/config.json + env fallback"
```

---

## Task 2: Wire server entry point to use `getServerConfig()`

**Files:**
- Modify: `apps/server/index.ts`

### Steps

- [ ] **Step 2.1: Replace raw `process.env` reads in index.ts**

In `apps/server/index.ts`, replace lines 1-25 and the `main()` function to use `getServerConfig()`:

1. Add import at the top (after existing imports):
```typescript
import { getServerConfig } from './src/lib/server-config.js'
import type { ServerConfig } from './src/lib/server-config.js'
```

2. Remove these three lines (23-25):
```typescript
const ENABLE_MQTT = process.env.ENABLE_MQTT === 'true' || false
const ENABLE_WS = process.env.ENABLE_WS !== 'false'
const ENABLE_DEJACLOUD = process.env.ENABLE_DEJACLOUD === 'true' || false
```

3. Replace with module-level variable + initialization in `main()`:
```typescript
let serverConfig: ServerConfig
```

4. In the `main()` function, after `startPeriodicRecheck(config.uid)` (around line 41), add:
```typescript
    serverConfig = await getServerConfig()
```

5. Replace all references to the old constants in `main()` and `shutdown()`:
- `ENABLE_MQTT` → `serverConfig.mqtt.enabled`
- `ENABLE_WS` → `serverConfig.ws.enabled`
- `ENABLE_DEJACLOUD` → `serverConfig.cloud.enabled`

6. Update the log lines:
```typescript
    log.note('MQTT', serverConfig.mqtt.enabled ? `ON (${serverConfig.mqtt.broker}:${serverConfig.mqtt.port})` : 'OFF')
    log.note('WebSocket', serverConfig.ws.enabled ? `ON (port ${serverConfig.ws.port})` : 'OFF')
    log.note('DEJA Cloud', serverConfig.cloud.enabled ? 'ON' : 'OFF')
```

- [ ] **Step 2.2: Verify server still compiles**

Run: `cd /Users/jmcdannel/TTT/worktrees/preview && pnpm --filter=deja-serverts exec tsc --noEmit`

Expected: No type errors.

- [ ] **Step 2.3: Commit**

```bash
git add apps/server/index.ts
git commit -m "refactor(server): read MQTT/WS/cloud toggles from server-config"
```

---

## Task 3: Update server modules to read `layoutId` from config

**Files:**
- Modify: `apps/server/src/dejaCloud.ts`
- Modify: `apps/server/src/lib/ws-server.ts`
- Modify: `apps/server/src/lib/mqtt.ts`
- Modify: `apps/server/src/lib/dcc.ts`
- Modify: `apps/server/src/lib/deja.ts`
- Modify: `apps/server/src/lib/AudioCacheService.ts`
- Modify: `apps/server/src/modules/effects.ts`
- Modify: `apps/server/src/modules/throttles.ts`
- Modify: `apps/server/src/modules/roster.ts`
- Modify: `apps/server/src/modules/sync-config.ts`
- Modify: `apps/server/src/modules/sensors.ts`
- Modify: `apps/server/src/modules/turnouts.ts`
- Modify: `apps/server/src/modules/layout.ts`
- Modify: `apps/server/src/modules/blocks.ts`
- Modify: `apps/server/src/modules/trackOutputs.ts`

### Steps

- [ ] **Step 3.1: Update `dejaCloud.ts`**

In `apps/server/src/dejaCloud.ts`, line 21:

Replace:
```typescript
const layoutId = process.env.LAYOUT_ID || 'betatrack'
```
With:
```typescript
import { getServerConfig } from './lib/server-config.js'
// layoutId is resolved lazily on first use
let _layoutId: string | null = null
async function getLayoutId(): Promise<string> {
  if (!_layoutId) {
    const config = await getServerConfig()
    _layoutId = config.layoutId
  }
  return _layoutId
}
```

Then update all usages of `layoutId` in this file to `await getLayoutId()`. Since `dejaCloud.connect()` is already async, this is safe. The key places are:
- The `connect()` function where it sets up Firebase listeners
- Any function that references `layoutId` for Firestore paths

**Alternative simpler approach** — since `getServerConfig()` caches after first call and `main()` calls it before `dejaCloud.connect()`, the config is already loaded. Use synchronous access:

```typescript
import { getServerConfig } from './lib/server-config.js'
import type { ServerConfig } from './lib/server-config.js'

let config: ServerConfig

export const dejaCloud = {
  async connect() {
    config = await getServerConfig()
    const layoutId = config.layoutId
    // ... rest uses layoutId as before
  }
}
```

Apply the **same pattern** to each module below: import `getServerConfig`, call it at the top of the module's `connect()` / initialization function, and use the result.

- [ ] **Step 3.2: Update `ws-server.ts`**

In `apps/server/src/lib/ws-server.ts`, replace lines 7-9:

```typescript
const layoutId = process.env.LAYOUT_ID
const port = process.env.VITE_WS_PORT || '8082'
const serverId = process.env.VITE_WS_ID || 'DEJA.js'
```

With:
```typescript
import { getServerConfig } from './server-config.js'
import type { ServerConfig } from './server-config.js'

let layoutId: string
let port: string
let serverId: string
```

Then in the `connect()` function, at the top:
```typescript
const config = await getServerConfig()
layoutId = config.layoutId
port = String(config.ws.port)
serverId = config.ws.id
```

- [ ] **Step 3.3: Update `mqtt.ts`**

In `apps/server/src/lib/mqtt.ts`, replace lines 7-9:

```typescript
const layoutId = process.env.LAYOUT_ID
const mqttBroker = process.env.VITE_MQTT_BROKER || 'mqtt://localhost'
const mqttPort = process.env.VITE_MQTT_PORT || '1883'
```

With:
```typescript
import { getServerConfig } from './server-config.js'

let layoutId: string
let mqttBroker: string
let mqttPort: string
```

Then in the `connect()` function, at the top:
```typescript
const config = await getServerConfig()
layoutId = config.layoutId
mqttBroker = config.mqtt.broker
mqttPort = String(config.mqtt.port)
```

- [ ] **Step 3.4: Update `dcc.ts` and `deja.ts`**

In both files, replace `const layoutId = process.env.LAYOUT_ID` with:

```typescript
import { getServerConfig } from './server-config.js'

let layoutId: string

export async function init() {
  const config = await getServerConfig()
  layoutId = config.layoutId
}
```

If these modules don't have an `init()` or `connect()` function, add a lazy accessor:

```typescript
import { getServerConfig } from './server-config.js'

let _layoutId: string | null = null
function getLayoutId(): string {
  // Config is guaranteed loaded by main() before any module uses it
  if (!_layoutId) {
    throw new Error('Server config not loaded — call getServerConfig() in main() first')
  }
  return _layoutId
}

// Called once at startup from dejaCloud.connect() flow
export async function initConfig(): Promise<void> {
  const config = await getServerConfig()
  _layoutId = config.layoutId
}
```

**Simpler approach for modules that only need layoutId:** Since `getServerConfig()` caches and is synchronous after first call, and `main()` always calls it before any module code runs, the safest minimal change is:

For each module file (`dcc.ts`, `deja.ts`, `effects.ts`, `throttles.ts`, `roster.ts`, `sync-config.ts`, `sensors.ts`, `turnouts.ts`, `layout.ts`, `blocks.ts`, `trackOutputs.ts`):

Replace:
```typescript
const layoutId = process.env.LAYOUT_ID || 'betatrack'
// or
const layoutId = process.env.LAYOUT_ID
```

With:
```typescript
const layoutId = process.env.LAYOUT_ID || 'betatrack'
// TODO: Will be replaced by server-config in Task 3.5
```

Actually, keep it simple — use process.env for now since `getServerConfig()` is async and these are module-level constants. **The config.json reader in `main()` should write to `process.env` as a bridge:**

- [ ] **Step 3.5: Bridge strategy — populate `process.env` from config.json**

Add to the end of `getServerConfig()` in `server-config.ts`, after caching:

```typescript
  // Bridge: populate process.env so module-level constants pick up config values.
  // This avoids refactoring every module to use async config access.
  process.env.LAYOUT_ID = cachedConfig.layoutId
  process.env.ENABLE_MQTT = String(cachedConfig.mqtt.enabled)
  process.env.MQTT_BROKER = cachedConfig.mqtt.broker
  process.env.MQTT_PORT = String(cachedConfig.mqtt.port)
  process.env.ENABLE_WS = String(cachedConfig.ws.enabled)
  process.env.VITE_WS_PORT = String(cachedConfig.ws.port)
  process.env.WS_ID = cachedConfig.ws.id
  process.env.ENABLE_DEJACLOUD = String(cachedConfig.cloud.enabled)
  process.env.AUDIO_CACHE_SIZE_MB = String(cachedConfig.audio.cacheSizeMb)
  process.env.AUDIO_CACHE_DIR = cachedConfig.audio.cacheDir
```

This means all existing `process.env.LAYOUT_ID` reads across every module file **just work** without changing them. The config.json values override whatever was in `.env`.

With this bridge, steps 3.1–3.4 become **optional future cleanup** rather than blocking work. The critical path is:
1. `main()` calls `getServerConfig()` early (before any subsystem starts) ✅ (done in Task 2)
2. `getServerConfig()` writes values to `process.env` ✅ (this step)
3. All modules read `process.env` as before ✅ (no changes needed)

- [ ] **Step 3.6: Update mqtt.ts and ws-server.ts to use new env var names**

In `apps/server/src/lib/mqtt.ts`, change:
```typescript
const mqttBroker = process.env.VITE_MQTT_BROKER || 'mqtt://localhost'
const mqttPort = process.env.VITE_MQTT_PORT || '1883'
```
To:
```typescript
const mqttBroker = process.env.MQTT_BROKER || process.env.VITE_MQTT_BROKER || 'mqtt://localhost'
const mqttPort = process.env.MQTT_PORT || process.env.VITE_MQTT_PORT || '1883'
```

In `apps/server/src/lib/ws-server.ts`, change:
```typescript
const serverId = process.env.VITE_WS_ID || 'DEJA.js'
```
To:
```typescript
const serverId = process.env.WS_ID || process.env.VITE_WS_ID || 'DEJA.js'
```

- [ ] **Step 3.7: Update server scripts**

In `apps/server/src/scripts/start-mqtt.ts`, replace:
```typescript
log.log('MQTT broker:', process.env.VITE_MQTT_BROKER || 'mqtt://localhost')
log.log('MQTT port:', process.env.VITE_MQTT_PORT || '8082')
```
With:
```typescript
log.log('MQTT broker:', process.env.MQTT_BROKER || process.env.VITE_MQTT_BROKER || 'mqtt://localhost')
log.log('MQTT port:', process.env.MQTT_PORT || process.env.VITE_MQTT_PORT || '1883')
```

(Also fixes the bug where port fallback was `'8082'` instead of `'1883'`.)

In `apps/server/src/scripts/check-mqtt.ts`, no change needed — it only reads `ENABLE_MQTT` which is unchanged.

- [ ] **Step 3.8: Verify server compiles**

Run: `cd /Users/jmcdannel/TTT/worktrees/preview && pnpm --filter=deja-serverts exec tsc --noEmit`

Expected: No type errors.

- [ ] **Step 3.9: Commit**

```bash
git add apps/server/src/lib/server-config.ts apps/server/src/lib/mqtt.ts apps/server/src/lib/ws-server.ts apps/server/src/scripts/start-mqtt.ts
git commit -m "refactor(server): bridge config.json values to process.env, use new MQTT_BROKER/MQTT_PORT/WS_ID names"
```

---

## Task 4: Remove `VITE_LAYOUT_ID` from client apps

**Files:**
- Modify: `packages/auth/src/guards/requireLayout.ts`
- Modify: `apps/tour/src/stores/tour.ts` (line 73)

### Steps

- [ ] **Step 4.1: Update `requireLayout.ts`**

In `packages/auth/src/guards/requireLayout.ts`, replace lines 10-18:

```typescript
// Prefer the Vite environment variable VITE_LAYOUT_ID when available.
// Use empty string (not null) as default to ensure useStorage always uses
// the string serializer — consistent with all other consumers in the codebase.
const defaultLayoutId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LAYOUT_ID)
  ? String(import.meta.env.VITE_LAYOUT_ID)
  : ''

// Hoisted to module level so useStorage doesn't create a new ref per navigation.
const layoutId = useStorage('@DEJA/layoutId', defaultLayoutId)
```

With:
```typescript
// Hoisted to module level so useStorage doesn't create a new ref per navigation.
// Default is empty string (not null) to ensure useStorage always uses the string serializer.
// When empty, the guard queries Firestore to auto-select or redirect to layout selection.
const layoutId = useStorage('@DEJA/layoutId', '')
```

- [ ] **Step 4.2: Update tour store**

In `apps/tour/src/stores/tour.ts`, replace line 73:

```typescript
const layoutId = useStorage<string | null>('@DEJA/layoutId', import.meta.env.VITE_LAYOUT_ID || null)
```

With:
```typescript
const layoutId = useStorage<string | null>('@DEJA/layoutId', null)
```

- [ ] **Step 4.3: Verify client apps compile**

Run in parallel:
```bash
cd /Users/jmcdannel/TTT/worktrees/preview && pnpm --filter=deja-tour exec vue-tsc --noEmit
cd /Users/jmcdannel/TTT/worktrees/preview && pnpm --filter=@repo/auth exec vue-tsc --noEmit
```

Or run the full type check: `pnpm check-types`

Expected: No type errors.

- [ ] **Step 4.4: Commit**

```bash
git add packages/auth/src/guards/requireLayout.ts apps/tour/src/stores/tour.ts
git commit -m "refactor(auth,tour): remove VITE_LAYOUT_ID dependency, use Firestore auto-selection"
```

---

## Task 5: Update IO scripts to use new env var names

**Files:**
- Modify: `io/scripts/build.ts` (line 76)
- Modify: `io/scripts/lib/prompts.ts` (line 51)

### Steps

- [ ] **Step 5.1: Update `io/scripts/build.ts`**

Replace:
```typescript
const mqttBroker = process.env.VITE_MQTT_BROKER || process.env.MQTT_BROKER || ''
```
With:
```typescript
const mqttBroker = process.env.MQTT_BROKER || process.env.VITE_MQTT_BROKER || ''
```

(Swap priority — new name first, legacy fallback second.)

- [ ] **Step 5.2: Update `io/scripts/lib/prompts.ts`**

Replace:
```typescript
const defaultBroker = process.env.VITE_MQTT_BROKER || process.env.MQTT_BROKER || ''
```
With:
```typescript
const defaultBroker = process.env.MQTT_BROKER || process.env.VITE_MQTT_BROKER || ''
```

- [ ] **Step 5.3: Commit**

```bash
git add io/scripts/build.ts io/scripts/lib/prompts.ts
git commit -m "refactor(io): prefer MQTT_BROKER over legacy VITE_MQTT_BROKER"
```

---

## Task 6: Update `.env.example`, `turbo.json`, and `setup-env.sh`

**Files:**
- Modify: `.env.example`
- Modify: `turbo.json`
- Modify: `apps/server/setup-env.sh`

### Steps

- [ ] **Step 6.1: Update `.env.example`**

Replace the full contents with:

```bash
# ═══════════════════════════════════════════════════════════
# 🚂 DEJA.js — Environment Configuration Template
# ═══════════════════════════════════════════════════════════
# Copy this to .env and fill in your values.
# See ENV.md for full documentation.
# ═══════════════════════════════════════════════════════════

# ── Layout ────────────────────────────────────────────────
# Which layout to load on startup (server reads from ~/.deja/config.json or this)
LAYOUT_ID=demo

# ── Firebase (Client — public, safe to commit) ──────────
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# ── Firebase (Admin — secret, server/cloud API only) ────
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# ── MQTT (Server) ───────────────────────────────────────
# End users: set these in ~/.deja/config.json instead
MQTT_BROKER=mqtt://localhost
MQTT_PORT=1883
ENABLE_MQTT=true

# ── WebSocket (Server + Cloud dashboard) ────────────────
ENABLE_WS=true
VITE_WS_PORT=8082
WS_ID=DEJA.js

# ── Cloud Sync ──────────────────────────────────────────
ENABLE_DEJACLOUD=true

# ── Sentry — Error Tracking ─────────────────────────────
VITE_SENTRY_DSN=

# ── Stripe (Test Keys) ──────────────────────────────────
VITE_BILLING_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=

# ── Demo / Dev ───────────────────────────────────────────
VITE_DEMO_MODE=true
VITE_DEV_AUTO_LOGIN=

# ── Sanity CMS (dejajs-www only) ────────────────────────
SANITY_API_TOKEN=

# ── Cloudflare Tunnel (optional) ────────────────────────
CLOUDFLARE_TUNNEL_TOKEN=

# ── Vercel Blob (asset uploads) ─────────────────────────
BLOB_READ_WRITE_TOKEN=
```

Key changes:
- Removed `VITE_LAYOUT_ID` entirely
- `VITE_MQTT_BROKER` → `MQTT_BROKER`
- `VITE_MQTT_PORT` → `MQTT_PORT`
- `VITE_WS_ID` → `WS_ID`
- `VITE_WS_PORT` stays (used by cloud dashboard client-side)
- Added comments about `~/.deja/config.json` for end users

- [ ] **Step 6.2: Update `turbo.json` globalEnv**

Replace the `globalEnv` array with:

```json
"globalEnv": [
  "ENABLE_MQTT",
  "ENABLE_DEJACLOUD",
  "ENABLE_WS",
  "LAYOUT_ID",
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_DATABASE_URL",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "MQTT_BROKER",
  "MQTT_PORT",
  "VITE_WS_PORT",
  "WS_ID",
  "VITE_SENTRY_DSN",
  "VITE_BILLING_API_URL",
  "VITE_STRIPE_PUBLISHABLE_KEY",
  "VITE_DEMO_MODE",
  "VITE_DEV_AUTO_LOGIN",
  "VITE_DEV_FEATURES",
  "BLOB_READ_WRITE_TOKEN",
  "BASE_URL",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "CRON_SECRET",
  "DEV",
  "PROD"
]
```

Changes: removed `VITE_LAYOUT_ID`, `VITE_MQTT_BROKER` → `MQTT_BROKER`, `VITE_MQTT_PORT` → `MQTT_PORT`, `VITE_WS_ID` → `WS_ID`.

- [ ] **Step 6.3: Update `setup-env.sh`**

In `apps/server/setup-env.sh`, replace the heredoc (lines 13-29):

```bash
cat > .env << 'EOF'
# Layout Configuration
LAYOUT_ID=betatrack

# MQTT Configuration - Using localhost
ENABLE_MQTT=true
MQTT_BROKER=mqtt://localhost
MQTT_PORT=1883

# WebSocket Configuration
ENABLE_WS=true
VITE_WS_PORT=8082
WS_ID=DEJA.js

# Firebase (for Cloud features)
ENABLE_DEJACLOUD=false
EOF
```

- [ ] **Step 6.4: Commit**

```bash
git add .env.example turbo.json apps/server/setup-env.sh
git commit -m "refactor: rename VITE_MQTT_BROKER→MQTT_BROKER, VITE_MQTT_PORT→MQTT_PORT, VITE_WS_ID→WS_ID, remove VITE_LAYOUT_ID"
```

---

## Task 7: De-dupe per-app `.env` files

**Files:**
- Modify: `apps/server/.env`
- Modify: `apps/throttle/.env`
- Modify: `apps/cloud/.env`
- Modify: `apps/monitor/.env`
- Modify: `apps/tour/.env`

### Steps

- [ ] **Step 7.1: Update `apps/server/.env`**

Replace `VITE_MQTT_BROKER` with `MQTT_BROKER`, `VITE_MQTT_PORT` with `MQTT_PORT`, `VITE_WS_ID` with `WS_ID`. Remove `VITE_LAYOUT_ID` if present.

- [ ] **Step 7.2: Update all per-app `.env` files**

For each app `.env` file, remove `VITE_LAYOUT_ID` if present. The apps should be copies of the root `.env` with the new var names.

This is a manual/scripted step since these files are gitignored. The key point is that future copies from root `.env` will have the correct names.

- [ ] **Step 7.3: Commit**

Only `apps/server/.env` should be committed if it was tracked. Other app `.env` files are gitignored.

Note: The per-app `.env` files are gitignored, so this step is about updating the developer's local files. The `.env.example` (updated in Task 6) is the template that gets copied.

---

## Task 8: Rewrite `ENV.md` documentation

**Files:**
- Modify: `ENV.md`

### Steps

- [ ] **Step 8.1: Rewrite `ENV.md`**

Replace the full contents of `ENV.md` with updated documentation that reflects:
- The new variable names (`MQTT_BROKER`, `MQTT_PORT`, `WS_ID`)
- Removal of `VITE_LAYOUT_ID`
- The `~/.deja/config.json` structure for end users
- The prefix naming convention (`VITE_` = browser, no prefix = server)
- The env var → config.json mapping table
- The copy-to-apps workflow for dev

Key sections to include:
1. Quick Start (unchanged workflow)
2. Architecture diagram (root → per-app copies)
3. **NEW: `~/.deja/config.json` (End Users)** — full JSON shape, when it's used, how it overrides env vars
4. Variable Reference tables (updated names)
5. Naming Conventions (updated — no `VITE_LAYOUT_ID`)
6. Turborepo Cache (updated `globalEnv` list)

- [ ] **Step 8.2: Commit**

```bash
git add ENV.md
git commit -m "docs: rewrite ENV.md with new var names and ~/.deja/config.json docs"
```

---

## Task 9: Create `ENV-README.md` developer guide

**Files:**
- Create: `ENV-README.md` (root)

### Steps

- [ ] **Step 9.1: Write `ENV-README.md`**

Create a concise developer-facing README focused on the env process:

```markdown
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

### Firebase (Admin — secret)
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
| `VITE_DEV_AUTO_LOGIN` | all apps | Never in production |
| `VITE_DEV_FEATURES` | feature flags | Dev-only features |

## Adding a New Env Var

1. Add it to `.env.example` with a comment
2. Add it to `turbo.json` → `globalEnv` if it affects build output
3. Add it to `ENV.md` variable reference table
4. If it's a server-only per-user setting, add it to the `DejaConfig` interface in `apps/server/src/lib/subscription.ts` and handle it in `apps/server/src/lib/server-config.ts`
```

- [ ] **Step 9.2: Commit**

```bash
git add ENV-README.md
git commit -m "docs: create ENV-README.md developer guide"
```

---

## Task 10: Update `CLAUDE.md` env var tables

**Files:**
- Modify: `CLAUDE.md` (root)

### Steps

- [ ] **Step 10.1: Update env var tables in CLAUDE.md**

Find the two environment variable tables in `CLAUDE.md` and update them:

1. Replace `VITE_MQTT_BROKER` → `MQTT_BROKER` in all tables and descriptions
2. Replace `VITE_MQTT_PORT` → `MQTT_PORT`
3. Replace `VITE_WS_ID` → `WS_ID`
4. Remove `VITE_LAYOUT_ID` references
5. Add a note about `~/.deja/config.json` for end-user config

- [ ] **Step 10.2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md env var tables with new names"
```

---

## Execution Order

Tasks 1–3 are sequential (each builds on the previous).
Task 4 is independent (can run in parallel with Tasks 2-3).
Task 5 is independent (can run in parallel with Tasks 2-4).
Task 6 depends on Tasks 4-5 (needs final var names settled).
Task 7 depends on Task 6.
Tasks 8-10 depend on Task 6 (documentation references final names).

```
Task 1 → Task 2 → Task 3
                         ╲
Task 4 (parallel) ────────→ Task 6 → Task 7
Task 5 (parallel) ────────╱         ╲
                                     → Task 8, 9, 10 (parallel)
```
