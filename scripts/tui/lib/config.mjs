import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

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

// ── Paths ──────────────────────────────────────────────────────────────────────

export const DEJA_DIR = join(homedir(), '.deja')

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

export function writeConfig(updates) {
  const existing = readConfig()
  try { writeFileSync(CONFIG_FILE, JSON.stringify({ ...existing, ...updates }, null, 2)) }
  catch {}
}

export function isFirstRun() {
  return !readConfig().onboardingComplete
}
