# Cloud Dashboard Redesign — Design Spec

## Overview

Redesign the cloud app homepage as a device-connection-focused dashboard. The device list is the hero section — each device is a rich card with inline connection controls (serial port dropdown or MQTT topic), status, and navigation. Below the device list, a System Overview section shows stat cards and graphs. New shared components in `@repo/ui` are reused in the throttle connect page. All new UI supports three themes: light, dark, and high-contrast.

## Goals

1. **Connection-first homepage** — users see device status and can connect/disconnect devices without navigating away
2. **Shared `DeviceConnectionCard`** — one component in `@repo/ui` used by both cloud (links to detail page) and throttle (opens detail modal)
3. **Dashboard stats** — server status, device count, track power, command count, activity graph, connection donut chart
4. **Themeable UI** — light, dark, and high-contrast themes via Vuetify + Tailwind, with a theme toggle

---

## Architecture

### New Components (in `@repo/ui`)

#### `DeviceConnectionCard`

Rich card for a single device. Handles both connected and disconnected states.

**Props:**

```typescript
interface DeviceConnectionCardProps {
  device: Device                      // from @repo/modules layouts/types
  availablePorts: string[]            // serial ports from server
  availableTopics?: string[]          // MQTT topics (optional)
  linkMode: 'page' | 'modal'         // cloud = page, throttle = modal
  turnoutCount?: number               // pre-computed by parent
  effectCount?: number                // pre-computed by parent
}
```

**Emits:**

```typescript
interface DeviceConnectionCardEmits {
  connect: [deviceId: string, port?: string, topic?: string]
  disconnect: [deviceId: string]
  reconnect: [deviceId: string]
  navigate: [deviceId: string]        // cloud: router.push, throttle: open modal
}
```

**Rendering logic:**

- **Connected state**: green left border, device icon + name + type, connection badge (USB/WiFi), port or topic path, StatusPulse animation, uptime duration (computed from `device.lastConnected`), metadata tags (turnout count, effect count, track power for dcc-ex), action buttons: Reconnect, Disconnect, Details →
- **Disconnected state**: red left border, device icon + name + type, port/topic selector dropdown (serial port `<v-select>` for USB devices, text input for MQTT topic), Connect button, Details →
- Device icon and color derived from `deviceTypes` in `useLayout()` — this is the canonical source:
  - `dcc-ex` → `mdi-memory` / `pink`
  - `deja-arduino` → `mdi-usb` / `lime`
  - `deja-arduino-led` → `mdi-led-strip` / `teal`
  - `deja-mqtt` → `mdi-wifi` / `blue`

**Note:** `deja-server` is listed in `useLayout().deviceTypes` but is not in the `Device` type union. Device cards will not render for `deja-server` type — server status is shown separately in `SystemOverviewStats`. The `constants.ts` `deviceTypes` array should be updated to match `useLayout()` colors (dcc-ex → pink, not yellow) as a cleanup task.

**Metadata sources:**
- `turnoutCount` and `effectCount` are passed as props. The parent component queries these via `getTurnoutsByDevice(deviceId)` and `getEffectsByDevice(deviceId)` from `useLayout()` (same pattern as existing `DeviceStatusItem`).
- Track power (`dccEx.power`) comes from the layout document, not the device — the parent reads it from `useLayout().getLayout()` and passes it only to the dcc-ex device card.
- Uptime is computed from `device.lastConnected` timestamp (already on the Device interface) using a reactive interval.

#### `DeviceConnectionList`

Container for DeviceConnectionCard instances with header actions.

**Props:**

```typescript
interface DeviceConnectionListProps {
  devices: Device[]
  availablePorts: string[]
  availableTopics?: string[]
  linkMode: 'page' | 'modal'
  showHeader?: boolean                // default true
}
```

**Emits:**

```typescript
interface DeviceConnectionListEmits {
  connect: [deviceId: string, port?: string, topic?: string]
  disconnect: [deviceId: string]
  reconnect: [deviceId: string]
  navigate: [deviceId: string]
  refreshPorts: []
  addDevice: []
}
```

**Rendering:**
- Section header "Devices" with "↻ Refresh Ports" and "+ Add Device" buttons (when `showHeader` is true)
- Maps over `devices` array, rendering `DeviceConnectionCard` for each
- Connected devices sorted first, then disconnected
- Internally queries turnout/effect counts per device and passes as props to each card

#### `SystemOverviewStats`

Stat cards row for the dashboard.

**Props:**

```typescript
interface SystemOverviewStatsProps {
  serverStatus: ServerStatus | null
  deviceCount: { connected: number; total: number }
  trackPower: boolean | null
  commandCount?: number
}
```

**Rendering:**
- 4 stat cards in a responsive grid (`v-row` / `v-col` with breakpoints)
- Server: Online/Offline with uptime (from `serverStatus.lastSeen`)
- Devices: connected / total
- Track Power: ON/OFF
- Commands: count in last hour

#### `CommandActivityChart`

Bar chart showing command throughput over time. Fixed at 10-minute window — no time range selector (YAGNI, can add later).

**Props:**

```typescript
interface CommandActivityChartProps {
  data: { timestamp: number; count: number }[]
}
```

**Implementation:** Pure CSS bar chart using Tailwind — no chart library dependency. Each bar is a `div` with dynamic height percentage. Time labels at start and end.

#### `DeviceConnectionChart`

Donut chart showing connected vs disconnected device ratio.

**Props:**

```typescript
interface DeviceConnectionChartProps {
  connected: number
  disconnected: number
}
```

**Implementation:** CSS `conic-gradient` donut with center label showing percentage. Legend below with color dots.

### Cloud App Changes

#### `apps/cloud/src/Dashboard/Dashboard.vue` (rewrite)

Current: shows `DeviceStatusList` or empty state.
New: full dashboard layout.

**Structure:**

```
<template>
  <!-- Device List (hero section) -->
  <DeviceConnectionList
    :devices="devices"
    :available-ports="ports"
    link-mode="page"
    @connect="handleConnect"
    @disconnect="handleDisconnect"
    @reconnect="handleReconnect"
    @navigate="navigateToDevice"
    @refresh-ports="refreshPorts"
    @add-device="navigateToAddDevice"
  />

  <!-- Divider -->

  <!-- System Overview -->
  <h2>System Overview</h2>
  <SystemOverviewStats ... />

  <!-- Graphs row -->
  <v-row>
    <v-col cols="12" md="6">
      <CommandActivityChart :data="commandActivity" />
    </v-col>
    <v-col cols="12" md="6">
      <DeviceConnectionChart
        :connected="connectedCount"
        :disconnected="disconnectedCount"
      />
    </v-col>
  </v-row>
</template>
```

**Data sources:**
- `devices` — from `useLayout().getDevices()`
- `ports` — from Firebase RTDB at `portList/{layoutId}` (see Port List data flow below)
- `serverStatus` — from `useServerStatus()`
- `commandActivity` — new: tracked via `useCommandActivity()` composable (local to cloud app, see below)
- `trackPower` — from layout document's `dccEx.power` field via `useLayout().getLayout()`

**Event handlers:**
- `handleConnect` → calls `useLayout().connectDevice(device, serial, topic)` (note: parameter is `serial`, not `port`)
- `handleDisconnect` → calls `useLayout().disconnectDevice(deviceId)` (new method, see Server Changes below)
- `handleReconnect` → shows loading state on card, calls `disconnectDevice`, awaits Firestore update confirming `isConnected: false`, then calls `connectDevice` with the device's existing `port`/`topic` values. If disconnect times out after 5 seconds, shows error toast.
- `navigateToDevice` → `router.push({ name: 'DeviceDetails', params: { deviceId } })`
- `refreshPorts` → calls `useDejaJS().send('listPorts')`

#### Empty state

When `devices` array is empty (no devices of any type configured), show a centered empty state card with:
- Icon: `mdi-devices`
- Title: "No devices configured"
- Subtitle: "Add a DCC-EX command station or DEJA device to get started"
- Action button: "Add Device" → navigates to `/devices`

This differs from the current behavior which checks for `dcc-ex` specifically. The new dashboard shows all device types, so the empty state triggers only when there are truly zero devices.

### Throttle App Changes

#### `apps/throttle/src/connect/Connect.vue` (update)

Current: layout card selector only.
New: layout selector + device connection list below.

After a layout is selected, show:

```
<DeviceConnectionList
  :devices="devices"
  :available-ports="ports"
  link-mode="modal"
  :show-header="false"
  @connect="handleConnect"
  @disconnect="handleDisconnect"
  @navigate="openDeviceModal"
/>
```

The throttle uses `linkMode="modal"` — clicking "Details →" opens a `v-dialog` with `DeviceStatusItem` (existing component) rather than navigating to a page.

No stats or graphs in the throttle — just the connection list.

**Data source for ports in throttle:** The throttle app communicates with the server via Firebase (not direct WebSocket). Port list data is available at the same RTDB path `portList/{layoutId}` that the cloud app uses. The throttle listens to this path using `onValue` from Firebase RTDB. For MQTT-only devices, the port dropdown is hidden and replaced with a topic text field.

---

## Theming

### Strategy

Extend the existing `useThemeSwitcher` composable (at `packages/ui/src/composables/useThemeSwitcher.ts`) and its companion `ThemeSwitcher` component (already rendered in `AppHeader`). Currently these support `system / light / dark` cycling. We update them to support `light / dark / high-contrast` — dropping `system` mode in favor of the explicit high-contrast option.

### Migration from existing ThemeSwitcher

- The existing `ThemeSwitcher` component and `useThemeSwitcher` composable are **updated in place** (not replaced with a new `ThemeToggle`)
- The localStorage key stays as `@DEJA/theme-preference` (no migration needed)
- The `system` option is replaced by `high-contrast` in the cycle
- `useThemeSwitcher` already handles Vuetify `theme.global.name` and Tailwind class syncing — we extend it to handle the `high-contrast` class on `<html>`

### Theme Definitions

Extend the existing Vuetify theme config in `apps/cloud/src/main.ts` and `apps/throttle/src/main.ts`. The new definitions **merge into** the existing theme objects, preserving existing `variables`, `surface-bright`, `surface-light`, `on-surface-variant`, `primary-darken-1`, `secondary-darken-1`, and other existing properties.

New colors added to all themes:

```typescript
// Added to existing light theme colors:
'device-connected': '#4CAF50',
'device-disconnected': '#F44336',
'stat-card': '#F5F7FA',

// Added to existing dark theme colors:
'device-connected': '#4CAF50',
'device-disconnected': '#F44336',
'stat-card': '#1E1E2E',

// New high-contrast theme (added as third theme):
'high-contrast': {
  dark: true,
  colors: {
    background: '#000000',
    surface: '#1A1A1A',
    'surface-variant': '#2A2A2A',
    primary: '#00FFFF',
    secondary: '#FF00FF',
    accent: '#FFFF00',
    success: '#00FF00',
    error: '#FF0000',
    warning: '#FFA500',
    info: '#00BFFF',
    'device-connected': '#00FF00',
    'device-disconnected': '#FF0000',
    'stat-card': '#1A1A1A',
    // Also include all variables from dark theme as baseline
  },
}
```

### Tailwind Sync

The new components use Vuetify color tokens (`rgb(var(--v-theme-surface))`) for backgrounds and Tailwind utilities for spacing/layout. This avoids duplication — Vuetify owns color, Tailwind owns layout.

For the high-contrast theme, Tailwind's `darkMode: 'class'` treats `high-contrast` as a dark variant. The `useThemeSwitcher` composable sets both `dark` and `high-contrast` classes on `<html>` when high-contrast is active. Components that need high-contrast-specific overrides use:

```css
:root.high-contrast .device-card {
  border-width: 2px;
  font-weight: 600;
}
```

---

## Data Flow

### Port List

The server already broadcasts `portList` over WebSocket when `listPorts` is requested. To make this data accessible to both cloud and throttle apps (which use Firebase, not direct WebSocket), we add a small server-side write:

```
Dashboard mount
  → useDejaJS().send('listPorts')           // DEJA command to RTDB
  → Server picks up, calls serial.list()
  → Server writes result to RTDB: portList/{layoutId}
  → Server also broadcasts { action: 'portList', payload: string[] } (existing behavior)
  → Cloud/Throttle listen to RTDB portList/{layoutId} via onValue()
```

**Server change required:** In `apps/server/src/lib/deja.ts`, the `listPorts` handler currently only broadcasts over WebSocket. Add a write to Firebase RTDB at `portList/{layoutId}` so the data is accessible to Firebase-connected clients.

### Device Connect

```
User selects port in dropdown, clicks Connect
  → emit('connect', deviceId, serial)
  → Dashboard calls useLayout().connectDevice(device, serial)
  → Writes DEJA command { action: 'connect', payload: { deviceId, serial } }
  → Server connects serial port, updates Firestore device.isConnected = true
  → Firestore listener fires, DeviceConnectionCard reactively updates
```

### Device Disconnect

**Server change required:** Add a `disconnect` handler to `apps/server/src/lib/deja.ts`.

```
User clicks Disconnect
  → emit('disconnect', deviceId)
  → Dashboard calls useLayout().disconnectDevice(deviceId)
  → Writes DEJA command { action: 'disconnect', payload: { deviceId } }
  → Server calls serial.disconnect(port) or mqtt.unsubscribe(topic)
  → Server updates Firestore device.isConnected = false
  → Firestore listener fires, DeviceConnectionCard reactively updates
```

**New method in `useLayout()`:**

```typescript
async function disconnectDevice(deviceId: string): Promise<void> {
  // Sends DEJA command to RTDB dejaCommands/{layoutId}
  await send('disconnect', { deviceId })
}
```

### Command Activity Tracking

New composable `useCommandActivity()` local to the **cloud app** (not `@repo/modules`, since it depends on WebSocket access which is app-specific):

**File:** `apps/cloud/src/composables/useCommandActivity.ts`

```typescript
export function useCommandActivity(wsMessages: Ref<WsMessage[]>) {
  const buffer = ref<{ timestamp: number; count: number }[]>([])
  // Watches wsMessages for 'dcc' action messages
  // Aggregates into 1-minute buckets
  // Keeps last 10 entries (10-minute window)
  return { activity: readonly(buffer) }
}
```

The composable receives a reactive ref of WebSocket messages as a parameter (dependency injection). The cloud app's existing WebSocket connection (via the `useWebSocket` composable or direct `ws` listener in the dashboard) passes incoming messages to it.

The data is ephemeral (not persisted) — it reflects the current session's command throughput. On initial load, the chart is empty and fills in over time.

---

## Server Changes (now in scope)

Two small server-side additions are required:

### 1. `disconnect` handler in `apps/server/src/lib/deja.ts`

Add a new case to `handleDejaCommands`:

```typescript
case 'disconnect': {
  const { deviceId } = payload
  const device = await getDevice(deviceId)  // read from Firestore
  if (device?.port) {
    await serial.disconnect(device.port)
  }
  // Update Firestore
  await updateDoc(deviceRef, { isConnected: false })
  break
}
```

### 2. Write `portList` to RTDB in `apps/server/src/lib/deja.ts`

In the existing `listPorts` handler, after broadcasting over WebSocket, also write:

```typescript
await rtdb.ref(`portList/${layoutId}`).set(ports)
```

### 3. New `disconnectDevice` method in `useLayout()` (`packages/modules/layouts/useLayout.ts`)

```typescript
async function disconnectDevice(deviceId: string): Promise<void> {
  return send('disconnect', { deviceId })
}
```

Added to the returned object from `useLayout()`.

---

## Component Placement

### `@repo/ui` (new exports)

```
packages/ui/src/
├── DeviceConnection/
│   ├── DeviceConnectionCard.vue
│   ├── DeviceConnectionList.vue
│   └── index.ts
├── Dashboard/
│   ├── SystemOverviewStats.vue
│   ├── CommandActivityChart.vue
│   ├── DeviceConnectionChart.vue
│   └── index.ts
```

All exported from `packages/ui/src/index.ts`.

### Updated in place

- `packages/ui/src/composables/useThemeSwitcher.ts` — add `high-contrast` support
- `packages/ui/src/ThemeSwitcher.vue` (or wherever it lives) — update cycle to light/dark/high-contrast

### Existing components kept

- `DeviceStatusItem` — still used in throttle's device detail modal
- `DeviceStatusList` — replaced on cloud dashboard by `DeviceConnectionList`, but kept for backward compatibility
- `StatusPulse` — reused inside `DeviceConnectionCard`

---

## Responsive Behavior

- **Desktop (md+):** Stat cards in 4-column grid, graphs in 2-column grid, device cards full width
- **Tablet (sm):** Stat cards in 2-column grid, graphs stack vertically, device cards full width
- **Mobile (xs):** Everything stacks single column, device card action buttons wrap to second row

Use Vuetify's `v-row`/`v-col` with breakpoint props for grid layout.

---

## Scope Boundaries

**In scope:**
- Cloud dashboard rewrite with device connection list + stats + graphs
- New shared components in `@repo/ui` (DeviceConnectionCard, DeviceConnectionList, SystemOverviewStats, charts)
- Throttle connect page update to show device connection list
- Three-theme support (light, dark, high-contrast) by extending existing `useThemeSwitcher`
- `useCommandActivity` composable (cloud app local)
- Server: `disconnect` handler in deja.ts
- Server: `portList` RTDB write in deja.ts
- `useLayout().disconnectDevice()` method

**Out of scope:**
- Device creation/editing flow (existing `/devices` page handles this)
- MQTT broker connection management (existing settings page)
- WiThrottle connection (existing throttle settings)
- Chart library integration (CSS-only charts are sufficient for this scope)
- Updating `constants.ts` deviceTypes colors to match `useLayout()` (cleanup task, not blocking)

---

## Files Modified

| File | Change |
|---|---|
| `packages/ui/src/DeviceConnection/DeviceConnectionCard.vue` | **New** — rich device card with connect/disconnect/navigate |
| `packages/ui/src/DeviceConnection/DeviceConnectionList.vue` | **New** — container with header actions, sorts devices |
| `packages/ui/src/DeviceConnection/index.ts` | **New** — barrel export |
| `packages/ui/src/Dashboard/SystemOverviewStats.vue` | **New** — 4 stat cards |
| `packages/ui/src/Dashboard/CommandActivityChart.vue` | **New** — CSS bar chart |
| `packages/ui/src/Dashboard/DeviceConnectionChart.vue` | **New** — CSS donut chart |
| `packages/ui/src/Dashboard/index.ts` | **New** — barrel export |
| `packages/ui/src/index.ts` | Add new exports |
| `packages/ui/src/composables/useThemeSwitcher.ts` | **Update** — add high-contrast theme support |
| `apps/cloud/src/Dashboard/Dashboard.vue` | **Rewrite** — full dashboard layout |
| `apps/cloud/src/composables/useCommandActivity.ts` | **New** — command activity tracking |
| `apps/cloud/src/main.ts` | **Update** — add high-contrast theme, device-connected/disconnected/stat-card colors |
| `apps/throttle/src/connect/Connect.vue` | **Update** — add DeviceConnectionList below layout selector |
| `apps/throttle/src/main.ts` | **Update** — add matching theme definitions |
| `apps/server/src/lib/deja.ts` | **Update** — add `disconnect` handler, write portList to RTDB |
| `packages/modules/layouts/useLayout.ts` | **Update** — add `disconnectDevice()` method |
