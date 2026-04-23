# Device Card Unification Design

**Date:** 2026-04-12
**Scope:** `@repo/ui` shared components, Cloud app (homepage, `/connect`, `/devices`), Throttle app (`/connect`)

---

## Problem

Six+ device card variants exist across the cloud and throttle apps with inconsistent layouts, missing disconnect buttons, and duplicated logic:

| Page | Current Component | Issues |
|------|-------------------|--------|
| Cloud Homepage `/` | `DeviceTile` + `QuickConnectPanel` | No disconnect, redundant quick-connect panel |
| Cloud Connect `/connect` | `DeviceConnectionCard` | Has disconnect — the "good" one |
| Cloud Devices `/devices` | `DeviceListItem` | Empty disconnect handler, different layout |
| Throttle Connect `/connect` | `DeviceConnectionCard` | Shows edit/details buttons that shouldn't be editable |

The deja-server device has no special visual treatment despite being the central coordinator that all other devices depend on.

---

## Design

Replace the current components with **two unified cards** in `@repo/ui`, plus updates to the existing `DeviceConnectionList` container.

### 1. `DeviceConnectCard` (new, in `@repo/ui`)

The primary card for connecting and disconnecting devices. Used on all connect surfaces.

**Used on:** Cloud homepage `/`, Cloud `/connect`, Throttle `/connect`

**Replaces:** `DeviceTile`, `DeviceConnectionCard`, `QuickConnectPanel`

#### Props

```ts
interface DeviceConnectCardProps {
  device: Device
  availablePorts: string[]
  availableTopics?: string[]
  serverOnline: boolean
  showDetailsLink?: boolean // default true; false in throttle
  // Server stats (deja-server only)
  serverUptime?: string
  connectedDeviceCount?: number
  totalDeviceCount?: number
  serverVersion?: string
  // Device stats (non-server devices)
  turnoutCount?: number
  effectCount?: number
  trackPower?: boolean | null
}
```

#### Emits

```ts
interface DeviceConnectCardEmits {
  connect: [deviceId: string, serial?: string, topic?: string]
  disconnect: [deviceId: string]
  navigate: [deviceId: string]
}
```

#### States

**deja-server online:**
- DEJA.js SERVER branded logo (purple gradient avatar with "DEJA.js" text) instead of generic device icon
- Always sorted first in any device list
- Stats row: Uptime, Connected devices (N/M), Version
- No connect/disconnect buttons (server lifecycle is managed via CLI)
- Details link (cloud icon) to `/devices/:id`

**deja-server offline:**
- Same logo but dimmed/greyscale
- Red "Server Offline" status
- Prominent CTA block: "Start the server to connect your devices" with `deja start` code block and copy-to-clipboard button
- Details link still available

**Device connected (server online):**
- Left border: green (connected color)
- Top row: device avatar + name + type/connection info + green status pulse
- Metadata chips: turnout count, effect count, track power (device-type-specific)
- Action buttons: Disconnect (red tonal) + Details (cloud icon, tonal) if `showDetailsLink` is true
- Details link navigates to cloud `/devices/:id`

**Device disconnected (server online):**
- Left border: red/grey (disconnected color)
- Top row: device avatar + name + "Disconnected" status
- Inline connection form:
  - USB devices: port dropdown selector
  - WiFi/MQTT devices: topic text field (prepopulated from saved device value)
- Action buttons: Connect (green) + Details (cloud icon) if `showDetailsLink` is true

**Device disconnected (server offline):**
- Entire card dimmed (reduced opacity)
- No connection form, no buttons
- Text: "Waiting for server..."
- Communicates that the server must be started before any device can connect

**Throttle variant:**
- `showDetailsLink` set to `false` — no details/edit/delete buttons
- Only connect and disconnect actions available

### 2. `DeviceManageCard` (new, in `@repo/ui`)

The management card for device configuration. Used only on the cloud `/devices` page.

**Used on:** Cloud `/devices` page only

**Replaces:** `DeviceListItem`

**Keeps from current `DeviceListItem`:**
- Drag handle for reordering
- Auto-connect toggle
- Link to full device detail page (`/devices/:id`)
- Port/connection type display
- Connection status indicator

**Fixes:**
- Disconnect button gets a working handler (currently empty `handleDisconnect` stub)
- Consistent styling with the rest of the device card family

#### Props

```ts
interface DeviceManageCardProps {
  device: Device
  ports: string[] | null | undefined
}
```

#### Emits

```ts
interface DeviceManageCardEmits {
  connect: [deviceId: string, serial?: string, topic?: string]
  disconnect: [deviceId: string]
  navigate: [deviceId: string]
}
```

### 3. `DeviceConnectionList` Updates

The existing container component gets these changes:

- **Always shows Refresh Ports button** in the header area, regardless of card type or device state
- Refresh Ports button is **disabled when server is offline**
- Passes `serverOnline` prop down to all child `DeviceConnectCard` instances
- Sorting: deja-server always first, then connected devices, then disconnected devices
- Removes `tileMode` prop — no longer needed since `DeviceConnectCard` is the single card for all connect surfaces
- Removes `QuickConnectPanel` integration from Dashboard

### 4. Details Link Behavior

- Rendered as a button with `mdi-cloud` (cloud) icon
- In the cloud app: navigates to `/devices/:deviceId` via vue-router
- `showDetailsLink` prop controls visibility (default `true`, set to `false` in throttle)
- Present in both connected and disconnected states

---

## Page-Level Changes

### Cloud Homepage `/` (Dashboard.vue)
- Replace `DeviceConnectionList` tile mode + `QuickConnectPanel` sidebar with a single `DeviceConnectionList` using `DeviceConnectCard`
- Remove `QuickConnectPanel` from sidebar
- `showDetailsLink` = true (default)

### Cloud Connect `/connect` (Connect.vue)
- Replace `DeviceConnectionCard` usage with `DeviceConnectCard`
- `showDetailsLink` = true (default)

### Cloud Devices `/devices` (Layout.vue)
- Replace `DeviceListItem` with `DeviceManageCard`
- Wire up disconnect handler (fix empty stub)

### Throttle Connect `/connect` (Connect.vue)
- Replace `DeviceConnectionCard` usage with `DeviceConnectCard`
- `showDetailsLink` = false

---

## Components Deleted

| File | Replaced By |
|------|-------------|
| `packages/ui/src/Dashboard/DeviceTile.vue` | `DeviceConnectCard` |
| `packages/ui/src/DeviceConnection/DeviceConnectionCard.vue` | `DeviceConnectCard` |
| `packages/ui/src/Dashboard/QuickConnectPanel.vue` | Removed (connect card handles this) |
| `apps/cloud/src/Layout/Devices/DeviceListItem.vue` | `DeviceManageCard` |

---

## Components Kept As-Is

| Component | Reason |
|-----------|--------|
| `DeviceDetails.vue` | Full detail page, separate concern |
| `DeviceStatus.vue` (dropdown) | App bar status indicator, different purpose |
| `DeviceStatusItem.vue` | Used in modals, read-only display |
| `DeviceStatusList.vue` | Layout overview grid, different context |
| `AddDeviceItem.vue` | Device creation modal, separate concern |
| `DevicePicker.vue` | Asset assignment picker, separate concern |
| `PortList.vue` | Port management view on `/devices`, separate concern |

---

## Barrel Export Updates

Update `packages/ui/src/index.ts`:
- Add: `DeviceConnectCard`, `DeviceManageCard`
- Remove: `DeviceTile`, `DeviceConnectionCard`, `QuickConnectPanel`
