#!/usr/bin/env node
/**
 * scripts/deja-ui-ink.mjs
 * Interactive TUI for DEJA.js server — ink (React) implementation.
 *
 * Layout:
 *   ⚡ DEJA.js Server  v1.4.0  ·  help for commands  ·  Ctrl+C to stop
 *   ──────────────────────────────────────────────────
 *   [10:23:41] Starting server...
 *   [10:23:41] WebSocket listening on :8082
 *   ...  (last N lines, auto-scrolls)
 *   ──────────────────────────────────────────────────
 *   ● running  pid 12345  uptime 00:01:32
 *   > _
 *
 * Commands: restart · stop · help
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { render, Box, Text, useInput, useStdout } from 'ink'
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { homedir } from 'node:os'
import { join } from 'node:path'

// ── Load env ──────────────────────────────────────────────────────────────────

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

// ── Paths ─────────────────────────────────────────────────────────────────────
const ENTRY           = join(DEJA_DIR, 'server', 'index.js')
const VERSION_FILE    = join(DEJA_DIR, 'server', 'version.txt')
const CONFIG_FILE     = join(DEJA_DIR, 'config.json')
const LOG_DIR         = join(DEJA_DIR, 'logs')
const TUNNEL_PID_FILE = join(DEJA_DIR, 'tunnel.pid')
const TUNNEL_LOG_FILE = join(LOG_DIR, 'tunnel.log')
const TUNNEL_URL_FILE = join(DEJA_DIR, 'tunnel.url')
const CLOUDFLARED_YML = join(DEJA_DIR, 'cloudflared.yml')

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    srv.once('error', () => resolve(false))   // port in use
    srv.once('listening', () => srv.close(() => resolve(true))) // port free
    srv.listen(port)
  })
}

function getPlan() {
  try {
    const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'))
    return config.subscription?.plan || ''
  } catch { return '' }
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

const WS_PORT = parseInt(process.env.VITE_WS_PORT || '8082', 10)
const VERSION = getVersion()
const h = React.createElement

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const { stdout } = useStdout()
  const [logLines, setLogLines]   = useState([])
  const [inputText, setInputText] = useState('')
  const [status, setStatus]       = useState('starting')
  const [pid, setPid]             = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [uptime, setUptime]       = useState('00:00:00')
  const [tunnelUrl, setTunnelUrl] = useState(null)
  const childRef = useRef(null)
  const tunnelRef = useRef(null)

  // ── Logging ────────────────────────────────────────────────────────────────

  const addLog = useCallback((text) => {
    const raw = String(text)

    // Detect EADDRINUSE and replace the entire block with a friendly one-liner
    if (raw.includes('EADDRINUSE')) {
      const portMatch = raw.match(/address already in use (?:::)?(\d+)/) || raw.match(/port:\s*(\d+)/)
      const p = portMatch?.[1] || port
      const line = `[${ts()}] Port ${p} is already in use — is another server instance running?`
      setLogLines(prev => {
        const next = [...prev, line]
        return next.length > 500 ? next.slice(next.length - 500) : next
      })
      return
    }

    const lines = raw.split('\n')
      .map(l => l.trimEnd())
      .filter(l => l.length > 0)
      // Strip stack trace lines and error object property dumps
      .filter(l => !(/^\s+at\s/.test(l) || /^\s+(code|errno|syscall|address|port):/.test(l) || /^\s*[{}]\s*$/.test(l)))
      .map(l => `[${ts()}] ${l}`)
    if (!lines.length) return
    setLogLines(prev => {
      const next = [...prev, ...lines]
      // Keep a rolling window to avoid memory growth
      return next.length > 500 ? next.slice(next.length - 500) : next
    })
  }, [])

  // ── Uptime counter ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (status !== 'running' || !startTime) return
    const timer = setInterval(() => setUptime(formatUptime(startTime)), 1000)
    return () => clearInterval(timer)
  }, [status, startTime])

  // ── Server lifecycle ───────────────────────────────────────────────────────

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
      } else {
        addLog(`Server exited unexpectedly (code ${code}).`)
      }
      childRef.current = null
    })

    child.on('error', (err) => {
      addLog(`Failed to start server: ${err.message}`)
      setStatus('stopped')
      childRef.current = null
    })

    childRef.current = child
  }, [addLog])

  // ── Tunnel lifecycle ─────────────────────────────────────────────────────

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

    const token = process.env.CLOUDFLARE_TUNNEL_TOKEN || ''
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
      addLog('Starting temporary Cloudflare tunnel (no token or name configured)...')
      args = ['tunnel', '--url', `http://localhost:${WS_PORT}`]
    }

    mkdirSync(LOG_DIR, { recursive: true })

    const tunnel = spawn('cloudflared', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    tunnel.on('spawn', () => {
      try { writeFileSync(TUNNEL_PID_FILE, String(tunnel.pid)) } catch {}
    })

    // cloudflared writes connection info to stderr
    tunnel.stderr.on('data', (d) => {
      const text = String(d)
      // Extract temporary tunnel URL
      const urlMatch = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
      if (urlMatch) {
        setTunnelUrl(urlMatch[0])
        try { writeFileSync(TUNNEL_URL_FILE, urlMatch[0]) } catch {}
        addLog(`Temporary tunnel ready: ${urlMatch[0]}`)
      }
      // For named tunnels, show the configured URL
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
  }, [addLog])

  // Spawn server on mount; clean up on unmount
  useEffect(() => {
    spawnServer()
    return () => {
      childRef.current?.kill('SIGTERM')
      stopTunnel()
    }
  }, [spawnServer, stopTunnel])

  // Start tunnel once server is running
  useEffect(() => {
    if (status === 'running' && !tunnelRef.current) {
      spawnTunnel()
    }
    if (status === 'stopped' && tunnelRef.current) {
      stopTunnel()
    }
  }, [status, spawnTunnel, stopTunnel])

  // ── Commands ───────────────────────────────────────────────────────────────

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
        addLog('')
        addLog('Available commands:')
        addLog('  restart   Stop and restart the server')
        addLog('  stop      Stop the server and exit')
        addLog('  help      Show this help')
        addLog('')
        break

      default:
        addLog(`Unknown command: "${cmd}". Type help for available commands.`)
    }
  }, [addLog, spawnServer])

  // ── Keyboard input ─────────────────────────────────────────────────────────
  // Single useInput at the root handles everything — no conflicts.

  useInput((input, key) => {
    // Ctrl+C → stop
    if (key.ctrl && input === 'c') {
      addLog('Stopping...')
      stopTunnel()
      childRef.current?.kill('SIGTERM')
      setTimeout(() => process.exit(0), 400)
      return
    }
    // Enter → submit command
    if (key.return) {
      const cmd = inputText.trim()
      setInputText('')
      if (cmd) handleCommand(cmd)
      return
    }
    // Backspace / delete
    if (key.backspace || key.delete) {
      setInputText(t => t.slice(0, -1))
      return
    }
    // Regular character
    if (!key.ctrl && !key.meta && !key.tab && !key.escape && input) {
      setInputText(t => t + input)
    }
  })

  // ── Layout dimensions ──────────────────────────────────────────────────────

  const termHeight = stdout?.rows ?? 24
  // chrome = title(1) + divider(1) + status(1) + divider(1) + input(1) = 5
  const logHeight  = Math.max(termHeight - 5, 1)

  // Pad the log pane so it always fills logHeight rows (keeps status+input anchored)
  const visibleLines = logLines.slice(-logHeight)
  const paddingLines = Math.max(0, logHeight - visibleLines.length)

  // ── Status bar content ─────────────────────────────────────────────────────

  const statusColor = status === 'running' ? 'green' : status === 'stopped' ? 'red' : 'yellow'
  const statusIcon  = status === 'running' ? '●' : '○'
  const pidText     = pid ? `  pid ${pid}` : ''
  const uptimeText  = status === 'running' ? `  uptime ${uptime}` : ''
  const tunnelText  = tunnelUrl ? `  🔒 ${tunnelUrl}` : ''

  // ── Render ─────────────────────────────────────────────────────────────────

  return h(Box, { flexDirection: 'column', height: termHeight },
    // Title
    h(Box, null,
      h(Text, { bold: true, color: 'green' }, '⚡ DEJA.js Server  '),
      h(Text, { dimColor: true }, `v${VERSION}  ·  help for commands  ·  Ctrl+C to stop`)
    ),
    h(Box, null,
      h(Text, { dimColor: true }, '─'.repeat(stdout?.columns ?? 80))
    ),

    // Log pane — padding rows keep the height fixed
    h(Box, { flexDirection: 'column', height: logHeight },
      ...Array.from({ length: paddingLines }, (_, i) =>
        h(Text, { key: `pad-${i}` }, ' ')
      ),
      ...visibleLines.map((line, i) =>
        h(Text, { key: i, wrap: 'truncate' }, line)
      )
    ),

    // Divider
    h(Box, null,
      h(Text, { dimColor: true }, '─'.repeat(stdout?.columns ?? 80))
    ),

    // Status bar
    h(Box, null,
      h(Text, { color: statusColor }, statusIcon),
      h(Text, null, ` ${status}${pidText}${uptimeText}`),
      tunnelUrl ? h(Text, { dimColor: true }, tunnelText) : null
    ),

    // Input
    h(Box, null,
      h(Text, { color: 'cyan' }, '> '),
      h(Text, null, inputText),
      h(Text, { color: 'cyan' }, '▌')
    )
  )
}

render(h(App), { exitOnCtrlC: false })
