/**
 * scripts/tui/App.mjs
 * Root App component — wires hooks, components, keyboard input, and layout.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
import { CommandInput } from './components/CommandInput.mjs'
import { DeviceList } from './components/DeviceList.mjs'
import { TopicInput } from './components/TopicInput.mjs'

// Hooks
import { useLogger } from './hooks/useLogger.mjs'
import { useServerProcess } from './hooks/useServerProcess.mjs'
import { useTunnel } from './hooks/useTunnel.mjs'
import { useFirebase, ServerValue } from './hooks/useFirebase.mjs'
import { useDevices } from './hooks/useDevices.mjs'
import { useThrottles } from './hooks/useThrottles.mjs'
import { useTips } from './hooks/useTips.mjs'

// Commands
import { registerAllCommands } from './commands/index.mjs'
import { lookup } from './commands/registry.mjs'

const h = React.createElement

// Load env ONCE at module scope
loadEnvFile(`${DEJA_DIR}/.env`)

// Register all slash commands at module scope
registerAllCommands()

const WS_PORT = parseInt(process.env.VITE_WS_PORT || '8082', 10)
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
    const onResize = () => setTermSize({ cols: stdout.columns, rows: stdout.rows })
    stdout.on('resize', onResize)
    return () => stdout.off('resize', onResize)
  }, [stdout])

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { logLines, logFilter, contextHint, addLog, showHint, exportLogs, cycleFilter, cleanup: logCleanup } = useLogger(WS_PORT)
  const { status, pid, startTime: startTimeRef, childRef, spawnServer, stopServer, restartServer, setStatus, cleanup: serverCleanup } = useServerProcess(WS_PORT, addLog, showHint)
  const { tunnelUrl, tunnelRef, spawnTunnel, stopTunnel, toggleTunnel, cleanup: tunnelCleanup } = useTunnel(WS_PORT, addLog, showHint)
  const { db, rtdb, layoutId, cleanup: firebaseCleanup } = useFirebase()
  const { devices, connectedCount, totalCount, cleanup: devicesCleanup } = useDevices(db, layoutId)
  const { throttleCount, activeThrottleCount, cleanup: throttlesCleanup } = useThrottles(db, layoutId)

  // ── Local TUI state ────────────────────────────────────────────────────────
  const [mode, setMode]                     = useState(() => isFirstRun() ? 'onboarding' : 'logs')
  const [menuIndex, setMenuIndex]           = useState(0)
  const [deviceIndex, setDeviceIndex]       = useState(0)
  const [portIndex, setPortIndex]           = useState(0)
  const [availablePorts, setAvailablePorts] = useState([])
  const [showHelp, setShowHelp]             = useState(false)
  const [startupTip]                        = useState(() =>
    STARTUP_TIPS[Math.floor(Math.random() * STARTUP_TIPS.length)]
  )

  const configRef       = useRef(readConfig())
  const inputRef        = useRef(null)
  const topicInputRef   = useRef(null)
  const editingDeviceRef = useRef(null)
  const devicesRef      = useRef([])
  const prevModeRef     = useRef('logs')

  // Tips — must be after mode/status/contextHint declarations
  const currentTip = useTips(mode, status, contextHint)

  // Keep devicesRef in sync with devices state
  useEffect(() => { devicesRef.current = devices }, [devices])

  // ── Mode transitions ───────────────────────────────────────────────────────

  const transitionMode = useCallback((next) => {
    setMode(prev => {
      prevModeRef.current = prev
      return next
    })
    if (next === 'ports') {
      setAvailablePorts(detectSerialPorts())
      setPortIndex(0)
    }
    if (next === 'menu') setMenuIndex(0)
    if (next === 'devices') setDeviceIndex(0)
  }, [])

  // ── Connect / Disconnect device ────────────────────────────────────────────

  const connectDevice = useCallback((device) => {
    if (!rtdb || !layoutId) return
    const payload = device.topic
      ? { device: device.id, topic: device.topic }
      : { device: device.id, serial: device.port }
    rtdb.ref(`dejaCommands/${layoutId}`).push({
      action: 'connect',
      payload: JSON.stringify(payload),
      timestamp: ServerValue.TIMESTAMP,
    })
  }, [rtdb, layoutId])

  const saveDeviceTopic = useCallback((deviceId, topic) => {
    if (!db || !layoutId) return
    db.collection('layouts').doc(layoutId).collection('devices').doc(deviceId)
      .update({ topic })
      .catch(() => {})
  }, [db, layoutId])

  const disconnectDevice = useCallback((device) => {
    if (!rtdb || !layoutId) return
    rtdb.ref(`dejaCommands/${layoutId}`).push({
      action: 'disconnect',
      payload: JSON.stringify({ device: device.id }),
      timestamp: ServerValue.TIMESTAMP,
    })
  }, [rtdb, layoutId])

  // ── handleCommand (text input + hotkey actions) ────────────────────────────

  const handleCommand = useCallback((cmd) => {
    switch (cmd.toLowerCase().trim()) {
      case 'stop':
      case 'exit':
      case 'quit':
        addLog('Stopping server...')
        stopTunnel()
        stopServer()
        setTimeout(() => process.exit(0), 400)
        break

      case 'restart':
        addLog('Restarting server...')
        stopTunnel()
        restartServer()
        break

      case 'help':
        setShowHelp(v => !v)
        break

      default:
        addLog(`Unknown command: "${cmd}". Type help or press [?] for shortcuts.`)
    }
  }, [addLog, stopServer, restartServer, stopTunnel])

  // ── Command context (passed to slash command execute()) ───────────────────

  const commandContext = useMemo(() => ({
    addLog, showHint, transitionMode,
    spawnServer, stopServer, restartServer, setStatus,
    childRef,
    toggleTunnel, tunnelCleanup,
    exportLogs, cycleFilter,
    get devices() { return devicesRef.current },
    connectDevice, disconnectDevice,
  }), [addLog, showHint, transitionMode, spawnServer, stopServer, restartServer,
       setStatus, toggleTunnel, tunnelCleanup, exportLogs, cycleFilter,
       connectDevice, disconnectDevice])

  // ── Auto-start: triggers on mode='logs' ────────────────────────────────────

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
    devicesCleanup()
    throttlesCleanup()
    firebaseCleanup()
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
          case 'devices': transitionMode('devices'); break
          case 'status':  transitionMode('status'); break
          case 'ports':   transitionMode('ports'); break
          case 'tunnel':  toggleTunnel(); transitionMode('logs'); break
          case 'export':  exportLogs(); transitionMode('logs'); break
        }
        return
      }
      return
    }

    // Devices mode
    if (mode === 'devices') {
      if (key.upArrow)   { setDeviceIndex(i => Math.max(0, i - 1)); return }
      if (key.downArrow) { setDeviceIndex(i => Math.min(Math.max(0, devices.length - 1), i + 1)); return }
      if (key.escape)    { transitionMode('logs'); return }
      // [p] — context-aware: serial port selector for serial devices, topic input for MQTT
      if (input === 'p' && devices.length > 0) {
        const device = devices[deviceIndex]
        if (device) {
          const isMqtt = device.type === 'deja-mqtt'
          if (isMqtt) {
            editingDeviceRef.current = device
            transitionMode('topic-input')
          } else {
            transitionMode('ports')
          }
        }
        return
      }
      if (key.return && devices.length > 0) {
        const device = devices[deviceIndex]
        if (!device) return
        const isConn = device.type === 'deja-server'
          ? status === 'running'
          : (device.isConnected || device.connected)
        if (isConn) {
          disconnectDevice(device)
          showHint(`Disconnecting ${device.id}...`)
        } else {
          // No endpoint configured — open the right editor
          if (!device.port && !device.topic && device.type !== 'deja-server') {
            if (device.type === 'deja-mqtt') {
              editingDeviceRef.current = device
              transitionMode('topic-input')
            } else {
              showHint(`No port assigned to ${device.id}. Press [p] to assign one.`)
            }
            return
          }
          connectDevice(device)
          showHint(`Connecting ${device.id}...`)
        }
        return
      }
      return
    }

    // Topic input mode
    if (mode === 'topic-input') {
      if (key.escape) { transitionMode('devices'); return }
      if (key.return) {
        const topic = topicInputRef.current?.getText()?.trim()
        const device = editingDeviceRef.current
        if (topic && device) {
          saveDeviceTopic(device.id, topic)
          showHint(`Topic saved for ${device.id}: ${topic}`)
        }
        editingDeviceRef.current = null
        transitionMode('devices')
        return
      }
      if (key.backspace || key.delete) { topicInputRef.current?.handleBackspace(); return }
      if (!key.ctrl && !key.meta && input) { topicInputRef.current?.handleChar(input); return }
      return
    }

    // Port selector mode
    if (mode === 'ports') {
      if (key.upArrow)   { setPortIndex(i => Math.max(0, i - 1)); return }
      if (key.downArrow) { setPortIndex(i => Math.min(Math.max(0, availablePorts.length - 1), i + 1)); return }
      if (key.escape)    { transitionMode(prevModeRef.current || 'logs'); return }
      if (key.return) {
        if (availablePorts.length > 0) {
          const selected = availablePorts[portIndex]
          writeConfig({ serialPort: selected })
          configRef.current = readConfig()
          showHint(`Serial port saved: ${selected}`)
        }
        transitionMode(prevModeRef.current || 'logs')
        return
      }
      return
    }

    // Status panel mode
    if (mode === 'status') {
      if (key.escape || input === 'q') { transitionMode('logs'); return }
      return
    }

    // ── Log view (default mode) ──────────────────────────────────────────────

    // Arrow keys: route to command menu dropdown if open
    if (key.upArrow) {
      if (inputRef.current?.handleArrowUp?.()) return
    }
    if (key.downArrow) {
      if (inputRef.current?.handleArrowDown?.()) return
    }

    // Tab: cycle through slash-command completions
    if (key.tab) { inputRef.current?.handleTab(); return }

    // Enter: if command menu is open, use selected command; otherwise normal execution
    if (key.return) {
      const selectedCmd = inputRef.current?.getSelectedCommand?.()
      const raw = selectedCmd || (inputRef.current?.getText() || '').trim()
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
      inputRef.current?.handleClear()
      return
    }

    // Esc: clear input if non-empty, otherwise open menu
    if (key.escape) {
      const text = inputRef.current?.getText() || ''
      if (text.length > 0) { inputRef.current?.handleClear(); return }
      transitionMode('menu')
      return
    }

    // Backspace/Delete
    if (key.backspace || key.delete) { inputRef.current?.handleBackspace(); return }

    // When input is non-empty, all keys go to input buffer (hotkeys disabled)
    const currentText = inputRef.current?.getText() || ''
    if (currentText.length > 0) {
      if (!key.ctrl && !key.meta && input) {
        inputRef.current?.handleChar(input)
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
      inputRef.current?.handleChar(input)
    }
  })

  // ── Layout dimensions ──────────────────────────────────────────────────────

  const { cols, rows: termHeight } = termSize

  const divider = useMemo(() => '─'.repeat(cols), [cols])

  // Chrome height: logo + tip(1) + divider(1) + hint(1) + divider(1) + status(1) + input(1) + helpbar(1)
  const logoChrome = LOGO_LINES.length + 1
  const helpChrome = showHelp ? 10 : 0
  const baseChrome = logoChrome + 7
  const logHeight  = useMemo(
    () => Math.max(termHeight - baseChrome - helpChrome, 3),
    [termHeight, baseChrome, helpChrome]
  )

  // Filter and window log lines
  const filteredLines = useMemo(() => {
    if (logFilter === 'all') return logLines
    return logLines.filter(l => l.text.toUpperCase().includes(logFilter === 'error' ? 'ERROR' : 'WARN'))
  }, [logLines, logFilter])

  const visibleLines = useMemo(
    () => filteredLines.slice(-logHeight),
    [filteredLines, logHeight]
  )

  const paddingLines = useMemo(
    () => Math.max(0, logHeight - visibleLines.length),
    [logHeight, visibleLines.length]
  )

  const cfg = configRef.current

  // ── Render ─────────────────────────────────────────────────────────────────

  // Full-screen onboarding
  if (mode === 'onboarding') {
    return h(OnboardingScreen)
  }

  return h(Box, { flexDirection: 'column', height: termHeight },

    // Body — status panel takes full body; other modes share the log area
    mode === 'status'
      ? h(StatusPanel, {
          version: VERSION,
          status,
          pid,
          startTimeRef,
          tunnelUrl,
          selectedPort: cfg.serialPort || null,
          layoutId:     layoutId || cfg.layoutId || null,
          wsPort:       WS_PORT,
        })
      : h(React.Fragment, null,

          // Help panel (shown above log pane when toggled)
          h(HelpPanel, { visible: showHelp }),

          // Main body: log pane OR menu OR port selector OR device list
          mode === 'menu'
            ? h(MenuOverlay, { items: MENU_ITEMS, selectedIndex: menuIndex, cols })
            : mode === 'ports'
              ? h(PortSelector, {
                  ports: availablePorts,
                  portIndex,
                  currentPort: cfg.serialPort || null,
                  cols,
                })
              : mode === 'devices'
                ? h(DeviceList, { devices, selectedIndex: deviceIndex, cols, serverStatus: status })
                : mode === 'topic-input'
                  ? h(TopicInput, {
                      ref: topicInputRef,
                      deviceName: editingDeviceRef.current?.id || '',
                      currentTopic: editingDeviceRef.current?.topic || '',
                    })
                : h(LogPane, { visibleLines, paddingLines, logHeight, filter: logFilter }),

          // Contextual hint row — system hints take priority, tips shown as fallback
          h(ContextHintRow, { hint: contextHint, tip: currentTip }),
        ),

    // Footer
    h(Box, null, h(Text, { dimColor: true }, divider)),
    h(StatusBar, {
      status,
      pid,
      startTimeRef,
      connectedCount,
      totalCount,
      throttleCount,
      activeThrottleCount,
      tunnelUrl,
      selectedPort: cfg.serialPort || null,
    }),

    // Input row (logs mode only)
    mode === 'logs'
      ? h(CommandInput, { ref: inputRef })
      : null,

    // Help bar (always shown)
    h(HelpBar, { mode, logFilter }),

    // Footer: logo + startup tip
    h(Box, null, h(Text, { dimColor: true }, divider)),
    h(LogoHeader, { version: VERSION, startupTip }),
  )
}
