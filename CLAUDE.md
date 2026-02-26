# CLAUDE.md — DEJA.js

This file provides Claude Code with project-specific context so it can work effectively in this codebase from the first message of every session.

> Inspired by Boris Cherny's workflow: any time Claude does something wrong, add a rule here so it knows not to do it next time.

---

## What is this project?

**DEJA.js** (DCC-EX JavaScript API) is a **pnpm monorepo** managed with **Turborepo** that provides a suite of web applications and a Node.js server for controlling DCC-EX model railroad CommandStations over USB/Serial.

---

## Monorepo Structure

```
DEJA.js/
├── apps/
│   ├── cloud/        Vue 3 + Firebase — layout management hub (port 3011)
│   ├── monitor/      Vue 3 + Firebase — system monitoring dashboard (port 3021)
│   ├── server/       Node.js + TypeScript — WebSocket API → DCC-EX serial bridge
│   ├── sound-api/    Next.js 14 — sound effects API (port 3001, Vercel Blob)
│   ├── throttle/     Vue 3 + MQTT — train throttle control app (port 3041)
│   └── tour/         Vue 3 — interactive tour / effects app (port 3031)
├── io/               Arduino / Pico W device firmware and layout configs
└── packages/
    ├── @repo/auth            Authentication & user management utilities
    ├── @repo/config-eslint   Shared ESLint flat config (base, vue, node, nextjs)
    ├── @repo/config-prettier Shared Prettier config (+ Tailwind plugin)
    ├── @repo/dccex           DCC-EX command station protocol library
    ├── @repo/deja            Core DEJA composables and utilities
    ├── @repo/firebase-config Firebase initialization (browser, Node, Admin)
    ├── @repo/modules         Shared business logic (effects, layouts, locos, signals, turnouts, routes)
    ├── @repo/sounds          Sound assets + Vercel Blob utilities
    ├── @repo/typescript-config TypeScript config presets
    ├── @repo/ui              Shared Vue component library (Consist, Turnouts, Effects, etc.)
    └── @repo/utils           Common utility functions
```

---

## Tech Stack

### Vue apps (cloud, monitor, throttle, tour)
- **Vue 3** with Composition API and `<script setup lang="ts">` syntax
- **Vuetify 3** for UI components (Material Design)
- **Pinia** for state management
- **Vue Router 4** for routing
- **Vite** for dev server and builds
- **TypeScript** throughout
- **Tailwind CSS** for utility classes
- **Firebase / Vuefire** for real-time data (cloud, monitor)
- **MQTT** via `mqtt-vue-hook` (throttle)

### Server (`apps/server`)
- **Node.js 20+** + **TypeScript** running via `tsx`
- **WebSockets** (`ws`) for browser ↔ server communication
- **SerialPort** for USB communication with DCC-EX CommandStation
- **MQTT** for broker communication
- **Firebase Admin SDK**

### Sound API (`apps/sound-api`)
- **Next.js 14** / React 18
- **Vercel Blob** for audio asset storage

---

## Key Commands

```bash
# Run all at once
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages
pnpm lint             # Lint all packages (ESLint, auto-fix)
pnpm format           # Format all .ts, .tsx, .md files (Prettier)
pnpm check-types      # TypeScript type check across monorepo

# Run server + monitor only
pnpm deja

# Filtered runs
pnpm --filter=deja-throttle dev
pnpm --filter=deja-cloud dev
pnpm --filter=deja-serverts dev

# Unit tests (throttle app only — Vitest)
pnpm --filter=deja-throttle test:unit

# Dependency management
pnpm deps:check       # syncpack: list version mismatches
pnpm deps:fix         # syncpack: fix mismatches
```

---

## Coding Conventions

### Vue Components
- Always use `<script setup lang="ts">` (Composition API, no Options API)
- Use `defineProps`, `defineEmits`, `defineExpose` with TypeScript types
- Component files are `.vue`, named in PascalCase
- Use Vuetify components (`v-btn`, `v-card`, etc.) for all UI — avoid raw HTML for common elements

### TypeScript
- Strict mode is on — no `any` unless absolutely unavoidable
- Prefer `interface` over `type` for object shapes
- Shared types live in `@repo/modules` or the relevant package

### Imports
- Always use workspace imports for shared packages: `@repo/ui`, `@repo/modules`, etc.
- Never use relative paths that cross package boundaries (e.g., `../../packages/...`)
- Vite apps have an `@/` alias pointing to `src/`

### State Management
- Use **Pinia** stores (not Vuex, not raw composables for global state)
- Firebase Realtime Database is accessed via **Vuefire** composables

### MQTT / WebSocket
- MQTT topics and payloads are defined in `@repo/modules`
- WebSocket protocol is documented in `apps/server/WEBSOCKET_PROTOCOL.md`

---

## Development Workflow

1. **Plan before coding** — Use Plan Mode (Shift+Tab twice) for non-trivial changes
2. **Lint and type-check before committing** — run `pnpm lint && pnpm check-types`
3. **Use the `/verify-changes` slash command** to confirm nothing is broken
4. **Use the `/commit-push-pr` slash command** to commit, push, and open a PR

---

## Environment Variables

Copy `.env.example` to `.env` at the root. Key variables:

| Variable | Purpose |
|----------|---------|
| `LAYOUT_ID` | Your DEJA Cloud layout ID |
| `VITE_FIREBASE_*` | Firebase project configuration |
| `VITE_MQTT_BROKER` | MQTT broker URL (default: `mqtt://localhost`) |
| `VITE_MQTT_PORT` | MQTT port (default: `1883`) |
| `ENABLE_MQTT` | Toggle MQTT communication |
| `ENABLE_WS` | Toggle WebSocket communication |
| `VITE_WS_PORT` | WebSocket server port (default: `8082`) |

App-specific env files go in `apps/<app>/.env.local`.

---

## Rules — Things Claude Should NOT Do

> This section grows over time. Every mistake becomes a rule.

- **Do not modify `pnpm-lock.yaml` manually** — it is auto-generated by pnpm
- **Do not use relative imports across package boundaries** — always use `@repo/*` workspace imports
- **Do not use the Options API** in Vue components — use `<script setup lang="ts">`
- **Do not add `any` types** without a clear comment explaining why
- **Do not create new packages** without updating `pnpm-workspace.yaml`
- **Do not run `npm install` or `yarn`** — this is a pnpm workspace; always use `pnpm`
- **Do not commit `.env` files** — only `.env.example` belongs in git
- **Do not bypass ESLint with `// eslint-disable`** without a specific reason in the comment
