import { useState, useEffect, useRef, useCallback } from 'react'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { DEJA_DIR, ENTRY } from '../lib/config.mjs'
import { formatUptime, checkPort } from '../lib/helpers.mjs'

/**
 * useServerProcess — manages server spawn/kill/restart and status tracking.
 *
 * @param {number}   wsPort   WebSocket port
 * @param {Function} addLog   Logger callback from useLogger
 * @param {Function} showHint Hint callback from useLogger
 * @returns {{ status, pid, uptime, childRef, spawnServer, stopServer, restartServer, setStatus, cleanup }}
 */
export function useServerProcess(wsPort, addLog, showHint) {
  const [status, setStatus]       = useState('starting')
  const [pid, setPid]             = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [uptime, setUptime]       = useState('00:00:00')

  const childRef = useRef(null)

  // ── Uptime counter ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (status !== 'running' || !startTime) return
    const timer = setInterval(() => setUptime(formatUptime(startTime)), 1000)
    return () => clearInterval(timer)
  }, [status, startTime])

  // ── Spawn server ───────────────────────────────────────────────────────────

  const spawnServer = useCallback(async () => {
    if (!existsSync(ENTRY)) {
      addLog(`ERROR: Server not found at ${ENTRY}`)
      addLog('Run "deja update" to install the server first.')
      setStatus('stopped')
      return
    }

    const portFree = await checkPort(wsPort)
    if (!portFree) {
      addLog(`Port ${wsPort} is already in use — is another server instance running?`)
      addLog(`Stop the other process or change VITE_WS_PORT in ~/.deja/.env`)
      setStatus('stopped')
      return
    }

    addLog('Starting DEJA.js server...')

    const child = spawn('node', [ENTRY], {
      cwd: DEJA_DIR,
      env: { ...process.env, FORCE_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    child.stdout.on('data', d => addLog(String(d)))
    child.stderr.on('data', d => addLog(String(d)))

    child.on('spawn', () => {
      setPid(child.pid)
      setStartTime(Date.now())
      setStatus('running')
    })

    child.on('close', (code) => {
      const upSecs = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
      setPid(null)
      setStartTime(null)
      setStatus('stopped')
      if (code === 0 || code == null) {
        addLog('Server stopped.')
      } else if (upSecs < 5) {
        addLog(`Server failed to start (exit ${code}). Check logs or run "deja status".`)
        showHint('Server failed to start. Press [r] to retry.')
      } else {
        addLog(`Server exited unexpectedly (code ${code}).`)
        showHint('Server crashed. Press [r] to restart.')
      }
      childRef.current = null
    })

    child.on('error', (err) => {
      addLog(`Failed to start server: ${err.message}`)
      setStatus('stopped')
      childRef.current = null
    })

    childRef.current = child
  }, [addLog, showHint, wsPort, startTime])

  // ── Stop server ────────────────────────────────────────────────────────────

  const stopServer = useCallback(() => {
    childRef.current?.kill('SIGTERM')
  }, [])

  // ── Restart server ─────────────────────────────────────────────────────────
  // NOTE: restartServer does NOT stop the tunnel here — the auto-start effect in App.mjs handles this

  const restartServer = useCallback(() => {
    childRef.current?.kill('SIGTERM')
    childRef.current = null
    setStatus('starting')
    setTimeout(spawnServer, 800)
  }, [spawnServer])

  // ── Cleanup ────────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    childRef.current?.kill('SIGTERM')
  }, [])

  return { status, pid, uptime, childRef, spawnServer, stopServer, restartServer, setStatus, cleanup }
}
