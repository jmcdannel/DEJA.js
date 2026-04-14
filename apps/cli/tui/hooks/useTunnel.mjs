import { useState, useRef, useCallback } from 'react'
import { spawn } from 'node:child_process'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { LOG_DIR, TUNNEL_PID_FILE, TUNNEL_URL_FILE, CLOUDFLARED_YML } from '../lib/config.mjs'
import { isPaidPlan, hasCloudflared } from '../lib/serial.mjs'

/**
 * useTunnel — manages Cloudflare tunnel lifecycle.
 *
 * Plan gating: only spawns if isPaidPlan() (engineer or conductor).
 * Named tunnel priority: token env → name env → cloudflared.yml → temporary.
 * URL dedup: uses a ref to prevent duplicate "connected" messages.
 * Persistent files: writes PID to ~/.deja/tunnel.pid, URL to ~/.deja/tunnel.url.
 *
 * @param {number}   wsPort   WebSocket port
 * @param {Function} addLog   Logger callback from useLogger
 * @param {Function} showHint Hint callback from useLogger
 * @returns {{ tunnelUrl, tunnelRef, spawnTunnel, stopTunnel, toggleTunnel, cleanup }}
 */
export function useTunnel(wsPort, addLog, showHint) {
  const [tunnelUrl, setTunnelUrl] = useState(null)
  const tunnelRef        = useRef(null)
  const tunnelUrlSetRef  = useRef(false)  // dedup flag — prevents duplicate URL messages

  // ── Stop tunnel ────────────────────────────────────────────────────────────

  const stopTunnel = useCallback(() => {
    if (tunnelRef.current) {
      tunnelRef.current.kill('SIGTERM')
      tunnelRef.current = null
    }
    tunnelUrlSetRef.current = false
    try { existsSync(TUNNEL_PID_FILE) && writeFileSync(TUNNEL_PID_FILE, '') } catch {}
    try { existsSync(TUNNEL_URL_FILE) && writeFileSync(TUNNEL_URL_FILE, '') } catch {}
    setTunnelUrl(null)
  }, [])

  // ── Spawn tunnel ───────────────────────────────────────────────────────────

  const spawnTunnel = useCallback(() => {
    if (!isPaidPlan()) return
    if (!hasCloudflared()) {
      addLog('cloudflared not installed — skipping tunnel. Install: brew install cloudflare/cloudflare/cloudflared')
      return
    }

    const token      = process.env.CLOUDFLARE_TUNNEL_TOKEN || ''
    const tunnelName = process.env.CLOUDFLARE_TUNNEL_NAME || ''
    let args
    let isNamedTunnel = false

    if (token) {
      addLog('Starting named Cloudflare tunnel (via token)...')
      args = ['tunnel', 'run', '--token', token]
      isNamedTunnel = true
    } else if (tunnelName) {
      addLog(`Starting named Cloudflare tunnel "${tunnelName}"...`)
      args = ['tunnel', 'run', tunnelName]
      isNamedTunnel = true
    } else if (existsSync(CLOUDFLARED_YML)) {
      addLog('Starting named Cloudflare tunnel (via config)...')
      args = ['tunnel', '--config', CLOUDFLARED_YML, 'run']
      isNamedTunnel = true
    } else {
      addLog('Starting temporary Cloudflare tunnel...')
      args = ['tunnel', '--url', `http://localhost:${wsPort}`]
    }

    mkdirSync(LOG_DIR, { recursive: true })

    const tunnel = spawn('cloudflared', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    tunnel.on('spawn', () => {
      try { writeFileSync(TUNNEL_PID_FILE, String(tunnel.pid)) } catch {}
    })

    tunnel.stderr.on('data', (d) => {
      const text = String(d)
      // Temporary tunnel URL detection
      const urlMatch = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
      if (urlMatch && !tunnelUrlSetRef.current) {
        tunnelUrlSetRef.current = true
        setTunnelUrl(urlMatch[0])
        try { writeFileSync(TUNNEL_URL_FILE, urlMatch[0]) } catch {}
        addLog(`Temporary tunnel ready: ${urlMatch[0]}`)
      }
      // Named tunnel detection
      if (isNamedTunnel && text.includes('Registered tunnel connection') && !tunnelUrlSetRef.current) {
        tunnelUrlSetRef.current = true
        const url = 'wss://ws.dejajs.com'
        setTunnelUrl(url)
        addLog(`Named tunnel connected: ${url}`)
      }
    })

    tunnel.on('close', () => {
      tunnelRef.current = null
      tunnelUrlSetRef.current = false
      setTunnelUrl(null)
    })

    tunnelRef.current = tunnel
  }, [addLog, wsPort])  // NO tunnelUrl in deps — dedup via ref

  // ── Toggle tunnel ──────────────────────────────────────────────────────────

  const toggleTunnel = useCallback(() => {
    if (tunnelRef.current) {
      stopTunnel()
      showHint('Tunnel stopped.')
    } else {
      spawnTunnel()
      showHint('Starting tunnel...')
    }
  }, [stopTunnel, spawnTunnel, showHint])

  // cleanup is just stopTunnel
  return { tunnelUrl, tunnelRef, spawnTunnel, stopTunnel, toggleTunnel, cleanup: stopTunnel }
}
