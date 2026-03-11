# Design Spec: tmux-Style Monitor Dashboard Redesign

**Date**: 2026-03-11
**App**: `apps/monitor/`
**Status**: Draft

---

## Context

The monitor app's current dashboard uses a card-based flexbox layout that doesn't efficiently use screen real estate. Stats cards are commented out. Log streams are squeezed into a 4-column row. The user wants a tmux-style terminal multiplexer look — a full-viewport grid of color-coded panes with running logs, each with a compact toolbar for clear/maximize/minimize/settings actions.

---

## Design Summary

Replace the current `Dashboard.vue` flexbox card layout with a full-viewport CSS Grid that mimics tmux's tiled pane layout. Six data stream panes fill the screen, each color-coded and wrapped in a reusable `MonitorPane` component with a tmux-authentic title bar. A global status bar replaces the AppHeader on the dashboard route.

---

## Layout

**Default grid** (dynamic auto-flow):

```
+---------------------------+---------------------------+
|        0:DCC LOG          |      1:SERIAL I/O         |   Row 1 (~33vh)
|        (cyan)             |    (yellow, tabbed)        |
+---------------------------+---------------------------+
|       2:TURNOUTS          |       3:EFFECTS            |   Row 2 (~33vh)
|        (green)            |       (orange)             |
+---------------------------+---------------------------+
|       4:SENSORS           |        5:STATS             |   Row 3 (~33vh)
|        (purple)           |        (slate)             |
+---------------------------+---------------------------+
```

- Top row: DCC commands + device serial I/O (highest traffic streams)
- Bottom rows: domain-specific logs + system stats
- 1px gap between panes (gap color = slate-800, mimics tmux borders)
- Status bar: 28px at top, grid fills `calc(100vh - 28px)`

**Maximize**: Any pane expands to fill the entire grid (like `prefix + z` in tmux). All other panes hidden.

**Minimize**: Pane collapses to just its title bar in a fixed-height row at the bottom. Remaining panes expand to fill freed space.

---

## Pane Configuration

| Index | ID | Name | Color | Data Source | Composable |
|-------|-----|------|-------|-------------|------------|
| 0 | `dcc` | DCC Log | Cyan (`#0ea5e9`) | WebSocket | `useDccLog` |
| 1 | `serial` | Serial I/O | Yellow (`#eab308`) | WebSocket + Firestore devices | `useDeviceSerialMonitor` per device |
| 2 | `turnouts` | Turnouts | Green (`#22c55e`) | Firestore `layouts/{id}/turnouts` | `useLayoutLogListeners` |
| 3 | `effects` | Effects | Orange (`#f97316`) | Firestore `layouts/{id}/effects` | `useLayoutLogListeners` |
| 4 | `sensors` | Sensors | Purple (`#a855f7`) | Firestore `layouts/{id}/sensors` | `useLayoutLogListeners` |
| 5 | `stats` | Stats | Slate (`#64748b`) | Firestore (multiple) | `useLayout`, `useLocos`, `useTurnouts`, `useEfx`, `useSignals` |

---

## Pane Toolbar (Title Bar)

Each pane has a 28px tmux-style title bar:

```
┌─ [0] DCC LOG  ● LIVE  142 msgs ─────────── [🗑] [⚙] [─] [□] ─┐
```

- **Left**: pane index, name (uppercase, monospace), live badge (pulsing green dot), message count
- **Right**: clear, settings, minimize, maximize buttons (shown on hover, icon-only)
- Background: gradient using pane's accent color at ~15% opacity
- Border-bottom: 1px solid accent color at ~30% opacity

---

## Global Status Bar

28px bar at the top replacing AppHeader on the dashboard route only:

```
┌─ DEJA.js Monitor  [≡] ──── ● WS Connected ──── ⚡ON  🛑E-Stop  Layout: ttt-jr  6 panes  12:04 ─┐
```

- **Left**: app name, hamburger menu button (opens existing `Menu` drawer for navigation to Settings/Logs/etc.)
- **Center**: WebSocket/MQTT connection status
- **Right**: track power toggle, emergency stop button, layout ID, pane count, clock

The existing `Menu` drawer (sidebar) is preserved and toggled from the hamburger icon in the status bar. This provides navigation to Settings, Logs, and other routes. Track power toggle and emergency stop are rendered inline in the status bar (compact icon buttons).

**Route detection**: The dashboard route name is `home` (as defined in `router.ts`). The `App.vue` conditional uses `route.name === 'home'` to switch between `MonitorStatusBar` and `AppHeader`.

---

## Color System

Each pane gets a unique accent applied to:
- Title bar background gradient
- Border color
- Log text highlights
- Scrollbar thumb
- Badge/status indicators

Color mapping uses a const lookup object (not dynamic Tailwind class concatenation) to ensure JIT purging works:

```typescript
const PANE_COLORS = {
  cyan:   { border: 'border-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-400' },
  green:  { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  slate:  { border: 'border-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400' },
} as const
```

Note: "cyan" uses Tailwind `sky-*` classes (hex `#0ea5e9` = `sky-500`), not `cyan-*`.

---

## Component Architecture

### New Components

| Component | Purpose |
|-----------|---------|
| `MonitorPane.vue` | Reusable pane wrapper: title bar + content slot + minimize/maximize |
| `MonitorStatusBar.vue` | Global tmux status line (replaces AppHeader on dashboard) |
| `DccLogPane.vue` | DCC command log (full pane, single data stream) |
| `DeviceSerialPane.vue` | Tabbed device serial monitors (one tab per connected device) |
| `TurnoutLogPane.vue` | Turnout state change log |
| `EffectLogPane.vue` | Effect activation log |
| `SensorLogPane.vue` | Sensor state change log |
| `StatsPane.vue` | Consolidated stats (merges 6 existing stats cards into terminal-style display) |

### New Composables

| Composable | Purpose |
|------------|---------|
| `usePaneManager.ts` | Pinia store for pane UI state: minimize/maximize states, dynamic CSS grid properties, persisted to localStorage |
| `useAutoScroll.ts` | Auto-scroll to newest log entry, respects user manual scroll position |

### Modified Files

| File | Change |
|------|--------|
| `Dashboard.vue` | Full rewrite: CSS Grid container with `MonitorPane` orchestration |
| `App.vue` | Conditional `MonitorStatusBar` vs `AppHeader` based on `route.name === 'home'` |
| `style.css` | Add `.monitor-pane__*` and `.monitor-grid__*` BEM classes (preserve existing `.monitor-card__*`) |
| `LogView.vue` | Update imports: use new pane components (`DccLogPane`, `DeviceSerialPane`) instead of deleted originals |

### Deleted Files (replaced by new components)

- `DCCLog.vue` → `DccLogPane.vue`
- `DCCLogger.vue` → dead code (broken import path `@/DCCEX/Log/useDccLog`), cleanup
- `DeviceSerialMonitors.vue` (root-level `components/DeviceSerialMonitors.vue`) → `DeviceSerialPane.vue`
- `LayoutCard.vue`, `ThrottleStatsCard.vue`, `TurnoutStatsCard.vue`, `EffectStatsCard.vue`, `SensorStatsCard.vue`, `DevicesTable.vue`, `ThrottleStatus.vue` → `StatsPane.vue`

### Preserved Files (used by LogView.vue, DeviceSerialMonitorView.vue, and other routes)

- `DCCLogItem.vue`, `useDccLog.ts`, `types.ts`, `constants.ts`
- `DeviceSerialMonitor.vue`, `useDeviceSerialMonitor.ts`, `DeviceSerialMonitorDemo.vue`, `index.ts`
- `DeviceSerialMonitors.vue` (inside `DeviceSerialMonitor/` subdirectory — this is the grouped device list, different from the root-level one)
- `TurnoutLogs.vue`, `EffectLogs.vue`, `SensorLogs.vue`
- `useLayoutLogListeners.ts`
- `DeviceSerialMonitorView.vue`

---

## CSS Grid Strategy

### Default state (all panes normal)
```css
.monitor-grid {
  display: grid;
  grid-template-areas:
    "dcc    serial"
    "turnouts effects"
    "sensors  stats";
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 1px;
  height: calc(100vh - 28px);
  background: #1e293b; /* gap shows as border */
}
```

### Maximized state
Single pane fills entire grid. Other panes hidden with `v-if`.

### Minimized state — algorithm

The grid and minimized bar are siblings in a flex column container:

```html
<div class="monitor-layout"> <!-- flex column, full height -->
  <div class="monitor-grid">  <!-- CSS grid, flex: 1 -->
    <!-- normal panes only -->
  </div>
  <div class="monitor-minimized-bar"> <!-- flex row, 28px height -->
    <!-- minimized pane title bars -->
  </div>
</div>
```

The minimized bar is a separate flex container below the grid (not part of the CSS grid). It shows only when panes are minimized.

**Reflow algorithm** for remaining normal panes:
1. Collect IDs of all panes in `normal` state
2. Arrange in 2-column grid, filling row by row in index order
3. If odd count, last pane spans both columns
4. Generate `grid-template-areas`, `grid-template-columns`, and `grid-template-rows` strings

**Examples**:

- **1 pane minimized** (e.g., stats): 5 normal panes → rows of 2,2,1 (last spans full width)
  ```
  "dcc      serial"
  "turnouts effects"
  "sensors  sensors"
  ```

- **3 panes minimized** (effects, sensors, stats): 3 normal panes → rows of 2,1
  ```
  "dcc      serial"
  "turnouts turnouts"
  ```

- **5 panes minimized**: 1 normal pane spans full width
  ```
  "dcc dcc"
  ```

Multiple panes can be minimized simultaneously. `restoreAll()` resets all to normal.

### Grid properties are computed reactively
`usePaneManager` store exposes `gridTemplateAreas`, `gridTemplateRows`, `gridTemplateColumns` as computed getters bound to `.monitor-grid` via `:style`.

---

## State Management

`usePaneManager` as a **Pinia store** (per project convention: "Use Pinia stores, not raw composables for global state"):

```typescript
interface PaneConfig {
  id: string
  index: number
  name: string
  icon: string
  color: string
  state: 'normal' | 'minimized' | 'maximized'
  messageCount: number
  isLive: boolean
}
```

State persisted via `useStorage('@DEJA/monitor/paneState')`. Key behaviors:
- Only one pane can be maximized at a time
- Maximizing restores any currently maximized pane first
- Minimize/maximize are toggle operations
- `restoreAll()` resets all panes to normal state

---

## Pane-Specific Behaviors

### DCC Log Pane
- Full pane dedicated to DCC command log
- Uses `useDccLog` composable (WebSocket messages with `action === 'dcc'`)
- Shows parsed DCC commands with timestamp, raw command, and decoded description
- Auto-scrolls to newest entry

### Device Serial Pane
- Tabbed interface: one tab per connected device
- Devices list from `useLayout().getDevices()`, filtered to connected only
- Tabs show device name + connection status badge
- Each tab renders the existing `DeviceSerialMonitor.vue` component (reused directly)
- Each active tab creates its own `useDeviceSerialMonitor(deviceId)` instance (WebSocket subscribe/unsubscribe lifecycle)
- Tabs add/remove dynamically as devices connect/disconnect via reactive Firestore watch
- Empty state: "No devices connected" message when device list is empty
- Direction indicators: green ↓ for incoming, orange ↑ for outgoing serial data

### Stats Pane
- Terminal-style display (no cards-in-cards)
- Rows of labeled stat pairs in a 2-column grid
- Data: active locos, turnouts thrown/total, active effects, triggered sensors, signal states, track power status, connected devices count
- Uses existing composables: `useLayout`, `useLocos`, `useTurnouts`, `useEfx`, `useSignals` from `@repo/modules`

### Log Panes (Turnouts, Effects, Sensors)
- Scrollable log list with auto-scroll via `useAutoScroll`
- Each entry: timestamp | tag | message
- Clear button resets the log list (local state only, does not affect Firestore)
- Message count displayed in title bar badge
- Adapted from existing `TurnoutLogs.vue`, `EffectLogs.vue`, `SensorLogs.vue` — extract rendering logic, remove `v-card` wrapper (the `MonitorPane` wrapper provides the chrome)

---

## WebSocket Connections

The dashboard opens multiple WebSocket connections (existing behavior, not introduced by this redesign):
- `useDccLog`: 1 connection for DCC command stream
- `useDeviceSerialMonitor`: 1 connection per connected device

This is accepted as-is. A shared WebSocket connection refactor is out of scope.

---

## Keyboard Shortcuts

Keyboard shortcuts are **deferred to a future phase**. The component architecture (centralized `usePaneManager` store with `toggleMaximize(id)`, `toggleMinimize(id)`, `restoreAll()`) is designed to support keybindings without structural changes. A future enhancement can add global key listeners (e.g., `Ctrl+1` to focus pane 0, `Ctrl+z` to maximize active pane).

---

## Responsive Behavior

This is a **desktop-first monitoring dashboard**. The 2-column grid requires a minimum viewport width of ~900px to be usable. On narrow viewports (< 768px), the grid switches to a single-column stack. This is handled via a CSS media query or Tailwind responsive classes:

```css
@media (max-width: 768px) {
  .monitor-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "dcc" "serial" "turnouts" "effects" "sensors" "stats";
    overflow-y: auto; /* allow scrolling in single-column */
  }
}
```

---

## LogView.vue Updates

`LogView.vue` currently imports `DCCLog.vue` and `DeviceSerialMonitors.vue` (from `DeviceSerialMonitor/` subdirectory), both of which are being preserved or replaced. Updates needed:

- For `case 'dcc'`: switch import from `DCCLog.vue` to the new `DccLogPane.vue`
- For `case 'devices'`: switch import from the subdirectory `DeviceSerialMonitors.vue` to the new `DeviceSerialPane.vue`
- `TurnoutLogs` and `EffectLogs` imports remain unchanged (preserved files)

---

## Verification

1. `pnpm --filter=deja-monitor dev` — dashboard loads with 6 tmux-style panes
2. All panes display real-time data from their respective sources
3. Maximize/minimize toggles work correctly and grid reflows
4. Clear button resets individual pane logs
5. Status bar shows correct WS connection state, layout info, track power, and e-stop
6. Hamburger menu in status bar opens sidebar for navigation to Settings/Logs
7. LogView routes (`/logs/:logType`) still work with updated imports
8. DeviceSerialMonitorView route (`/logs/devices/:deviceId`) still works
9. `pnpm lint && pnpm check-types` passes
10. No visual regressions on Settings or other non-dashboard routes
