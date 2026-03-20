import { useState, useRef, useCallback } from 'react'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { LOG_DIR } from '../lib/config.mjs'
import { ts } from '../lib/helpers.mjs'

/**
 * useLogger — manages log lines with debounced flushing, filtering,
 * contextual hints, and log export.
 *
 * Anti-flicker: log lines accumulate in a ref buffer and flush to React
 * state after a 200 ms quiet period, batching rapid server output into
 * a single re-render.  Each line is { id, text } with a monotonic ID
 * for stable React keys.
 *
 * @param {number} wsPort  WebSocket port (used in EADDRINUSE hints)
 * @returns {{ logLines, logFilter, contextHint, addLog, showHint, exportLogs, cycleFilter, cleanup }}
 */
export function useLogger(wsPort) {
  const [logLines, setLogLines]       = useState([])
  const [logFilter, setLogFilter]     = useState('all')
  const [contextHint, setContextHint] = useState(null)

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const bufferRef     = useRef([])        // accumulates { id, text } before flush
  const flushTimerRef = useRef(null)      // setTimeout ID for debounce
  const idCounterRef  = useRef(0)         // monotonic ID counter
  const hintTimerRef  = useRef(null)      // setTimeout ID for hint auto-clear

  // ── Noise filters ─────────────────────────────────────────────────────────────
  const NOISE_RE_STACK    = /^\s+at\s/
  const NOISE_RE_META     = /^\s+(code|errno|syscall|address|port):/
  const NOISE_RE_BRACE    = /^\s*[{}]\s*$/

  function isNoise(line) {
    return NOISE_RE_STACK.test(line) || NOISE_RE_META.test(line) || NOISE_RE_BRACE.test(line)
  }

  // ── Flush buffer → React state ────────────────────────────────────────────────
  const flushBuffer = useCallback(() => {
    const newLines = bufferRef.current
    if (newLines.length === 0) return
    bufferRef.current = []
    setLogLines(prev => {
      const next = [...prev, ...newLines]
      return next.length > 500 ? next.slice(-500) : next
    })
  }, [])

  // ── Schedule a debounced flush ────────────────────────────────────────────────
  const scheduleFlush = useCallback(() => {
    clearTimeout(flushTimerRef.current)
    flushTimerRef.current = setTimeout(flushBuffer, 200)
  }, [flushBuffer])

  // ── Hint helper ───────────────────────────────────────────────────────────────
  const showHint = useCallback((msg) => {
    setContextHint(msg)
    clearTimeout(hintTimerRef.current)
    hintTimerRef.current = setTimeout(() => setContextHint(null), 5000)
  }, [])

  // ── addLog — buffer lines, debounce flush ─────────────────────────────────────
  const addLog = useCallback((text) => {
    const raw = String(text)

    // 1. EADDRINUSE — friendly one-liner replaces all output
    if (raw.includes('EADDRINUSE')) {
      const portMatch = raw.match(/address already in use (?:::)?(\d+)/) || raw.match(/port:\s*(\d+)/)
      const p = portMatch?.[1] || wsPort
      bufferRef.current.push({
        id: idCounterRef.current++,
        text: `[${ts()}] ⚠ Port ${p} already in use — is another server running?`,
      })
      showHint(`Port ${p} in use. Stop the other process or change VITE_WS_PORT.`)
      scheduleFlush()
      return
    }

    // 2. Contextual hints from log content
    if (raw.includes('Registered tunnel connection') || raw.includes('trycloudflare.com')) {
      showHint('Tunnel connected! Remote access is live.')
    }
    if (raw.includes('FATAL') || raw.includes('Uncaught Exception')) {
      showHint('Server error detected. Press [r] to restart.')
    }

    // 3. Split, trim, filter empty
    const lines = raw.split('\n')
      .map(l => l.trimEnd())
      .filter(l => l.length > 0)

    // 4. Filter noise
    const cleaned = lines.filter(l => !isNoise(l))
    if (cleaned.length === 0) return

    // 5. Create log entry objects with monotonic IDs
    for (const line of cleaned) {
      bufferRef.current.push({
        id: idCounterRef.current++,
        text: `[${ts()}] ${line}`,
      })
    }

    // 6. Schedule debounced flush
    scheduleFlush()
  }, [showHint, wsPort, scheduleFlush])

  // ── Export logs ───────────────────────────────────────────────────────────────
  const exportLogs = useCallback(() => {
    try {
      mkdirSync(LOG_DIR, { recursive: true })
      const filename = `export-${Date.now()}.txt`
      const filepath = join(LOG_DIR, filename)
      // Combine flushed state + any unflushed buffer lines
      const allLines = [...logLines, ...bufferRef.current]
      writeFileSync(filepath, allLines.map(l => l.text).join('\n'))
      showHint(`Logs exported → ~/.deja/logs/${filename}`)
    } catch (err) {
      showHint(`Export failed: ${err.message}`)
    }
  }, [logLines, showHint])

  // ── Cycle filter: all → error → warn → all ───────────────────────────────────
  const cycleFilter = useCallback(() => {
    setLogFilter(f => f === 'all' ? 'error' : f === 'error' ? 'warn' : 'all')
  }, [])

  // ── Cleanup — clear pending timers ────────────────────────────────────────────
  const cleanup = useCallback(() => {
    clearTimeout(flushTimerRef.current)
    clearTimeout(hintTimerRef.current)
  }, [])

  return { logLines, logFilter, contextHint, addLog, showHint, exportLogs, cycleFilter, cleanup }
}
