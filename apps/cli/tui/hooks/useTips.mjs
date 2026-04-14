import { useState, useEffect, useRef, useCallback } from 'react'
import { CONTEXTUAL_TIPS } from '../lib/brand.mjs'

/**
 * useTips — selects context-aware tips based on mode, server status, and idle time.
 *
 * Returns the current tip string. Tips rotate every 15s when idle, and update
 * immediately on context changes (mode switch, server status change).
 *
 * The tip is shown as a fallback in ContextHintRow when no system hint is active.
 *
 * @param {string} mode     Current TUI mode
 * @param {string} status   Server status ('starting' | 'running' | 'stopped')
 * @param {string|null} contextHint  Active system hint (tips hidden when this is set)
 * @returns {string} Current tip text
 */
export function useTips(mode, status, contextHint) {
  const [tip, setTip] = useState('')
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  // Pick the right tip pool based on current context
  const getTipPool = useCallback(() => {
    if (mode === 'devices') return CONTEXTUAL_TIPS.devicesMode
    if (mode === 'menu')    return CONTEXTUAL_TIPS.menuMode
    if (status === 'running') return [...CONTEXTUAL_TIPS.serverRunning, ...CONTEXTUAL_TIPS.idle]
    if (status === 'stopped') return [...CONTEXTUAL_TIPS.serverStopped, ...CONTEXTUAL_TIPS.idle]
    return CONTEXTUAL_TIPS.idle
  }, [mode, status])

  // Select next tip from pool
  const rotateTip = useCallback(() => {
    const pool = getTipPool()
    if (pool.length === 0) return
    indexRef.current = (indexRef.current + 1) % pool.length
    setTip(pool[indexRef.current])
  }, [getTipPool])

  // Set initial tip and rotate on context change
  useEffect(() => {
    const pool = getTipPool()
    if (pool.length === 0) return
    // Pick a random starting point on context change
    indexRef.current = Math.floor(Math.random() * pool.length)
    setTip(pool[indexRef.current])

    // Rotate every 15 seconds
    clearInterval(timerRef.current)
    timerRef.current = setInterval(rotateTip, 15000)
    return () => clearInterval(timerRef.current)
  }, [mode, status, getTipPool, rotateTip])

  // Cleanup
  useEffect(() => () => clearInterval(timerRef.current), [])

  return tip
}
