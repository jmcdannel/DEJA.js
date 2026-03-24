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

interface TrackOutput {
  output: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
  mode: TrackMode
  cabAddress?: number   // Required for DC/DCX (1-10239)
  power: boolean        // On/off state
}
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

### Constraints

- **PROG restriction:** Only Device 1, Output B can be set to `PROG` mode. UI disables the PROG option on all other outputs with a note: *"Programming track is only supported on the first command station's second output (B)"*
- **DC/DCX requires cabAddress:** Must be 1-10239. Server skips output if address is 0 or out of range.
- **BOOST modes are ESP32-only:** UI can note this. Could be gated by `device.config.platform` in the future.
- **One PROG max:** Only one output across the entire layout can be PROG.

---

## Server: Startup Config + Unified Dispatch

### Startup routine

When the server connects to a DCC-EX device:

1. Read `device.trackOutputs` from Firestore
2. For each configured output, send `<= {output} {mode}>` (e.g., `<= A MAIN>`, `<= B DC 45>`)
3. Send `<=>` to query and verify the configuration
4. Parse responses and sync confirmed state back to Firestore
5. If a DC/DCX output exists, check/create the auto-loco (see below)

If a device has no `trackOutputs` configured, the server skips track configuration and DCC-EX uses its defaults (typically A=MAIN, B=PROG).

### Unified throttle broadcasting

| Command type | Routing |
|-------------|---------|
| Throttle (speed/direction) | **All** connected DCC-EX devices |
| Function (F0-F28) | **All** connected DCC-EX devices |
| Accessory/turnout | **All** connected DCC-EX devices |
| Track power (`<1 A>` / `<0 A>`) | **Specific device** that owns the output |
| PROG commands (CV read/write) | **Device 1 only** |

### Power state sync

Server parses `<p1 A>` / `<p0 A>` responses from each device and writes `trackOutput.power` back to Firestore. This keeps the UI in sync with actual hardware state during operation.

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
- **Power toggle** — sends `<1 {output}>` / `<0 {output}>` to the specific device via RTDB
- **Delete district** — removes the mapping (doesn't affect the device's track config)

### Updated CommandStationTracks.vue

Evolve the existing component to show **all outputs across all connected devices** instead of hardcoded Track A/B. Each output displays its mode and power state.

---

## Package Structure

### `@repo/dccex` — Track output config + commands

- `types.ts` — Add `TrackOutput`, `TrackMode` types
- `constants.ts` — Track mode options, labels, validation rules (PROG constraint, cabAddress rules, ESP32 modes)
- `useTrackOutputs.ts` — Composable for reading/writing track outputs per device (VueFire bindings to `device.trackOutputs`)
- `useDcc.ts` — Extend with:
  - `configureTrackOutput(output, mode, cabAddress?)` — builds and sends `<= A MAIN>` command
  - `setTrackPower(output, power)` — sends `<1 A>` / `<0 A>`
  - `queryTrackConfig()` — sends `<=>`
  - `parseTrackState(response)` — parses `<= A MAIN>` responses
  - `parsePowerState(response)` — parses `<p1 A>` responses

### `@repo/modules` — Power districts

- `powerDistricts/types.ts` — `PowerDistrict` interface
- `powerDistricts/usePowerDistricts.ts` — Composable for layout-level power district collection

### `@repo/ui` — Shared components

- Evolve `TrackPower.vue` — support N outputs (not just A/B)
- New `TrackOutputConfig.vue` — mode dropdown + cab address field per output row
- New `PowerDistrictCard.vue` — district name, device/output, power toggle

### `apps/server` — Server module

- New `src/modules/trackOutputs.ts`:
  - On device connect: read Firestore config → send track commands → verify with `<=>`
  - Parse `<p...>` responses → write power state to Firestore
  - DC auto-loco creation
- Update `src/lib/dcc.ts`:
  - Broadcast throttle/function commands to all connected DCC-EX devices
  - Route power commands to specific devices

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
| Device disconnects | Config retained in Firestore, power state cleared/stale |
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
