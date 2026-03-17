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
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

// ── Paths ─────────────────────────────────────────────────────────────────────

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

const VERSION = getVersion()

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const { stdout } = useStdout()
  const [logLines, setLogLines]   = useState([])
  const [inputText, setInputText] = useState('')
  const [status, setStatus]       = useState('starting')
  const [pid, setPid]             = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [uptime, setUptime]       = useState('00:00:00')
  const childRef = useRef(null)

  // ── Logging ────────────────────────────────────────────────────────────────

  const addLog = useCallback((text) => {
    const lines = String(text).split('\n')
      .map(l => l.trimEnd())
      .filter(l => l.length > 0)
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

  const spawnServer = useCallback(() => {
    if (!existsSync(ENTRY)) {
      addLog(`ERROR: Server not found at ${ENTRY}`)
      addLog('Run "deja update" to install the server first.')
      setStatus('stopped')
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
      setPid(child.pid)
      setStartTime(Date.now())
      setStatus('running')
    })

    child.on('close', (code) => {
      setPid(null)
      setStartTime(null)
      setStatus('stopped')
      addLog(code != null ? `Server exited (code ${code})` : 'Server stopped.')
      childRef.current = null
    })

    child.on('error', (err) => {
      addLog(`Failed to start server: ${err.message}`)
      setStatus('stopped')
      childRef.current = null
    })

    childRef.current = child
  }, [addLog])

  // Spawn server on mount; clean up on unmount
  useEffect(() => {
    spawnServer()
    return () => { childRef.current?.kill('SIGTERM') }
  }, [spawnServer])

  // ── Commands ───────────────────────────────────────────────────────────────

  const handleCommand = useCallback((cmd) => {
    switch (cmd.toLowerCase().trim()) {
      case 'stop':
      case 'exit':
      case 'quit':
        addLog('Stopping server...')
        childRef.current?.kill('SIGTERM')
        setTimeout(() => process.exit(0), 400)
        break

      case 'restart':
        addLog('Restarting server...')
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box flexDirection="column" height={termHeight}>

      {/* Title */}
      <Box>
        <Text bold color="green">⚡ DEJA.js Server  </Text>
        <Text dimColor>v{VERSION}  ·  help for commands  ·  Ctrl+C to stop</Text>
      </Box>
      <Box>
        <Text dimColor>{'─'.repeat(stdout?.columns ?? 80)}</Text>
      </Box>

      {/* Log pane — padding rows keep the height fixed */}
      <Box flexDirection="column" height={logHeight}>
        {Array.from({ length: paddingLines }, (_, i) => (
          <Text key={`pad-${i}`}> </Text>
        ))}
        {visibleLines.map((line, i) => (
          <Text key={i} wrap="truncate">{line}</Text>
        ))}
      </Box>

      {/* Divider */}
      <Box>
        <Text dimColor>{'─'.repeat(stdout?.columns ?? 80)}</Text>
      </Box>

      {/* Status bar */}
      <Box>
        <Text color={statusColor}>{statusIcon}</Text>
        <Text> {status}{pidText}{uptimeText}</Text>
      </Box>

      {/* Input */}
      <Box>
        <Text color="cyan">{'> '}</Text>
        <Text>{inputText}</Text>
        <Text color="cyan">▌</Text>
      </Box>

    </Box>
  )
}

render(<App />, { exitOnCtrlC: false })
