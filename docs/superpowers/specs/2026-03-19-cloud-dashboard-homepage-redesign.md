# Cloud Dashboard Homepage Redesign

**Date:** 2026-03-19
**Scope:** `apps/cloud` dashboard homepage, `@repo/ui` shared components
**Branch:** `feature/cloud-ui-refinements`

---

## Problem

The current Cloud homepage has a flat, single-column layout that doesn't feel like a dashboard. The DEJA Server status bar sits above the device list as a separate component, duplicating information. Device cards are functional but lack visual richness. New users with no devices configured see a minimal empty state that doesn't guide them toward getting started.

## Goals

1. Transform the homepage into a proper two-column dashboard layout
2. Remove the standalone DEJA Server status bar; promote `deja-server` to first position in the device list with embedded stats
3. Redesign device cards as rich tiles with per-device metrics
4. Add a sidebar with quick connect, layout info, activity chart, and QR code
5. Create a rich empty state that guides new users through setup with a vertical timeline stepper
6. Unify all QuickStart / installation instruction instances to follow the same 3-step process with a prerequisite note

---

## Design Decisions

### Layout Structure

**Two-column layout** on desktop (md breakpoint and above):
- **Left column** (8/12 via `v-col cols="12" md="8"`): Device tiles — the hero content
- **Right column** (4/12 via `v-col cols="12" md="4"`): Sidebar widgets stacked vertically

On mobile, columns stack to single column (left column content first, then sidebar).

### What's Removed

- **DEJA Server status bar** (the `v-card` at lines 115–157 in `Dashboard.vue`) — removed entirely
- **SystemOverviewStats** component usage on the dashboard — server stats are now embedded in the server device tile; the component remains in `@repo/ui` for use elsewhere
- **DeviceConnectionChart** (donut chart) — removed from dashboard; the Quick Connect panel provides a clearer connection status at a glance

### What's Kept

- **CommandActivityChart** — moves to the sidebar, same component
- **ThrottleLaunchQR** — moves to the sidebar, same component
- **DeviceConnectionList** header (Devices title + Refresh Ports / Add Device buttons) — kept as-is

---

## Component Specifications

### 1. DeviceTile (`packages/ui/src/Dashboard/DeviceTile.vue`)

**New component.** A rich card for a single device with embedded stats.

**Dependencies:** Imports `StatusPulse` from `../animations/StatusPulse.vue`. Calls `useServerStatus()` and `useLayout()` from `@repo/modules` internally (same pattern as `DeviceConnectionCard`). Does NOT accept `serverStatus` as a prop — fetches it internally for `deja-server` type devices.

**Props:**
```typescript
interface Props {
  device: Device
  availablePorts: string[]
  availableTopics?: string[]
  turnoutCount?: number
  effectCount?: number
  trackPower?: boolean | null
  /** Server-specific stats passed from parent (only relevant for deja-server type) */
  serverUptime?: string
  connectedDeviceCount?: number
  totalDeviceCount?: number
  commandCount?: number
}
```

**Events:**
```typescript
defineEmits<{
  connect: [deviceId: string, serial?: string, topic?: string]
  disconnect: [deviceId: string]
  reconnect: [deviceId: string]
  navigate: [deviceId: string]
}>()
```

**Data flow for server stats:** The `deja-server` tile's mini-stat row shows Uptime, Devices (connected/total), and Commands (last hour). These are dashboard-level concerns:
- `serverUptime` — computed by the parent using `formatUptime(serverStatus.lastSeen)`
- `connectedDeviceCount` / `totalDeviceCount` — computed by the parent from the devices array
- `commandCount` — computed by the parent from the `useCommandActivity` composable

These props are only rendered when `device.type === 'deja-server'` and ignored for other device types. This keeps `DeviceTile` as a presentational component that doesn't need access to the full devices array or activity composable.

For `dcc-ex` devices, the tile uses its existing `turnoutCount`, `effectCount`, and `trackPower` props. For `deja-arduino` / `deja-arduino-led`, it uses `effectCount` and `device.strips`. For `deja-mqtt`, it uses `effectCount`.

**Layout — Connected device:**
- Top row: device avatar (40px, rounded, color-coded by type) + device name (bold, device type color) + connection info (type · path · version) + `StatusPulse` component + "Connected"/"Online" label
- Bottom row: embedded mini-stats as small cards in a flex row. Stats vary by device type:
  - `deja-server`: Uptime, Devices (connected/total), Commands (last hour)
  - `dcc-ex`: Turnouts, Effects, Track Power (ON/OFF with warning color)
  - `deja-arduino` / `deja-arduino-led`: Effects, Strips
  - `deja-mqtt`: Effects

**Layout — Disconnected device (non-server):**
- Top row: same as connected but dimmed (opacity 0.7), status shows "Disconnected" in red
- Bottom area: port/topic selector + Connect button inline (same as current DeviceConnectionCard behavior)
- No stat row when disconnected

**Layout — Disconnected deja-server:**
- Top row: dimmed, "Server Offline" chip
- No connect controls (server connects automatically)
- Details button only

**Styling:**
- `border-left: 4px solid` using device type color (from `deviceTypes` constant via `useLayout()`)
- Background: `rgba(deviceColor, 0.06)` with `border: 1px solid rgba(deviceColor, 0.15)`
- Border radius: 8px
- Stat cards inside: `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.06)`, border-radius 6px
- Clickable device name area navigates to device details

**Note:** The `DeviceType` interface in `packages/modules/layouts/types.ts` is missing `color` and `image` fields that exist in the constants. Add `color?: string` and `image?: string` to the interface as part of this work.

### 2. Device Sort Order

**In `DeviceConnectionList.vue`**, change the `sortedDevices` computed to:

```typescript
const sortedDevices = computed(() => {
  return [...props.devices].sort((a, b) => {
    // deja-server always first
    if (a.type === 'deja-server') return -1
    if (b.type === 'deja-server') return 1
    // then connected before disconnected
    const aConnected = a.isConnected ? 0 : 1
    const bConnected = b.isConnected ? 0 : 1
    return aConnected - bConnected
  })
})
```

**DeviceConnectionList will use `DeviceTile` instead of `DeviceConnectionCard`** for the dashboard. The existing `DeviceConnectionCard` remains available for other contexts (e.g., the Devices settings page).

Approach: Add an optional `tileMode` prop to `DeviceConnectionList` (default `false`). When `true`, render `DeviceTile` instead of `DeviceConnectionCard`. The dashboard passes `tile-mode` to get the rich layout.

When `tileMode` is true, `DeviceConnectionList` must also accept and forward the server-specific stat props needed by `DeviceTile`:

```typescript
// Additional props when tileMode is true
interface TileModeProps {
  tileMode?: boolean
  serverUptime?: string
  connectedDeviceCount?: number
  totalDeviceCount?: number
  commandCount?: number
}
```

These are forwarded to the `DeviceTile` for the `deja-server` device only. When `tileMode` is false, these props are ignored.

**Empty state suppression:** When `tileMode` is true, the parent (`Dashboard.vue`) conditionally renders either `DashboardEmptyState` or `DeviceConnectionList` — so the list's internal empty state (lines 104–118) is never reached. No changes needed to the empty state markup in `DeviceConnectionList`.

### 3. QuickConnectPanel (`packages/ui/src/Dashboard/QuickConnectPanel.vue`)

**New component.** A sidebar widget for fast device connections.

**Props:**
```typescript
interface Props {
  devices: Device[]
  availablePorts: string[]
  availableTopics?: string[]
}
```

**Events:**
```typescript
defineEmits<{
  connect: [deviceId: string, serial?: string, topic?: string]
  refreshPorts: []
}>()
```

**States:**

**Has disconnected devices:** Shows one row per disconnected non-server device:
- Device icon (24px) + device name
- Port/topic selector (compact)
- Connect button (small, green)
- Header shows "Quick Connect" label + "N offline" badge

**All connected:** Shows a green card:
- Green pulse dot + "All devices connected" text
- "N of N online" subtitle
- No controls needed

**No devices configured:** Hidden (the empty state handles this case)

### 4. LayoutInfoCard (`packages/ui/src/Dashboard/LayoutInfoCard.vue`)

**New component.** Shows layout identity and server connection info.

**Props:**
```typescript
interface Props {
  layoutName?: string
  layoutId: string
  serverIp?: string | null
  wsPort?: string | number // defaults to 8082
}
```

The component constructs the connection URL internally from `serverIp` and `wsPort`: `ws://${serverIp}:${wsPort}`. No separate `serverConnection` prop needed.

**Layout:**
- Header: "Layout" overline label
- Layout name (bold, white)
- Layout ID (monospace, muted)
- "Server Connection" sub-label
- Connection URL (`ws://IP:PORT`) in a monospace code block with subtle border. Shows "—" when `serverIp` is null.
- Optional: link to Settings page

### 5. DashboardEmptyState (`packages/ui/src/Dashboard/DashboardEmptyState.vue`)

**New component.** Replaces the entire dashboard content for new users.

**Props:**
```typescript
interface Props {
  /** Step numbers (1-based) that are already completed */
  completed?: number[]
  /** Firebase UID for personalized install URL */
  uid?: string | null
  /** Layout ID for personalized install URL */
  layoutId?: string
  /** Whether the server is currently online */
  serverOnline?: boolean
}
```

**Events:**
```typescript
defineEmits<{
  addLoco: [address: number, name: string]
}>()
```

**Display condition:** Shown when `devices.length === 0` (no devices configured). This is the concrete boundary — once a user adds any device, they see the full dashboard regardless of server status. The empty state stepper handles the server-offline case via step 2.

**Structure:**

1. **Welcome header** (centered):
   - `v-icon` `mdi-train` (36px, primary color)
   - "Welcome to DEJA Cloud" (h5, bold)
   - "Your layout control center. Let's get your railroad connected in a few quick steps." (subtitle, muted)

2. **Prerequisite note** (muted, compact):
   - Small info card with `v-icon` `mdi-usb-port` (16px)
   - "Make sure your DCC-EX CommandStation is connected to your computer via USB before installing the server."
   - Styled subtly: `background: rgba(255,255,255,0.02)`, thin border, small text

3. **Vertical timeline stepper** (3 steps):

   **Step 1: Create your account**
   - Auto-completes when user is signed in (always complete on this page since auth is required)
   - Completed state: green circle with checkmark, struck-through title, "You're signed in — nice!" subtitle

   **Step 2: Install the DEJA Server**
   - Active when step 1 complete and server not online
   - Shows the `ServerSetupInfo` component (existing) with the personalized `curl` install command and copy button
   - Auto-completes when `serverOnline` becomes true

   **Step 3: Run your first train**
   - Active when server is online (`serverOnline === true`)
   - Shows the quick-add loco form (reused pattern from `SetupComplete.vue`):
     - DCC Address field (number input, compact)
     - Name field (optional, compact)
     - "Add Locomotive" button
     - Success alert + "Add Another" option after adding
   - Also shows a link/button to open the Throttle app

4. **Resource links** (below stepper):
   - Horizontal row: Docs, DEJA IO, Help, FAQ
   - Styled as small links with the existing QuickStart link style

### 6. QuickStart Component Unification

All instances of quick start / installation instructions will follow the same structure:

**Prerequisite note:** "Make sure your DCC-EX CommandStation is connected via USB."

**3 steps:**
1. Create your account
2. Install the DEJA Server
3. Run your first train

**Loco creation pattern:** Both `DashboardEmptyState` and `QuickStart` emit an `addLoco` event rather than calling `useLocos().createLoco()` directly. This keeps `@repo/ui` components presentational — the parent app handles the business logic. `@repo/ui` already imports from `@repo/modules` (e.g., `DeviceConnectionList` uses `useLayout`, `useTurnouts`, `useEfx`), so the dependency exists, but the event pattern is cleaner for loco creation since it requires error handling and success state that the parent controls.

**Files to update:**
- `packages/ui/src/QuickStart/QuickStart.vue` — refactor to use the 3-step process with prerequisite. The component currently has only 2 steps (Register + Install). Add step 3 (Run your first train) with the quick-add loco form (emit `addLoco` event), and add the prerequisite note.
- `apps/cloud/src/views/SetupComplete.vue` — align the QuickStart usage to the unified 3-step flow with prerequisite. The existing quick-add loco form stays in this view but should match the same UI pattern.

---

## Dashboard.vue Composition

### Active User State (has devices)

```
<v-container fluid>
  <v-row>
    <!-- Left Column: Devices -->
    <v-col cols="12" md="8">
      <DeviceConnectionList
        :devices="devices"
        :available-ports="ports"
        tile-mode
        link-mode="page"
        :server-uptime="serverUptime"
        :connected-device-count="connectedCount"
        :total-device-count="devices?.length ?? 0"
        :command-count="totalCommandCount"
        @connect="handleConnect"
        @disconnect="handleDisconnect"
        @reconnect="handleReconnect"
        @navigate="navigateToDevice"
        @refresh-ports="refreshPorts"
        @add-device="navigateToAddDevice"
      />
    </v-col>

    <!-- Right Column: Sidebar -->
    <v-col cols="12" md="4">
      <QuickConnectPanel
        :devices="devices"
        :available-ports="ports"
        @connect="handleConnect"
        @refresh-ports="refreshPorts"
      />
      <LayoutInfoCard
        :layout-name="layout?.name"
        :layout-id="layoutId"
        :server-ip="serverStatus?.ip"
        :ws-port="wsPort"
      />
      <CommandActivityChart :data="commandActivity" />
      <ThrottleLaunchQR :size="100" label="Scan to open" />
    </v-col>
  </v-row>
</v-container>
```

### Empty State (new user)

```
<v-container fluid>
  <DashboardEmptyState
    :completed="emptyStateSteps"
    :uid="user?.uid"
    :layout-id="layoutId"
    :server-online="serverStatus?.online"
    @add-loco="handleAddLoco"
  />
</v-container>
```

The `emptyStateSteps` computed determines which steps are complete based on:
- Step 1: always complete (user is authenticated)
- Step 2: complete when `serverStatus?.online === true`

The `handleAddLoco` handler calls `useLocos().createLoco(address, name, undefined, true)` — same pattern as `SetupComplete.vue`.

**Note:** `CommandActivityChart` data is currently sourced from an empty `wsMessages` ref (placeholder). This is a known limitation — the data source will be wired to real WebSocket messages in a future task. The chart renders correctly with empty data (shows "No activity data yet").

---

## Responsive Behavior

- **Desktop (md+):** Two-column layout, sidebar on the right
- **Tablet (sm–md):** Single column, devices first, then sidebar widgets
- **Mobile (xs):** Single column, full width, compact padding

The empty state is always single-column centered (max-width 520px).

---

## Files to Create

| File | Description |
|------|-------------|
| `packages/ui/src/Dashboard/DeviceTile.vue` | Rich device tile with embedded stats |
| `packages/ui/src/Dashboard/QuickConnectPanel.vue` | Sidebar quick connect widget |
| `packages/ui/src/Dashboard/LayoutInfoCard.vue` | Layout info + server connection |
| `packages/ui/src/Dashboard/DashboardEmptyState.vue` | Welcome stepper for new users |

## Files to Modify

| File | Changes |
|------|---------|
| `apps/cloud/src/Dashboard/Dashboard.vue` | Two-column layout, remove server status bar, wire up empty state, remove SystemOverviewStats and DeviceConnectionChart |
| `packages/ui/src/DeviceConnection/DeviceConnectionList.vue` | Add `tileMode` prop, sort deja-server first, conditionally render DeviceTile |
| `packages/ui/src/QuickStart/QuickStart.vue` | Add step 3 (run first train), add prerequisite note, align to 3-step process |
| `apps/cloud/src/views/SetupComplete.vue` | Align QuickStart usage to 3-step process with prerequisite |
| `packages/modules/layouts/types.ts` | Add `color?: string` and `image?: string` to `DeviceType` interface |
| `packages/ui/src/Dashboard/index.ts` | Export new components |
| `packages/ui/src/index.ts` | Export new components |

## Files Unchanged

| File | Reason |
|------|--------|
| `packages/ui/src/Dashboard/SystemOverviewStats.vue` | Kept in library, just not used on homepage anymore |
| `packages/ui/src/Dashboard/CommandActivityChart.vue` | Used as-is in sidebar |
| `packages/ui/src/DeviceConnection/DeviceConnectionCard.vue` | Kept for now; `DeviceTile` is intended to eventually replace it as the primary device display component across all apps |
| `packages/ui/src/ThrottleLaunchQR.vue` | Used as-is in sidebar |

## Reusability

All new components live in `@repo/ui` and are designed to be reused across apps (monitor, throttle, etc.):
- **`DeviceTile`** — rich device display, intended to eventually replace `DeviceConnectionCard` everywhere
- **`QuickConnectPanel`** — useful anywhere a quick device connect flow is needed
- **`LayoutInfoCard`** — layout identity display
- **`DashboardEmptyState`** — onboarding stepper for any app's first-run experience
