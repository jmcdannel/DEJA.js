#!/usr/bin/env node
/**
 * apps/cli/login.mjs
 * 🤝 `deja login` — device-code pairing flow.
 *
 * Starts a device-code pairing with the DEJA Cloud API, prints a short code
 * and verification URL, then polls until the user approves (or the code
 * expires). On approval, persists { pairingId, sessionSecret } into
 * ~/.deja/config.json with 0600 permissions.
 */

import { updateConfig } from './tui/lib/config.mjs'

const CLOUD_API_URL = process.env.DEJA_CLOUD_API_URL ?? 'https://cloud.dejajs.com'

// ── ANSI helpers ───────────────────────────────────────────────────────────────
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

async function postJson(path, body) {
  const url = `${CLOUD_API_URL}${path}`
  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
  } catch (err) {
    throw new Error(`network error contacting ${url}: ${err.message ?? err}`)
  }
  if (!res.ok) {
    let err = {}
    try { err = await res.json() } catch {}
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function login() {
  console.log(`\n  ${BOLD}🤝 DEJA device pairing${RESET}`)
  console.log(`  ${DIM}──────────────────────────────${RESET}\n`)

  let start
  try {
    start = await postJson('/api/devices/pair-start', {})
  } catch (err) {
    console.error(`  ${RED}✗${RESET} Failed to start pairing: ${err.message}`)
    process.exit(1)
  }

  if (
    typeof start.userCode !== 'string' ||
    typeof start.pollToken !== 'string' ||
    typeof start.verificationUrl !== 'string' ||
    typeof start.pollInterval !== 'number' ||
    typeof start.expiresIn !== 'number'
  ) {
    console.error(`  ${RED}✗${RESET} Pairing server returned an unexpected response.`)
    process.exit(1)
  }

  console.log(`  ${DIM}1.${RESET} Visit:       ${BOLD}${CYAN}${start.verificationUrl}${RESET}`)
  console.log(`  ${DIM}2.${RESET} Enter code:  ${BOLD}${CYAN}${start.userCode}${RESET}`)
  console.log(`  ${DIM}3.${RESET} Approve the device on your dashboard\n`)
  console.log(`  ${DIM}Waiting for approval... (press Ctrl-C to cancel)${RESET}`)

  const deadline = Date.now() + start.expiresIn * 1000
  const intervalMs = Math.max(1, start.pollInterval) * 1000

  while (Date.now() < deadline) {
    await sleep(intervalMs)

    let poll
    try {
      poll = await postJson('/api/devices/pair-poll', {
        userCode: start.userCode,
        pollToken: start.pollToken,
      })
    } catch (err) {
      console.error(`\n  ${RED}✗${RESET} Poll failed: ${err.message}`)
      process.exit(1)
    }

    if (poll.state === 'approved') {
      if (typeof poll.pairingId !== 'string' || typeof poll.sessionSecret !== 'string') {
        console.error(`\n  ${RED}✗${RESET} Approval response missing pairingId or sessionSecret.`)
        process.exit(1)
      }
      try {
        const updates = {
          auth: { pairingId: poll.pairingId, sessionSecret: poll.sessionSecret },
        }
        if (typeof poll.uid === 'string') updates.uid = poll.uid
        if (typeof poll.layoutId === 'string') updates.layoutId = poll.layoutId
        updateConfig(updates)
      } catch (err) {
        console.error(`\n  ${RED}✗${RESET} Failed to save config: ${err.message ?? err}`)
        process.exit(1)
      }
      console.log(`\n  ${GREEN}✓${RESET} Device paired successfully.`)
      console.log(`  ${DIM}You can now run:${RESET} ${CYAN}deja start${RESET}\n`)
      return
    }

    if (poll.state === 'expired') {
      console.error(
        `\n  ${RED}✗${RESET} Pairing code expired. Run ${CYAN}deja login${RESET} again.`,
      )
      process.exit(1)
    }

    // state === 'pending' → keep polling
  }

  console.error(
    `\n  ${RED}✗${RESET} Pairing timed out. Run ${CYAN}deja login${RESET} again.`,
  )
  process.exit(1)
}

// Allow running directly or being imported for tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  login().catch((err) => {
    console.error(`  ${RED}✗${RESET} ${err.message ?? err}`)
    process.exit(1)
  })
}
