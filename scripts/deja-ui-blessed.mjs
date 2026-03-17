#!/usr/bin/env node
/**
 * scripts/deja-ui-blessed.mjs
 * Interactive TUI for DEJA.js server — blessed (ncurses-style) implementation.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────┐
 *   │ ⚡ DEJA.js Server — v1.4.0                        │  ← title (1 line)
 *   ├─────────────────────────────────────────────────┤
 *   │ [10:23:41] Starting server...                    │
 *   │ [10:23:41] WebSocket listening on :8082           │  ← scrollable log
 *   │ ...                                              │
 *   ├─────────────────────────────────────────────────┤
 *   │ ● running  pid 12345  uptime 00:01:32            │  ← status bar
 *   ├─────────────────────────────────────────────────┤
 *   │ > _                                              │  ← input box
 *   └─────────────────────────────────────────────────┘
 *
 * Commands: restart · stop · help
 */

import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

// blessed is CommonJS — use createRequire for ESM compat
const require = createRequire(import.meta.url)
const blessed = require('blessed')

// ── Paths ────────────────────────────────────────────────────────────────────

const DEJA_DIR     = join(homedir(), '.deja')
const ENTRY        = join(DEJA_DIR, 'server', 'index.js')
const VERSION_FILE = join(DEJA_DIR, 'server', 'version.txt')

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

// ── State ─────────────────────────────────────────────────────────────────────

let serverProcess  = null
let serverPid      = null
let serverStartTime = null
let serverStatus   = 'starting'

// ── Screen ────────────────────────────────────────────────────────────────────

const screen = blessed.screen({
  smartCSR: true,
  fullUnicode: true,
  title: 'DEJA.js Server',
})

const version = getVersion()

// Title bar (row 0)
blessed.box({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: 1,
  tags: true,
  content: `{green-fg}{bold}⚡ DEJA.js Server{/bold}{/green-fg}  {dim}v${version}  ·  {cyan-fg}help{/cyan-fg} for commands  ·  {cyan-fg}Ctrl+C{/cyan-fg} to stop{/dim}`,
  style: { bg: 'black' },
})

// Log pane (fills space between title and status bar)
const logBox = blessed.log({
  parent: screen,
  top: 1,
  left: 0,
  width: '100%',
  bottom: 2,            // leaves 2 rows for status + input
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  tags: false,
  style: { fg: 'white', bg: 'black' },
})

// Status bar (2nd-to-last row)
const statusBar = blessed.box({
  parent: screen,
  bottom: 1,
  left: 0,
  width: '100%',
  height: 1,
  tags: true,
  content: '{dim}○ starting...{/dim}',
  style: { bg: 'black' },
})

// Prompt label (">" prefix, non-editable)
blessed.text({
  parent: screen,
  bottom: 0,
  left: 0,
  width: 2,
  height: 1,
  content: '> ',
  style: { fg: 'cyan', bg: 'black' },
})

// Input textbox (last row, offset past the prompt)
const inputBox = blessed.textbox({
  parent: screen,
  bottom: 0,
  left: 2,
  width: '100%-2',
  height: 1,
  keys: true,
  mouse: true,
  inputOnFocus: true,
  style: { fg: 'white', bg: 'black', focus: { fg: 'white' } },
})

// ── Log helper ────────────────────────────────────────────────────────────────

function addLog(text) {
  for (const line of String(text).split('\n')) {
    const trimmed = line.trimEnd()
    if (trimmed) logBox.log(`[${ts()}] ${trimmed}`)
  }
  screen.render()
}

// ── Status bar ────────────────────────────────────────────────────────────────

function updateStatus() {
  const icon    = serverStatus === 'running' ? '{green-fg}●{/green-fg}' : '{dim}○{/dim}'
  const pidText = serverPid ? `  pid ${serverPid}` : ''
  const upText  = (serverStatus === 'running' && serverStartTime)
    ? `  uptime ${formatUptime(serverStartTime)}`
    : ''
  statusBar.setContent(` ${icon} ${serverStatus}${pidText}${upText}`)
  screen.render()
}

setInterval(updateStatus, 1000)

// ── Server management ─────────────────────────────────────────────────────────

function spawnServer() {
  if (!existsSync(ENTRY)) {
    addLog(`ERROR: Server not found at ${ENTRY}`)
    addLog('Run "deja update" to install the server first.')
    serverStatus = 'stopped'
    updateStatus()
    return
  }

  addLog('Starting DEJA.js server...')

  const child = spawn('node', [ENTRY], {
    cwd: DEJA_DIR,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.on('data', d => addLog(String(d)))
  child.stderr.on('data', d => addLog(String(d)))

  child.on('spawn', () => {
    serverPid       = child.pid
    serverStartTime = Date.now()
    serverStatus    = 'running'
    updateStatus()
  })

  child.on('close', (code) => {
    serverPid       = null
    serverStartTime = null
    serverStatus    = 'stopped'
    addLog(code != null ? `Server exited (code ${code})` : 'Server stopped.')
    updateStatus()
    serverProcess = null
  })

  child.on('error', (err) => {
    addLog(`Failed to start server: ${err.message}`)
    serverStatus  = 'stopped'
    serverProcess = null
    updateStatus()
  })

  serverProcess = child
}

function shutdown() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM')
    serverProcess = null
  }
  screen.destroy()
  process.exit(0)
}

function restartServer() {
  addLog('Restarting server...')
  if (serverProcess) {
    serverProcess.kill('SIGTERM')
    serverProcess = null
  }
  serverStatus = 'starting'
  updateStatus()
  setTimeout(spawnServer, 800)
}

// ── Commands ──────────────────────────────────────────────────────────────────

function handleCommand(raw) {
  const cmd = raw.toLowerCase().trim()
  if (!cmd) return

  switch (cmd) {
    case 'stop':
    case 'exit':
    case 'quit':
      addLog('Stopping server...')
      shutdown()
      break

    case 'restart':
      restartServer()
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
      addLog(`Unknown command: "${raw}". Type help for available commands.`)
  }
}

// ── Input handling ────────────────────────────────────────────────────────────

inputBox.key('enter', () => {
  const value = inputBox.getValue()
  inputBox.clearValue()
  screen.render()
  handleCommand(value.trim())
  inputBox.focus()
})

screen.key(['C-c'], shutdown)
screen.on('click', () => inputBox.focus())

// ── Start ─────────────────────────────────────────────────────────────────────

screen.render()
inputBox.focus()
spawnServer()
