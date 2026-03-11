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

- **Connected state**: green left border, device icon + name + type, connection badge (USB/WiFi), port or topic path, StatusPulse animation, uptime duration, metadata tags (turnout count, effect count, firmware version, track power for dcc-ex), action buttons: Reconnect, Disconnect, Details →
- **Disconnected state**: red left border, device icon + name + type, port/topic selector dropdown, Connect button, Details →
- Device icon and color derived from `deviceTypes` in `useLayout` (dcc-ex → mdi-memory/pink, deja-arduino → mdi-usb/lime, deja-mqtt → mdi-wifi/blue, etc.)

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
- Server: Online/Offline with uptime
- Devices: connected / total
- Track Power: ON/OFF
- Commands: count in last hour

#### `CommandActivityChart`

Bar chart showing command throughput over time.

**Props:**

```typescript
interface CommandActivityChartProps {
  data: { timestamp: number; count: number }[]
  timeRange?: '10m' | '1h' | '24h'   // default '10m'
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
- `ports` — from WebSocket `portList` action (already exists in server)
- `serverStatus` — from `useServerStatus()`
- `commandActivity` — new: tracked client-side from WebSocket `dcc` messages, stored in a reactive circular buffer
- `trackPower` — from layout's `dccEx.power` field

**Event handlers:**
- `handleConnect` → calls `useLayout().connectDevice(device, port, topic)`
- `handleDisconnect` → sends DEJA command `{ action: 'disconnect', payload: { deviceId } }`
- `handleReconnect` → disconnect then connect with same port/topic
- `navigateToDevice` → `router.push({ name: 'DeviceDetails', params: { deviceId } })`
- `refreshPorts` → sends DEJA command `{ action: 'listPorts' }`

#### Empty state

When no devices exist, show a centered empty state card with:
- Icon: `mdi-devices`
- Title: "No devices configured"
- Subtitle: "Add a DCC-EX command station or DEJA device to get started"
- Action button: "Add Device" → navigates to device creation

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

---

## Theming

### Strategy

Use Vuetify's built-in theme system as the source of truth, with Tailwind's `darkMode: 'class'` synced to Vuetify's active theme. Add a third "high-contrast" theme for accessibility.

### Theme Definitions

Extend the existing Vuetify theme config in `apps/cloud/src/main.ts` and `apps/throttle/src/main.ts`:

```typescript
const themes = {
  light: {
    dark: false,
    colors: {
      background: '#F0F4F8',
      surface: '#FFFFFF',
      'surface-variant': '#E8EDF2',
      primary: '#00B8D4',
      secondary: '#D500F9',
      accent: '#C6FF00',
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',
      'device-connected': '#4CAF50',
      'device-disconnected': '#F44336',
      'stat-card': '#F5F7FA',
    },
  },
  dark: {
    dark: true,
    colors: {
      background: '#0B1120',
      surface: '#111827',
      'surface-variant': '#1E293B',
      primary: '#00E5FF',
      secondary: '#D500F9',
      accent: '#C6FF00',
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FFAB40',
      info: '#2196F3',
      'device-connected': '#4CAF50',
      'device-disconnected': '#F44336',
      'stat-card': '#1E1E2E',
    },
  },
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
    },
  },
}
```

### Theme Toggle

New shared component in `@repo/ui`:

#### `ThemeToggle`

A segmented button or dropdown that switches between light / dark / high-contrast.

**Props:**

```typescript
interface ThemeToggleProps {
  modelValue: 'light' | 'dark' | 'high-contrast'
}
```

**Behavior:**
- Persists selection to `localStorage` via `useStorage('@DEJA/theme', 'dark')`
- Updates `vuetify.theme.global.name`
- Syncs the `dark` / `light` / `high-contrast` class on `<html>` for Tailwind
- Placed in `AppHeader` (already shared via `@repo/ui`)

### Tailwind Sync

The new components use Vuetify color tokens (`rgb(var(--v-theme-surface))`) for backgrounds and Tailwind utilities for spacing/layout. This avoids duplication — Vuetify owns color, Tailwind owns layout.

For the high-contrast theme, Tailwind's `darkMode: 'class'` treats `high-contrast` as a dark variant. Components that need high-contrast-specific overrides use:

```css
:root.high-contrast .device-card {
  border-width: 2px;
  font-weight: 600;
}
```

---

## Data Flow

### Port List

```
Dashboard mount
  → useDejaJS().send('listPorts')        // DEJA command to RTDB
  → Server picks up, calls serial.list()
  → Server broadcasts { action: 'portList', payload: string[] }
  → Dashboard WebSocket listener updates reactive `ports` ref
```

### Device Connect

```
User selects port in dropdown, clicks Connect
  → emit('connect', deviceId, port)
  → Dashboard calls useLayout().connectDevice(device, port)
  → Writes DEJA command { action: 'connect', payload: { deviceId, port } }
  → Server connects serial port, updates Firestore device.isConnected
  → Firestore listener fires, DeviceConnectionCard reactively updates
```

### Command Activity Tracking

New composable `useCommandActivity()` in `@repo/modules`:

```typescript
export function useCommandActivity() {
  const buffer = ref<{ timestamp: number; count: number }[]>([])
  // Listens to WebSocket 'dcc' messages
  // Aggregates into 1-minute buckets
  // Keeps last 60 entries (1 hour)
  return { activity: readonly(buffer) }
}
```

The cloud dashboard subscribes to this. The data is ephemeral (not persisted) — it reflects the current session's command throughput.

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
├── ThemeToggle/
│   ├── ThemeToggle.vue
│   └── index.ts
```

All exported from `packages/ui/src/index.ts`.

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
- New shared components in `@repo/ui` (DeviceConnectionCard, DeviceConnectionList, SystemOverviewStats, charts, ThemeToggle)
- Throttle connect page update to show device connection list
- Three-theme support (light, dark, high-contrast) with toggle
- `useCommandActivity` composable

**Out of scope:**
- Device creation/editing flow (existing `/devices` page handles this)
- MQTT broker connection management (existing settings page)
- WiThrottle connection (existing throttle settings)
- Chart library integration (CSS-only charts are sufficient for this scope)
- Server-side changes (all data sources already exist)

---

## Files Modified

| File | Change |
|---|---|
| `packages/ui/src/DeviceConnection/DeviceConnectionCard.vue` | **New** |
| `packages/ui/src/DeviceConnection/DeviceConnectionList.vue` | **New** |
| `packages/ui/src/Dashboard/SystemOverviewStats.vue` | **New** |
| `packages/ui/src/Dashboard/CommandActivityChart.vue` | **New** |
| `packages/ui/src/Dashboard/DeviceConnectionChart.vue` | **New** |
| `packages/ui/src/ThemeToggle/ThemeToggle.vue` | **New** |
| `packages/ui/src/index.ts` | Add new exports |
| `packages/modules/layouts/useCommandActivity.ts` | **New** composable |
| `apps/cloud/src/Dashboard/Dashboard.vue` | **Rewrite** |
| `apps/cloud/src/main.ts` | Add high-contrast theme, theme custom colors |
| `apps/throttle/src/connect/Connect.vue` | Add DeviceConnectionList below layout selector |
| `apps/throttle/src/main.ts` | Add theme definitions matching cloud |
| `packages/ui/src/AppHeader.vue` | Add ThemeToggle |
