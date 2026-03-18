#!/usr/bin/env node
/**
 * scripts/deja-ui-ink.mjs
 * Interactive TUI for DEJA.js server — ink (React) implementation.
 *
 * Modes:
 *   onboarding  First-run welcome screen
 *   logs        Main log view (default)
 *   menu        Arrow-key navigation menu
 *   ports       Serial port selector
 *   status      Config / status panel
 *
 * Hotkeys (logs mode):
 *   r        Restart server
 *   s        Stop server & exit
 *   t        Toggle Cloudflare tunnel
 *   l        Cycle log filter (all → error → warn)
 *   e        Export logs to ~/.deja/logs/
 *   m / Esc  Open command menu
 *   ?        Toggle help panel
 *   Ctrl+C   Force exit
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { render, Box, Text, useInput, useStdout } from 'ink'
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { homedir } from 'node:os'
import { join } from 'node:path'
import figlet from 'figlet'

// ── Brand ──────────────────────────────────────────────────────────────────────

const LOGO_RAW   = figlet.textSync('DEJA', { font: 'ANSI Shadow', horizontalLayout: 'full' })
const LOGO_LINES = LOGO_RAW.split('\n').filter(l => l.trim().length > 0)

// Cyan-to-sky-blue gradient — one hex color per logo line
const LOGO_COLORS = [
  '#00FFFF',
  '#00E0FF',
  '#00C4FF',
  '#00A8FF',
  '#0090FF',
  '#007FFF',
]

const STARTUP_TIPS = [
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

const MENU_ITEMS = [
  { label: 'Start Server',       action: 'start'   },
  { label: 'Stop Server',        action: 'stop'    },
  { label: 'Restart Server',     action: 'restart' },
  { label: 'Status Panel',       action: 'status'  },
  { label: 'Select Serial Port', action: 'ports'   },
  { label: 'Toggle Tunnel',      action: 'tunnel'  },
  { label: 'Export Logs',        action: 'export'  },
]

// ── Load env ───────────────────────────────────────────────────────────────────

function loadEnvFile(filepath) {
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

const DEJA_DIR = join(homedir(), '.deja')
loadEnvFile(join(DEJA_DIR, '.env'))

// ── Paths ──────────────────────────────────────────────────────────────────────

const ENTRY           = join(DEJA_DIR, 'server', 'index.js')
const VERSION_FILE    = join(DEJA_DIR, 'server', 'version.txt')
const CONFIG_FILE     = join(DEJA_DIR, 'config.json')
const LOG_DIR         = join(DEJA_DIR, 'logs')
const TUNNEL_PID_FILE = join(DEJA_DIR, 'tunnel.pid')
const TUNNEL_URL_FILE = join(DEJA_DIR, 'tunnel.url')
const CLOUDFLARED_YML = join(DEJA_DIR, 'cloudflared.yml')

// ── Pure helpers ───────────────────────────────────────────────────────────────

function getVersion() {
  try { return readFileSync(VERSION_FILE, 'utf8').trim() }
  catch { return 'dev' }
}

function formatUptime(startMs) {
  const secs = Math.floor((Date.now() - startMs) / 1000)
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

function checkPort(port) {
  return new Promise((resolve) => {
    const srv = createServer()
    srv.once('error', () => resolve(false))
    srv.once('listening', () => srv.close(() => resolve(true)))
    srv.listen(port)
  })
}

// ── Config helpers ─────────────────────────────────────────────────────────────

function readConfig() {
  try { return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) }
  catch { return {} }
}

function writeConfig(updates) {
  const existing = readConfig()
  try { writeFileSync(CONFIG_FILE, JSON.stringify({ ...existing, ...updates }, null, 2)) }
  catch {}
}

function isFirstRun() {
  return !readConfig().onboardingComplete
}

function detectSerialPorts() {
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

function getPlan() {
  try { return readConfig().subscription?.plan || '' }
  catch { return '' }
}

function isPaidPlan() {
  const plan = getPlan()
  return plan === 'engineer' || plan === 'conductor'
}

function hasCloudflared() {
  try {
    execFileSync('which', ['cloudflared'], { stdio: 'ignore' })
    return true
  } catch { return false }
}

// ── Log line coloring ──────────────────────────────────────────────────────────

function getLogLineColor(line) {
  const u = line.toUpperCase()
  if (u.includes('ERROR') || u.includes('FATAL')) return 'red'
  if (u.includes('WARN'))                         return 'yellow'
  if (u.includes('SUCCESS') || u.includes('LISTEN') || u.includes('CONNECTED')) return 'green'
  return undefined
}

function getLogLineDim(line) {
  const u = line.toUpperCase()
  return u.includes('DEBUG') || u.includes('VERBOSE')
}

// ── Constants ──────────────────────────────────────────────────────────────────

const WS_PORT = parseInt(process.env.VITE_WS_PORT || '8082', 10)
const VERSION = getVersion()
const h = React.createElement

// ── Sub-components (module scope — no recreation on every render) ──────────────

function LogoHeader({ version, startupTip }) {
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

function HelpPanel({ visible }) {
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

function LogPane({ visibleLines, paddingLines, logHeight, filter }) {
  return h(Box, { flexDirection: 'column', height: logHeight },
    filter !== 'all'
      ? h(Text, { color: 'yellow', dimColor: true }, `  ── showing ${filter} logs only ──`)
      : null,
    ...Array.from({ length: paddingLines }, (_, i) =>
      h(Text, { key: `pad-${i}` }, ' ')
    ),
    ...visibleLines.map((line, i) => {
      const color = getLogLineColor(line)
      const dim   = getLogLineDim(line)
      return h(Text, { key: i, wrap: 'truncate', color, dimColor: dim }, line)
    })
  )
}

function ContextHintRow({ hint }) {
  if (!hint) return h(Text, null, ' ')
  return h(Text, { color: '#00C4FF' }, `  ▸ ${hint}`)
}

function StatusBar({ status, pid, uptime, tunnelUrl, selectedPort }) {
  const color      = status === 'running' ? 'green' : status === 'stopped' ? 'red' : 'yellow'
  const icon       = status === 'running' ? '●' : '○'
  const pidText    = pid ? `  pid ${pid}` : ''
  const uptimeText = status === 'running' ? `  uptime ${uptime}` : ''
  const portText   = selectedPort ? `  ⬡ ${selectedPort}` : ''
  const tunnelText = tunnelUrl ? `  🔒 ${tunnelUrl}` : ''
  return h(Box, null,
    h(Text, { color }, icon),
    h(Text, null, ` ${status}${pidText}${uptimeText}`),
    h(Text, { dimColor: true }, `${portText}${tunnelText}`)
  )
}

function HelpBar({ mode, logFilter }) {
  if (mode !== 'logs') return null
  const filterLabel = logFilter === 'all' ? 'filter' : `filter:${logFilter}`
  return h(Box, null,
    h(Text, { dimColor: true },
      `  [r]estart  [s]top  [t]unnel  [l]${filterLabel}  [e]xport  [m]enu  [?]help`
    )
  )
}

function MenuOverlay({ items, selectedIndex, cols }) {
  const width = 40
  const pad   = Math.max(0, Math.floor((cols - width) / 2))
  return h(Box, { flexDirection: 'column', paddingLeft: pad },
    h(Box, {
      borderStyle: 'round',
      borderColor: '#00C4FF',
      width,
      flexDirection: 'column',
      paddingX: 1,
    },
      h(Text, { bold: true, color: '#00FFFF' }, ' DEJA.js Menu'),
      h(Text, null, ''),
      ...items.map((item, i) => {
        const selected = i === selectedIndex
        return h(Box, { key: i },
          h(Text, { color: selected ? '#00FFFF' : undefined, bold: selected },
            `  ${selected ? '▸' : ' '} ${item.label}`
          )
        )
      }),
      h(Text, null, ''),
      h(Text, { dimColor: true }, '  [↑↓] navigate  [Enter] select  [Esc] back')
    )
  )
}

function PortSelector({ ports, portIndex, currentPort, cols }) {
  const width        = 50
  const pad          = Math.max(0, Math.floor((cols - width) / 2))
  const displayPorts = ports.length > 0 ? ports : ['(no serial ports detected)']
  const hasPort      = ports.length > 0
  return h(Box, { flexDirection: 'column', paddingLeft: pad },
    h(Box, {
      borderStyle: 'round',
      borderColor: '#00C4FF',
      width,
      flexDirection: 'column',
      paddingX: 1,
    },
      h(Text, { bold: true, color: '#00FFFF' }, ' Select Serial Port'),
      h(Text, { dimColor: true }, `  current: ${currentPort || 'none'}`),
      h(Text, null, ''),
      ...displayPorts.map((port, i) => {
        const selected  = i === portIndex
        const isCurrent = port === currentPort
        return h(Box, { key: i },
          h(Text, { color: selected ? '#00FFFF' : undefined, bold: selected },
            `  ${selected ? '▸' : ' '} ${port}${isCurrent ? '  ✓' : ''}`
          )
        )
      }),
      h(Text, null, ''),
      hasPort
        ? h(Text, { dimColor: true }, '  [↑↓] navigate  [Enter] save  [Esc] back')
        : h(Text, { dimColor: true }, '  [Esc] back')
    )
  )
}

function StatusPanel({ version, status, pid, uptime, tunnelUrl, selectedPort, layoutId, wsPort }) {
  const stColor = status === 'running' ? 'green' : 'red'
  return h(Box, { flexDirection: 'column', paddingX: 2, paddingY: 1 },
    h(Text, { bold: true, color: '#00FFFF' }, 'System Status'),
    h(Text, { dimColor: true }, '─'.repeat(32)),
    h(Text, null, ''),
    h(Text, { color: stColor }, `  ${status === 'running' ? '● running' : '○ stopped'}`),
    pid ? h(Text, null, `  PID       ${pid}`) : null,
    status === 'running' ? h(Text, null, `  Uptime    ${uptime}`) : null,
    h(Text, null, `  Version   ${version}`),
    h(Text, null, ''),
    h(Text, { bold: true }, 'Connections'),
    h(Text, { dimColor: true }, '─'.repeat(32)),
    h(Text, null, ''),
    h(Text, null, `  WebSocket   ws://localhost:${wsPort}`),
    selectedPort
      ? h(Text, null, `  Serial      ${selectedPort}`)
      : h(Text, { dimColor: true }, '  Serial      (not configured)'),
    tunnelUrl
      ? h(Text, { color: '#00C4FF' }, `  Tunnel      ${tunnelUrl}`)
      : h(Text, { dimColor: true }, '  Tunnel      not running'),
    layoutId
      ? h(Text, null, `  Layout      ${layoutId}`)
      : h(Text, { dimColor: true }, '  Layout      (not set)'),
    h(Text, null, ''),
    h(Text, { dimColor: true }, '  [Esc] back to logs')
  )
}

function OnboardingScreen() {
  return h(Box, { flexDirection: 'column', paddingX: 2, paddingY: 1 },
    ...LOGO_LINES.map((line, i) =>
      h(Text, { key: i, color: LOGO_COLORS[i] ?? '#007FFF', bold: true }, line)
    ),
    h(Text, null, ''),
    h(Text, { bold: true, color: 'green' }, '  Welcome to DEJA.js!'),
    h(Text, null, ''),
    h(Text, null, '  Your model railroad control server is ready to run.'),
    h(Text, null, ''),
    h(Text, { dimColor: true }, `  Config:  ${CONFIG_FILE}`),
    h(Text, { dimColor: true }, `  Logs:    ${LOG_DIR}/`),
    h(Text, { dimColor: true }, `  Env:     ${join(DEJA_DIR, '.env')}`),
    h(Text, null, ''),
    h(Text, { color: '#00C4FF' }, '  Press any key to start the server...')
  )
}

// ── App ────────────────────────────────────────────────────────────────────────

function App() {
  const { stdout } = useStdout()

  // Server state
  const [logLines, setLogLines]   = useState([])
  const [inputText, setInputText] = useState('')
  const [status, setStatus]       = useState('starting')
  const [pid, setPid]             = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [uptime, setUptime]       = useState('00:00:00')
  const [tunnelUrl, setTunnelUrl] = useState(null)

  // TUI state
  const [mode, setMode]                   = useState(() => isFirstRun() ? 'onboarding' : 'logs')
  const [logFilter, setLogFilter]         = useState('all')
  const [menuIndex, setMenuIndex]         = useState(0)
  const [portIndex, setPortIndex]         = useState(0)
  const [availablePorts, setAvailablePorts] = useState([])
  const [contextHint, setContextHint]     = useState(null)
  const [showHelp, setShowHelp]           = useState(false)
  const [startupTip]                      = useState(() =>
    STARTUP_TIPS[Math.floor(Math.random() * STARTUP_TIPS.length)]
  )

  const childRef   = useRef(null)
  const tunnelRef  = useRef(null)
  const hintTimer  = useRef(null)
  const configRef  = useRef(readConfig())

  // ── Hint helper ──────────────────────────────────────────────────────────────

  const showHint = useCallback((msg) => {
    setContextHint(msg)
    clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setContextHint(null), 5000)
  }, [])

  // ── Mode transitions ─────────────────────────────────────────────────────────

  const transitionMode = useCallback((next) => {
    if (next === 'ports') {
      setAvailablePorts(detectSerialPorts())
      setPortIndex(0)
    }
    if (next === 'menu') setMenuIndex(0)
    setMode(next)
  }, [])

  // ── Logging ──────────────────────────────────────────────────────────────────

  const addLog = useCallback((text) => {
    const raw = String(text)

    // EADDRINUSE — friendly one-liner
    if (raw.includes('EADDRINUSE')) {
      const portMatch = raw.match(/address already in use (?:::)?(\d+)/) || raw.match(/port:\s*(\d+)/)
      const p = portMatch?.[1] || WS_PORT
      setLogLines(prev => {
        const next = [...prev, `[${ts()}] ⚠ Port ${p} already in use — is another server running?`]
        return next.length > 500 ? next.slice(-500) : next
      })
      showHint(`Port ${p} in use. Stop the other process or change VITE_WS_PORT.`)
      return
    }

    // Contextual hints from log content
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
  }, [showHint])

  // ── Uptime counter ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (status !== 'running' || !startTime) return
    const timer = setInterval(() => setUptime(formatUptime(startTime)), 1000)
    return () => clearInterval(timer)
  }, [status, startTime])

  // ── Server lifecycle ─────────────────────────────────────────────────────────

  const spawnServer = useCallback(async () => {
    if (!existsSync(ENTRY)) {
      addLog(`ERROR: Server not found at ${ENTRY}`)
      addLog('Run "deja update" to install the server first.')
      setStatus('stopped')
      return
    }

    const portFree = await checkPort(WS_PORT)
    if (!portFree) {
      addLog(`Port ${WS_PORT} is already in use — is another server instance running?`)
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
  }, [addLog, showHint])

  // ── Tunnel lifecycle ─────────────────────────────────────────────────────────

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
      args = ['tunnel', '--url', `http://localhost:${WS_PORT}`]
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
      if (isNamedTunnel && text.includes('Registered tunnel connection') && !tunnelUrl) {
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
  }, [addLog, tunnelUrl])

  // ── Toggle tunnel ────────────────────────────────────────────────────────────

  const toggleTunnel = useCallback(() => {
    if (tunnelRef.current) {
      stopTunnel()
      showHint('Tunnel stopped.')
    } else {
      spawnTunnel()
      showHint('Starting tunnel...')
    }
  }, [stopTunnel, spawnTunnel, showHint])

  // ── Export logs ──────────────────────────────────────────────────────────────

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

  // ── Auto-start: triggers on mode='logs' (onboarding-aware) ──────────────────

  useEffect(() => {
    if (mode === 'logs' && !childRef.current && status === 'starting') {
      spawnServer()
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ───────────────────────────────────────────────────────

  useEffect(() => () => {
    clearTimeout(hintTimer.current)
    childRef.current?.kill('SIGTERM')
    stopTunnel()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tunnel: auto-start when server running ───────────────────────────────────

  useEffect(() => {
    if (status === 'running' && !tunnelRef.current) {
      spawnTunnel()
    }
    if (status === 'stopped' && tunnelRef.current) {
      stopTunnel()
    }
  }, [status, spawnTunnel, stopTunnel])

  // ── Commands (text input) ────────────────────────────────────────────────────

  const handleCommand = useCallback((cmd) => {
    switch (cmd.toLowerCase().trim()) {
      case 'stop':
      case 'exit':
      case 'quit':
        addLog('Stopping server...')
        stopTunnel()
        childRef.current?.kill('SIGTERM')
        setTimeout(() => process.exit(0), 400)
        break

      case 'restart':
        addLog('Restarting server...')
        stopTunnel()
        childRef.current?.kill('SIGTERM')
        childRef.current = null
        setStatus('starting')
        setTimeout(spawnServer, 800)
        break

      case 'help':
        setShowHelp(v => !v)
        break

      default:
        addLog(`Unknown command: "${cmd}". Type help or press [?] for shortcuts.`)
    }
  }, [addLog, spawnServer, stopTunnel])

  // ── Keyboard input — mode-branched ──────────────────────────────────────────

  useInput((input, key) => {
    // Always: Ctrl+C exits
    if (key.ctrl && input === 'c') {
      addLog('Stopping...')
      stopTunnel()
      childRef.current?.kill('SIGTERM')
      setTimeout(() => process.exit(0), 400)
      return
    }

    // Onboarding: any key proceeds to logs
    if (mode === 'onboarding') {
      writeConfig({ onboardingComplete: true })
      configRef.current = readConfig()
      transitionMode('logs')
      return
    }

    // Menu mode
    if (mode === 'menu') {
      if (key.upArrow)   { setMenuIndex(i => Math.max(0, i - 1)); return }
      if (key.downArrow) { setMenuIndex(i => Math.min(MENU_ITEMS.length - 1, i + 1)); return }
      if (key.escape)    { transitionMode('logs'); return }
      if (key.return) {
        const item = MENU_ITEMS[menuIndex]
        switch (item.action) {
          case 'start':
            if (!childRef.current) { setStatus('starting'); spawnServer() }
            transitionMode('logs')
            break
          case 'stop':    handleCommand('stop'); transitionMode('logs'); break
          case 'restart': handleCommand('restart'); transitionMode('logs'); break
          case 'status':  transitionMode('status'); break
          case 'ports':   transitionMode('ports'); break
          case 'tunnel':  toggleTunnel(); transitionMode('logs'); break
          case 'export':  exportLogs(); transitionMode('logs'); break
        }
        return
      }
      return
    }

    // Port selector mode
    if (mode === 'ports') {
      if (key.upArrow)   { setPortIndex(i => Math.max(0, i - 1)); return }
      if (key.downArrow) { setPortIndex(i => Math.min(Math.max(0, availablePorts.length - 1), i + 1)); return }
      if (key.escape)    { transitionMode('menu'); return }
      if (key.return) {
        if (availablePorts.length > 0) {
          const selected = availablePorts[portIndex]
          writeConfig({ serialPort: selected })
          configRef.current = readConfig()
          showHint(`Serial port saved: ${selected}`)
        }
        transitionMode('menu')
        return
      }
      return
    }

    // Status panel mode
    if (mode === 'status') {
      if (key.escape || input === 'q') { transitionMode('logs'); return }
      return
    }

    // Log view (default mode)
    if (key.escape || input === 'm') { transitionMode('menu'); return }
    if (input === '?') { setShowHelp(v => !v); return }
    if (input === 'r') { handleCommand('restart'); return }
    if (input === 's') { handleCommand('stop'); return }
    if (input === 't') { toggleTunnel(); return }
    if (input === 'e') { exportLogs(); return }
    if (input === 'l') {
      setLogFilter(f => f === 'all' ? 'error' : f === 'error' ? 'warn' : 'all')
      return
    }

    // Text input (command box)
    if (key.return) {
      const cmd = inputText.trim()
      setInputText('')
      if (cmd) handleCommand(cmd)
      return
    }
    if (key.backspace || key.delete) { setInputText(t => t.slice(0, -1)); return }
    if (!key.ctrl && !key.meta && !key.tab && !key.escape && input) {
      setInputText(t => t + input)
    }
  })

  // ── Layout dimensions ────────────────────────────────────────────────────────

  const termHeight = stdout?.rows ?? 24
  const cols       = stdout?.columns ?? 80

  // Chrome height: logo + tip(1) + divider(1) + hint(1) + divider(1) + status(1) + input(1) + helpbar(1)
  const logoChrome = LOGO_LINES.length + 1  // logo lines + tip row
  const helpChrome = showHelp ? 10 : 0
  const baseChrome = logoChrome + 7          // divider + hint + divider + status + input + helpbar + 1
  const logHeight  = Math.max(termHeight - baseChrome - helpChrome, 3)

  // Filter and window log lines
  const filteredLines = logFilter === 'all'
    ? logLines
    : logLines.filter(l => l.toUpperCase().includes(logFilter === 'error' ? 'ERROR' : 'WARN'))

  const visibleLines = filteredLines.slice(-logHeight)
  const paddingLines = Math.max(0, logHeight - visibleLines.length)

  const cfg = configRef.current

  // ── Render ───────────────────────────────────────────────────────────────────

  // Full-screen onboarding
  if (mode === 'onboarding') {
    return h(OnboardingScreen)
  }

  return h(Box, { flexDirection: 'column', height: termHeight },

    // Header: logo + startup tip
    h(LogoHeader, { version: VERSION, startupTip }),
    h(Box, null, h(Text, { dimColor: true }, '─'.repeat(cols))),

    // Body — status panel takes full body; other modes share the log area
    mode === 'status'
      ? h(StatusPanel, {
          version: VERSION,
          status,
          pid,
          uptime,
          tunnelUrl,
          selectedPort: cfg.serialPort || null,
          layoutId:     cfg.layoutId   || null,
          wsPort:       WS_PORT,
        })
      : h(React.Fragment, null,

          // Help panel (shown above log pane when toggled)
          h(HelpPanel, { visible: showHelp }),

          // Main body: log pane OR menu OR port selector
          mode === 'menu'
            ? h(MenuOverlay, { items: MENU_ITEMS, selectedIndex: menuIndex, cols })
            : mode === 'ports'
              ? h(PortSelector, {
                  ports: availablePorts,
                  portIndex,
                  currentPort: cfg.serialPort || null,
                  cols,
                })
              : h(LogPane, { visibleLines, paddingLines, logHeight, filter: logFilter }),

          // Contextual hint row (always 1 line for layout stability)
          h(ContextHintRow, { hint: contextHint }),
        ),

    // Footer
    h(Box, null, h(Text, { dimColor: true }, '─'.repeat(cols))),
    h(StatusBar, {
      status,
      pid,
      uptime,
      tunnelUrl,
      selectedPort: cfg.serialPort || null,
    }),

    // Input row (logs mode only)
    mode === 'logs'
      ? h(Box, null,
          h(Text, { color: '#00C4FF' }, '> '),
          h(Text, null, inputText),
          h(Text, { color: '#00C4FF' }, '▌')
        )
      : null,

    // Help bar (always shown in logs mode)
    h(HelpBar, { mode, logFilter }),
  )
}

render(h(App), { exitOnCtrlC: false })
