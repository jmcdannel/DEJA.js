# Screenshot Automation Enhancement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the `/capture-screenshots` skill with a `--layout` flag, expanded view registry (35 views across 3 apps), and monitor dashboard mock data seeding.

**Architecture:** Three independent changes to the screenshot skill infrastructure: (1) add a dev-only mock injection system to the monitor app's Dashboard component, (2) add a `seed` method to DccLogPane so mock DCC entries can be injected, (3) rewrite the SKILL.md with the updated view registry, `--layout` flag, and monitor seeding procedure.

**Deviation from spec:** The spec proposed separate `apps/monitor/src/dev/injectMocks.ts` + `main.ts` modification. This plan simplifies to a single `window.__DEJA_MOCK__` block in `Dashboard.vue` because the reactive refs (`turnoutChanges`, `effectChanges`, `sensorChanges`, `dccLogRef`) are scoped to that component. No `injectMocks.ts` or `main.ts` changes needed.

**Tech Stack:** Vue 3, TypeScript, Claude Preview MCP (headless Playwright), Claude Code Skills

**Spec:** `docs/superpowers/specs/2026-03-18-screenshot-automation-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `apps/monitor/src/dev/mockData.ts` | Mock data constants for all 6 dashboard panes (DCC log, turnout/effect/sensor changes, stats, devices) |

### Modified Files

| File | Change |
|------|--------|
| `apps/monitor/src/Dashboard/Dashboard.vue` | Expose log refs on `window.__DEJA_MOCK__` in dev mode |
| `apps/monitor/src/Dashboard/components/DccLogPane.vue` | Add `seed(entries)` method to `defineExpose` |
| `.claude/skills/capture-screenshots/SKILL.md` | Full rewrite: `--layout` flag, 35-view registry, monitor mock seeding procedure |

---

## Task 1: Add `seed` method to DccLogPane

**Files:**
- Modify: `apps/monitor/src/Dashboard/components/DccLogPane.vue`

The DccLogPane currently exposes `{ messageCount, clear }`. Add a `seed` method that pushes mock entries into the internal `useDccLog` log ref.

- [ ] **Step 1: Read the current DccLogPane source**

Read `apps/monitor/src/Dashboard/components/DccLogPane.vue` to confirm the `defineExpose` and `useDccLog` usage.

- [ ] **Step 2: Add the `seed` method**

In `DccLogPane.vue`, add a `seed` function that accepts an array of `LogEntry` objects and pushes them into the log ref. Add it to `defineExpose`:

```typescript
function seed(entries: LogEntry[]) {
  entries.forEach(entry => log.value.push(entry))
}

defineExpose({
  messageCount,
  clear,
  seed,
})
```

Import `LogEntry` from `./DCCLog/types` if not already imported. Access `log` from the `useDccLog` return — check if it's already destructured or if the composable return needs updating.

- [ ] **Step 3: Verify the monitor app still builds**

Run: `pnpm --filter=deja-monitor build`
Expected: Build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add apps/monitor/src/Dashboard/components/DccLogPane.vue
git commit -m "feat(monitor): add seed method to DccLogPane for mock data injection"
```

---

## Task 2: Create mock data constants

**Files:**
- Create: `apps/monitor/src/dev/mockData.ts`

Define realistic mock data matching the exact types used by each pane.

- [ ] **Step 1: Read DCC log constants for accurate mock data**

Read `apps/monitor/src/Dashboard/components/DCCLog/constants.ts` to get the exact `dccMessages` entries (key/action/color/icon mappings).

- [ ] **Step 2: Create the mock data file**

Create `apps/monitor/src/dev/mockData.ts` with exports for each pane's data. Use the actual `LogEntry` type from the DCCLog types and `DocumentData` shape from the log panes.

```typescript
import type { LogEntry } from '../Dashboard/components/DCCLog/types'

// DCC Log: matches LogEntry interface
// The key field is used to match against dccMessages constants for color/icon
// but the pane renders action/color/icon directly from the entry
export const mockDccLog: LogEntry[] = [
  { id: 1, action: 'Power', payload: 'Track power ON', color: 'red', icon: 'mdi-power' },
  { id: 2, action: 'Locomotive', payload: 'Loco 5 speed 50 fwd', color: 'yellow', icon: 'mdi-train' },
  { id: 3, action: 'Locomotive', payload: 'Loco 8 speed 75 fwd', color: 'yellow', icon: 'mdi-train' },
  { id: 4, action: 'Turnout', payload: 'Turnout 1 thrown', color: 'blue', icon: 'mdi-directions-fork' },
  { id: 5, action: 'Accessory', payload: 'Output 5 ON', color: 'purple', icon: 'mdi-lightbulb' },
  { id: 6, action: 'Locomotive', payload: 'Loco 5 function 0 ON', color: 'yellow', icon: 'mdi-train' },
  { id: 7, action: 'Status', payload: 'iDCC-EX V-5.2.13', color: 'green', icon: 'mdi-information' },
  { id: 8, action: 'Locomotive', payload: 'Loco 8 speed 0 fwd', color: 'yellow', icon: 'mdi-train' },
]

// Turnout Log: matches DocumentData shape from useLayoutLogListeners
export const mockTurnoutChanges = [
  { id: 'turnout-1', name: 'Main Line Switch', state: true, device: 'dcc-ex-1' },
  { id: 'turnout-2', name: 'Yard Entry', state: false, device: 'dcc-ex-1' },
  { id: 'turnout-3', name: 'Siding A', state: true, device: 'dcc-ex-1' },
  { id: 'turnout-4', name: 'Loop Return', state: false, device: 'dcc-ex-1' },
  { id: 'turnout-5', name: 'Engine House', state: true, device: 'dcc-ex-1' },
]

// Effect Log: matches DocumentData shape
export const mockEffectChanges = [
  { id: 'effect-1', name: 'Station Lights', state: true, device: 'pico-w-1' },
  { id: 'effect-2', name: 'Crossing Bell', state: true, device: 'pico-w-1' },
  { id: 'effect-3', name: 'Yard Lights', state: false, device: 'arduino-1' },
  { id: 'effect-4', name: 'Smoke Generator', state: true, device: 'arduino-1' },
]

// Sensor Log: matches DocumentData shape with type for icon mapping
// Note: getSensorIcon() checks inputType first, falling back to type.
// Omit inputType so the descriptive type value drives icon selection.
export const mockSensorChanges = [
  { id: 'sensor-1', name: 'Block A Detector', state: true, type: 'ir', device: 'pico-w-1' },
  { id: 'sensor-2', name: 'Block B Detector', state: false, type: 'ir', device: 'pico-w-1' },
  { id: 'sensor-3', name: 'Crossing Gate', state: true, type: 'reed', device: 'arduino-1' },
  { id: 'sensor-4', name: 'Current Sensor', state: true, type: 'current', device: 'dcc-ex-1' },
]
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm --filter=deja-monitor build`
Expected: Build succeeds. The file is only imported conditionally in dev mode (next task), but the types should still validate.

- [ ] **Step 4: Commit**

```bash
git add apps/monitor/src/dev/mockData.ts
git commit -m "feat(monitor): add mock data constants for dashboard screenshot seeding"
```

---

## Task 3: Expose mock injection hook in Dashboard

**Files:**
- Modify: `apps/monitor/src/Dashboard/Dashboard.vue`

Expose the log refs and DccLogPane seed method on `window.__DEJA_MOCK__` in dev mode so `preview_eval` can inject mock data.

**Existing refs to use** (already defined in Dashboard.vue, do NOT re-create):
- `turnoutChanges`, `effectChanges`, `sensorChanges` — from `useLayoutLogListeners()` (line 22)
- `dccLogRef` — template ref to DccLogPane (line 49)

- [ ] **Step 1: Add dev-only mock injection to Dashboard.vue**

After the existing setup code (after line 46 where the device watch ends), add a dev-only block that exposes the injection points:

```typescript
// Dev-only: expose mock data injection for screenshot automation
if (import.meta.env.DEV) {
  import('../dev/mockData').then((mockData) => {
    ;(window as any).__DEJA_MOCK__ = {
      seedAll: () => {
        // Seed log panes (turnout/effect/sensor are props-driven from these refs)
        turnoutChanges.value.push(...mockData.mockTurnoutChanges)
        effectChanges.value.push(...mockData.mockEffectChanges)
        sensorChanges.value.push(...mockData.mockSensorChanges)
        // Seed DCC log via the pane's seed method
        dccLogRef.value?.seed(mockData.mockDccLog)
      },
    }
  })
}
```

This uses dynamic `import()` so the mock data module is never included in production builds. The `import.meta.env.DEV` guard ensures Vite tree-shakes the entire block in production.

- [ ] **Step 2: Verify the monitor app still builds**

Run: `pnpm --filter=deja-monitor build`
Expected: Build succeeds. The `import.meta.env.DEV` block is removed by Vite in production mode.

- [ ] **Step 3: Commit**

```bash
git add apps/monitor/src/Dashboard/Dashboard.vue
git commit -m "feat(monitor): expose window.__DEJA_MOCK__ for screenshot data injection"
```

---

## Task 4: Update the capture-screenshots SKILL.md

**Files:**
- Modify: `.claude/skills/capture-screenshots/SKILL.md`

Full rewrite of the skill file to add the `--layout` flag, expanded 35-view registry, monitor mock seeding procedure, and dynamic ID resolution for throttle detail and cloud edit views.

- [ ] **Step 1: Rewrite SKILL.md**

Replace the entire contents of `.claude/skills/capture-screenshots/SKILL.md` with the updated skill. Key changes:

**Usage section** — add `--layout` flag:
```
/capture-screenshots [app] [--views view1,view2] [--viewport desktop|mobile|both] [--layout layoutId]
```

**Procedure section** — update step 3 (Set Up App State) to use `--layout` flag:
```
If --layout flag provided, use that value. Otherwise read LAYOUT_ID from .env.
Default layout for docs/marketing: betatrack
localStorage.setItem('@DEJA/layoutId', '<layout-id>')
```

**Add new step between auth and capture** — Monitor Mock Data Seeding:
```
### 3.5. Seed Monitor Mock Data (monitor only)

After auth and before capturing, inject mock data:

1. Wait for Dashboard to mount: preview_eval({ expression: "await new Promise(r => setTimeout(r, 3000))" })
2. Seed all panes: preview_eval({ expression: "window.__DEJA_MOCK__?.seedAll()" })
3. Wait for reactivity: preview_eval({ expression: "await new Promise(r => setTimeout(r, 1000))" })
```

**View Registry** — replace with the full 35-view registry from the spec:

Throttle (12 views):
- All 10 existing + `/throttle/:address` (dynamic) + `/programming`

Cloud (22 views):
- 11 list views (existing 10 + `/sounds`)
- 6 add views (`/locos/new`, `/turnouts/new`, `/routes/new`, `/effects/new`, `/signals/new`, `/sensors/new`)
- 5 edit views (`/locos/:address`, `/turnouts/:turnoutId`, `/routes/:routeId`, `/effects/:effectId`, `/signals/:signalId`)

Monitor (1 view):
- `/` dashboard only (with mock data)

**Add dynamic ID resolution sections:**

For throttle `/throttle/:address`:
```
1. Navigate to /throttles
2. preview_eval: scrape links with href^="/throttle/"
3. Pick first address !== 3, fallback to 3
4. Skip if no addresses found
```

For cloud edit views:
```
For each edit view, navigate to the list view first.
preview_eval: scrape first link with href^="/<entity>/"
Navigate to that link. Skip if no items exist.
```

- [ ] **Step 2: Review the skill for completeness**

Read through the entire rewritten SKILL.md to verify:
- All 35 views are listed
- The `--layout` flag is documented in usage and procedure
- Monitor mock seeding procedure references `window.__DEJA_MOCK__.seedAll()`
- Dynamic ID resolution is documented for throttle detail and all 5 cloud edit views
- Naming conventions match the spec (`{app}_{vp}_{view-name}`)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/capture-screenshots/SKILL.md
git commit -m "feat(skills): update capture-screenshots with layout flag, 35 views, and monitor mock seeding"
```

---

## Task 5: Verify end-to-end

- [ ] **Step 1: Run monitor build to confirm no regressions**

Run: `pnpm --filter=deja-monitor build`
Expected: Clean build, no errors.

- [ ] **Step 2: Run full type check**

Run: `pnpm check-types`
Expected: No new type errors introduced.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: No new lint errors.

- [ ] **Step 4: Manual smoke test — start monitor dev server and test mock injection**

Run: `pnpm --filter=deja-monitor dev`

Open browser to `http://localhost:3021`, open console, run:
```javascript
window.__DEJA_MOCK__?.seedAll()
```
Expected: All log panes populate with mock data. DCC log shows 8 entries, turnout log shows 5, effect log shows 4, sensor log shows 4.

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during verification"
```
