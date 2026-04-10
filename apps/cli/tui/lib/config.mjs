/**
 * scripts/tui/lib/config.mjs
 * Environment loading, path constants, and config helpers.
 */

import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

// ── Load env ───────────────────────────────────────────────────────────────────

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

// ── Paths (all derived from ~/.deja/) ───────────────────────────────────────────

export const DEJA_DIR        = process.env.DEJA_DIR || join(homedir(), '.deja')
export const ENTRY           = join(DEJA_DIR, 'server', 'index.js')
export const VERSION_FILE    = join(DEJA_DIR, 'server', 'version.txt')
export const CONFIG_FILE     = join(DEJA_DIR, 'config.json')
export const LOG_DIR         = join(DEJA_DIR, 'logs')
export const TUNNEL_PID_FILE = join(DEJA_DIR, 'tunnel.pid')
export const TUNNEL_URL_FILE = join(DEJA_DIR, 'tunnel.url')
export const CLOUDFLARED_YML = join(DEJA_DIR, 'cloudflared.yml')

// ── Config helpers ─────────────────────────────────────────────────────────────

export function readConfig() {
  try { return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) }
  catch { return {} }
}

/**
 * 🔐 Atomically write config with 0600 permissions.
 * Matches the semantics of apps/server/src/lib/config-store.ts — ensures
 * directory exists with 0700, writes to a temp file with 0600, then renames.
 * Throws on failure so callers can handle errors explicitly.
 */
export function writeConfigAtomic(config) {
  const dir = dirname(CONFIG_FILE)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 })
  const tmp = `${CONFIG_FILE}.tmp`
  writeFileSync(tmp, JSON.stringify(config, null, 2), { mode: 0o600 })
  chmodSync(tmp, 0o600)
  renameSync(tmp, CONFIG_FILE)
}

/**
 * 🔄 Shallow-merge partial updates into the existing config and persist atomically.
 * This is the preferred API for all config writes — replaces the old best-effort
 * writeConfig() helper.
 */
export function updateConfig(updates) {
  const existing = readConfig()
  const next = { ...existing, ...updates }
  writeConfigAtomic(next)
  return next
}

/**
 * @deprecated Use {@link updateConfig} instead. Retained for backward compatibility
 * with existing TUI callers; now performs an atomic + 0600 write.
 */
export function writeConfig(updates) {
  try { updateConfig(updates) }
  catch {}
}

export function isFirstRun() {
  return !readConfig().onboardingComplete
}
