# Screenshot Automation Enhancement

**Date:** 2026-03-18
**Status:** Draft
**Scope:** Enhance `/capture-screenshots` skill with layout flag, updated view registry, and monitor mock data seeding

---

## Problem

The existing `/capture-screenshots` skill captures app views one at a time but lacks:
- A way to switch layouts without editing `.env`
- Coverage of all meaningful routes (throttle detail view, cloud sounds/sensors)
- Monitor dashboard mock data — the dashboard looks empty without a running server, making it useless for docs and marketing

## Solution

Enhance the `/capture-screenshots` skill with three additions:

1. **`--layout` flag** to override `LAYOUT_ID` without touching `.env`
2. **Updated view registry** covering all meaningful routes across throttle, cloud, and monitor
3. **Monitor mock data seeding** via `preview_eval` to populate dashboard panes before capture

---

## View Registry

### Throttle App (12 views)

Port is defined in `.claude/launch.json` (currently 3041).

| Route | Screenshot Name | Notes |
|-------|----------------|-------|
| `/` | `throttle_{vp}_home` | Landing page |
| `/throttles` | `throttle_{vp}_throttle-list` | Throttle list |
| `/throttle/:address` | `throttle_{vp}_throttle` | Individual loco control (dynamic address) |
| `/turnouts` | `throttle_{vp}_turnouts` | Turnout controls |
| `/routes` | `throttle_{vp}_routes` | Route management |
| `/effects` | `throttle_{vp}_effects` | Effects control |
| `/signals` | `throttle_{vp}_signals` | Signal management |
| `/conductor` | `throttle_{vp}_conductor` | Conductor view |
| `/locos` | `throttle_{vp}_roster` | Locomotive roster |
| `/connect` | `throttle_{vp}_connect` | Connection setup |
| `/settings` | `throttle_{vp}_settings` | App settings |
| `/programming` | `throttle_{vp}_programming` | DCC programming |

Where `{vp}` = `desktop` or `mobile`.

**Loco address resolution for `/throttle/:address`:**

1. Navigate to `/throttles` (roster loads from Firebase)
2. Query rendered loco links via `preview_eval`:
   ```javascript
   // Scrape throttle links from the rendered DOM (e.g., <a href="/throttle/5">)
   const links = Array.from(document.querySelectorAll('a[href^="/throttle/"]'))
     .map(a => parseInt(a.getAttribute('href').split('/').pop()))
     .filter(n => !isNaN(n))
   ```
3. Pick the first address where `address !== 3`
4. If only address 3 exists, use address 3
5. If no addresses found, skip this screenshot and log a warning
6. Navigate to `/throttle/:address`

> **Note:** The throttle app uses per-route `beforeEnter` guards from `@repo/auth` (`requireAuth`, `requireDccEx`, `requireLayout`). The `VITE_DEV_AUTO_LOGIN=true` flag bypasses all these guards in dev mode.

### Cloud App (22 views)

Port is defined in `.claude/launch.json` (3011).

**List views (11):**

| Route | Screenshot Name | Notes |
|-------|----------------|-------|
| `/` | `cloud_{vp}_dashboard` | Dashboard overview |
| `/locos` | `cloud_{vp}_roster` | Locomotive roster |
| `/turnouts` | `cloud_{vp}_turnouts` | Turnout configuration |
| `/routes` | `cloud_{vp}_routes` | Route configuration |
| `/effects` | `cloud_{vp}_effects` | Effects configuration |
| `/signals` | `cloud_{vp}_signals` | Signal wiring |
| `/sensors` | `cloud_{vp}_sensors` | Sensor management |
| `/sounds` | `cloud_{vp}_sounds` | Sound management |
| `/dccex` | `cloud_{vp}_dccex` | DCC-EX console |
| `/devices` | `cloud_{vp}_devices` | Device management |
| `/settings` | `cloud_{vp}_settings` | Settings |

**Add/New views (6):**

| Route | Screenshot Name | Notes |
|-------|----------------|-------|
| `/locos/new` | `cloud_{vp}_roster-add` | Add locomotive form |
| `/turnouts/new` | `cloud_{vp}_turnouts-add` | Add turnout form |
| `/routes/new` | `cloud_{vp}_routes-add` | Add route form |
| `/effects/new` | `cloud_{vp}_effects-add` | Add effect form |
| `/signals/new` | `cloud_{vp}_signals-add` | Add signal form |
| `/sensors/new` | `cloud_{vp}_sensors-add` | Add sensor form |

**Edit views (5) — navigate to first existing item dynamically:**

| Route | Screenshot Name | Notes |
|-------|----------------|-------|
| `/locos/:address` | `cloud_{vp}_roster-edit` | Edit locomotive (first roster loco) |
| `/turnouts/:turnoutId` | `cloud_{vp}_turnouts-edit` | Edit turnout (first turnout) |
| `/routes/:routeId` | `cloud_{vp}_routes-edit` | Edit route (first route) |
| `/effects/:effectId` | `cloud_{vp}_effects-edit` | Edit effect (first effect) |
| `/signals/:signalId` | `cloud_{vp}_signals-edit` | Edit signal (first signal) |

**Edit view ID resolution:** For each edit view, navigate to the corresponding list view first, scrape the first item's link href (e.g., `a[href^="/locos/"]`), and navigate to it. If no items exist for that type, skip the edit screenshot and log a warning.

### Monitor App (1 view)

Port is defined in `.claude/launch.json` (currently 3021). The existing SKILL.md also captured `/settings`, which is intentionally dropped — the dashboard is the only marketing-relevant view.

| Route | Screenshot Name | Notes |
|-------|----------------|-------|
| `/` | `monitor_{vp}_dashboard` | Dashboard (mock data seeded) |

---

## `--layout` Flag

### Usage

```
/capture-screenshots --layout betatrack
/capture-screenshots --layout demo
/capture-screenshots                     # reads LAYOUT_ID from .env
```

### Behavior

1. If `--layout <id>` is provided, use that value as the layout ID
2. If omitted, read `LAYOUT_ID` from `.env` (existing behavior)
3. The layout ID is set via `preview_eval`:
   ```javascript
   localStorage.setItem('@DEJA/layoutId', '<layout-id>')
   ```
4. This affects all Firebase queries — the roster, turnouts, effects, etc. displayed in screenshots will reflect the specified layout's data

### Default

The default layout for docs/marketing screenshots is `betatrack`. This may change to the demo layout later. The default is documented in the skill file and can be changed by editing the SKILL.md.

---

## Monitor Mock Data Seeding

### Why

The monitor dashboard renders 6 panes (DCC log, turnout log, effect log, sensor log, stats, device serial). Without a running server and active layout, all panes are empty. Screenshots of an empty dashboard are useless for docs and marketing.

### Data Sources (Current)

| Pane | Source | Reactive Ref |
|------|--------|-------------|
| DCC Log | WebSocket via `useDccLog()` | `log: Ref<LogEntry[]>` |
| Turnout Log | Firestore onSnapshot via `useLayoutLogListeners()` | `turnoutChanges: Ref<DocumentData[]>` |
| Effect Log | Firestore onSnapshot via `useLayoutLogListeners()` | `effectChanges: Ref<DocumentData[]>` |
| Sensor Log | Firestore onSnapshot via `useLayoutLogListeners()` | `sensorChanges: Ref<DocumentData[]>` |
| _(Signals)_ | _Firestore onSnapshot via `useLayoutLogListeners()`_ | _`signalChanges` — tracked by composable but no dashboard pane renders it_ |
| Stats | VueFire composables (`useLayout`, `useLocos`, `useTurnouts`, `useEfx`, `useSignals`) | Multiple refs |
| Device Serial | `useLayout().getDevices()` + WebSocket | Device list ref |

### Injection Strategy

Use `preview_eval` to push mock data directly into the Vue reactive refs after the app initializes. Access Vue component instances via the app's internal APIs.

**Step 1: Wait for app initialization**

```javascript
// Wait for Vue app to mount and Firebase auth to resolve
await new Promise(r => setTimeout(r, 3000))
```

**Step 2: Inject DCC log entries**

The `useDccLog` composable stores entries in a `ref<LogEntry[]>`. The `LogEntry` type extends `DccMessage` with `{ id, action, payload }` — plus optional `key`, `color`, and `icon` fields derived from `dccMessages` constants based on the DCC command letter.

> **Important:** `useDccLog` is instantiated per-component (inside `DccLogPane`), not as a singleton. The `window.__DEJA_MOCK__` injection hook must receive the `log` ref from the `DccLogPane` instance — either by having the pane register its ref with the mock system, or by exposing a `seed` method alongside the existing `clear` method.

```javascript
// Example mock DCC log entries (matches LogEntry interface)
const mockDccLog = [
  { id: 1, action: 'dcc', payload: '1 MAIN', key: 'power', color: 'green', icon: 'mdi-power' },
  { id: 2, action: 'dcc', payload: 't 3 50 1', key: 'throttle', color: 'blue', icon: 'mdi-train' },
  { id: 3, action: 'dcc', payload: 'F 3 0 1', key: 'function', color: 'orange', icon: 'mdi-lightbulb' },
  { id: 4, action: 'dcc', payload: 't 5 75 1', key: 'throttle', color: 'blue', icon: 'mdi-train' },
  { id: 5, action: 'dcc', payload: 'F 5 1 1', key: 'function', color: 'orange', icon: 'mdi-bell' },
  { id: 6, action: 'dcc', payload: 'T 1 1', key: 'turnout', color: 'purple', icon: 'mdi-call-split' },
  { id: 7, action: 'dcc', payload: 't 3 0 1', key: 'throttle', color: 'blue', icon: 'mdi-train' },
  { id: 8, action: 'dcc', payload: 'Z 5 1', key: 'output', color: 'teal', icon: 'mdi-electric-switch' },
]
```

> **Note:** The exact `key`, `color`, and `icon` values should be verified against the `dccMessages` constants in the monitor app during implementation.

**Step 3: Inject Firestore log entries**

```javascript
// Turnout changes
const mockTurnoutChanges = [
  { id: 'turnout-1', name: 'Main Line Switch', state: true, device: 'dcc-ex-1' },
  { id: 'turnout-2', name: 'Yard Entry', state: false, device: 'dcc-ex-1' },
  { id: 'turnout-3', name: 'Siding A', state: true, device: 'dcc-ex-1' },
  { id: 'turnout-4', name: 'Loop Return', state: false, device: 'dcc-ex-1' },
]

// Effect changes
const mockEffectChanges = [
  { id: 'effect-1', name: 'Station Lights', state: true, type: 'light' },
  { id: 'effect-2', name: 'Crossing Bell', state: true, type: 'sound' },
  { id: 'effect-3', name: 'Yard Lights', state: false, type: 'light' },
]

// Sensor changes
const mockSensorChanges = [
  { id: 'sensor-1', name: 'Block A Detector', state: true, type: 'occupancy', inputType: 'digital' },
  { id: 'sensor-2', name: 'Block B Detector', state: false, type: 'occupancy', inputType: 'digital' },
  { id: 'sensor-3', name: 'Crossing Gate Trigger', state: true, type: 'proximity', inputType: 'analog' },
]
```

**Step 4: Wait for Vue reactivity to propagate**

```javascript
await new Promise(r => setTimeout(r, 1000))
```

### Implementation Note

The exact method for accessing Vue reactive refs from `preview_eval` depends on how the composables are instantiated. Two approaches:

1. **Expose mock data injection on `window`**: Add a `if (import.meta.env.DEV)` block in the monitor's `main.ts` that exposes a `window.__DEJA_MOCK__` function. This function accepts mock data and pushes it into the composable refs. Clean, testable, and only available in dev mode.

2. **Direct Vue internals access**: Navigate the Vue component tree via `document.querySelector('#app').__vue_app__` to find composable state. Fragile but requires no code changes.

**Recommendation: Option 1** — add a dev-only mock injection hook. It's a small, safe addition to `main.ts` that also benefits future testing.

---

## Capture Workflow

The full workflow when running `/capture-screenshots --layout betatrack`:

```
1. Parse arguments (app filter, layout, viewport, views)
2. Set layout ID (from --layout flag or .env)
3. For each app (throttle, cloud, monitor):
   a. Start dev server via preview_start
   b. Wait for server ready
   c. Set localStorage: @DEJA/layoutId
   d. Handle auth (DEV_AUTO_LOGIN or email/password)
   e. [Monitor only] Seed mock data via preview_eval
   f. [Throttle only] Resolve loco address for detail view
   g. For each view in the registry:
      i.   Navigate to route
      ii.  Wait for render (2-3 seconds)
      iii. Resize to desktop → capture screenshot
      iv.  Resize to mobile → capture screenshot
   h. Stop dev server
4. Report results (captured count, failures, file paths)
```

---

## File Changes

### Modified

- **`.claude/skills/capture-screenshots/SKILL.md`** — Add `--layout` flag docs, update view registry (add throttle detail, cloud sounds/sensors, remove extra monitor views), add monitor mock data seeding procedure

### New

- **`apps/monitor/src/dev/mockData.ts`** — Dev-only mock data definitions (DCC log, turnout/effect/sensor changes, device info)
- **`apps/monitor/src/dev/injectMocks.ts`** — Dev-only function that accepts mock data and pushes into composable refs, exposed on `window.__DEJA_MOCK__` in dev mode

### Modified (minor)

- **`apps/monitor/src/main.ts`** — Import and register mock injection hook in dev mode

---

## Out of Scope

- Automated CI-triggered screenshot capture (manual trigger only for now)
- Screenshot diffing or visual regression testing
- Video capture or animated GIFs
- Tour app screenshots (not requested)
- Cloud sub-sub-routes (e.g., `/sensors/automations`, `/sensors/automations/new`) — only top-level list/add/edit views
- Cloud `/track-diagrams` route (feature-gated, not yet ready for marketing)
- Monitor `/settings` route (intentionally dropped — not marketing-relevant)
