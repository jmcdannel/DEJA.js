# 🚂 Multi DCC-EX Track Output Configuration

**Date:** 2026-03-23
**Branch:** `feature/multi-dcc-ex`
**Status:** Design approved

## Overview

Support configuring DCC-EX track outputs (MAIN, PROG, DC, DCX, BOOST, etc.) across multiple command stations and boosters. All DCC-EX devices receive unified throttle/function commands so locomotives move seamlessly between power districts. Track configuration is applied at server startup; changes require a restart.

## Goals

1. Configure track outputs (A-H) per DCC-EX device with mode and optional cab address
2. Unified command dispatch — all connected DCC-EX devices receive throttle/function commands
3. Per-output power control (on/off) during operation
4. Named power districts at the layout level for operational grouping
5. Auto-create loco roster entries for DC/DCX track outputs
6. Support single CS with multiple outputs, multiple independent CS units, and BOOST outputs

## Out of Scope

- Overload detection / current monitoring (`<jI>` parsing)
- Live track reconfiguration (restart required)
- CV programming integration (PROG track just gets configured)
- Historical current graphs
- Throttle app changes (multi-output awareness deferred)
- Monitor app changes (track output state in monitoring dashboard deferred)
- Firestore composite indexes for `powerDistricts` queries (simple collection reads only)

---

## Data Model

### TrackOutput (per device)

Stored on the device document: `layouts/{layoutId}/devices/{deviceId}.trackOutputs`

```typescript
type TrackMode =
  | 'MAIN' | 'MAIN_INV' | 'MAIN_AUTO'
  | 'PROG'
  | 'DC' | 'DCX'
  | 'BOOST' | 'BOOST_INV' | 'BOOST_AUTO'
  | 'NONE'

type TrackOutputLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

interface TrackOutput {
  mode: TrackMode
  cabAddress?: number       // Required for DC/DCX (1-10239)
  power: boolean | null     // true=on, false=off, null=unknown (not yet synced from hardware)
}
```

The `output` letter is **not stored inside `TrackOutput`** — it is the key of the `Record<string, TrackOutput>` on the device document. This eliminates redundancy between the key and a field value.

```typescript
// Example Firestore document:
// layouts/{layoutId}/devices/{deviceId}.trackOutputs = {
//   "A": { mode: "MAIN", power: null },
//   "B": { mode: "PROG", power: null }
// }
```

### Device extension

```typescript
interface Device {
  // ... existing fields (id, name, type, connection, port, autoConnect, etc.)
  trackOutputs?: Record<string, TrackOutput>  // Keyed by output letter ('A', 'B', etc.)
  maxOutputs?: number                          // Hardware limit (2 for Mega, up to 8 for ESP32)
}
```

### PowerDistrict (per layout)

Stored in subcollection: `layouts/{layoutId}/powerDistricts/{districtId}`

```typescript
interface PowerDistrict {
  id: string
  name: string        // e.g., "Mainline", "Yard", "Staging"
  deviceId: string    // Which DCC-EX device
  output: string      // Which output letter (A-H)
  color?: string      // For UI identification
}
```

### Loco type extension

```typescript
interface Loco {
  // ... existing fields (address, name, id, consist, functions, etc.)
  isDcTrack?: boolean   // True for auto-created DC track locos
}
```

Auto-created DC locos display normally in the Throttle app roster. The `isDcTrack` flag is informational — no special UI treatment in this phase.

### "Device 1" definition

"Device 1" means the **first `dcc-ex` type device by document ID** when devices are loaded from Firestore (`layouts/{layoutId}/devices/` sorted by ID). This is deterministic and doesn't depend on `order` or creation time. The Cloud UI should display which device is considered "Device 1" in the track output config.

### Constraints

- **PROG restriction:** Only Device 1 (first DCC-EX device by document ID), Output B can be set to `PROG` mode. UI disables the PROG option on all other outputs with a note: *"Programming track is only supported on the first command station's second output (B)"*
- **DC/DCX requires cabAddress:** Must be 1-10239. Server skips output if address is 0 or out of range.
- **BOOST modes are ESP32-only:** UI can note this. Could be gated by `device.config.platform` in the future.
- **One PROG max:** Only one output across the entire layout can be PROG.

### Migration from `layout.dccEx`

The existing `Layout.dccEx` fields (`trackA`, `trackB`, `power`, `isConnected`, `lastConnected`) are **deprecated** but retained for backward compatibility during the transition:

- **Server writes:** New track output state goes to `device.trackOutputs`. The server also continues writing to `layout.dccEx.power` for the global power state so existing UI components don't break.
- **Server reads:** Track config is read from `device.trackOutputs` only. The old `layout.dccEx.trackA/trackB` fields are no longer read.
- **UI migration:** `CommandStationTracks.vue` switches from reading `layout.dccEx.trackA/trackB` to reading `device.trackOutputs` across all devices. Old fields are left in Firestore but ignored.
- **Cleanup:** A future PR removes the deprecated `layout.dccEx.trackA/trackB` fields and the server code that writes to them.

### Firestore security rules

Add rules for the new `powerDistricts` subcollection in `firestore.rules`:

```
match /layouts/{layoutId}/powerDistricts/{districtId} {
  allow read: if request.auth != null;
  allow write: if isLayoutOwner(layoutId);
}
```

This follows the same pattern as other layout subcollections (locos, turnouts, etc.).

---

## Server: Startup Config + Unified Dispatch

### Architecture: Single-port to multi-port refactor

**Current state:** `dcc.ts` manages a single `com: SerialCom` variable. All commands (`sendSpeed`, `sendTurnout`, etc.) go through this one port. `layout.ts` has `_connections` which already tracks multiple devices, but `dcc.setConnection(port)` only stores one port.

**New architecture:**

1. **`dcc.ts` becomes a multi-port broadcaster.** Replace the single `com` variable with a `Map<string, SerialCom>` keyed by device ID:
   ```typescript
   const dccDevices: Map<string, SerialCom> = new Map()

   // Called from layout.ts connectUsbDevice() for each dcc-ex device
   function registerDevice(deviceId: string, port: SerialPort): void
   function unregisterDevice(deviceId: string): void
   ```

2. **`send()` becomes `broadcastToAll()` + `sendToDevice()`.** The existing `send()` function is refactored:
   - `broadcastToAll(cmd)` — iterates all entries in `dccDevices` and writes to each port. Used for throttle, function, turnout, accessory commands.
   - `sendToDevice(deviceId, cmd)` — writes to a specific device's port. Used for track config (`<=`), per-output power (`<1 A>`), and PROG commands.

3. **`layout.ts` connectUsbDevice()** calls `dcc.registerDevice(deviceId, port)` instead of `dcc.setConnection(port)` for `dcc-ex` type devices. The old `setConnection` is removed.

4. **Fan-out happens in `dcc.ts`.** The `handleMessage` switch cases for `throttle`, `function`, `turnout`, `output` call `broadcastToAll()`. The new `trackPower` action calls `sendToDevice()`.

5. **`handleSerialMessage` in `layout.ts`** already receives the `device` parameter. It now writes track state to `device.trackOutputs` in Firestore (per-device) instead of `layout.dccEx.trackA/trackB`. The existing track regex `/^=\s([AB])\s(.+)$/` is expanded to `/^=\s([A-H])\s(.+)$/` to match all 8 outputs.

6. **`connect()` in `dcc.ts` is deprecated.** The existing `connect` action in `handleMessage` created a single serial connection via `dcc.connect()`. All connections now go through `layout.ts` → `connectUsbDevice()` → `dcc.registerDevice()`. The `connect` case in `handleMessage` and the `connect()` function are removed. The RTDB `dejaCommands` path (handled by `deja.ts`) continues to handle device connect/disconnect requests as before.

7. **`rosterModule` adapts to multi-port.** The `createRosterModule` is initialized with `broadcastToAll` (for `syncRoster` which sends roster data to all CS units) and a `getIsConnected()` that returns `dccDevices.size > 0`. Roster import (`importRoster`) uses `sendToDevice(device1Id)` since it requires PROG track access.

8. **`broadcastToAll()` uses per-device try-catch.** Each port write is wrapped individually — a broken serial connection on one device does not prevent commands from reaching other devices. Errors are logged per device.

9. **Global power responses (`<p1>` / `<p0>`) update all outputs.** When `handleSerialMessage` receives a global `<p1>` or `<p0>` from a device, it sets `power: true` or `power: false` on all configured `trackOutputs` for that device in Firestore.

### RTDB command format for device-targeted commands

The existing RTDB command format `{ action, payload }` is extended. For device-targeted commands, the payload includes a `deviceId` field:

```typescript
// Existing broadcast commands (no change)
{ action: 'throttle', payload: '{"address":3,"speed":50}' }
{ action: 'power', payload: '"1"' }           // Global power — broadcast to all

// New device-targeted commands
{ action: 'trackPower', payload: '{"deviceId":"cs1","output":"A","power":true}' }
```

The `handleMessage` switch in `dcc.ts` gets a new `trackPower` case that extracts `deviceId` from the payload and calls `sendToDevice()`.

**`isPowerCommand` and `writePowerToFirestore`** are updated:
- `isPowerCommand` regex extended to match `1 A`, `0 B` etc. (per-output form)
- `writePowerToFirestore` updated to write per-device per-output power state to `device.trackOutputs.{output}.power` instead of `layout.dccEx.power`
- Global power commands (`<1>`, `<0>`) still write to `layout.dccEx.power` for backward compat

### Startup routine

Track configuration runs **on each device connect** (inside `connectUsbDevice` in `layout.ts`), not on a separate server-start event. The flow for each DCC-EX device:

1. Serial port connects successfully
2. `dcc.registerDevice(deviceId, port)` stores the port
3. Read `device.trackOutputs` from Firestore (via Admin SDK)
4. For each configured output, call `dcc.sendToDevice(deviceId, '= A MAIN')` etc.
5. Send `<=>` to query config — **best-effort verification** (DCC-EX serial is async with no request/response pairing; the server parses whatever comes back via `handleSerialMessage` and syncs to Firestore, but does not block waiting for responses)
6. Check/create auto-locos for DC/DCX outputs

If a device has no `trackOutputs` configured, the server skips track configuration and DCC-EX uses its defaults (typically A=MAIN, B=PROG).

### Unified throttle broadcasting

| Command type | Routing | Method |
|-------------|---------|--------|
| Throttle (speed/direction) | **All** connected DCC-EX devices | `broadcastToAll()` |
| Function (F0-F28) | **All** connected DCC-EX devices | `broadcastToAll()` |
| Accessory/turnout | **All** connected DCC-EX devices | `broadcastToAll()` |
| Global power (`<1>` / `<0>`) | **All** connected DCC-EX devices | `broadcastToAll()` |
| Track power (`<1 A>` / `<0 A>`) | **Specific device** | `sendToDevice(deviceId)` |
| PROG commands (CV read/write) | **Device 1 only** | `sendToDevice(device1Id)` |

### Power state sync

Server parses `<p1 A>` / `<p0 A>` responses from each device in `handleSerialMessage` (which receives the `device` parameter) and writes `device.trackOutputs.{output}.power` back to Firestore via Admin SDK.

**`<p2>` (mixed power state):** Ignored. The server relies on per-output `<p1 A>` / `<p0 B>` messages for granular state. The `<p2>` global response is informational only and doesn't trigger any Firestore writes.

### DC auto-loco creation

At startup, when the server encounters a DC/DCX output with a cabAddress:

1. Check if a loco with that address exists in `layouts/{layoutId}/locos/`
2. If not, create: `{ address: cabAddress, name: "DC Track {output}", isDcTrack: true }`
3. The loco appears in the Throttle app like any other
4. If the output mode is later changed away from DC, the loco stays in the roster (user can delete manually)
5. Auto-created locos get `isDcTrack: true` so the UI can display them distinctly

### Config change workflow

Track output configuration is **not applied live**. When the user changes track config in the Cloud app:

1. Changes are saved to Firestore immediately
2. UI shows a toast: *"Track configuration saved. Run `/restart` to apply."*
3. User runs `deja restart` or `/restart` from the DEJA REPL
4. Server reconnects and runs the startup routine with the new config

---

## UI: Cloud App

### Per-Device Track Output Config

**Location:** `apps/cloud/src/Layout/Devices/` — shown when viewing a DCC-EX device

- Table/list of outputs A through H (limited by `device.maxOutputs`, default 2)
- Each row:
  - **Output letter** (A, B, C...)
  - **Mode dropdown** — all TrackMode options
  - **Cab Address field** — visible only when mode is DC or DCX
  - **Power indicator** — 🟢/🔴 showing live power state (read-only here)
- **PROG disabled** on all outputs except Device 1 Output B, with tooltip note
- **BOOST options** show note if not ESP32
- **Save** writes to `device.trackOutputs` in Firestore → toast with restart instruction

### Layout-Wide Power Districts View

**Location:** New section in Cloud app navigation — **Power Districts**

- List of named districts with color badges
- Each district shows: **Name** | **Device name** | **Output letter** | **Mode** (read from referenced device) | **Power state** (live 🟢/🔴)
- **Add district** — name field + device dropdown + output dropdown
- **Power toggle** — writes `{ action: 'trackPower', payload: { deviceId, output, power } }` to RTDB `dccCommands/{layoutId}`. Server routes to the specific device.
- **Delete district** — removes the mapping (doesn't affect the device's track config)

### Updated CommandStationTracks.vue

Evolve the existing component to show **all outputs across all connected devices** instead of hardcoded Track A/B. Each output displays its mode and power state. **Note:** Fix pre-existing bug where both rows display "A" avatar — Track B row should show "B".

---

## Package Structure

### `@repo/dccex` — Track output config + commands

- `types.ts` — Add `TrackOutput`, `TrackMode`, `TrackOutputLetter` types
- `constants.ts` — Track mode options, labels, validation rules (PROG constraint, cabAddress rules, ESP32 modes)
- `useTrackOutputs.ts` — **Client-side only** (Vue composable). VueFire bindings to `device.trackOutputs` for reactive UI updates. The server reads `device.trackOutputs` directly via Firebase Admin SDK — it does not use this composable.
- `parsers.ts` — Pure functions for parsing DCC-EX responses (shared between client debug tools and server):
  - `parseTrackState(response)` — parses `= A MAIN` → `{ output: 'A', mode: 'MAIN' }`
  - `parsePowerState(response)` — parses `p1 A` → `{ output: 'A', power: true }`
- `commands.ts` — Pure functions for building DCC-EX command strings:
  - `buildTrackConfigCommand(output, mode, cabAddress?)` — returns `= A MAIN` or `= B DC 45`
  - `buildTrackPowerCommand(output, power)` — returns `1 A` or `0 A`
  - `buildQueryTracksCommand()` — returns `=`

### `@repo/modules` — Power districts

- `powerDistricts/types.ts` — `PowerDistrict` interface
- `powerDistricts/usePowerDistricts.ts` — Composable for layout-level power district collection

### `@repo/ui` — Shared components

- Evolve `TrackPower.vue` — support N outputs (not just A/B)
- New `TrackOutputConfig.vue` — mode dropdown + cab address field per output row
- New `PowerDistrictCard.vue` — district name, device/output, power toggle

### `apps/server` — Server module

- New `src/modules/trackOutputs.ts`:
  - `configureDevice(deviceId)` — reads Firestore config, sends track commands, verifies with `<=>`
  - `handleTrackPower(deviceId, output, power)` — sends per-output power command
  - `createDcLocos(deviceId)` — checks/creates auto-locos for DC outputs
  - Called from `layout.ts` `connectUsbDevice()` after `dcc.registerDevice()`
- Update `src/lib/dcc.ts`:
  - Replace single `com` with `dccDevices: Map<string, SerialCom>`
  - Add `registerDevice()`, `unregisterDevice()`, `broadcastToAll()`, `sendToDevice()`
  - Remove `setConnection()` (replaced by `registerDevice()`)
  - Add `trackPower` case to `handleMessage` switch
  - Extend `isPowerCommand` regex to match per-output form (`1 A`, `0 B`)
  - Add `VALID_ACTIONS`: `'trackPower'`
- Update `src/modules/layout.ts`:
  - `connectUsbDevice()`: call `dcc.registerDevice()` then `trackOutputs.configureDevice()`
  - `handleSerialMessage()`: parse track state → write to `device.trackOutputs` (per-device) instead of `layout.dccEx.trackA/trackB`
  - `disconnectDevice()`: call `dcc.unregisterDevice()`
- Update `dccLog` entries: Add optional `deviceId` field to log entries so multi-device commands are traceable: `{ type, message, deviceId?, timestamp }`

### `apps/cloud` — Cloud app UI

- New track output config section in device details
- New power districts view and navigation entry
- Updated CommandStationTracks to show all outputs

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Device has no `trackOutputs` | Server skips track config, uses DCC-EX defaults |
| Invalid cabAddress (0 or >10239) | Server logs warning, skips that output |
| PROG set on wrong output | Server skips, logs warning |
| Device disconnects | Config retained in Firestore, all `trackOutputs.*.power` set to `null` (unknown) |
| Device reconnects | Startup routine re-sends all track config |
| DC output mode changed | Auto-created loco stays in roster (`isDcTrack: true`) |
| `<=>` response doesn't match config | Log mismatch warning, trust the hardware response |

---

## DCC-EX Command Reference

### Track configuration
```
<= A MAIN>          Set output A to DCC main
<= A MAIN_INV>      Set output A to DCC main (inverted)
<= A MAIN_AUTO>     Set output A to DCC main (auto-reverser)
<= B PROG>          Set output B to programming track
<= C DC 45>         Set output C to DC mode, cab address 45
<= C DCX 45>        Set output C to DC inverted, cab address 45
<= D BOOST>         Set output D to booster (ESP32 only)
<= D BOOST_INV>     Booster inverted (ESP32 only)
<= D BOOST_AUTO>    Booster auto-reverse (ESP32 only)
<= E NONE>          Disable output E
<=>                  Query all track configurations
```

### Power control
```
<1>                  Power ON all tracks
<0>                  Power OFF all tracks
<1 MAIN>             Power ON all MAIN tracks
<0 PROG>             Power OFF PROG track
<1 A>                Power ON output A (specific)
<0 B>                Power OFF output B (specific)
```

### Response formats
```
<= A MAIN>           Track config confirmation
<= B DC 45>          DC config with cab address
<p1>                 All tracks ON
<p0>                 All tracks OFF
<p2>                 Mixed power state
<p1 A>               Output A ON
<p0 B>               Output B OFF
```
