# DEJA TUI Feature-Complete Rebuild

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the DEJA.js TUI from scratch — a terminal UI that manages the DEJA.js server, Cloudflare tunnels, Firebase device connections, and real-time log streaming.

**Architecture:** React 18 + Ink 5 terminal UI. Modular `scripts/tui/` directory with `lib/` (pure functions), `components/` (UI), `hooks/` (stateful logic), `commands/` (slash command registry). The TUI must be flicker-free: minimize re-renders through memoization, refs for cross-render reads, debounced state updates, and isolated component state.

**Tech Stack:** React 18, Ink 5, Firebase Admin SDK (Firestore + RTDB), Node.js ESM (.mjs), figlet (ASCII art)

**Reference:** The existing TUI at `scripts/tui/` is the feature-complete reference implementation. Read it for behavior details but do NOT copy code — rebuild from scratch with clean architecture.

---

## Anti-Flicker Architecture Requirements

Ink 5 redraws the entire terminal on every React state change. These constraints are non-negotiable:

1. **No per-render disk I/O** — Config reads must be cached in refs, not called every render
2. **Debounced log flushing** — Buffer log lines in a ref; flush to state after a quiet period (200ms). Never call `setLogLines` per-line
3. **Stable callback identities** — All callbacks passed as props or used in effects must have stable references (useCallback with minimal deps). Break closure dependencies by reading from refs
4. **Memoize computed values** — Filtered log lines, padding counts, divider strings, layout dimensions — all must be `useMemo`'d
5. **Isolate input state** — Keystroke state must live inside CommandInput (not App). App reads input via ref. Keystrokes must NOT cause App re-renders
6. **Isolate timer state** — Uptime tickers must be self-contained components with their own intervals, not state in App or hooks
7. **All leaf components must be `React.memo`** — LogPane, StatusBar, HelpBar, CommandInput, MenuOverlay, PortSelector, DeviceList, StatusPanel, OnboardingScreen, LogoHeader, HelpPanel, ContextHintRow
8. **Stable terminal dimensions** — Read `stdout.columns`/`stdout.rows` once into state, update only on `resize` event. Do NOT read from `stdout` on every render
9. **Log lines as objects** — Each log line is `{ id, text }` with a monotonic ID counter. This gives React stable keys instead of array indices
10. **Snapshot deduplication** — Firestore listeners must fingerprint incoming data and skip `setState` if nothing changed

---

## File Structure

```
scripts/
├── deja-ui-ink.mjs                    # Entry point: import App, render with Ink
└── tui/
    ├── App.mjs                        # Root component: mode routing, keyboard input, layout
    ├── lib/
    │   ├── config.mjs                 # loadEnvFile(), readConfig(), writeConfig(), isFirstRun(), path constants
    │   ├── brand.mjs                  # LOGO_LINES, LOGO_COLORS, STARTUP_TIPS, MENU_ITEMS
    │   ├── serial.mjs                 # detectSerialPorts(), getPlan(), isPaidPlan(), hasCloudflared()
    │   └── helpers.mjs                # getVersion(), formatUptime(), ts(), checkPort(), getLogLineColor(), getLogLineDim()
    ├── components/
    │   ├── LogoHeader.mjs             # ASCII logo with gradient colors + version + random tip
    │   ├── HelpPanel.mjs              # Keyboard shortcut overlay (toggled with ?)
    │   ├── LogPane.mjs                # Scrollable log viewer with severity coloring
    │   ├── ContextHintRow.mjs         # Ephemeral hint line (auto-clears after 5s)
    │   ├── StatusBar.mjs              # Footer: status, pid, uptime, devices, throttles, tunnel
    │   ├── HelpBar.mjs                # Mode-specific keyboard hint line
    │   ├── MenuOverlay.mjs            # Centered bordered menu with arrow navigation
    │   ├── PortSelector.mjs           # Serial port picker with current port indicator
    │   ├── DeviceList.mjs             # Device list with connection status and controls
    │   ├── StatusPanel.mjs            # Full-screen status/connection info panel
    │   ├── OnboardingScreen.mjs       # First-run welcome screen
    │   └── CommandInput.mjs           # Slash command input with tab completion and ghost text
    ├── hooks/
    │   ├── useLogger.mjs              # Log buffer, filtering, hints, export
    │   ├── useServerProcess.mjs       # Server spawn/stop/restart lifecycle
    │   ├── useTunnel.mjs              # Cloudflare tunnel lifecycle
    │   ├── useFirebase.mjs            # Firebase Admin SDK singleton init
    │   ├── useDevices.mjs             # Firestore device list listener
    │   └── useThrottles.mjs           # Firestore throttle count listener
    └── commands/
        ├── registry.mjs               # Command map: register(), lookup(), complete(), list()
        ├── server.mjs                 # /start, /stop, /restart
        ├── tunnel.mjs                 # /tunnel
        ├── navigation.mjs            # /menu, /status, /ports, /logs
        ├── tools.mjs                  # /help, /filter, /export
        ├── devices.mjs                # /devices, /connect, /disconnect
        └── index.mjs                  # registerAllCommands() barrel
```

---

## Task 1: Entry Point & Minimal Shell

Build the minimum viable TUI — an Ink app that renders to the terminal with a logo and exits cleanly on Ctrl+C.

**Files:** `scripts/deja-ui-ink.mjs`, `scripts/tui/App.mjs`, `scripts/tui/lib/config.mjs`, `scripts/tui/lib/brand.mjs`, `scripts/tui/lib/helpers.mjs`, `scripts/tui/components/LogoHeader.mjs`

### Features

- [ ] **Entry point** (`scripts/deja-ui-ink.mjs`) is a thin script (~5 lines): imports App, renders with `ink`'s `render()`, sets `exitOnCtrlC: false` (custom Ctrl+C handler)
- [ ] **Environment loading** — `loadEnvFile()` reads `~/.deja/.env` at module scope before any React code runs. Sets env vars only if not already set. Skips comments and empty lines
- [ ] **Path constants** — All paths derived from `~/.deja/`: `DEJA_DIR`, `ENTRY` (server/index.js), `VERSION_FILE`, `CONFIG_FILE`, `LOG_DIR`, `TUNNEL_PID_FILE`, `TUNNEL_URL_FILE`, `CLOUDFLARED_YML`
- [ ] **Config helpers** — `readConfig()` reads `~/.deja/config.json` (returns `{}` on error), `writeConfig(updates)` merges into existing, `isFirstRun()` checks `!config.onboardingComplete`
- [ ] **ASCII logo** — Generated via `figlet` with "ANSI Shadow" font for the text "DEJA". 6 lines, gradient colors: `#00FFFF`, `#00E0FF`, `#00C4FF`, `#00A8FF`, `#0090FF`, `#007FFF`. Below logo: dim version text + random startup tip in cyan
- [ ] **Startup tips** — 10 tips randomly selected on each launch (see brand.mjs in existing code for the full list)
- [ ] **Version** — Read from `~/.deja/server/version.txt`, fallback to `'dev'`
- [ ] **Ctrl+C handler** — Custom handler in `useInput`: logs "Stopping...", kills server, kills tunnel, exits after 400ms delay
- [ ] **Terminal dimensions** — Read `stdout.columns` and `stdout.rows` once into state. Listen for `resize` event to update. Never re-read from stdout on renders

### Verification
- [ ] `node scripts/deja-ui-ink.mjs` launches, shows logo with gradient colors and a tip
- [ ] Ctrl+C exits cleanly
- [ ] No visible flicker on idle (30s test)

### Commit
```bash
git commit -m "feat(tui): scaffold entry point with logo, config, and clean exit"
```

---

## Task 2: Logging System

Real-time log streaming with debounced rendering, severity coloring, filtering, contextual hints, and export.

**Files:** `scripts/tui/hooks/useLogger.mjs`, `scripts/tui/components/LogPane.mjs`, `scripts/tui/components/ContextHintRow.mjs`

### Features

- [ ] **Log line format** — Each line is `{ id: number, text: string }` with a monotonic ID counter. Text is prefixed with `[HH:MM:SS]` timestamp
- [ ] **Debounced flushing** — `addLog(text)` writes to a buffer ref. A 200ms debounce timer flushes the buffer to React state. Rapid server output batches into a single re-render
- [ ] **Max 500 lines** — Older lines are rotated out when the buffer exceeds 500
- [ ] **Noise filtering** — Strip stack trace lines (`^\s+at\s`), error metadata lines (`^\s+(code|errno|syscall|address|port):`), and bare braces (`^\s*[{}]\s*$`)
- [ ] **Multi-line splitting** — Input text is split on `\n`, empty lines filtered, each surviving line becomes a separate log entry
- [ ] **EADDRINUSE detection** — When log text contains "EADDRINUSE", extract the port number and replace with a friendly one-liner: `⚠ Port {N} already in use — is another server running?`. Also show a hint
- [ ] **Severity coloring** — Red for ERROR/FATAL, yellow for WARN, green for SUCCESS/LISTEN/CONNECTED, dimmed for DEBUG/VERBOSE, default for everything else
- [ ] **Log filtering** — Three modes cycling `all → error → warn → all`. When filter is active, LogPane shows a header: `── showing {filter} logs only ──`
- [ ] **Contextual hints** — Auto-clearing messages shown for 5 seconds. Triggered by: tunnel connection, EADDRINUSE, FATAL errors, server failures. Display format: `▸ {hint}` in cyan. Always occupies 1 line (blank space when no hint) for layout stability
- [ ] **Log export** — Writes all lines (including unflushed buffer) to `~/.deja/logs/export-{timestamp}.txt`. Shows hint with filename on success, error message on failure
- [ ] **LogPane rendering** — Fixed height computed from terminal rows minus chrome. Padding lines fill empty space above log content. Each line uses `line.id` as React key. Line wrapping: `truncate`
- [ ] **LogPane and ContextHintRow wrapped in `React.memo`**

### Verification
- [ ] Multi-line server output appears as separate timestamped lines
- [ ] No re-render flicker during rapid log output
- [ ] Filter cycling works (press `l`): header appears, only matching lines shown
- [ ] Stack traces and noise lines are stripped
- [ ] Export creates a file at the expected path

### Commit
```bash
git commit -m "feat(tui): logging system with debounced flush, filtering, and export"
```

---

## Task 3: Server Process Management

Spawn, stop, and restart the DEJA.js Node.js server as a child process with lifecycle tracking.

**Files:** `scripts/tui/hooks/useServerProcess.mjs`

### Features

- [ ] **Status states** — `'starting'` → `'running'` (on spawn event) → `'stopped'` (on close/error)
- [ ] **Pre-flight checks** — Before spawning: verify server exists at `~/.deja/server/index.js` (abort with log message if not), verify WebSocket port is free (async port check — abort with hint if in use)
- [ ] **Spawn** — `spawn('node', [ENTRY], { cwd: DEJA_DIR, env: { ...process.env, FORCE_COLOR: '1' }, stdio: ['ignore', 'pipe', 'pipe'] })`. Set `FORCE_COLOR: '1'` to preserve colored output from the server's logger. Pipe stdout and stderr to `addLog()`
- [ ] **`spawnServer` is async** — The port check is awaited internally. Call sites fire-and-forget (`spawnServer()` without `await`). The function handles its own error cases internally
- [ ] **PID tracking** — Set PID state on spawn, clear on close
- [ ] **Start time tracking** — Record `Date.now()` on spawn. Used by StatusBar for uptime display. Use a ref to avoid making `spawnServer` depend on `startTime` state
- [ ] **Failure detection** — On close with non-zero exit code: if uptime < 5 seconds → "Server failed to start" message + hint; if uptime ≥ 5 seconds → "Server exited unexpectedly" message + hint
- [ ] **Clean exit** — On close with code 0 or null → "Server stopped." message
- [ ] **Restart** — Kill current process with SIGTERM, clear `childRef.current = null`, set status to 'starting', spawn new process after 800ms delay. Does NOT manage tunnel lifecycle (App handles that via effects)
- [ ] **Cleanup** — Kill child process on unmount
- [ ] **Stable `spawnServer` identity** — Must not depend on `startTime` state. Use a ref to read startTime in the close handler

### Verification
- [ ] Server spawns on launch, PID appears in status bar
- [ ] Restart kills old process, spawns new one after brief delay
- [ ] "Server not found" message when `~/.deja/server/index.js` doesn't exist
- [ ] Port-in-use detection works when another server is running
- [ ] Fast failure (< 5s) shows different message than crash (> 5s)

### Commit
```bash
git commit -m "feat(tui): server process management with lifecycle tracking"
```

---

## Task 4: Tunnel Management

Spawn and manage Cloudflare tunnels (named or temporary) with auto-start/stop tied to server lifecycle.

**Files:** `scripts/tui/hooks/useTunnel.mjs`, `scripts/tui/lib/serial.mjs`

### Features

- [ ] **Plan gating** — Only spawn if `isPaidPlan()` returns true (engineer or conductor subscription). Plan read from `~/.deja/config.json` → `subscription.plan`
- [ ] **Cloudflared detection** — Check if `cloudflared` binary exists via `which`. Show install hint if not found
- [ ] **Named tunnel priority** (in order):
  1. `CLOUDFLARE_TUNNEL_TOKEN` env var → use `cloudflared tunnel run --token {token}`
  2. `CLOUDFLARE_TUNNEL_NAME` env var → use `cloudflared tunnel run {name}`
  3. `~/.deja/cloudflared.yml` exists → use `cloudflared tunnel --config {path} run`
  4. Fallback: temporary tunnel → `cloudflared tunnel --url http://localhost:{wsPort}`
- [ ] **URL detection** — Parse stderr for URL. Temporary: regex match `https://...trycloudflare.com`. Named: detect "Registered tunnel connection" → set URL to `wss://ws.dejajs.com`
- [ ] **URL dedup** — Use a ref to track whether URL has been set. Prevent duplicate "Named tunnel connected" messages. Remove `tunnelUrl` from `spawnTunnel` dependency array
- [ ] **Persistent files** — Write PID to `~/.deja/tunnel.pid`, URL to `~/.deja/tunnel.url`. Clear both on stop
- [ ] **Toggle** — If running: stop and show "Tunnel stopped." hint. If stopped: spawn and show "Starting tunnel..." hint
- [ ] **Auto-lifecycle** (in App.mjs) — When server status changes to `'running'` → auto-spawn tunnel. When server status changes to `'stopped'` → auto-stop tunnel
- [ ] **Serial port detection** — `detectSerialPorts()` reads `/dev/` directory, filters for USB/ACM/serial devices, returns sorted list

### Verification
- [ ] Tunnel auto-starts when server reaches 'running' status
- [ ] Tunnel auto-stops when server stops
- [ ] Toggle command starts/stops tunnel manually
- [ ] Named tunnel shows `wss://ws.dejajs.com` in status bar
- [ ] Temporary tunnel shows `https://...trycloudflare.com` URL

### Commit
```bash
git commit -m "feat(tui): Cloudflare tunnel management with auto-lifecycle"
```

---

## Task 5: Firebase Integration

Real-time device list and throttle counts from Firestore, plus device connect/disconnect commands via RTDB.

**Files:** `scripts/tui/hooks/useFirebase.mjs`, `scripts/tui/hooks/useDevices.mjs`, `scripts/tui/hooks/useThrottles.mjs`

### Features

- [ ] **Firebase singleton** — Initialize Firebase Admin SDK once at module scope. Credentials from env vars: `VITE_FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `VITE_FIREBASE_DATABASE_URL`. Gracefully handle missing credentials (return null db/rtdb)
- [ ] **Layout ID** — Read from `~/.deja/config.json` → `layoutId`, fallback to `LAYOUT_ID` env var. Cache the config read in a ref (don't read from disk every render)
- [ ] **Re-export `ServerValue`** — Used by connect/disconnect commands for `ServerValue.TIMESTAMP`
- [ ] **Device listener** — Firestore `onSnapshot` on `layouts/{layoutId}/devices`. Returns array of `{ id, ...doc.data() }` objects. Track `connectedCount` (devices with `isConnected` or `connected` === true) and `totalCount`
- [ ] **Snapshot deduplication** (devices) — Fingerprint each snapshot by device IDs + connection states + ports + topics. Skip `setDevices` if fingerprint is unchanged
- [ ] **Throttle listener** — Firestore `onSnapshot` on `layouts/{layoutId}/throttles`. Track `throttleCount` (snapshot.size). Skip state update if count unchanged
- [ ] **Error state** — Both `useDevices` and `useThrottles` expose an `error` state for Firestore listener failures (currently not rendered, but useful for debugging)
- [ ] **Guard clauses** — All hooks no-op if `db` or `layoutId` is null
- [ ] **Cleanup** — Unsubscribe Firestore listeners on unmount. Delete Firebase app on unmount
- [ ] **Connect device** (in App.mjs) — Push to RTDB `dejaCommands/{layoutId}`: `{ action: 'connect', payload: JSON.stringify({ device: id, topic|serial }), timestamp: ServerValue.TIMESTAMP }`
- [ ] **Disconnect device** (in App.mjs) — Push to RTDB `dejaCommands/{layoutId}`: `{ action: 'disconnect', payload: JSON.stringify({ device: id }), timestamp: ServerValue.TIMESTAMP }`

### Verification
- [ ] TUI launches without errors when Firebase credentials are missing
- [ ] Device count appears in status bar when connected to Firebase
- [ ] Throttle count appears in status bar
- [ ] Counts update in real-time when devices connect/disconnect or throttles change
- [ ] No flicker from unchanged Firestore snapshots

### Commit
```bash
git commit -m "feat(tui): Firebase device and throttle listeners with snapshot dedup"
```

---

## Task 6: Status Bar & Footer Chrome

Persistent footer showing server status, PID, uptime, device counts, throttle counts, and tunnel URL.

**Files:** `scripts/tui/components/StatusBar.mjs`, `scripts/tui/components/HelpBar.mjs`

### Features

- [ ] **StatusBar layout** (left to right): status icon (●/○), status text, PID, uptime, device count, throttle count, tunnel URL
- [ ] **Status colors** — Green (running), red (stopped), yellow (starting)
- [ ] **Uptime display** — Format: `HH:MM:SS`. Updates every 1 second. **Must be a separate self-contained component** with its own `useEffect` interval — NOT state in App or the hook. This prevents uptime ticks from re-rendering App
- [ ] **Device count** — `⬡ {connected}/{total} devices`. Cyan when connected > 0, dimmed otherwise. Only shown when totalCount > 0
- [ ] **Throttle count** — `🚂 {count} throttles`. Cyan color. Only shown when count > 0
- [ ] **Tunnel URL** — `🔒 {url}`. Dimmed
- [ ] **HelpBar** — Single-line contextual hints that change per TUI mode:
  - `logs`: `/ commands  [r]estart  [s]top  [t]unnel  [?]help`
  - `menu`: `[↑↓] navigate  [Enter] select  [Esc] back`
  - `devices`: `[↑↓] navigate  [Enter] connect  [p] port  [Esc] back`
  - `ports`: `[↑↓] navigate  [Enter] save  [Esc] back`
  - `status`: `[Esc] back to logs`
- [ ] **Both components wrapped in `React.memo`**
- [ ] **Divider lines** — `─` repeated to terminal width. Memoized (`useMemo` on `cols`)

### Verification
- [ ] Status bar shows all expected fields
- [ ] Uptime ticks every second without causing App re-renders
- [ ] HelpBar changes when switching between modes
- [ ] No flicker during idle with uptime ticking

### Commit
```bash
git commit -m "feat(tui): StatusBar with device/throttle counts and contextual HelpBar"
```

---

## Task 7: Slash Command System

Command registry with tab completion, ghost text preview, and all 14 commands.

**Files:** `scripts/tui/commands/registry.mjs`, `scripts/tui/commands/server.mjs`, `scripts/tui/commands/tunnel.mjs`, `scripts/tui/commands/navigation.mjs`, `scripts/tui/commands/tools.mjs`, `scripts/tui/commands/devices.mjs`, `scripts/tui/commands/index.mjs`, `scripts/tui/components/CommandInput.mjs`

### Features

#### Registry
- [ ] **Command registration** — `register(command)` stores command by name and all aliases
- [ ] **Lookup** — `lookup(input)` strips leading `/`, splits on whitespace, resolves name → command, returns `{ command, args }` or null
- [ ] **Tab completion** — `complete(partial)` returns sorted list of matching command names (deduplicated, no aliases in results)
- [ ] **List** — `list()` returns all unique commands (deduplicated)

#### Commands

| Command | Aliases | Description | Behavior |
|---------|---------|-------------|----------|
| `/start` | — | Start the server | Spawn server if not running; hint if already running |
| `/stop` | `quit`, `exit` | Stop server & exit | Log "Stopping...", kill server, kill tunnel, exit after 400ms |
| `/restart` | `r` | Restart server | Kill + respawn with 800ms delay |
| `/tunnel` | `t` | Toggle tunnel | Start if stopped, stop if running |
| `/menu` | `m` | Open menu | Transition to menu mode |
| `/status` | `s` | Status panel | Transition to status mode |
| `/ports` | `p` | Port selector | Transition to ports mode |
| `/logs` | `l` | Back to logs | Transition to logs mode |
| `/help` | `h`, `?` | Show commands | Print all commands with aliases and descriptions to log |
| `/filter` | `f` | Cycle log filter | Cycle all → error → warn → all |
| `/export` | `e` | Export logs | Write logs to `~/.deja/logs/export-{ts}.txt` |
| `/devices` | `d`, `io`, `iodevices` | Device list | Transition to devices mode |
| `/connect` | `c` | Connect device | `/connect <name>` — find device, push RTDB connect command. If already connected, shows hint. If no argument, transitions to devices mode |
| `/disconnect` | `dc` | Disconnect device | `/disconnect <name>` — find device, push RTDB disconnect command. If not connected, shows hint. If no argument, shows usage hint |

#### CommandInput Component
- [ ] **Owns its own state** — Input text lives inside CommandInput, NOT in App. App reads text via ref (`useImperativeHandle`/`forwardRef`)
- [ ] **Ref API**: `getText()`, `handleTab()`, `handleChar(c)`, `handleBackspace()`, `handleClear()`
- [ ] **Visual rendering** — Prompt `> ` in cyan, input text (cyan when starts with `/`), ghost text (dimmed completion preview), cursor block `▌` in cyan
- [ ] **Tab completion** — When input starts with `/`, Tab cycles through matching command names. Ghost text shows remainder of top match
- [ ] **Wrapped in `React.memo`**

#### Command Object Shape
Each command: `{ name, aliases, description, usage, execute(args, ctx) }`

#### Command Context
All commands receive a context object with: `addLog`, `showHint`, `transitionMode`, `spawnServer`, `stopServer`, `restartServer`, `setStatus`, `childRef`, `toggleTunnel`, `tunnelCleanup`, `exportLogs`, `cycleFilter`, `devices` (via getter from ref), `connectDevice`, `disconnectDevice`

### Verification
- [ ] `/help` prints all commands with descriptions
- [ ] `/re` + Tab completes to `/restart`
- [ ] Ghost text appears while typing slash commands
- [ ] All 14 commands execute correctly
- [ ] Tab cycling wraps around available matches
- [ ] Typing does NOT cause App-level re-renders (only CommandInput updates)

### Commit
```bash
git commit -m "feat(tui): slash command system with 14 commands and tab completion"
```

---

## Task 8: TUI Modes & Navigation

Six display modes with keyboard navigation: logs (default), menu, devices, ports, status, onboarding.

**Files:** `scripts/tui/App.mjs`, `scripts/tui/components/MenuOverlay.mjs`, `scripts/tui/components/DeviceList.mjs`, `scripts/tui/components/PortSelector.mjs`, `scripts/tui/components/StatusPanel.mjs`, `scripts/tui/components/OnboardingScreen.mjs`, `scripts/tui/components/HelpPanel.mjs`

### Features

#### Mode System
- [ ] **Mode state** in App: `'logs'` | `'menu'` | `'devices'` | `'ports'` | `'status'` | `'onboarding'`
- [ ] **Initial mode** — `'onboarding'` if first run (no `onboardingComplete` in config), else `'logs'`
- [ ] **Mode transitions** — `transitionMode(next)` resets relevant indices and sets mode. Ports mode triggers `detectSerialPorts()`. Menu/devices modes reset their selection indices

#### Onboarding Screen
- [ ] Full-screen welcome: DEJA logo, "Welcome to DEJA.js!" in green, config/logs/env paths in dim, "Press any key to start the server..." in cyan
- [ ] Any key press → write `onboardingComplete: true` to config → transition to logs → server auto-starts

#### Menu Overlay
- [ ] Centered box (40 chars wide), rounded cyan border
- [ ] Title: " DEJA.js Menu" in cyan bold
- [ ] 8 items: Start Server, Stop Server, Restart Server, Devices, Status Panel, Select Serial Port, Toggle Tunnel, Export Logs
- [ ] Selected item: cyan bold with `▸` arrow. Others: plain with space
- [ ] Navigation: `↑↓` arrows, `Enter` executes, `Esc` returns to logs

#### Device List
- [ ] Centered box (52 chars wide), rounded cyan border
- [ ] Title: " 🔌 DEJA Devices"
- [ ] Each device: arrow indicator, status dot (● green / ○ default), device type label, endpoint (port or topic)
- [ ] Device type labels: `dcc-ex` → "DCC-EX CommandStation", `deja-arduino` → "DEJA Arduino (MEGA)", `deja-arduino-led` → "DEJA LED Arduino", `deja-mqtt` → "DEJA MQTT (Pico W)", `deja-server` → "DEJA Server"
- [ ] Empty state: "(no devices configured)"
- [ ] Navigation: `↑↓` select, `Enter` toggles connect/disconnect (checks if device has port/topic first), `p` opens port selector, `Esc` returns to logs
- [ ] Connect: for WiFi devices sends topic, for serial devices sends port
- [ ] If no port assigned: show hint "No port assigned to {name}. Press [p] to assign one."

#### Port Selector
- [ ] Centered box (50 chars wide), rounded cyan border
- [ ] Title: " Select Serial Port", current port shown below title
- [ ] Lists detected serial ports. Current port marked with ✓
- [ ] Empty state: "(no serial ports detected)"
- [ ] Navigation: `↑↓` select, `Enter` saves to `~/.deja/config.json`, `Esc` returns to menu

#### Status Panel
- [ ] Full body panel (replaces log area)
- [ ] Section 1 — System Status: running/stopped indicator (colored), PID, uptime (live ticker), version
- [ ] Section 2 — Connections: WebSocket URL, serial port, tunnel URL, layout ID
- [ ] Missing values shown as dimmed "(not configured)" or "(not set)"
- [ ] `Esc` or `q` returns to logs

#### Help Panel
- [ ] Toggleable overlay shown above log pane (visible when `showHelp` is true)
- [ ] Bordered box with keyboard shortcut reference (r, s, t, l, e, m/Esc, ?, Ctrl+C)
- [ ] Toggled with `?` key

#### All overlay/panel components wrapped in `React.memo`

### Verification
- [ ] First launch shows onboarding; subsequent launches go straight to logs
- [ ] Menu opens with Esc/`m`, all 8 items navigate and execute correctly
- [ ] Device list shows Firebase devices with correct status indicators
- [ ] Port selector saves selection to config
- [ ] Status panel shows all system info with live uptime
- [ ] Help panel toggles cleanly
- [ ] All modes have correct HelpBar hints

### Commit
```bash
git commit -m "feat(tui): six TUI modes with navigation, device management, and onboarding"
```

---

## Task 9: Keyboard Input & Hotkeys

Mode-branched keyboard handling with smart hotkey/input coexistence.

**Files:** `scripts/tui/App.mjs`

### Features

- [ ] **Global** — `Ctrl+C` always exits (all modes)

- [ ] **Onboarding** — Any key proceeds to logs mode

- [ ] **Menu mode** — `↑↓` navigate, `Enter` execute, `Esc` back to logs

- [ ] **Devices mode** — `↑↓` navigate, `Enter` connect/disconnect, `p` port selector, `Esc` back to logs

- [ ] **Ports mode** — `↑↓` navigate, `Enter` save, `Esc` back to menu (not logs)

- [ ] **Status mode** — `Esc` or `q` back to logs

- [ ] **Logs mode hotkeys** (only when input is empty):
  - `m` → open menu
  - `?` → toggle help panel
  - `r` → restart server (calls `handleCommand('restart')`)
  - `s` → stop server and exit (calls `handleCommand('stop')`)
  - `t` → toggle tunnel
  - `e` → export logs
  - `l` → cycle log filter

  > **Important:** Single-key hotkeys are a SEPARATE system from slash command aliases. The `s` hotkey stops the server and exits, while `/s` resolves to `/status` (opens the status panel) via the command registry. Similarly, `r` hotkey restarts, while `/r` resolves to `/restart`. Hotkeys route through `handleCommand()`, not the slash command registry. Do not conflate them.

- [ ] **Smart input/hotkey coexistence** — When any character is typed, hotkeys are disabled. All subsequent keys go to the input buffer. Hotkeys re-enable when input is cleared (Esc or after Enter execution)

- [ ] **Input handling** — Tab: slash-command completion. Enter: if starts with `/` → lookup + execute via command registry; else → pass to `handleCommand()`. Esc: clear input if non-empty, open menu if empty. Backspace/Delete: remove last char

- [ ] **`handleCommand(text)` function** — A separate `useCallback` in App.mjs that handles non-slash text input AND hotkey actions. Cases:
  - `stop` / `exit` / `quit` → log "Stopping server...", stop tunnel, kill server child, exit process after 400ms
  - `restart` → log "Restarting server...", stop tunnel, kill server, clear childRef, set status='starting', spawn after 800ms
  - `help` → toggle help panel visibility
  - default → log "Unknown command" message

- [ ] **App reads input via ref** — `inputRef.current?.getText()` to check input state. No App state changes from keystrokes

- [ ] **Auto-start server** — When transitioning to logs mode with no running server and status === 'starting', auto-spawn the server (runs once per mode transition, not continuously)

### Verification
- [ ] Hotkeys fire only when input is empty
- [ ] Typing `re` then Enter shows "Unknown command" (hotkey `r` not triggered)
- [ ] `/restart` Enter works
- [ ] Esc clears input when non-empty, opens menu when empty
- [ ] Tab completion cycles through matches
- [ ] Rapid typing does NOT cause full-screen flicker (only CommandInput re-renders)
- [ ] All slash commands work: `/help`, `/devices`, `/connect`, `/restart`, `/quit`

### Commit
```bash
git commit -m "feat(tui): mode-branched keyboard input with smart hotkey coexistence"
```

---

## Task 10: Final Integration & Verification

Wire everything together in App.mjs and run full verification.

**Files:** `scripts/tui/App.mjs`

### App.mjs Wiring

- [ ] **Hook composition** — Call all hooks in order: useLogger → useServerProcess → useTunnel → useFirebase → useDevices → useThrottles
- [ ] **Command context** — Build memoized (`useMemo`) context object with all callbacks and refs. Use a getter for `devices` to read from a ref (avoids `devices` array as a dependency)
- [ ] **Register commands** — Call `registerAllCommands()` at module scope
- [ ] **Cleanup effect** — On unmount: cleanup all hooks (devices, throttles, firebase, logs, server, tunnel)
- [ ] **Tunnel auto-lifecycle effect** — When `status === 'running'` and no tunnel → spawn. When `status === 'stopped'` and tunnel exists → stop
- [ ] **Layout computation** — Memoize: `logHeight` (from terminal height, logo chrome, help chrome), `visibleLines` (filtered + sliced), `paddingLines`, `divider` string
- [ ] **Render tree** — Onboarding (full screen) OR: LogoHeader → divider → [StatusPanel | HelpPanel + body + ContextHintRow] → divider → StatusBar → CommandInput (logs only) → HelpBar

### Full Verification Checklist

- [ ] `node scripts/deja-ui-ink.mjs` — launches without errors
- [ ] 30 seconds idle — no visible flicker
- [ ] `/devices` dialog — no flicker while idle
- [ ] Rapid typing — only input line updates (no full-screen redraw)
- [ ] All slash commands work: `/help`, `/devices`, `/connect`, `/restart`, `/quit`, `/tunnel`, `/status`, `/menu`, `/ports`, `/logs`, `/filter`, `/export`, `/start`, `/stop`, `/disconnect`
- [ ] Status bar shows device + throttle counts (when Firebase connected)
- [ ] HelpBar changes per mode
- [ ] Uptime counter ticks without causing flicker
- [ ] Log filter cycling works
- [ ] Log export creates file
- [ ] Onboarding shows on first run, skips on subsequent runs
- [ ] Menu navigation works (all 8 items)
- [ ] Device list shows correct connection states
- [ ] Port selector saves to config

### Commit
```bash
git commit -m "feat(tui): complete DEJA TUI rebuild — flicker-free, modular, feature-complete"
```
