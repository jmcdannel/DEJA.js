#!/usr/bin/env node
/**
 * apps/cli/install.mjs
 * 🎟️ `deja install <jwt>` — consume an install token minted by the cloud API.
 *
 * This command is typically run by install.sh after the user pastes a curl
 * command from the dashboard. The token is a JWT whose body contains the
 * pairing credentials (pairingId, sessionSecret) plus uid and layoutId. The
 * CLI does NOT verify the JWT signature locally — the cryptographic binding
 * is enforced server-side when the DEJA server later POSTs to
 * /api/devices/auth with these credentials.
 */

import { updateConfig } from './tui/lib/config.mjs'

// ── ANSI helpers ───────────────────────────────────────────────────────────────
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

function base64UrlDecodeJson(str) {
  return JSON.parse(Buffer.from(str, 'base64url').toString('utf8'))
}

export function parseInstallJwt(token) {
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('Install token is empty')
  }
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Malformed install token (expected 3 JWT segments)')
  }
  let payload
  try {
    payload = base64UrlDecodeJson(parts[1])
  } catch {
    throw new Error('Install token body is not valid base64url JSON')
  }
  if (
    typeof payload.pairingId !== 'string' ||
    typeof payload.sessionSecret !== 'string' ||
    typeof payload.uid !== 'string'
  ) {
    throw new Error(
      'Install token missing required fields (pairingId, sessionSecret, uid)',
    )
  }
  if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Install token expired — request a new one from the dashboard')
  }
  return payload
}

export async function install(token) {
  if (!token) {
    console.error(`  ${RED}✗${RESET} Usage: ${CYAN}deja install <install-token>${RESET}`)
    process.exit(2)
  }

  let payload
  try {
    payload = parseInstallJwt(token)
  } catch (err) {
    console.error(`  ${RED}✗${RESET} ${err.message}`)
    process.exit(1)
  }

  const updates = {
    uid: payload.uid,
    auth: {
      pairingId: payload.pairingId,
      sessionSecret: payload.sessionSecret,
    },
  }
  if (typeof payload.layoutId === 'string') {
    updates.layoutId = payload.layoutId
  }

  try {
    updateConfig(updates)
  } catch (err) {
    console.error(`  ${RED}✗${RESET} Failed to write config: ${err.message ?? err}`)
    process.exit(1)
  }

  console.log(`\n  ${GREEN}✓${RESET} ${BOLD}Device pairing configured${RESET}`)
  console.log(`  ${DIM}Account${RESET}  ${payload.uid}`)
  if (payload.layoutId) {
    console.log(`  ${DIM}Layout${RESET}   ${payload.layoutId}`)
  }
  console.log(`\n  ${DIM}Start the server with:${RESET} ${CYAN}deja start${RESET}\n`)
}

// Allow running directly or being imported for tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  install(process.argv[2]).catch((err) => {
    console.error(`  ${RED}✗${RESET} ${err.message ?? err}`)
    process.exit(1)
  })
}
