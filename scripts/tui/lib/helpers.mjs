/**
 * scripts/tui/lib/helpers.mjs
 * Utility functions: version, uptime, timestamps, port checking, log styling.
 */

import { readFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { VERSION_FILE } from './config.mjs'

// ── Version ────────────────────────────────────────────────────────────────────

export function getVersion() {
  try { return readFileSync(VERSION_FILE, 'utf8').trim() }
  catch { return 'dev' }
}

// ── Uptime formatting ──────────────────────────────────────────────────────────

export function formatUptime(startMs) {
  const secs = Math.floor((Date.now() - startMs) / 1000)
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ── Timestamp ──────────────────────────────────────────────────────────────────

export function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

// ── Port availability check ────────────────────────────────────────────────────

export function checkPort(port) {
  return new Promise((resolve) => {
    const srv = createServer()
    srv.once('error', () => resolve(false))
    srv.once('listening', () => srv.close(() => resolve(true)))
    srv.listen(port)
  })
}

// ── Log line coloring ──────────────────────────────────────────────────────────

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
