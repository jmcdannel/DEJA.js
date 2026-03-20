# DEJA CLI TUI Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the monolithic TUI into modules and add slash commands, device connection management, and a live status bar with device/throttle counts.

**Architecture:** Extract `scripts/deja-ui-ink.mjs` (885 lines) into `scripts/tui/` with focused modules: `lib/` (pure helpers), `components/` (React/Ink UI), `hooks/` (stateful logic), `commands/` (slash command registry). New Firebase Admin SDK integration provides real-time device and throttle data. The TUI sends device commands via Firebase RTDB — no server changes needed.

**Tech Stack:** React 18 + Ink 5 (terminal UI), Firebase Admin SDK (Firestore listeners + RTDB writes), Node.js ESM modules (.mjs)

**Spec:** `docs/superpowers/specs/2026-03-19-deja-cli-tui-enhancements-design.md`

---

## File Map

### New files (create)

| File | Responsibility |
|------|---------------|
| `scripts/tui/lib/config.mjs` | `readConfig()`, `writeConfig()`, `isFirstRun()`, `DEJA_DIR`, all path constants, `loadEnvFile()` |
| `scripts/tui/lib/brand.mjs` | `LOGO_RAW`, `LOGO_LINES`, `LOGO_COLORS`, `STARTUP_TIPS`, `MENU_ITEMS` |
| `scripts/tui/lib/serial.mjs` | `detectSerialPorts()`, `getPlan()`, `isPaidPlan()`, `hasCloudflared()` |
| `scripts/tui/lib/helpers.mjs` | `getVersion()`, `formatUptime()`, `ts()`, `checkPort()`, `getLogLineColor()`, `getLogLineDim()` |
| `scripts/tui/components/LogoHeader.mjs` | ASCII banner + version + startup tip |
| `scripts/tui/components/HelpPanel.mjs` | Full keyboard shortcut overlay |
| `scripts/tui/components/LogPane.mjs` | Log viewer with filtering |
| `scripts/tui/components/ContextHintRow.mjs` | Ephemeral toast-style hint line |
| `scripts/tui/components/StatusBar.mjs` | Persistent bottom bar (server + devices + throttles + tunnel) |
| `scripts/tui/components/HelpBar.mjs` | Contextual keyboard hints per mode |
| `scripts/tui/components/MenuOverlay.mjs` | Arrow-key navigation menu |
| `scripts/tui/components/PortSelector.mjs` | Serial port picker |
| `scripts/tui/components/StatusPanel.mjs` | Detailed status view |
| `scripts/tui/components/OnboardingScreen.mjs` | First-run welcome screen |
| `scripts/tui/components/CommandInput.mjs` | Slash command input with tab-completion |
| `scripts/tui/components/DeviceList.mjs` | Device list mode with connect/disconnect |

> **Note:** The spec's `DeviceStatus.mjs` component is NOT needed as a separate file — the `StatusBar.mjs` component handles device count display directly via props. The spec's `helpers.mjs` is an addition not in the spec's file tree but is a justified split for pure utility functions.
| `scripts/tui/hooks/useLogger.mjs` | Log buffer, addLog(), filtering, export, contextual hints |
| `scripts/tui/hooks/useServerProcess.mjs` | Spawn/kill/restart server child process |
| `scripts/tui/hooks/useTunnel.mjs` | Tunnel lifecycle (spawn/stop cloudflared) |
| `scripts/tui/hooks/useFirebase.mjs` | Firebase Admin SDK init, exports db + rtdb + layoutId + cleanup() |
| `scripts/tui/hooks/useDevices.mjs` | Firestore listener: device list + connection state |
| `scripts/tui/hooks/useThrottles.mjs` | Firestore listener: active throttle count |
| `scripts/tui/commands/registry.mjs` | Command registry: register(), lookup(), complete(), list() |
| `scripts/tui/commands/server.mjs` | /start, /stop, /restart commands |
| `scripts/tui/commands/devices.mjs` | /devices, /connect, /disconnect commands |
| `scripts/tui/commands/tunnel.mjs` | /tunnel command |
| `scripts/tui/commands/navigation.mjs` | /menu, /status, /ports, /logs commands |
| `scripts/tui/commands/tools.mjs` | /help, /filter, /export commands |
| `scripts/tui/commands/index.mjs` | Registers all commands with the registry |
| `scripts/tui/App.mjs` | Root App component: mode routing, state, keyboard input, layout |

### Modified files

| File | Change |
|------|--------|
| `scripts/deja-ui-ink.mjs` | Replace 885-line monolith with thin entry point (import App + render) |
| `scripts/package.json` | Add `firebase-admin` dependency |

---

## Task 1: Extract lib/ modules

**Files:**
- Create: `scripts/tui/lib/config.mjs`
- Create: `scripts/tui/lib/brand.mjs`
- Create: `scripts/tui/lib/serial.mjs`
- Create: `scripts/tui/lib/helpers.mjs`

These are pure functions with zero React dependencies. Extracted verbatim from `deja-ui-ink.mjs`.

- [ ] **Step 1: Create `scripts/tui/lib/config.mjs`**

Extract from `deja-ui-ink.mjs` lines 73–144 (loadEnvFile, paths, readConfig, writeConfig, isFirstRun) and lines 88–99 (DEJA_DIR and path constants):

```javascript
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export function loadEnvFile(filepath) {
  try {
    const content = readFileSync(filepath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {}
}

export const DEJA_DIR       = join(homedir(), '.deja')
export const ENTRY          = join(DEJA_DIR, 'server', 'index.js')
export const VERSION_FILE   = join(DEJA_DIR, 'server', 'version.txt')
export const CONFIG_FILE    = join(DEJA_DIR, 'config.json')
export const LOG_DIR        = join(DEJA_DIR, 'logs')
export const TUNNEL_PID_FILE = join(DEJA_DIR, 'tunnel.pid')
export const TUNNEL_URL_FILE = join(DEJA_DIR, 'tunnel.url')
export const CLOUDFLARED_YML = join(DEJA_DIR, 'cloudflared.yml')

export function readConfig() {
  try { return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) }
  catch { return {} }
}

export function writeConfig(updates) {
  const existing = readConfig()
  try { writeFileSync(CONFIG_FILE, JSON.stringify({ ...existing, ...updates }, null, 2)) }
  catch {}
}

export function isFirstRun() {
  return !readConfig().onboardingComplete
}
```

- [ ] **Step 2: Create `scripts/tui/lib/brand.mjs`**

Extract from `deja-ui-ink.mjs` lines 33–69 (LOGO, COLORS, TIPS, MENU_ITEMS):

```javascript
import figlet from 'figlet'

export const LOGO_RAW   = figlet.textSync('DEJA', { font: 'ANSI Shadow', horizontalLayout: 'full' })
export const LOGO_LINES = LOGO_RAW.split('\n').filter(l => l.trim().length > 0)

export const LOGO_COLORS = [
  '#00FFFF', '#00E0FF', '#00C4FF', '#00A8FF', '#0090FF', '#007FFF',
]

export const STARTUP_TIPS = [
  'Press [?] to see all keyboard shortcuts',
  'Press [r] to restart the server at any time',
  'Press [m] to open the command menu',
  'Press [l] to cycle log filters  all → error → warn',
  'Press [e] to export logs to ~/.deja/logs/',
  'Press [t] to toggle the Cloudflare tunnel',
  'Use arrow keys ↑↓ in the menu to navigate',
  'Serial port selection is saved to config.json',
  'Tip: DCC-EX commands are queued in Firebase RTDB',
  'Tip: Use the Cloud app to manage your layout config',
]

export const MENU_ITEMS = [
  { label: 'Start Server',       action: 'start'   },
  { label: 'Stop Server',        action: 'stop'    },
  { label: 'Restart Server',     action: 'restart' },
  // NOTE: 'Devices' entry added in Task 10, not here — extraction must be verbatim
  { label: 'Status Panel',       action: 'status'  },
  { label: 'Select Serial Port', action: 'ports'   },
  { label: 'Toggle Tunnel',      action: 'tunnel'  },
  { label: 'Export Logs',        action: 'export'  },
]
```

- [ ] **Step 3: Create `scripts/tui/lib/serial.mjs`**

Extract from `deja-ui-ink.mjs` lines 146–176 (detectSerialPorts, getPlan, isPaidPlan, hasCloudflared):

```javascript
import { readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { readConfig } from './config.mjs'

export function detectSerialPorts() {
  try {
    const entries = readdirSync('/dev')
    return entries
      .filter(name =>
        /^tty\.(usb|USB|ACM|SLAB|wch)/i.test(name) ||
        /^ttyUSB\d/.test(name) ||
        /^ttyACM\d/.test(name) ||
        /^ttyAMA\d/.test(name)
      )
      .map(name => `/dev/${name}`)
      .sort()
  } catch { return [] }
}

export function getPlan() {
  try { return readConfig().subscription?.plan || '' }
  catch { return '' }
}

export function isPaidPlan() {
  const plan = getPlan()
  return plan === 'engineer' || plan === 'conductor'
}

export function hasCloudflared() {
  try {
    execFileSync('which', ['cloudflared'], { stdio: 'ignore' })
    return true
  } catch { return false }
}
```

- [ ] **Step 4: Create `scripts/tui/lib/helpers.mjs`**

Extract from `deja-ui-ink.mjs` lines 103–127, 180–196 (getVersion, formatUptime, ts, checkPort, getLogLineColor, getLogLineDim):

```javascript
import { readFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { VERSION_FILE } from './config.mjs'

export function getVersion() {
  try { return readFileSync(VERSION_FILE, 'utf8').trim() }
  catch { return 'dev' }
}

export function formatUptime(startMs) {
  const secs = Math.floor((Date.now() - startMs) / 1000)
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

export function checkPort(port) {
  return new Promise((resolve) => {
    const srv = createServer()
    srv.once('error', () => resolve(false))
    srv.once('listening', () => srv.close(() => resolve(true)))
    srv.listen(port)
  })
}

export function getLogLineColor(line) {
  const u = line.toUpperCase()
  if (u.includes('ERROR') || u.includes('FATAL')) return 'red'
  if (u.includes('WARN'))                         return 'yellow'
  if (u.includes('SUCCESS') || u.includes('LISTEN') || u.includes('CONNECTED')) return 'green'
  return undefined
}

export function getLogLineDim(line) {
  const u = line.toUpperCase()
  return u.includes('DEBUG') || u.includes('VERBOSE')
}
```

- [ ] **Step 5: Verify lib modules load**

Run: `node -e "import('./scripts/tui/lib/config.mjs').then(m => console.log('config OK:', Object.keys(m))); import('./scripts/tui/lib/brand.mjs').then(m => console.log('brand OK:', Object.keys(m))); import('./scripts/tui/lib/serial.mjs').then(m => console.log('serial OK:', Object.keys(m))); import('./scripts/tui/lib/helpers.mjs').then(m => console.log('helpers OK:', Object.keys(m)))"`

Expected: All four modules load without errors and print their export names.

- [ ] **Step 6: Commit**

```bash
git add scripts/tui/lib/
git commit -m "refactor(tui): extract lib/ modules from monolithic TUI"
```

---

## Task 2: Extract components

**Files:**
- Create: `scripts/tui/components/LogoHeader.mjs`
- Create: `scripts/tui/components/HelpPanel.mjs`
- Create: `scripts/tui/components/LogPane.mjs`
- Create: `scripts/tui/components/ContextHintRow.mjs`
- Create: `scripts/tui/components/StatusBar.mjs`
- Create: `scripts/tui/components/HelpBar.mjs`
- Create: `scripts/tui/components/MenuOverlay.mjs`
- Create: `scripts/tui/components/PortSelector.mjs`
- Create: `scripts/tui/components/StatusPanel.mjs`
- Create: `scripts/tui/components/OnboardingScreen.mjs`

Each component is extracted verbatim from `deja-ui-ink.mjs` with imports updated to point to `../lib/`. All use `React.createElement` (aliased as `h`) — same pattern as the monolith. No JSX.

- [ ] **Step 1: Create `scripts/tui/components/LogoHeader.mjs`**

Extract from `deja-ui-ink.mjs` lines 201–211:

```javascript
import React from 'react'
import { Box, Text } from 'ink'
import { LOGO_LINES, LOGO_COLORS } from '../lib/brand.mjs'

const h = React.createElement

export function LogoHeader({ version, startupTip }) {
  return h(Box, { flexDirection: 'column' },
    ...LOGO_LINES.map((line, i) =>
      h(Text, { key: i, color: LOGO_COLORS[i] ?? '#007FFF', bold: true }, line)
    ),
    h(Box, null,
      h(Text, { dimColor: true }, `  v${version}  ·  `),
      h(Text, { color: '#00C4FF', dimColor: true }, startupTip)
    )
  )
}
```

- [ ] **Step 2: Create `scripts/tui/components/HelpPanel.mjs`**

Extract from `deja-ui-ink.mjs` lines 213–232:

```javascript
import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

export function HelpPanel({ visible }) {
  if (!visible) return null
  return h(Box, {
    flexDirection: 'column',
    borderStyle: 'single',
    borderColor: '#00C4FF',
    paddingX: 1,
  },
    h(Text, { bold: true, color: '#00FFFF' }, ' Keyboard Shortcuts'),
    h(Text, { dimColor: true }, ' ─────────────────────────────────'),
    h(Text, null, '  r        Restart server'),
    h(Text, null, '  s        Stop server & exit'),
    h(Text, null, '  t        Toggle Cloudflare tunnel'),
    h(Text, null, '  l        Cycle log filter  all → error → warn'),
    h(Text, null, '  e        Export logs to ~/.deja/logs/'),
    h(Text, null, '  m / Esc  Open command menu'),
    h(Text, null, '  ?        Toggle this help panel'),
    h(Text, null, '  Ctrl+C   Force exit'),
  )
}
```

- [ ] **Step 3: Create remaining components**

Create these files following the same pattern — extract the function verbatim from the monolith, update imports to use `../lib/`:

- `LogPane.mjs` — from lines 234–248 (imports `getLogLineColor`, `getLogLineDim` from `../lib/helpers.mjs`)
- `ContextHintRow.mjs` — from lines 250–253
- `StatusBar.mjs` — from lines 255–267
- `HelpBar.mjs` — from lines 269–277
- `MenuOverlay.mjs` — from lines 279–304
- `PortSelector.mjs` — from lines 306–337
- `StatusPanel.mjs` — from lines 339–366
- `OnboardingScreen.mjs` — from lines 368–384 (imports `LOGO_LINES`, `LOGO_COLORS` from `../lib/brand.mjs`, imports `CONFIG_FILE`, `LOG_DIR`, `DEJA_DIR` from `../lib/config.mjs`)

Every component follows the same structure:
```javascript
import React from 'react'
import { Box, Text } from 'ink'
// ... lib imports as needed

const h = React.createElement

export function ComponentName(props) {
  // ... exact code from monolith
}
```

- [ ] **Step 4: Verify components import cleanly**

Run: `node -e "import('./scripts/tui/components/LogoHeader.mjs').then(() => console.log('OK'))"`

Expected: No import errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/tui/components/
git commit -m "refactor(tui): extract components/ from monolithic TUI"
```

---

## Task 3: Extract hooks (useLogger, useServerProcess, useTunnel)

**Files:**
- Create: `scripts/tui/hooks/useLogger.mjs`
- Create: `scripts/tui/hooks/useServerProcess.mjs`
- Create: `scripts/tui/hooks/useTunnel.mjs`

These hooks encapsulate the stateful logic currently embedded in the `App()` function.

- [ ] **Step 1: Create `scripts/tui/hooks/useLogger.mjs`**

Extracts: `logLines` state, `addLog()` callback, `logFilter` state, `exportLogs()`, `contextHint` + `showHint()`, and the hint timer ref. From `App()` lines 392, 406–407, 417–423, 438–472, 631–641, 776–778.

```javascript
import { useState, useRef, useCallback } from 'react'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { LOG_DIR } from '../lib/config.mjs'
import { ts } from '../lib/helpers.mjs'

export function useLogger(wsPort) {
  const [logLines, setLogLines]     = useState([])
  const [logFilter, setLogFilter]   = useState('all')
  const [contextHint, setContextHint] = useState(null)
  const hintTimer = useRef(null)

  const showHint = useCallback((msg) => {
    setContextHint(msg)
    clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setContextHint(null), 5000)
  }, [])

  const addLog = useCallback((text) => {
    const raw = String(text)

    if (raw.includes('EADDRINUSE')) {
      const portMatch = raw.match(/address already in use (?:::)?(\d+)/) || raw.match(/port:\s*(\d+)/)
      const p = portMatch?.[1] || wsPort
      setLogLines(prev => {
        const next = [...prev, `[${ts()}] ⚠ Port ${p} already in use — is another server running?`]
        return next.length > 500 ? next.slice(-500) : next
      })
      showHint(`Port ${p} in use. Stop the other process or change VITE_WS_PORT.`)
      return
    }

    if (raw.includes('Registered tunnel connection') || raw.includes('trycloudflare.com')) {
      showHint('Tunnel connected! Remote access is live.')
    }
    if (raw.includes('FATAL') || raw.includes('Uncaught Exception')) {
      showHint('Server error detected. Press [r] to restart.')
    }

    const lines = raw.split('\n')
      .map(l => l.trimEnd())
      .filter(l => l.length > 0)
      .filter(l => !(/^\s+at\s/.test(l) || /^\s+(code|errno|syscall|address|port):/.test(l) || /^\s*[{}]\s*$/.test(l)))
      .map(l => `[${ts()}] ${l}`)

    if (!lines.length) return
    setLogLines(prev => {
      const next = [...prev, ...lines]
      return next.length > 500 ? next.slice(-500) : next
    })
  }, [showHint, wsPort])

  const exportLogs = useCallback(() => {
    try {
      mkdirSync(LOG_DIR, { recursive: true })
      const filename = `export-${Date.now()}.txt`
      const filepath = join(LOG_DIR, filename)
      writeFileSync(filepath, logLines.join('\n'))
      showHint(`Logs exported → ~/.deja/logs/${filename}`)
    } catch (err) {
      showHint(`Export failed: ${err.message}`)
    }
  }, [logLines, showHint])

  const cycleFilter = useCallback(() => {
    setLogFilter(f => f === 'all' ? 'error' : f === 'error' ? 'warn' : 'all')
  }, [])

  const cleanup = useCallback(() => {
    clearTimeout(hintTimer.current)
  }, [])

  return { logLines, logFilter, contextHint, addLog, showHint, exportLogs, cycleFilter, cleanup }
}
```

- [ ] **Step 2: Create `scripts/tui/hooks/useServerProcess.mjs`**

Extracts: server spawn/kill/restart, status state, pid, uptime, startTime. From `App()` lines 394–397, 476–541.

```javascript
import { useState, useEffect, useRef, useCallback } from 'react'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { DEJA_DIR, ENTRY } from '../lib/config.mjs'
import { formatUptime, checkPort } from '../lib/helpers.mjs'

export function useServerProcess(wsPort, addLog, showHint) {
  const [status, setStatus]       = useState('starting')
  const [pid, setPid]             = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [uptime, setUptime]       = useState('00:00:00')
  const childRef = useRef(null)

  // Uptime counter
  useEffect(() => {
    if (status !== 'running' || !startTime) return
    const timer = setInterval(() => setUptime(formatUptime(startTime)), 1000)
    return () => clearInterval(timer)
  }, [status, startTime])

  const spawnServer = useCallback(async () => {
    if (!existsSync(ENTRY)) {
      addLog(`ERROR: Server not found at ${ENTRY}`)
      addLog('Run "deja update" to install the server first.')
      setStatus('stopped')
      return
    }

    const portFree = await checkPort(wsPort)
    if (!portFree) {
      addLog(`Port ${wsPort} is already in use — is another server instance running?`)
      addLog(`Stop the other process or change VITE_WS_PORT in ~/.deja/.env`)
      setStatus('stopped')
      return
    }

    addLog('Starting DEJA.js server...')

    const child = spawn('node', [ENTRY], {
      cwd: DEJA_DIR,
      env: { ...process.env, FORCE_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    child.stdout.on('data', d => addLog(String(d)))
    child.stderr.on('data', d => addLog(String(d)))

    child.on('spawn', () => {
      setPid(child.pid)
      setStartTime(Date.now())
      setStatus('running')
    })

    child.on('close', (code) => {
      const upSecs = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
      setPid(null)
      setStartTime(null)
      setStatus('stopped')
      if (code === 0 || code == null) {
        addLog('Server stopped.')
      } else if (upSecs < 5) {
        addLog(`Server failed to start (exit ${code}). Check logs or run "deja status".`)
        showHint('Server failed to start. Press [r] to retry.')
      } else {
        addLog(`Server exited unexpectedly (code ${code}).`)
        showHint('Server crashed. Press [r] to restart.')
      }
      childRef.current = null
    })

    child.on('error', (err) => {
      addLog(`Failed to start server: ${err.message}`)
      setStatus('stopped')
      childRef.current = null
    })

    childRef.current = child
  }, [addLog, showHint, wsPort, startTime])

  const stopServer = useCallback(() => {
    childRef.current?.kill('SIGTERM')
  }, [])

  // NOTE: restartServer does NOT stop the tunnel here — the tunnel auto-stop/start
  // effect in App.mjs handles this when status changes to 'stopped' then 'running'.
  // This matches the monolith's behavior where stopTunnel() was called inline, but
  // the auto-start effect would re-start it. Keeping it out avoids a dependency cycle.
  const restartServer = useCallback(() => {
    addLog('Restarting server...')
    childRef.current?.kill('SIGTERM')
    childRef.current = null
    setStatus('starting')
    setTimeout(spawnServer, 800)
  }, [addLog, spawnServer])

  const cleanup = useCallback(() => {
    childRef.current?.kill('SIGTERM')
  }, [])

  return { status, pid, uptime, childRef, spawnServer, stopServer, restartServer, setStatus, cleanup }
}
```

- [ ] **Step 3: Create `scripts/tui/hooks/useTunnel.mjs`**

Extracts: tunnel spawn/stop/toggle, tunnelUrl state. From `App()` lines 398, 545–627.

```javascript
import { useState, useRef, useCallback } from 'react'
import { spawn } from 'node:child_process'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { LOG_DIR, TUNNEL_PID_FILE, TUNNEL_URL_FILE, CLOUDFLARED_YML } from '../lib/config.mjs'
import { isPaidPlan, hasCloudflared } from '../lib/serial.mjs'

export function useTunnel(wsPort, addLog, showHint) {
  const [tunnelUrl, setTunnelUrl] = useState(null)
  const tunnelRef = useRef(null)

  const stopTunnel = useCallback(() => {
    if (tunnelRef.current) {
      tunnelRef.current.kill('SIGTERM')
      tunnelRef.current = null
    }
    try { existsSync(TUNNEL_PID_FILE) && writeFileSync(TUNNEL_PID_FILE, '') } catch {}
    try { existsSync(TUNNEL_URL_FILE) && writeFileSync(TUNNEL_URL_FILE, '') } catch {}
    setTunnelUrl(null)
  }, [])

  const spawnTunnel = useCallback(() => {
    if (!isPaidPlan()) return
    if (!hasCloudflared()) {
      addLog('cloudflared not installed — skipping tunnel. Install: brew install cloudflare/cloudflare/cloudflared')
      return
    }

    const token      = process.env.CLOUDFLARE_TUNNEL_TOKEN || ''
    const tunnelName = process.env.CLOUDFLARE_TUNNEL_NAME || ''
    let args
    let isNamedTunnel = false

    if (token) {
      addLog('Starting named Cloudflare tunnel (via token)...')
      args = ['tunnel', 'run', '--token', token]
      isNamedTunnel = true
    } else if (tunnelName) {
      addLog(`Starting named Cloudflare tunnel "${tunnelName}"...`)
      args = ['tunnel', 'run', tunnelName]
      isNamedTunnel = true
    } else if (existsSync(CLOUDFLARED_YML)) {
      addLog('Starting named Cloudflare tunnel (via config)...')
      args = ['tunnel', '--config', CLOUDFLARED_YML, 'run']
      isNamedTunnel = true
    } else {
      addLog('Starting temporary Cloudflare tunnel...')
      args = ['tunnel', '--url', `http://localhost:${wsPort}`]
    }

    mkdirSync(LOG_DIR, { recursive: true })

    const tunnel = spawn('cloudflared', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    tunnel.on('spawn', () => {
      try { writeFileSync(TUNNEL_PID_FILE, String(tunnel.pid)) } catch {}
    })

    tunnel.stderr.on('data', (d) => {
      const text = String(d)
      const urlMatch = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
      if (urlMatch) {
        setTunnelUrl(urlMatch[0])
        try { writeFileSync(TUNNEL_URL_FILE, urlMatch[0]) } catch {}
        addLog(`Temporary tunnel ready: ${urlMatch[0]}`)
      }
      if (isNamedTunnel && text.includes('Registered tunnel connection')) {
        const url = 'wss://ws.dejajs.com'
        setTunnelUrl(url)
        addLog(`Named tunnel connected: ${url}`)
      }
    })

    tunnel.on('close', () => {
      tunnelRef.current = null
      setTunnelUrl(null)
    })

    tunnelRef.current = tunnel
  }, [addLog, wsPort])

  const toggleTunnel = useCallback(() => {
    if (tunnelRef.current) {
      stopTunnel()
      showHint('Tunnel stopped.')
    } else {
      spawnTunnel()
      showHint('Starting tunnel...')
    }
  }, [stopTunnel, spawnTunnel, showHint])

  return { tunnelUrl, tunnelRef, spawnTunnel, stopTunnel, toggleTunnel, cleanup: stopTunnel }
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/tui/hooks/useLogger.mjs scripts/tui/hooks/useServerProcess.mjs scripts/tui/hooks/useTunnel.mjs
git commit -m "refactor(tui): extract hooks from monolithic TUI"
```

---

## Task 4: Wire up App.mjs and slim down entry point

**Files:**
- Create: `scripts/tui/App.mjs`
- Modify: `scripts/deja-ui-ink.mjs`

This task replaces the monolith with the modular version. The App component imports from `tui/` modules. Behavior should be identical to the monolith at this stage — no new features yet. (Behavioral changes like hotkey/input coexistence come in Task 6 per the spec.)

- [ ] **Step 1: Create `scripts/tui/App.mjs`**

The App component uses the extracted hooks and components. This is the `App()` function from the monolith, but all inline functions and sub-components are now imports. The keyboard input handler (`useInput`) and render tree stay in App.mjs since they orchestrate everything.

Key structure:
```javascript
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Text, useInput, useStdout } from 'ink'

// Lib
import { loadEnvFile, DEJA_DIR, readConfig, writeConfig, isFirstRun } from './lib/config.mjs'
import { LOGO_LINES, STARTUP_TIPS, MENU_ITEMS } from './lib/brand.mjs'
import { detectSerialPorts } from './lib/serial.mjs'
import { getVersion } from './lib/helpers.mjs'

// Components
import { LogoHeader } from './components/LogoHeader.mjs'
import { HelpPanel } from './components/HelpPanel.mjs'
import { LogPane } from './components/LogPane.mjs'
import { ContextHintRow } from './components/ContextHintRow.mjs'
import { StatusBar } from './components/StatusBar.mjs'
import { HelpBar } from './components/HelpBar.mjs'
import { MenuOverlay } from './components/MenuOverlay.mjs'
import { PortSelector } from './components/PortSelector.mjs'
import { StatusPanel } from './components/StatusPanel.mjs'
import { OnboardingScreen } from './components/OnboardingScreen.mjs'

// Hooks
import { useLogger } from './hooks/useLogger.mjs'
import { useServerProcess } from './hooks/useServerProcess.mjs'
import { useTunnel } from './hooks/useTunnel.mjs'

const h = React.createElement

// Load env before anything else
loadEnvFile(`${DEJA_DIR}/.env`)

const WS_PORT = parseInt(process.env.VITE_WS_PORT || '8082', 10)
const VERSION = getVersion()

export function App() {
  // ... hooks, state, useInput, render — same logic as monolith App()
  // but using imported hooks and components instead of inline definitions
}
```

Write the full `App.mjs` with the same `useInput` handler and render tree from the monolith (lines 388–883), but replace inline state/callbacks with hook calls:
- `const { logLines, logFilter, contextHint, addLog, showHint, exportLogs, cycleFilter, cleanup: logCleanup } = useLogger(WS_PORT)`
- `const { status, pid, uptime, childRef, spawnServer, stopServer, restartServer, setStatus, cleanup: serverCleanup } = useServerProcess(WS_PORT, addLog, showHint)`
- `const { tunnelUrl, tunnelRef, spawnTunnel, stopTunnel, toggleTunnel, cleanup: tunnelCleanup } = useTunnel(WS_PORT, addLog, showHint)`

The remaining state (`mode`, `menuIndex`, `portIndex`, `availablePorts`, `showHelp`, `inputText`, `startupTip`, `configRef`) stays local in App.

- [ ] **Step 2: Slim down `scripts/deja-ui-ink.mjs`**

Replace the entire 885-line file with:

```javascript
#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import { App } from './tui/App.mjs'

render(React.createElement(App), { exitOnCtrlC: false })
```

- [ ] **Step 3: Smoke test — verify identical behavior**

Run: `node scripts/deja-ui-ink.mjs`

Expected: TUI launches identically — logo, log pane, hotkeys, menu, port selector, status panel all work exactly as before. Press `r` to restart, `m` for menu, `?` for help panel.

- [ ] **Step 4: Commit**

```bash
git add scripts/tui/App.mjs scripts/deja-ui-ink.mjs
git commit -m "refactor(tui): wire up modular App, slim entry point to 5 lines"
```

---

## Task 5: Build command registry

**Files:**
- Create: `scripts/tui/commands/registry.mjs`
- Create: `scripts/tui/commands/server.mjs`
- Create: `scripts/tui/commands/tunnel.mjs`
- Create: `scripts/tui/commands/navigation.mjs`
- Create: `scripts/tui/commands/tools.mjs`
- Create: `scripts/tui/commands/index.mjs`

- [ ] **Step 1: Create `scripts/tui/commands/registry.mjs`**

```javascript
const commands = new Map()

export function register(command) {
  commands.set(command.name, command)
  for (const alias of command.aliases || []) {
    commands.set(alias, command)
  }
}

export function lookup(input) {
  const trimmed = input.trim()
  const withoutSlash = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
  const parts = withoutSlash.split(/\s+/)
  const name = parts[0]?.toLowerCase()
  const args = parts.slice(1)
  const command = commands.get(name)
  return command ? { command, args } : null
}

export function complete(partial) {
  const withoutSlash = partial.startsWith('/') ? partial.slice(1) : partial
  const lower = withoutSlash.toLowerCase()
  if (!lower) return []

  // Deduplicate — only return primary names, not aliases
  const seen = new Set()
  const matches = []
  for (const [key, cmd] of commands) {
    if (key.startsWith(lower) && !seen.has(cmd.name)) {
      seen.add(cmd.name)
      matches.push(cmd.name)
    }
  }
  return matches.sort()
}

export function list() {
  // Deduplicate by command name
  const seen = new Set()
  const result = []
  for (const cmd of commands.values()) {
    if (!seen.has(cmd.name)) {
      seen.add(cmd.name)
      result.push(cmd)
    }
  }
  return result
}
```

- [ ] **Step 2: Create command modules**

`scripts/tui/commands/server.mjs`:
```javascript
import { register } from './registry.mjs'

export function registerServerCommands() {
  register({
    name: 'start',
    aliases: [],
    description: 'Start the server',
    usage: '/start',
    execute: (_args, ctx) => {
      if (!ctx.childRef.current) {
        ctx.setStatus('starting')
        ctx.spawnServer()
      } else {
        ctx.showHint('Server is already running.')
      }
    },
  })

  register({
    name: 'stop',
    aliases: ['quit', 'exit'],
    description: 'Stop server & exit',
    usage: '/stop',
    execute: (_args, ctx) => {
      ctx.addLog('Stopping server...')
      ctx.tunnelCleanup()
      ctx.stopServer()
      setTimeout(() => process.exit(0), 400)
    },
  })

  register({
    name: 'restart',
    aliases: ['r'],
    description: 'Restart the server',
    usage: '/restart',
    execute: (_args, ctx) => {
      ctx.restartServer()
    },
  })
}
```

`scripts/tui/commands/tunnel.mjs`:
```javascript
import { register } from './registry.mjs'

export function registerTunnelCommands() {
  register({
    name: 'tunnel',
    aliases: ['t'],
    description: 'Toggle Cloudflare tunnel',
    usage: '/tunnel',
    execute: (_args, ctx) => {
      ctx.toggleTunnel()
    },
  })
}
```

`scripts/tui/commands/navigation.mjs`:
```javascript
import { register } from './registry.mjs'

export function registerNavigationCommands() {
  register({
    name: 'menu',
    aliases: ['m'],
    description: 'Open command menu',
    usage: '/menu',
    execute: (_args, ctx) => ctx.transitionMode('menu'),
  })

  register({
    name: 'status',
    aliases: ['s'],
    description: 'Open status panel',
    usage: '/status',
    execute: (_args, ctx) => ctx.transitionMode('status'),
  })

  register({
    name: 'ports',
    aliases: ['p'],
    description: 'Open serial port selector',
    usage: '/ports',
    execute: (_args, ctx) => ctx.transitionMode('ports'),
  })

  register({
    name: 'logs',
    aliases: ['l'],
    description: 'Back to log view',
    usage: '/logs',
    execute: (_args, ctx) => ctx.transitionMode('logs'),
  })
}
```

`scripts/tui/commands/tools.mjs`:
```javascript
import { register } from './registry.mjs'
import { list as listCommands } from './registry.mjs'

export function registerToolCommands() {
  register({
    name: 'help',
    aliases: ['h', '?'],
    description: 'Show all commands',
    usage: '/help',
    execute: (_args, ctx) => {
      const cmds = listCommands()
      ctx.addLog('── Available Commands ──')
      for (const cmd of cmds) {
        const aliases = cmd.aliases?.length ? ` (${cmd.aliases.map(a => '/' + a).join(', ')})` : ''
        ctx.addLog(`  /${cmd.name}${aliases} — ${cmd.description}`)
      }
    },
  })

  register({
    name: 'filter',
    aliases: ['f'],
    description: 'Cycle log filter (all → error → warn)',
    usage: '/filter',
    execute: (_args, ctx) => ctx.cycleFilter(),
  })

  register({
    name: 'export',
    aliases: ['e'],
    description: 'Export logs to file',
    usage: '/export',
    execute: (_args, ctx) => ctx.exportLogs(),
  })
}
```

`scripts/tui/commands/index.mjs`:
```javascript
import { registerServerCommands } from './server.mjs'
import { registerTunnelCommands } from './tunnel.mjs'
import { registerNavigationCommands } from './navigation.mjs'
import { registerToolCommands } from './tools.mjs'

export function registerAllCommands() {
  registerServerCommands()
  registerTunnelCommands()
  registerNavigationCommands()
  registerToolCommands()
}
```

- [ ] **Step 3: Verify registry works**

Run: `node -e "const idx = await import('./scripts/tui/commands/index.mjs'); idx.registerAllCommands(); const reg = await import('./scripts/tui/commands/registry.mjs'); console.log('Commands:', reg.list().map(c => c.name)); console.log('Complete /re:', reg.complete('re')); console.log('Lookup /stop:', reg.lookup('/stop')?.command.name)" --input-type=module`

Expected: Lists all command names, completes "re" to "restart", looks up "/stop".

- [ ] **Step 4: Commit**

```bash
git add scripts/tui/commands/
git commit -m "feat(tui): add slash command registry with server, tunnel, nav, and tool commands"
```

---

## Task 6: Build CommandInput component

**Files:**
- Create: `scripts/tui/components/CommandInput.mjs`
- Modify: `scripts/tui/App.mjs` — replace bare input with CommandInput, wire up slash command execution

- [ ] **Step 1: Create `scripts/tui/components/CommandInput.mjs`**

```javascript
import React, { useState, useCallback } from 'react'
import { Box, Text } from 'ink'
import { complete } from '../commands/registry.mjs'

const h = React.createElement

export function CommandInput({ value, onChange, onSubmit, onEscape }) {
  const isCommand = value.startsWith('/')
  const ghost = isCommand ? getGhost(value) : ''

  return h(Box, null,
    h(Text, { color: '#00C4FF' }, '> '),
    h(Text, { color: isCommand ? '#00FFFF' : undefined }, value),
    ghost ? h(Text, { dimColor: true }, ghost) : null,
    h(Text, { color: '#00C4FF' }, '▌')
  )
}

function getGhost(input) {
  const matches = complete(input.slice(1)) // strip leading /
  if (matches.length === 0) return ''
  const top = matches[0]
  const typed = input.slice(1) // what user typed after /
  if (top.startsWith(typed) && top !== typed) {
    return top.slice(typed.length)
  }
  return ''
}

export function useCommandInput() {
  const [inputText, setInputText] = useState('')
  const [completionIndex, setCompletionIndex] = useState(0)

  const handleTab = useCallback(() => {
    if (!inputText.startsWith('/')) return
    const matches = complete(inputText.slice(1))
    if (matches.length === 0) return
    const idx = completionIndex % matches.length
    setInputText('/' + matches[idx])
    setCompletionIndex(idx + 1)
  }, [inputText, completionIndex])

  const handleChar = useCallback((char) => {
    setInputText(t => t + char)
    setCompletionIndex(0)
  }, [])

  const handleBackspace = useCallback(() => {
    setInputText(t => t.slice(0, -1))
    setCompletionIndex(0)
  }, [])

  const handleClear = useCallback(() => {
    setInputText('')
    setCompletionIndex(0)
  }, [])

  return { inputText, setInputText, handleTab, handleChar, handleBackspace, handleClear }
}
```

- [ ] **Step 2: Wire CommandInput into App.mjs**

In `App.mjs`:
1. Import `registerAllCommands` from `./commands/index.mjs` and `lookup` from `./commands/registry.mjs`
2. Call `registerAllCommands()` at module scope (once)
3. Import `CommandInput` and `useCommandInput` from `./components/CommandInput.mjs`
4. Replace the `inputText` state + bare input rendering with `useCommandInput()`
5. Update the `useInput` handler in logs mode (**deliberate behavioral change per spec Section 6.1** — in the monolith, hotkeys fire regardless of input text; now they only fire when input is empty):
   - Hotkeys fire **only when `inputText` is empty**
   - If `inputText` is non-empty, all keys go to the input buffer
   - Tab calls `handleTab()`
   - Enter: if input starts with `/`, call `lookup()` then `command.execute(context)`; else fall through to existing `handleCommand()`
   - Esc calls `handleClear()`

6. Build the `context` object for command execution:
```javascript
const commandContext = {
  addLog, showHint, transitionMode,
  spawnServer, stopServer, restartServer, setStatus,
  childRef,
  toggleTunnel, tunnelCleanup: tunnelCleanup,
  exportLogs, cycleFilter,
}
```

7. Replace the input render row with: `h(CommandInput, { value: inputText, onChange: setInputText })`

- [ ] **Step 3: Smoke test — slash commands work**

Run: `node scripts/deja-ui-ink.mjs`

Test:
- Type `/help` Enter → should print all commands in the log pane
- Type `/re` Tab → should complete to `/restart`
- Type `r` (single key, empty input) → should still restart via hotkey
- Type some text, then Esc → should clear input

- [ ] **Step 4: Commit**

```bash
git add scripts/tui/components/CommandInput.mjs scripts/tui/App.mjs
git commit -m "feat(tui): add CommandInput with slash commands and tab-completion"
```

---

## Task 7: Add firebase-admin dependency

**Files:**
- Modify: `scripts/package.json`

- [ ] **Step 1: Add firebase-admin to scripts/package.json**

Run: `cd /Users/jmcdannel/TTT/worktrees/deja-cli-enhancements && pnpm --filter=deja-scripts add firebase-admin`

Expected: `firebase-admin` added to `scripts/package.json` dependencies, lockfile updated.

- [ ] **Step 2: Commit**

```bash
git add scripts/package.json pnpm-lock.yaml
git commit -m "deps(tui): add firebase-admin for device and throttle listeners"
```

---

## Task 8: Build Firebase hooks (useFirebase, useDevices, useThrottles)

**Files:**
- Create: `scripts/tui/hooks/useFirebase.mjs`
- Create: `scripts/tui/hooks/useDevices.mjs`
- Create: `scripts/tui/hooks/useThrottles.mjs`

- [ ] **Step 1: Create `scripts/tui/hooks/useFirebase.mjs`**

Inlines the Firebase Admin SDK init logic from `packages/firebase-config/src/firebase-admin-node.ts`:

```javascript
import { useState, useEffect, useRef } from 'react'
import { initializeApp, cert, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getDatabase, ServerValue } from 'firebase-admin/database'
import { readConfig } from '../lib/config.mjs'

let _app = null
let _db = null
let _rtdb = null

function initFirebase() {
  if (_app) return { db: _db, rtdb: _rtdb }

  const serviceAccount = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }

  // Skip init if credentials are missing
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    return { db: null, rtdb: null }
  }

  _app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  })

  _db = getFirestore(_app)
  _rtdb = getDatabase(_app)

  return { db: _db, rtdb: _rtdb }
}

export function useFirebase() {
  const config = readConfig()
  const layoutId = config.layoutId || null

  // Lazy init on first call
  const { db, rtdb } = initFirebase()

  const cleanup = () => {
    if (_app) {
      deleteApp(_app).catch(() => {})
      _app = null
      _db = null
      _rtdb = null
    }
  }

  return { db, rtdb, layoutId, cleanup }
}

// Re-export ServerValue for RTDB writes (used by connectDevice/disconnectDevice)
export { ServerValue }

```

- [ ] **Step 2: Create `scripts/tui/hooks/useDevices.mjs`**

```javascript
import { useState, useEffect, useRef } from 'react'

export function useDevices(db, layoutId) {
  const [devices, setDevices]           = useState([])
  const [connectedCount, setConnectedCount] = useState(0)
  const [totalCount, setTotalCount]     = useState(0)
  const [error, setError]               = useState(null)
  const unsubRef = useRef(null)

  useEffect(() => {
    if (!db || !layoutId) return

    const ref = db.collection('layouts').doc(layoutId).collection('devices')

    unsubRef.current = ref.onSnapshot(
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        setDevices(docs)
        setTotalCount(docs.length)
        setConnectedCount(docs.filter(d => d.isConnected).length)
        setError(null)
      },
      (err) => {
        setError(err.message)
      }
    )

    return () => {
      unsubRef.current?.()
      unsubRef.current = null
    }
  }, [db, layoutId])

  const cleanup = () => {
    unsubRef.current?.()
    unsubRef.current = null
  }

  return { devices, connectedCount, totalCount, error, cleanup }
}
```

- [ ] **Step 3: Create `scripts/tui/hooks/useThrottles.mjs`**

```javascript
import { useState, useEffect, useRef } from 'react'

export function useThrottles(db, layoutId) {
  const [throttleCount, setThrottleCount] = useState(0)
  const [error, setError]                 = useState(null)
  const unsubRef = useRef(null)

  useEffect(() => {
    if (!db || !layoutId) return

    const ref = db.collection('layouts').doc(layoutId).collection('throttles')

    unsubRef.current = ref.onSnapshot(
      (snapshot) => {
        setThrottleCount(snapshot.size)
        setError(null)
      },
      (err) => {
        setError(err.message)
      }
    )

    return () => {
      unsubRef.current?.()
      unsubRef.current = null
    }
  }, [db, layoutId])

  const cleanup = () => {
    unsubRef.current?.()
    unsubRef.current = null
  }

  return { throttleCount, error, cleanup }
}
```

- [ ] **Step 4: Wire Firebase hooks into App.mjs**

In `App.mjs`:
1. Import `useFirebase`, `useDevices`, `useThrottles`, and `ServerValue`:
```javascript
import { useFirebase, ServerValue } from './hooks/useFirebase.mjs'
```
2. Call them in the App component:
```javascript
const { db, rtdb, layoutId, cleanup: firebaseCleanup } = useFirebase()
const { devices, connectedCount, totalCount, cleanup: devicesCleanup } = useDevices(db, layoutId)
const { throttleCount, cleanup: throttlesCleanup } = useThrottles(db, layoutId)
```
3. Add to the unmount cleanup effect:
```javascript
useEffect(() => () => {
  logCleanup()
  serverCleanup()
  tunnelCleanup()
  devicesCleanup()
  throttlesCleanup()
  firebaseCleanup()
}, [])
```

- [ ] **Step 5: Smoke test — Firebase connects**

Run: `node scripts/deja-ui-ink.mjs`

Expected: TUI launches without errors. If `~/.deja/.env` has valid Firebase credentials and `config.json` has a `layoutId`, the hooks will connect silently. No visible change yet (status bar update is next task).

- [ ] **Step 6: Commit**

```bash
git add scripts/tui/hooks/useFirebase.mjs scripts/tui/hooks/useDevices.mjs scripts/tui/hooks/useThrottles.mjs scripts/tui/App.mjs
git commit -m "feat(tui): add Firebase hooks for device and throttle listeners"
```

---

## Task 9: Enhance StatusBar with device and throttle counts

**Files:**
- Modify: `scripts/tui/components/StatusBar.mjs`
- Modify: `scripts/tui/App.mjs` — pass new props to StatusBar

- [ ] **Step 1: Update `scripts/tui/components/StatusBar.mjs`**

Add `connectedCount`, `totalCount`, `throttleCount` props:

```javascript
import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

export function StatusBar({ status, pid, uptime, tunnelUrl, selectedPort, connectedCount, totalCount, throttleCount }) {
  const color      = status === 'running' ? 'green' : status === 'stopped' ? 'red' : 'yellow'
  const icon       = status === 'running' ? '●' : '○'
  const pidText    = pid ? `  pid ${pid}` : ''
  const uptimeText = status === 'running' ? `  uptime ${uptime}` : ''
  const deviceText = totalCount > 0 ? `  ⬡ ${connectedCount}/${totalCount} devices` : ''
  const throttleText = throttleCount > 0 ? `  🚂 ${throttleCount} throttles` : ''
  const portText   = selectedPort ? `  ⬡ ${selectedPort}` : ''
  const tunnelText = tunnelUrl ? `  🔒 ${tunnelUrl}` : ''

  return h(Box, null,
    h(Text, { color }, icon),
    h(Text, null, ` ${status}${pidText}${uptimeText}`),
    h(Text, { color: connectedCount > 0 ? '#00C4FF' : undefined, dimColor: connectedCount === 0 }, deviceText),
    h(Text, { color: '#00C4FF' }, throttleText),
    h(Text, { dimColor: true }, `${portText}${tunnelText}`)
  )
}
```

- [ ] **Step 2: Pass new props in App.mjs**

Update the StatusBar render call in `App.mjs` to include the new props:

```javascript
h(StatusBar, {
  status,
  pid,
  uptime,
  tunnelUrl,
  selectedPort: cfg.serialPort || null,
  connectedCount,
  totalCount,
  throttleCount,
})
```

- [ ] **Step 3: Smoke test — status bar shows counts**

Run: `node scripts/deja-ui-ink.mjs`

Expected: Status bar shows `⬡ 0/N devices` and (if throttles exist) `🚂 N throttles` alongside the existing server status.

- [ ] **Step 4: Commit**

```bash
git add scripts/tui/components/StatusBar.mjs scripts/tui/App.mjs
git commit -m "feat(tui): show device and throttle counts in status bar"
```

---

## Task 10: Build DeviceList component and /devices commands

**Files:**
- Create: `scripts/tui/components/DeviceList.mjs`
- Create: `scripts/tui/commands/devices.mjs`
- Modify: `scripts/tui/commands/index.mjs` — register device commands
- Modify: `scripts/tui/App.mjs` — add `devices` mode, wire DeviceList + device commands

- [ ] **Step 1: Create `scripts/tui/components/DeviceList.mjs`**

```javascript
import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

// Device type labels matching packages/modules/layouts/constants.ts
const TYPE_LABELS = {
  'dcc-ex':          'DCC-EX CommandStation',
  'deja-arduino':    'DEJA Arduino (MEGA)',
  'deja-arduino-led':'DEJA LED Arduino',
  'deja-mqtt':       'DEJA MQTT (Pico W)',
  'deja-server':     'DEJA Server',
}

export function DeviceList({ devices, selectedIndex, cols }) {
  const width = 54
  const pad   = Math.max(0, Math.floor((cols - width) / 2))
  const hasDevices = devices.length > 0

  return h(Box, { flexDirection: 'column', paddingLeft: pad },
    h(Box, {
      borderStyle: 'round',
      borderColor: '#00C4FF',
      width,
      flexDirection: 'column',
      paddingX: 1,
    },
      h(Text, { bold: true, color: '#00FFFF' }, ' DEJA Devices'),
      h(Text, null, ''),
      hasDevices
        ? devices.map((device, i) => {
            const selected = i === selectedIndex
            const connected = device.isConnected
            const icon = connected ? '●' : '○'
            const iconColor = connected ? 'green' : undefined
            const label = TYPE_LABELS[device.type] || device.name
            const endpoint = device.connection === 'wifi'
              ? (device.topic ? `topic: ${device.topic}` : '(no topic)')
              : (device.port || '(no port)')

            return h(Box, { key: device.id },
              h(Text, { color: selected ? '#00FFFF' : undefined, bold: selected },
                `  ${selected ? '▸' : ' '} `
              ),
              h(Text, { color: iconColor, dimColor: !connected }, `${icon} `),
              h(Text, { color: selected ? '#00FFFF' : undefined, bold: selected },
                label.padEnd(26)
              ),
              h(Text, { dimColor: true }, endpoint)
            )
          })
        : h(Text, { dimColor: true }, '  (no devices configured)'),
      h(Text, null, ''),
      hasDevices
        ? h(Text, { dimColor: true }, '  [↑↓] navigate  [Enter] connect  [p] port  [Esc] back')
        : h(Text, { dimColor: true }, '  [Esc] back')
    )
  )
}
```

- [ ] **Step 2: Create `scripts/tui/commands/devices.mjs`**

```javascript
import { register } from './registry.mjs'

export function registerDeviceCommands() {
  register({
    name: 'devices',
    aliases: ['d', 'io', 'iodevices'],
    description: 'List and manage IO devices',
    usage: '/devices',
    execute: (_args, ctx) => ctx.transitionMode('devices'),
  })

  register({
    name: 'connect',
    aliases: ['c'],
    description: 'Connect a device',
    usage: '/connect [device-name]',
    execute: (args, ctx) => {
      if (!args.length) {
        ctx.transitionMode('devices')
        return
      }
      const name = args.join(' ').toLowerCase()
      const device = ctx.devices.find(d =>
        d.id.toLowerCase() === name || d.name.toLowerCase() === name
      )
      if (!device) {
        ctx.showHint(`Device "${args.join(' ')}" not found. Try /devices to see all.`)
        return
      }
      if (device.isConnected) {
        ctx.showHint(`${device.name} is already connected.`)
        return
      }
      ctx.connectDevice(device)
    },
  })

  register({
    name: 'disconnect',
    aliases: ['dc'],
    description: 'Disconnect a device',
    usage: '/disconnect [device-name]',
    execute: (args, ctx) => {
      if (!args.length) {
        ctx.showHint('Usage: /disconnect <device-name>')
        return
      }
      const name = args.join(' ').toLowerCase()
      const device = ctx.devices.find(d =>
        d.id.toLowerCase() === name || d.name.toLowerCase() === name
      )
      if (!device) {
        ctx.showHint(`Device "${args.join(' ')}" not found. Try /devices to see all.`)
        return
      }
      if (!device.isConnected) {
        ctx.showHint(`${device.name} is not connected.`)
        return
      }
      ctx.disconnectDevice(device)
    },
  })
}
```

- [ ] **Step 3: Update `scripts/tui/commands/index.mjs`**

Add device command registration:

```javascript
import { registerServerCommands } from './server.mjs'
import { registerTunnelCommands } from './tunnel.mjs'
import { registerNavigationCommands } from './navigation.mjs'
import { registerToolCommands } from './tools.mjs'
import { registerDeviceCommands } from './devices.mjs'

export function registerAllCommands() {
  registerServerCommands()
  registerDeviceCommands()
  registerTunnelCommands()
  registerNavigationCommands()
  registerToolCommands()
}
```

- [ ] **Step 4: Wire into App.mjs**

Add to `App.mjs`:

1. Add `devices` mode state: `const [deviceIndex, setDeviceIndex] = useState(0)`

2. Add `connectDevice` and `disconnectDevice` callbacks:
```javascript
const connectDevice = useCallback((device) => {
  if (!rtdb || !layoutId) return
  const payload = device.connection === 'wifi'
    ? { device: device.id, topic: device.topic }
    : { device: device.id, serial: device.port }
  rtdb.ref(`dejaCommands/${layoutId}`).push({
    action: 'connect',
    payload: JSON.stringify(payload),
    timestamp: ServerValue.TIMESTAMP,
  })
  showHint(`Connecting ${device.name}...`)
}, [rtdb, layoutId, showHint])

const disconnectDevice = useCallback((device) => {
  if (!rtdb || !layoutId) return
  rtdb.ref(`dejaCommands/${layoutId}`).push({
    action: 'disconnect',
    payload: JSON.stringify({ device: device.id }),
    timestamp: ServerValue.TIMESTAMP,
  })
  showHint(`Disconnecting ${device.name}...`)
}, [rtdb, layoutId, showHint])
```

3. Add `devices` and `connectDevice`/`disconnectDevice` to the `commandContext` object.

4. Add `devices` mode to `transitionMode`:
```javascript
if (next === 'devices') setDeviceIndex(0)
```

5. Add `devices` mode to `useInput` handler:
```javascript
if (mode === 'devices') {
  if (key.upArrow)   { setDeviceIndex(i => Math.max(0, i - 1)); return }
  if (key.downArrow) { setDeviceIndex(i => Math.min(Math.max(0, devices.length - 1), i + 1)); return }
  if (key.escape)    { transitionMode('logs'); return }
  if (input === 'p') {
    // Open port selector for current device
    transitionMode('ports')
    return
  }
  if (key.return && devices.length > 0) {
    const device = devices[deviceIndex]
    if (device.isConnected) {
      disconnectDevice(device)
    } else {
      if (device.connection === 'wifi' || device.port) {
        connectDevice(device)
      } else {
        showHint(`No port assigned to ${device.name}. Press [p] to assign one.`)
      }
    }
    return
  }
  return
}
```

6. Add `DeviceList` to the render tree (alongside menu/ports in the body section):
```javascript
mode === 'devices'
  ? h(DeviceList, { devices, selectedIndex: deviceIndex, cols })
  : // ... existing menu/ports/logs branching
```

7. Add `Devices` entry to `MENU_ITEMS` in `lib/brand.mjs` (was deferred from Task 1 extraction to keep extraction verbatim):
```javascript
{ label: 'Devices',            action: 'devices' },  // insert after 'Restart Server'
```

8. Add `devices` case to menu handler:
```javascript
case 'devices': transitionMode('devices'); break
```

- [ ] **Step 5: Smoke test — device list works**

Run: `node scripts/deja-ui-ink.mjs`

Test:
- Type `/devices` Enter → should show device list
- Type `/io` Enter → should also show device list
- Arrow keys to navigate, Enter to connect/disconnect
- Esc to go back to logs
- `/connect dccex` → should push connect command to RTDB

- [ ] **Step 6: Commit**

```bash
git add scripts/tui/components/DeviceList.mjs scripts/tui/commands/devices.mjs scripts/tui/commands/index.mjs scripts/tui/App.mjs
git commit -m "feat(tui): add device list mode with connect/disconnect via Firebase RTDB"
```

---

## Task 11: Update HelpBar for contextual mode hints

**Files:**
- Modify: `scripts/tui/components/HelpBar.mjs`

- [ ] **Step 1: Update HelpBar to show per-mode hints**

Replace the current `HelpBar` (which only shows in logs mode) with mode-aware hints:

```javascript
import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

const HINTS = {
  logs:    '  / commands  [r]estart  [s]top  [t]unnel  [?]help',
  menu:    '  [↑↓] navigate  [Enter] select  [Esc] back',
  devices: '  [↑↓] navigate  [Enter] connect  [p] port  [Esc] back',
  ports:   '  [↑↓] navigate  [Enter] save  [Esc] back',
  status:  '  [Esc] back to logs',
}

export function HelpBar({ mode }) {
  const hint = HINTS[mode]
  if (!hint) return null
  return h(Box, null,
    h(Text, { dimColor: true }, hint)
  )
}
```

- [ ] **Step 2: Update App.mjs — pass `mode` prop instead of `logFilter`**

Change `h(HelpBar, { mode, logFilter })` to `h(HelpBar, { mode })`.

- [ ] **Step 3: Smoke test — hints change per mode**

Run: `node scripts/deja-ui-ink.mjs`

Test:
- Logs mode → shows `/ commands  [r]estart  [s]top  [t]unnel  [?]help`
- `/menu` → shows `[↑↓] navigate  [Enter] select  [Esc] back`
- `/devices` → shows `[↑↓] navigate  [Enter] connect  [p] port  [Esc] back`
- `/status` → shows `[Esc] back to logs`

- [ ] **Step 4: Commit**

```bash
git add scripts/tui/components/HelpBar.mjs scripts/tui/App.mjs
git commit -m "feat(tui): contextual HelpBar hints per mode, lead with slash commands"
```

---

## Task 12: Final cleanup and verification

**Files:**
- Review: all `scripts/tui/**/*.mjs` files
- Verify: `scripts/deja-ui-ink.mjs` is the thin entry point

- [ ] **Step 1: Verify the old monolith code is fully replaced**

Check that `scripts/deja-ui-ink.mjs` is just the thin entry point (~5 lines). If any monolith code leaked back in, clean it up.

- [ ] **Step 2: Full smoke test**

Run: `node scripts/deja-ui-ink.mjs`

Walk through the complete verification table from the spec (Section 10):

| Test | Expected |
|------|----------|
| TUI launches | Logo, logs, status bar all render |
| `/help` | Lists all 14 commands with descriptions |
| `/re` Tab | Completes to `/restart` |
| Status bar | Shows `⬡ N/N devices` and `🚂 N throttles` |
| Throttle in web app | TUI status bar count updates in real time |
| `/devices` | Shows device list with correct status |
| `/connect dccex` | Server connects (if serial port configured) |
| Mode switching | HelpBar content changes per mode |
| Hotkeys still work | `r`, `s`, `t`, `?` work when input is empty |
| Ctrl+C | Clean exit |

- [ ] **Step 3: Lint check**

Run: `pnpm lint`

Fix any lint errors in `scripts/tui/**/*.mjs` files. Since these are `.mjs` files outside the TypeScript build system, `check-types` does not apply, but ESLint should still catch issues.

- [ ] **Step 4: Commit final state**

```bash
git add -A
git commit -m "feat(tui): complete CLI TUI enhancements — modular architecture, slash commands, device management, live status bar"
```
