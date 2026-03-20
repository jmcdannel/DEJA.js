/**
 * scripts/tui/App.mjs
 * Root App component — minimal shell for Task 1.
 * Renders LogoHeader, handles Ctrl+C, tracks terminal dimensions via state+resize.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Text, useInput, useStdout } from 'ink'

// Lib
import { loadEnvFile, DEJA_DIR, readConfig } from './lib/config.mjs'
import { STARTUP_TIPS } from './lib/brand.mjs'
import { getVersion } from './lib/helpers.mjs'

// Components
import { LogoHeader } from './components/LogoHeader.mjs'

const h = React.createElement

// Load env ONCE at module scope — before any React code runs
loadEnvFile(`${DEJA_DIR}/.env`)

const VERSION = getVersion()

export function App() {
  const { stdout } = useStdout()

  // ── Terminal dimensions — read once, update on resize ────────────────────────
  const [termSize, setTermSize] = useState(() => ({
    cols: stdout?.columns ?? 80,
    rows: stdout?.rows ?? 24,
  }))

  useEffect(() => {
    if (!stdout) return
    const onResize = () => {
      setTermSize({ cols: stdout.columns, rows: stdout.rows })
    }
    stdout.on('resize', onResize)
    return () => stdout.off('resize', onResize)
  }, [stdout])

  // ── Stable state — computed once ─────────────────────────────────────────────
  const [startupTip] = useState(() =>
    STARTUP_TIPS[Math.floor(Math.random() * STARTUP_TIPS.length)]
  )

  // Cache config in ref — no per-render disk I/O
  const configRef = useRef(readConfig())

  // Refs for child processes — populated by future hooks (Task 3, Task 4)
  const childRef  = useRef(null)
  const tunnelRef = useRef(null)

  // ── Ctrl+C handler ───────────────────────────────────────────────────────────
  const handleExit = useCallback(() => {
    console.error('Stopping...')
    childRef.current?.kill('SIGTERM')
    tunnelRef.current?.kill('SIGTERM')
    setTimeout(() => process.exit(0), 400)
  }, [])

  useInput(useCallback((input, key) => {
    if (key.ctrl && input === 'c') {
      handleExit()
      return
    }
  }, [handleExit]))

  // ── Render ───────────────────────────────────────────────────────────────────
  return h(Box, { flexDirection: 'column', height: termSize.rows },

    // Header: logo + startup tip
    h(LogoHeader, { version: VERSION, startupTip }),
    h(Box, null, h(Text, { dimColor: true }, '─'.repeat(termSize.cols))),

    // Placeholder body — future tasks will add log pane, status bar, etc.
    h(Box, { flexGrow: 1, flexDirection: 'column', paddingLeft: 1 },
      h(Text, { color: '#00C4FF' }, '🚂 DEJA.js TUI ready. More features coming soon.'),
      h(Text, { dimColor: true }, 'Press Ctrl+C to exit.')
    ),
  )
}
