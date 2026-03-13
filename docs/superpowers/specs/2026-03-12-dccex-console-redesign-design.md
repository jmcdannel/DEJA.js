# DCC-EX Console Redesign — Design Spec

**Date:** 2026-03-12
**Scope:** Redesign the DCC-EX page in the Cloud app (`apps/cloud/src/DCCEX/`)
**Status:** Draft

---

## Overview

Replace the current DCC-EX page with a redesigned console featuring:

1. A hybrid retro/modern **LCD terminal display** showing live command station I/O
2. A **flat icon button grid** with 14 predefined DCC-EX commands
3. A **built-in command input** integrated into the LCD panel
4. A **dense cheat sheet** reference card for command syntax

Data flows through Firebase RTDB (not WebSocket) so the page works when the cloud app is deployed on Vercel.

---

## Page Layout

**Terminal Focus** — two-column layout:

- **Left (~75% width):** LCD terminal panel (full height)
- **Right (280px sidebar):** Command buttons + cheat sheet, stacked vertically

Responsive: on narrow viewports, sidebar stacks below the LCD.

---

## Component 1: LCD Terminal Display

### Visual Style — Hybrid (Modern + Retro)

- Dark green gradient background: `linear-gradient(180deg, #050a05, #0a120a)`
- Subtle scan line overlay: `repeating-linear-gradient` with low-opacity horizontal lines
- Green border: `2px solid #1a3a2a`
- Outer glow: `box-shadow: 0 0 40px rgba(74, 222, 128, 0.06)`
- Rounded corners: `border-radius: 12px`

### Header Bar

- Left: green status dot (live: `#4ade80` with glow, offline: `#ef4444`) + "DCC-EX Terminal" label
- Right: version string (dimmed, `#22543d`)
- Separated from body by a `1px solid rgba(74, 222, 128, 0.15)` border
- Connection status dot is driven by Firestore `layouts/{layoutId}.dccEx.isConnected`

### Log Body

Scrollable area (`min-height: 300px`, `max-height: 500px`, `overflow-y: auto`) displaying timestamped log entries. Auto-scrolls to bottom on new entries.

**Line types and colors:**

| Type | Color | Glow | Use |
|------|-------|------|-----|
| `cmd-out` | `#fbbf24` (amber) | amber glow | Commands sent by the user |
| `cmd-in` | `#4ade80` (green) | green glow | Responses from command station |
| `info` | `#86efac` (light green) | faint green | System info (WiFi, serial) |
| `error` | `#f87171` (red) | red glow | Error messages |
| `system` | `#2d6a4f` (dark green) | none | Status/ready messages |

Each line has:
- Timestamp prefix (dimmed `#22543d`, `font-size: 10px`)
- `>` prefix for outgoing commands
- Blinking cursor `_` on the last line

**Font:** `'Courier New', monospace`, `13px`, `line-height: 1.8`
**Text shadow:** Subtle per-color glow (`0 0 3px` at ~20% opacity)

### Command Input (built into LCD)

Integrated at the bottom of the LCD panel, separated by a faint border.

- Green prompt character `>`
- Text input (transparent background, green text, monospace)
- "Send" button (green outlined, uppercase, small)
- Submit on Enter key or Send button click
- Sends command via `useDcc().sendDccCommand({ action: 'dcc', payload: commandString })`
- The payload is the **inner command string without angle brackets** (e.g., `1`, `t 3 50 1`). The server's `send()` function wraps it in `<..>\n` automatically. The server's `validateDccCommand` rejects strings containing `<` or `>`.
- If the user types angle brackets, strip them before sending
- Clears input after send

---

## Component 2: Command Buttons

### Layout

Flat 2-column icon grid inside a glassmorphic card. No category headers — button colors communicate grouping. 14 buttons total.

### Glassmorphic Card Style

```
background: rgba(15, 23, 42, 0.55)
backdrop-filter: blur(6px)
border: 1px solid rgba(148, 163, 184, 0.18)
border-radius: 12px
padding: 14px
```

Panel title: "Commands" — `10px`, uppercase, `letter-spacing: 0.15em`, `#38bdf8`

### Button Style

Each button:
- Background: `#0d1117`
- Border: `1px solid` (color varies per button)
- Border radius: `8px`
- Padding: `10px 8px`
- Center-aligned icon (18px) + label (10px, font-weight 500)
- Hover: `translateY(-1px)` + lighter background tint

### Command List (14 buttons)

The "Serial Output" column shows what goes over the wire for reference. The actual payload sent via `sendDccCommand({ action: 'dcc', payload })` is the **inner string only** — no angle brackets. The server wraps automatically.

| # | Label | Icon | Payload (inner string) | Serial Output | Accent Color | Notes |
|---|-------|------|----------------------|---------------|-------------|-------|
| 1 | Power | `mdi-flash` | `1` / `0` | `<1>` / `<0>` | `#4ade80` green | Toggle — reads state from Firestore `dccEx.power` |
| 2 | Main Trk | `mdi-ray-start-arrow` | `1 MAIN` / `0 MAIN` | `<1 MAIN>` / `<0 MAIN>` | `#22d3ee` teal | One-shot (no reliable toggle state available) |
| 3 | Prog Trk | `mdi-cog` | `1 PROG` / `0 PROG` | `<1 PROG>` / `<0 PROG>` | `#a78bfa` purple | One-shot (no reliable toggle state available) |
| 4 | Join Trks | `mdi-link-variant` | `1 JOIN` | `<1 JOIN>` | `#86efac` light green | One-shot |
| 5 | E-Stop All | `mdi-alert-octagon` | `!` | `<!>` | `#f87171` red | Emergency — stops all locos immediately |
| 6 | Stop Loco | `mdi-stop` | `t {addr} 0 1` | `<t addr 0 1>` | `#fb923c` orange | Prompts for address, then sends stop |
| 7 | Status | `mdi-information-outline` | `s` | `<s>` | `#38bdf8` cyan | One-shot |
| 8 | Reset | `mdi-refresh` | `D RESET` | `<D RESET>` | `#fbbf24` amber | One-shot, confirm dialog |
| 9 | Turnouts | `mdi-call-split` | `T` | `<T>` | `#38bdf8` cyan | Lists all defined turnouts |
| 10 | Locos | `mdi-train` | `JR` | `<JR>` | `#38bdf8` cyan | Lists roster entries |
| 11 | Save | `mdi-content-save` | `E` | `<E>` | `#a78bfa` purple | One-shot |
| 12 | Outputs | `mdi-format-list-bulleted` | `Z` | `<Z>` | `#94a3b8` slate | Lists all defined outputs |
| 13 | Forget All | `mdi-delete-sweep` | `-` | `<->` | `#a78bfa` purple | Confirm dialog — forgets all locos |
| 14 | Read CV | `mdi-magnify` | `R {cv}` | `<R cv>` | `#a78bfa` purple | Prompts for CV number |

### Interaction Notes

- **Toggle button** (Power only): Reads on/off state from Firestore `layouts/{layoutId}.dccEx.power`. Visual toggle indicator (brighter border/glow when on). Sends `1` or `0` based on current state.
- **One-shot buttons** (Main Trk, Prog Trk, Join, E-Stop, Status, Turnouts, Locos, Save, Outputs): Send the command immediately on click. Main Trk and Prog Trk are one-shot because the server only writes a single `dccEx.power` boolean — it cannot distinguish per-track power state. These buttons could gain toggle behavior in a future enhancement if the server is extended to write `dccEx.powerMain` / `dccEx.powerProg`.
- **Prompt buttons** (Stop Loco, Read CV): Show a small inline input or `v-dialog` to collect the required parameter (address or CV number) before sending.
- **Confirm buttons** (Reset, Forget All): Show a `v-dialog` confirmation before executing.

---

## Component 3: Quick Reference Card

### Layout

Dense two-column grid inside a glassmorphic card (same card style as command buttons).

Panel title: "Command Cheat Sheet" — same style as command panel title.

### Content

| Command | Description |
|---------|-------------|
| `<1>` / `<0>` | power on/off |
| `<1 MAIN>` | main track on |
| `<1 PROG>` | prog track on |
| `<1 JOIN>` | join tracks |
| — divider — | |
| `<t a s d>` | throttle |
| `<F a f s>` | function |
| `<!>` | emergency stop |
| — divider — | |
| `<T i s>` | turnout |
| `<Z p s>` | output |
| — divider — | |
| `<s>` | status |
| `<D RESET>` | reset |
| `<E>` | save EEPROM |
| `<R cv>` | read CV |
| `<->` | forget locos |
| `<JR>` | list roster |

**Note:** The cheat sheet shows full wire format (with angle brackets) since it serves as a reference for the DCC-EX protocol. Users typing commands in the input can include or omit brackets — the input strips them before sending.

**Color coding:** Command syntax colored by category — green (power), amber (throttle/loco), purple (turnouts/outputs), cyan (system). Parameters shown in italic lighter color.

**Parameter legend** at bottom: `a=addr s=speed/state d=dir f=func i=idx p=pin cv=CV#`

**Font:** `'Courier New', monospace`, `11px` for commands, `10px` for descriptions.

---

## Component 4: Data Architecture

### New RTDB Path: `dccLog/{layoutId}`

The server writes command echoes and serial responses to this path. Each entry is a child with an auto-generated key.

**Entry schema (read shape):**

```typescript
interface DccLogEntry {
  type: 'cmd-out' | 'cmd-in' | 'info' | 'error' | 'system'
  message: string        // The raw command or response string
  timestamp: number      // Resolved serverTimestamp (milliseconds since epoch)
}
```

When writing entries, use `admin.database.ServerValue.TIMESTAMP` for the `timestamp` field. The `DccLogEntry` interface represents the resolved shape as read by clients.

### Server Changes

**File: `apps/server/src/lib/dcc.ts`**

1. **Log outgoing commands:** Inside the `send()` function, after a successful `serial.send()` call, push a `{ type: 'cmd-out', message: data, timestamp: ServerValue.TIMESTAMP }` entry to `dccLog/{layoutId}`.

2. **Log incoming serial responses:** Register a serial data listener via `serial.addDataListener()` (either in `dcc.ts` or in a new init function called during server startup). The listener receives parsed serial lines from the `ReadlineParser` in `serial.ts`. On each line, push `{ type: 'cmd-in', message: line, timestamp: ServerValue.TIMESTAMP }` to `dccLog/{layoutId}`.

3. **Log connection/status events:** On connect/disconnect/error events, push entries with type `info`, `error`, or `system` as appropriate.

4. **Pruning:** The cloud app client query uses `limitToLast(50)` so it only ever reads 50 entries. Server-side pruning can be deferred to a periodic cleanup or a follow-up task. If implemented eagerly, use a debounced check (e.g., every 10 writes) that queries `orderByChild('timestamp').limitToFirst(1)` and removes entries beyond a threshold count.

### Cloud App Changes

**New composable: `useDccLog(layoutId)`**

Uses the raw Firebase RTDB client SDK directly (consistent with how `useDcc.ts` already works — the cloud app does not have the VueFire database module registered):

```typescript
import { ref as vueRef, onUnmounted } from 'vue'
import { ref as dbRef, query, orderByChild, limitToLast, onValue } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'

export function useDccLog(layoutId: string) {
  const entries = vueRef<DccLogEntry[]>([])
  const logQuery = query(
    dbRef(rtdb, `dccLog/${layoutId}`),
    orderByChild('timestamp'),
    limitToLast(50)
  )
  const unsubscribe = onValue(logQuery, (snapshot) => {
    const result: DccLogEntry[] = []
    snapshot.forEach((child) => {
      result.push(child.val() as DccLogEntry)
    })
    entries.value = result
  })
  onUnmounted(unsubscribe)
  return { entries }
}
```

**Sending commands:** Continue using `useDcc().sendDccCommand({ action: 'dcc', payload: innerString })` which writes to `dccCommands/{layoutId}` — no change needed.

### Existing Paths (unchanged)

| Path | Direction | Purpose |
|------|-----------|---------|
| `dccCommands/{layoutId}` | OUT | Command queue (existing) |
| `layouts/{layoutId}.dccEx.power` | IN | Power state (existing, single boolean) |
| `layouts/{layoutId}.dccEx.isConnected` | IN | Connection state (existing) |

---

## File Structure

### New Files

```
apps/cloud/src/DCCEX/
├── DccExConsole.vue          # Page-level layout (grid, LCD + sidebar)
├── LcdTerminal.vue           # LCD display component (header, log body, input)
├── CommandGrid.vue           # 14-button flat icon grid
├── CommandCheatSheet.vue     # Dense reference card
└── composables/
    └── useDccLog.ts          # RTDB subscription for dccLog/{layoutId}
```

### Modified Files

```
apps/cloud/src/DCCEX/DCCEX.vue   # Update to import DccExConsole.vue instead of old components
apps/server/src/lib/dcc.ts        # Add RTDB writes to dccLog/{layoutId}
apps/server/src/lib/serial.ts     # Add data listener registration for logging (if not already exposed)
```

The router (`apps/cloud/src/router.ts`) continues importing `./DCCEX/DCCEX.vue` — no router change needed. `DCCEX.vue` becomes a thin wrapper that renders `<DccExConsole />`.

### Removed/Replaced Files

The entire `apps/cloud/src/DCCEX/Log/` subdirectory is replaced:
- `Log/DCCLog.vue` — log panel component
- `Log/DCCLogItem.vue` — individual log entry component
- `Log/DCCLogger.vue` — WebSocket listener
- `Log/useDccLog.ts` — WebSocket-based log composable
- `Log/constants.ts` — log message constants
- `Log/types.ts` — log types

Also replaced:
- `DCCCommand.vue` → functionality split between `CommandGrid.vue` and the input in `LcdTerminal.vue`

**Not removed:**
- `Core/UI/LcdDisplay.vue` is a shared component used by 11+ other files across the cloud app. It is NOT removed or modified — only the DCCEX-specific components that previously consumed it are replaced.

### Deprecated Exports

The `defaultCommands` export from `@repo/dccex/constants.ts` is no longer used by the redesigned console. It may be deprecated or removed in a follow-up if no other consumers exist. Do not remove it in this change.

---

## Styling

All components follow the DEJA.js design system:

- Dark mode first (`bg-[#020617]` page background)
- Glassmorphic cards for sidebar panels
- Hybrid retro LCD for the terminal (scan lines, green glow, monospace)
- Vuetify components where applicable (`v-btn`, `v-dialog` for confirms)
- Tailwind utilities for layout and spacing
- Transitions: `150ms ease` on hover, `300ms` on state changes
- MDI icons (`mdi-*`) via Vuetify for button icons

---

## Out of Scope

- WebSocket fallback for when running on local network (can be added later)
- CV programming wizard (Read CV button just sends the raw command)
- Serial port selection UI (handled elsewhere in the cloud app)
- Mobile-optimized layout (basic stacking is fine, no dedicated mobile design)
- Per-track power state tracking in Firestore (`dccEx.powerMain` / `dccEx.powerProg`) — can be added later to enable toggle behavior on Main Trk / Prog Trk buttons
- Server-side pruning of `dccLog` entries (client limits to 50 via query; pruning deferred)
