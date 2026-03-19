# DEJA CLI TUI Enhancements — Design Spec

**Date:** 2026-03-19
**Branch:** `feature/deja-cli-enhancements`
**Scope:** Bucket A — TUI Infrastructure (slash commands, device management, status bar, modular architecture)

---

## 1. Goal

Transform the DEJA TUI from a server monitor into a **device-centric control center** with:

- Modular file architecture (extracted from the monolithic `deja-ui-ink.mjs`)
- Slash command system with tab-completion (Claude Code-inspired UX)
- Device connection management (list, connect, disconnect — USB and MQTT)
- Persistent status bar showing connected devices and active throttle count
- Contextual keyboard hint bar that adapts per mode

### Out of Scope (Future Buckets)

- **Bucket B:** Toggle turnouts, toggle effects, throttle control from TUI
- **Bucket C:** Roster CRUD, cloud config management

These build on top of the infrastructure established here.

---

## 2. Architecture

### 2.1 File Structure

The monolithic `scripts/deja-ui-ink.mjs` (~885 lines) is split into focused modules:

```
scripts/
├── deja                          # Bash CLI (unchanged)
├── deja-ui-ink.mjs               # Entry point — imports App, calls render()
├── tui/
│   ├── App.mjs                   # Root component: mode routing, layout chrome
│   ├── commands/
│   │   ├── registry.mjs          # Command registry — register(), lookup(), complete(), list()
│   │   ├── server.mjs            # /restart, /stop, /start
│   │   ├── devices.mjs           # /devices, /connect, /disconnect
│   │   ├── tunnel.mjs            # /tunnel
│   │   ├── navigation.mjs        # /menu, /status, /ports, /logs
│   │   ├── tools.mjs             # /export, /filter, /help
│   │   └── index.mjs             # Registers all commands
│   ├── components/
│   │   ├── LogoHeader.mjs        # ASCII banner + version + startup tip
│   │   ├── LogPane.mjs           # Log viewer with filtering
│   │   ├── StatusBar.mjs         # Persistent bar: server | devices | throttles | tunnel
│   │   ├── HelpBar.mjs           # Contextual keyboard hints (changes per mode)
│   │   ├── HelpPanel.mjs         # Full keyboard shortcut overlay
│   │   ├── CommandInput.mjs      # Slash command input with tab-completion
│   │   ├── MenuOverlay.mjs       # Arrow-key navigation menu
│   │   ├── DeviceList.mjs        # Device list mode with connect/disconnect
│   │   ├── DeviceStatus.mjs      # Inline device chip for status bar
│   │   ├── PortSelector.mjs      # Serial port picker
│   │   ├── StatusPanel.mjs       # Detailed status view
│   │   ├── OnboardingScreen.mjs  # First-run welcome
│   │   └── ContextHintRow.mjs    # Ephemeral toast-style hint line
│   ├── hooks/
│   │   ├── useServerProcess.mjs  # Spawn/kill/restart server child process
│   │   ├── useTunnel.mjs         # Tunnel lifecycle (spawn/stop cloudflared)
│   │   ├── useFirebase.mjs       # Firebase Admin SDK init, exports db + rtdb refs
│   │   ├── useDevices.mjs        # Firestore listener: device list + connection state
│   │   ├── useThrottles.mjs      # Firestore listener: active throttle count
│   │   └── useLogger.mjs         # Log buffer, filtering, rotation, export
│   └── lib/
│       ├── config.mjs            # readConfig(), writeConfig(), DEJA_DIR, paths
│       ├── brand.mjs             # LOGO_LINES, LOGO_COLORS, STARTUP_TIPS
│       └── serial.mjs            # detectSerialPorts()
```

### 2.2 Extraction Rules

- **1:1 extraction** — every function and component already exists in the monolith. No behavior changes during extraction.
- New pieces are: `commands/registry.mjs`, `CommandInput.mjs`, `DeviceList.mjs`, `DeviceStatus.mjs`, `useFirebase.mjs`, `useDevices.mjs`, `useThrottles.mjs`, `devices.mjs` commands.
- The entry point `deja-ui-ink.mjs` becomes a thin wrapper: imports `App` from `tui/App.mjs` and calls `render()`.

---

## 3. Slash Command System

### 3.1 Command Registry (`commands/registry.mjs`)

Each command is a plain object:

```javascript
{
  name: 'connect',         // Primary name (used after /)
  aliases: ['c'],          // Short aliases
  description: 'Connect a device',
  usage: '/connect [device-name]',
  execute: (args, context) => { ... }
}
```

The registry exports:

| Function | Purpose |
|----------|---------|
| `register(command)` | Add a command to the map |
| `lookup(input)` | Find by name or alias, returns `{ command, args }` |
| `complete(partial)` | Returns matching command names for tab-completion |
| `list()` | Returns all commands (for `/help` output) |

The `context` object passed to `execute()` provides access to TUI state and actions:

```javascript
{
  addLog,           // Write to log pane
  showHint,         // Show ephemeral context hint
  transitionMode,   // Switch TUI mode
  spawnServer,      // Start server process
  stopServer,       // Stop server process
  toggleTunnel,     // Toggle cloudflare tunnel
  exportLogs,       // Export logs to file
  setLogFilter,     // Cycle log filter
  devices,          // Current device list (from useDevices)
  connectDevice,    // Push connect command to RTDB
  disconnectDevice, // Push disconnect command to RTDB
}
```

### 3.2 V1 Commands

| Command | Aliases | Action |
|---------|---------|--------|
| `/help` | `/h`, `/?` | Show all commands with descriptions |
| `/start` | | Start server |
| `/stop` | `/quit`, `/exit` | Stop server & exit |
| `/restart` | `/r` | Restart server |
| `/devices` | `/d` | Open device list mode |
| `/connect` | `/c` | Connect device (opens list if no arg) |
| `/disconnect` | `/dc` | Disconnect device |
| `/tunnel` | `/t` | Toggle tunnel |
| `/status` | `/s` | Open status panel |
| `/ports` | `/p` | Open port selector |
| `/menu` | `/m` | Open menu |
| `/logs` | `/l` | Back to log view |
| `/filter` | `/f` | Cycle log filter (all → error → warn) |
| `/export` | `/e` | Export logs to file |

### 3.3 CommandInput Component

Replaces the current bare `> ▌` input line:

- Typing `/` activates **command mode** — text renders in cyan
- **Tab** cycles through matching completions (e.g. `/co` Tab → `/connect`)
- A dim ghost shows the top completion inline: `/con`<dim>`nect`</dim>
- **Enter** executes the command via `registry.lookup()` then `command.execute()`
- **Esc** clears the input
- Non-`/` text is passed through (available for future freeform input use)

---

## 4. Device Connection

### 4.1 Device List Mode

A new TUI mode (`mode === 'devices'`) with arrow-key navigation:

```
┌──────────────────────────────────────────────────┐
│  DEJA Devices                                    │
│  ────────────────────────────────────────────    │
│                                                  │
│  ▸ ● DCC-EX CommandStation      /dev/ttyUSB0    │
│    ○ DEJA Arduino (MEGA)        /dev/ttyACM0    │
│    ○ DEJA MQTT (Pico W)         topic: turnouts │
│    ○ DEJA LED Arduino           (no port)       │
│                                                  │
│  [↑↓] navigate  [Enter] connect  [p] port       │
│  [Esc] back                                      │
└──────────────────────────────────────────────────┘
```

- **Data source:** `useDevices` hook listening to Firestore `layouts/{layoutId}/devices`
- **● green** = connected (`isConnected: true`), **○ dim** = disconnected
- **Enter** on disconnected USB device → if `device.port` is set, writes connect command to RTDB; if no port, opens port selector for that device first
- **Enter** on disconnected MQTT device → writes connect command with `device.topic` (no port needed)
- **Enter** on connected device → writes disconnect command
- **`p`** on any USB device → opens port selector scoped to that device

### 4.2 Command Path

The TUI does NOT connect directly to serial ports or MQTT. It writes to Firebase RTDB, and the server handles the actual connection — just like the web apps:

```
TUI writes → dejaCommands/{layoutId}   (RTDB push)
                    ↓
Server listener → handleDejaCommands()
                    ↓
connectDevice() or disconnectDevice()   (apps/server/src/modules/layout.ts)
                    ↓
Firestore update → layouts/{layoutId}/devices/{id}.isConnected
                    ↓
TUI's useDevices listener fires → UI updates automatically
```

**No server-side changes are required.** The server already handles `connect`, `disconnect`, `listPorts`, and `getStatus` commands via the RTDB queue (`apps/server/src/lib/deja.ts`).

### 4.3 Connect/Disconnect via Slash Commands

- `/connect` with no args → opens device list mode (same as `/devices`)
- `/connect dccex` → looks up device by ID or name, writes connect command directly
- `/disconnect dccex` → writes disconnect command for that device

---

## 5. Status Bar

### 5.1 Layout

The persistent `StatusBar` component at the bottom of every mode:

```
● running  pid 12345  uptime 00:15:32  ⬡ 2/4 devices  🚂 3 throttles  🔒 wss://ws.dejajs.com
```

| Segment | Source | Display |
|---------|--------|---------|
| Server state | `useServerProcess` | `● running` / `○ stopped` (green/red) |
| PID | `useServerProcess` | `pid 12345` |
| Uptime | `useServerProcess` | `uptime HH:MM:SS` |
| Devices | `useDevices` | `⬡ {connected}/{total} devices` |
| Throttles | `useThrottles` | `🚂 {count} throttles` (only shown when > 0) |
| Serial port | Config file | `⬡ /dev/ttyUSB0` (existing, kept) |
| Tunnel | `useTunnel` | `🔒 {url}` (only shown when active) |

### 5.2 Data Sources

**`useDevices.mjs`:**
- Firestore `onSnapshot` on `layouts/{layoutId}/devices`
- Returns `{ devices, connectedCount, totalCount }`
- Each device exposes a **subset** of the full `Device` interface (see `packages/modules/layouts/types.ts`): `{ id, name, type, connection, port, topic, isConnected }` — additional fields like `autoConnect`, `client`, `config`, `strips`, `tags` are available on the raw Firestore doc but not surfaced in the TUI initially

**`useThrottles.mjs`:**
- Firestore `onSnapshot` on `layouts/{layoutId}/throttles`
- Returns `{ throttleCount }`
- Counts active documents — minimal overhead

---

## 6. Contextual HelpBar

The `HelpBar` component shows different hints depending on the current TUI mode:

| Mode | HelpBar content |
|------|-----------------|
| `logs` | `/ commands  [r]estart  [s]top  [t]unnel  [?]help` |
| `menu` | `[↑↓] navigate  [Enter] select  [Esc] back` |
| `devices` | `[↑↓] navigate  [Enter] connect  [p] port  [Esc] back` |
| `ports` | `[↑↓] navigate  [Enter] save  [Esc] back` |
| `status` | `[Esc] back to logs` |

Leading with `/ commands` in log mode is the discoverability hook for the slash command system.

**Deliberate change from existing HelpBar:** The current logs-mode HelpBar shows all shortcuts: `[r]estart  [s]top  [t]unnel  [l]filter  [e]xport  [m]enu  [?]help`. The new version drops `[l]filter`, `[e]xport`, and `[m]enu` to make room for `/ commands` — those actions are still available via their hotkeys AND as slash commands (`/filter`, `/export`, `/menu`). The reduced HelpBar prioritizes discoverability of the slash command system over listing every shortcut.

### 6.1 Hotkey and Slash Command Coexistence

Single-key shortcuts (`r`, `s`, `t`, `l`, `e`, `m`, `?`) remain active in logs mode **only when the input buffer is empty**. Once the user starts typing (any character), all keystrokes go to the input buffer. Pressing **Esc** clears the input and returns to hotkey mode. Typing `/` as the first character activates command mode (cyan text, tab-completion). This mirrors the current behavior where hotkeys are checked first (line 770–779) and text input is the fallback (line 782–791).

---

## 7. Firebase Integration

### 7.1 SDK Choice

**Firebase Admin SDK** (`firebase-admin`) — same as the server. The TUI runs on the same machine with the same env vars. Admin SDK bypasses Firestore security rules, so no auth ceremony is needed.

### 7.2 `useFirebase.mjs`

- Initializes Firebase Admin SDK by **inlining the init logic** (similar to `packages/firebase-config/src/firebase-admin-node.ts`). Cannot import `@repo/firebase-config` directly because `scripts/` is outside the workspace build system — no bundler, no TypeScript, no workspace resolution.
- Reads the following env vars from `~/.deja/.env` (already loaded by `loadEnvFile()`):
  - `VITE_FIREBASE_PROJECT_ID` — Firebase project ID
  - `VITE_FIREBASE_DATABASE_URL` — Realtime Database URL
  - `FIREBASE_CLIENT_EMAIL` — Service account client email
  - `FIREBASE_PRIVATE_KEY` — Service account private key
- Exports: `db` (Firestore instance), `rtdb` (Realtime Database reference), `layoutId` (from `config.json`)

### 7.3 Dependencies

- `firebase-admin` must be **added to `scripts/package.json`** as a new dependency. The current `scripts/package.json` only has `figlet`, `ink`, and `react`. pnpm's strict isolation means `firebase-admin` is not resolvable from `scripts/` even though it exists in other workspace packages. Run `pnpm --filter=deja-scripts add firebase-admin` to install.

### 7.4 Writing Commands to RTDB

To trigger device actions, the `payload` field must be a **JSON string** (not a raw object) because the server's `handleDejaCommands()` calls `JSON.parse(payload)`. The `device` field is the **device ID string** (not the full device object):

```javascript
// Push to dejaCommands/{layoutId}
rtdb.ref(`dejaCommands/${layoutId}`).push({
  action: 'connect',
  payload: JSON.stringify({ device: deviceId, serial: port }),
  timestamp: admin.database.ServerValue.TIMESTAMP
})
```

This matches the web app pattern in `packages/deja/useDejaJS.ts`.

---

## 8. Menu Updates

The existing `MENU_ITEMS` array gains a new entry:

```javascript
const MENU_ITEMS = [
  { label: 'Start Server',       action: 'start'   },
  { label: 'Stop Server',        action: 'stop'    },
  { label: 'Restart Server',     action: 'restart' },
  { label: 'Devices',            action: 'devices' },  // 🆕
  { label: 'Status Panel',       action: 'status'  },
  { label: 'Select Serial Port', action: 'ports'   },
  { label: 'Toggle Tunnel',      action: 'tunnel'  },
  { label: 'Export Logs',        action: 'export'  },
]
```

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Firebase Admin SDK adds startup latency | Initialize lazily — only connect when first Firestore query is needed |
| Firestore listeners keep the TUI process alive after server stops | Each hook (`useDevices`, `useThrottles`) stores the `onSnapshot` unsubscribe function and calls it in a `useEffect` cleanup return. `useFirebase` exports a `cleanup()` function that terminates the Admin SDK app. The top-level unmount effect in `App.mjs` calls all cleanup functions. |
| Tab-completion conflicts with Ink's input handling | `useInput` already captures all keys; Tab is just another key event |
| Module extraction introduces regressions | Extract first with zero behavior changes, then add new features |
| TUI started before server (no Firebase data) | `useDevices` and `useThrottles` return empty defaults (`[]`, `0`) until listeners fire. UI renders gracefully with "0/0 devices" |
| `layoutId` not set in `config.json` | `useFirebase` checks for `layoutId` before creating listeners. If missing, Firebase hooks are no-ops and status bar shows "no layout" |
| Firebase unreachable (offline/network failure) | Admin SDK `onSnapshot` has error callbacks. Hooks set an `error` state, status bar shows `⬡ -- devices` instead of counts. No crash. |

---

## 10. Verification Smoke Tests

Each implementation step has a quick smoke test to confirm it works:

| Step | Smoke Test |
|------|------------|
| 1. Extract modules | Run `node scripts/deja-ui-ink.mjs` — TUI should look and behave identically to before |
| 2. Command registry | Type `/help` in the input — should list all registered commands |
| 3. CommandInput | Type `/re` then Tab — should complete to `/restart`. Execute it. |
| 4. Firebase hooks | Check status bar shows `⬡ 0/N devices` and `🚂 0 throttles` (or actual counts if layout has data) |
| 5. Status bar | Start a throttle in the web app — TUI status bar count should update in real time |
| 6. Device list | Type `/devices` — should show all layout devices with correct connection status |
| 7. Device commands | `/connect dccex` with a serial port configured — server should connect, status updates to ● |
| 8. HelpBar | Switch between modes — HelpBar content should change per the table in Section 6 |

---

## 11. Implementation Order

1. **Extract modules** — split monolith into `tui/` structure, verify TUI works identically
2. **Command registry** — build `registry.mjs`, wire up existing hotkey actions as slash commands
3. **CommandInput** — replace bare input with slash-aware input + tab-completion
4. **Firebase hooks** — `useFirebase`, `useDevices`, `useThrottles`
5. **Status bar** — add device count + throttle count to `StatusBar`
6. **Device list mode** — `DeviceList` component + connect/disconnect flow
7. **Device commands** — `/devices`, `/connect`, `/disconnect`
8. **HelpBar** — contextual hints per mode
