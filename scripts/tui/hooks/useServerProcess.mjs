import { useState, useRef, useCallback } from 'react'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { DEJA_DIR, ENTRY } from '../lib/config.mjs'
import { checkPort } from '../lib/helpers.mjs'

/**
 * useServerProcess — manages server spawn/kill/restart and status tracking.
 *
 * Anti-flicker: startTime lives in a ref (not state) so that spawnServer's
 * useCallback identity stays stable — it never depends on startTime.  The
 * close handler reads the ref directly to compute uptime.
 *
 * @param {number}   wsPort   WebSocket port
 * @param {Function} addLog   Logger callback from useLogger
 * @param {Function} showHint Hint callback from useLogger
 * @returns {{ status, pid, startTime, childRef, spawnServer, stopServer, restartServer, setStatus, cleanup }}
 */
export function useServerProcess(wsPort, addLog, showHint) {
  const [status, setStatus] = useState('starting')
  const [pid, setPid]       = useState(null)

  // startTime in a REF (not state!) to avoid dependency in spawnServer
  const startTimeRef      = useRef(null)
  const childRef          = useRef(null)
  const restartPendingRef = useRef(false)

  // ── Spawn server ───────────────────────────────────────────────────────────

  const spawnServer = useCallback(async () => {
    // Pre-flight: check ENTRY exists
    if (!existsSync(ENTRY)) {
      addLog(`ERROR: Server not found at ${ENTRY}`)
      addLog('Run "deja update" to install the server first.')
      setStatus('stopped')
      return
    }

    // Pre-flight: check port is free
    const portFree = await checkPort(wsPort)
    if (!portFree) {
      addLog(`Port ${wsPort} is already in use — is another server instance running?`)
      addLog('Stop the other process or change VITE_WS_PORT in ~/.deja/.env')
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
      startTimeRef.current = Date.now()
      setStatus('running')
    })

    child.on('close', (code) => {
      const upSecs = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0
      setPid(null)
      startTimeRef.current = null
      childRef.current = null

      // If a restart was requested, re-spawn immediately (port is now free)
      if (restartPendingRef.current) {
        restartPendingRef.current = false
        addLog('Server stopped. Restarting...')
        setStatus('starting')
        // Small delay to ensure the OS fully releases the port
        setTimeout(spawnServer, 200)
        return
      }

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
    })

    child.on('error', (err) => {
      addLog(`Failed to start server: ${err.message}`)
      setStatus('stopped')
      childRef.current = null
    })

    childRef.current = child
  }, [addLog, showHint, wsPort])

  // ── Stop server ────────────────────────────────────────────────────────────

  const stopServer = useCallback(() => {
    childRef.current?.kill('SIGTERM')
  }, [])

  // ── Restart server ─────────────────────────────────────────────────────────
  // NOTE: restartServer does NOT stop the tunnel — App handles that via effects
  // Waits for the child process to fully exit (and release the WS port)
  // before respawning, via the restartPendingRef flag checked in the close handler.

  const restartServer = useCallback(() => {
    if (childRef.current) {
      restartPendingRef.current = true
      setStatus('starting')
      childRef.current.kill('SIGTERM')
    } else {
      setStatus('starting')
      spawnServer()
    }
  }, [spawnServer])

  // ── Cleanup ────────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    childRef.current?.kill('SIGTERM')
  }, [])

  return { status, pid, startTime: startTimeRef, childRef, spawnServer, stopServer, restartServer, setStatus, cleanup }
}
