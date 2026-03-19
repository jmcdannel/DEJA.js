import { useState, useRef, useCallback } from 'react'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { LOG_DIR } from '../lib/config.mjs'
import { ts } from '../lib/helpers.mjs'

/**
 * useLogger — manages log lines, log filtering, contextual hints, and log export.
 *
 * @param {number} wsPort  WebSocket port (used in EADDRINUSE hints)
 * @returns {{ logLines, logFilter, contextHint, addLog, showHint, exportLogs, cycleFilter, cleanup }}
 */
export function useLogger(wsPort) {
  const [logLines, setLogLines]       = useState([])
  const [logFilter, setLogFilter]     = useState('all')
  const [contextHint, setContextHint] = useState(null)
  const hintTimer                     = useRef(null)

  // ── Hint helper ──────────────────────────────────────────────────────────────

  const showHint = useCallback((msg) => {
    setContextHint(msg)
    clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setContextHint(null), 5000)
  }, [])

  // ── Logging ────────────────────────────────────────────────────────────────

  const addLog = useCallback((text) => {
    const raw = String(text)

    // EADDRINUSE — friendly one-liner
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
  }, [showHint, wsPort])

  // ── Export logs ────────────────────────────────────────────────────────────

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

  // ── Cycle filter ───────────────────────────────────────────────────────────

  const cycleFilter = useCallback(() => {
    setLogFilter(f => f === 'all' ? 'error' : f === 'error' ? 'warn' : 'all')
  }, [])

  // ── Cleanup ────────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    clearTimeout(hintTimer.current)
  }, [])

  return { logLines, logFilter, contextHint, addLog, showHint, exportLogs, cycleFilter, cleanup }
}
