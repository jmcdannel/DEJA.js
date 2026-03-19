/**
 * scripts/tui/App.mjs
 * Root App component — wires hooks, components, keyboard input, and layout.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Text, useInput, useStdout } from 'ink'

// Lib
import { loadEnvFile, DEJA_DIR, readConfig, writeConfig, isFirstRun } from './lib/config.mjs'
import { LOGO_LINES, STARTUP_TIPS, MENU_ITEMS } from './lib/brand.mjs'
import { detectSerialPorts } from './lib/serial.mjs'
import { getVersion } from './lib/helpers.mjs'

// Components
import { LogoHeader } from './components/LogoHeader.mjs'
import { HelpPanel } from './components/HelpPanel.mjs'
import { LogPane } from './components/LogPane.mjs'
import { ContextHintRow } from './components/ContextHintRow.mjs'
import { StatusBar } from './components/StatusBar.mjs'
import { HelpBar } from './components/HelpBar.mjs'
import { MenuOverlay } from './components/MenuOverlay.mjs'
import { PortSelector } from './components/PortSelector.mjs'
import { StatusPanel } from './components/StatusPanel.mjs'
import { OnboardingScreen } from './components/OnboardingScreen.mjs'

// Hooks
import { useLogger } from './hooks/useLogger.mjs'
import { useServerProcess } from './hooks/useServerProcess.mjs'
import { useTunnel } from './hooks/useTunnel.mjs'

// Commands
import { registerAllCommands } from './commands/index.mjs'
import { lookup } from './commands/registry.mjs'
import { CommandInput, useCommandInput } from './components/CommandInput.mjs'

const h = React.createElement

// Load env ONCE at module scope
loadEnvFile(`${DEJA_DIR}/.env`)

// Register all slash commands at module scope
registerAllCommands()

const WS_PORT = parseInt(process.env.VITE_WS_PORT || '8082', 10)
const VERSION = getVersion()

export function App() {
  const { stdout } = useStdout()

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { logLines, logFilter, contextHint, addLog, showHint, exportLogs, cycleFilter, cleanup: logCleanup } = useLogger(WS_PORT)
  const { status, pid, uptime, childRef, spawnServer, stopServer, restartServer, setStatus, cleanup: serverCleanup } = useServerProcess(WS_PORT, addLog, showHint)
  const { tunnelUrl, tunnelRef, spawnTunnel, stopTunnel, toggleTunnel, cleanup: tunnelCleanup } = useTunnel(WS_PORT, addLog, showHint)

  // ── Local TUI state ────────────────────────────────────────────────────────
  const [mode, setMode]                     = useState(() => isFirstRun() ? 'onboarding' : 'logs')
  const [menuIndex, setMenuIndex]           = useState(0)
  const [portIndex, setPortIndex]           = useState(0)
  const [availablePorts, setAvailablePorts] = useState([])
  const [showHelp, setShowHelp]             = useState(false)
  const { inputText, setInputText, handleTab, handleChar, handleBackspace, handleClear } = useCommandInput()
  const [startupTip]                        = useState(() =>
    STARTUP_TIPS[Math.floor(Math.random() * STARTUP_TIPS.length)]
  )

  const configRef = useRef(readConfig())

  // ── Mode transitions ───────────────────────────────────────────────────────

  const transitionMode = useCallback((next) => {
    if (next === 'ports') {
      setAvailablePorts(detectSerialPorts())
      setPortIndex(0)
    }
    if (next === 'menu') setMenuIndex(0)
    setMode(next)
  }, [])

  // ── Commands (text input) ──────────────────────────────────────────────────

  const handleCommand = useCallback((cmd) => {
    switch (cmd.toLowerCase().trim()) {
      case 'stop':
      case 'exit':
      case 'quit':
        addLog('Stopping server...')
        stopTunnel()
        childRef.current?.kill('SIGTERM')
        setTimeout(() => process.exit(0), 400)
        break

      case 'restart':
        addLog('Restarting server...')
        stopTunnel()
        childRef.current?.kill('SIGTERM')
        childRef.current = null
        setStatus('starting')
        setTimeout(spawnServer, 800)
        break

      case 'help':
        setShowHelp(v => !v)
        break

      default:
        addLog(`Unknown command: "${cmd}". Type help or press [?] for shortcuts.`)
    }
  }, [addLog, spawnServer, stopTunnel, childRef, setStatus])

  // ── Command context (passed to slash command execute()) ───────────────────

  const commandContext = {
    addLog, showHint, transitionMode,
    spawnServer, stopServer, restartServer, setStatus,
    childRef,
    toggleTunnel, tunnelCleanup,
    exportLogs, cycleFilter,
  }

  // ── Auto-start: triggers on mode='logs' (onboarding-aware) ────────────────

  useEffect(() => {
    if (mode === 'logs' && !childRef.current && status === 'starting') {
      spawnServer()
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ─────────────────────────────────────────────────────

  useEffect(() => () => {
    logCleanup()
    serverCleanup()
    tunnelCleanup()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tunnel: auto-start when server running ─────────────────────────────────

  useEffect(() => {
    if (status === 'running' && !tunnelRef.current) {
      spawnTunnel()
    }
    if (status === 'stopped' && tunnelRef.current) {
      stopTunnel()
    }
  }, [status, spawnTunnel, stopTunnel])

  // ── Keyboard input — mode-branched ─────────────────────────────────────────

  useInput((input, key) => {
    // Always: Ctrl+C exits
    if (key.ctrl && input === 'c') {
      addLog('Stopping...')
      stopTunnel()
      childRef.current?.kill('SIGTERM')
      setTimeout(() => process.exit(0), 400)
      return
    }

    // Onboarding: any key proceeds to logs
    if (mode === 'onboarding') {
      writeConfig({ onboardingComplete: true })
      configRef.current = readConfig()
      transitionMode('logs')
      return
    }

    // Menu mode
    if (mode === 'menu') {
      if (key.upArrow)   { setMenuIndex(i => Math.max(0, i - 1)); return }
      if (key.downArrow) { setMenuIndex(i => Math.min(MENU_ITEMS.length - 1, i + 1)); return }
      if (key.escape)    { transitionMode('logs'); return }
      if (key.return) {
        const item = MENU_ITEMS[menuIndex]
        switch (item.action) {
          case 'start':
            if (!childRef.current) { setStatus('starting'); spawnServer() }
            transitionMode('logs')
            break
          case 'stop':    handleCommand('stop'); transitionMode('logs'); break
          case 'restart': handleCommand('restart'); transitionMode('logs'); break
          case 'status':  transitionMode('status'); break
          case 'ports':   transitionMode('ports'); break
          case 'tunnel':  toggleTunnel(); transitionMode('logs'); break
          case 'export':  exportLogs(); transitionMode('logs'); break
        }
        return
      }
      return
    }

    // Port selector mode
    if (mode === 'ports') {
      if (key.upArrow)   { setPortIndex(i => Math.max(0, i - 1)); return }
      if (key.downArrow) { setPortIndex(i => Math.min(Math.max(0, availablePorts.length - 1), i + 1)); return }
      if (key.escape)    { transitionMode('menu'); return }
      if (key.return) {
        if (availablePorts.length > 0) {
          const selected = availablePorts[portIndex]
          writeConfig({ serialPort: selected })
          configRef.current = readConfig()
          showHint(`Serial port saved: ${selected}`)
        }
        transitionMode('menu')
        return
      }
      return
    }

    // Status panel mode
    if (mode === 'status') {
      if (key.escape || input === 'q') { transitionMode('logs'); return }
      return
    }

    // Log view (default mode)

    // Tab: cycle through slash-command completions
    if (key.tab) { handleTab(); return }

    // Enter: execute slash command or legacy text command
    if (key.return) {
      const raw = inputText.trim()
      if (!raw) return
      if (raw.startsWith('/')) {
        const result = lookup(raw)
        if (result) {
          result.command.execute(result.args, commandContext)
        } else {
          addLog(`Unknown command: "${raw}". Type /help for available commands.`)
        }
      } else {
        handleCommand(raw)
      }
      handleClear()
      return
    }

    // Esc: clear input if non-empty, otherwise open menu
    if (key.escape) {
      if (inputText.length > 0) { handleClear(); return }
      transitionMode('menu')
      return
    }

    // Backspace/Delete
    if (key.backspace || key.delete) { handleBackspace(); return }

    // When input is non-empty, all keys go to input buffer (hotkeys disabled)
    if (inputText.length > 0) {
      if (!key.ctrl && !key.meta && input) {
        handleChar(input)
      }
      return
    }

    // Hotkeys (only when input is empty)
    if (input === 'm') { transitionMode('menu'); return }
    if (input === '?') { setShowHelp(v => !v); return }
    if (input === 'r') { handleCommand('restart'); return }
    if (input === 's') { handleCommand('stop'); return }
    if (input === 't') { toggleTunnel(); return }
    if (input === 'e') { exportLogs(); return }
    if (input === 'l') { cycleFilter(); return }

    // Regular character input
    if (!key.ctrl && !key.meta && input) {
      handleChar(input)
    }
  })

  // ── Layout dimensions ──────────────────────────────────────────────────────

  const termHeight = stdout?.rows ?? 24
  const cols       = stdout?.columns ?? 80

  // Chrome height: logo + tip(1) + divider(1) + hint(1) + divider(1) + status(1) + input(1) + helpbar(1)
  const logoChrome = LOGO_LINES.length + 1  // logo lines + tip row
  const helpChrome = showHelp ? 10 : 0
  const baseChrome = logoChrome + 7          // divider + hint + divider + status + input + helpbar + 1
  const logHeight  = Math.max(termHeight - baseChrome - helpChrome, 3)

  // Filter and window log lines
  const filteredLines = logFilter === 'all'
    ? logLines
    : logLines.filter(l => l.toUpperCase().includes(logFilter === 'error' ? 'ERROR' : 'WARN'))

  const visibleLines = filteredLines.slice(-logHeight)
  const paddingLines = Math.max(0, logHeight - visibleLines.length)

  const cfg = configRef.current

  // ── Render ─────────────────────────────────────────────────────────────────

  // Full-screen onboarding
  if (mode === 'onboarding') {
    return h(OnboardingScreen)
  }

  return h(Box, { flexDirection: 'column', height: termHeight },

    // Header: logo + startup tip
    h(LogoHeader, { version: VERSION, startupTip }),
    h(Box, null, h(Text, { dimColor: true }, '─'.repeat(cols))),

    // Body — status panel takes full body; other modes share the log area
    mode === 'status'
      ? h(StatusPanel, {
          version: VERSION,
          status,
          pid,
          uptime,
          tunnelUrl,
          selectedPort: cfg.serialPort || null,
          layoutId:     cfg.layoutId   || null,
          wsPort:       WS_PORT,
        })
      : h(React.Fragment, null,

          // Help panel (shown above log pane when toggled)
          h(HelpPanel, { visible: showHelp }),

          // Main body: log pane OR menu OR port selector
          mode === 'menu'
            ? h(MenuOverlay, { items: MENU_ITEMS, selectedIndex: menuIndex, cols })
            : mode === 'ports'
              ? h(PortSelector, {
                  ports: availablePorts,
                  portIndex,
                  currentPort: cfg.serialPort || null,
                  cols,
                })
              : h(LogPane, { visibleLines, paddingLines, logHeight, filter: logFilter }),

          // Contextual hint row (always 1 line for layout stability)
          h(ContextHintRow, { hint: contextHint }),
        ),

    // Footer
    h(Box, null, h(Text, { dimColor: true }, '─'.repeat(cols))),
    h(StatusBar, {
      status,
      pid,
      uptime,
      tunnelUrl,
      selectedPort: cfg.serialPort || null,
    }),

    // Input row (logs mode only)
    mode === 'logs'
      ? h(CommandInput, { value: inputText })
      : null,

    // Help bar (always shown in logs mode)
    h(HelpBar, { mode, logFilter }),
  )
}
