import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { formatUptime } from '../lib/helpers.mjs'

const h = React.createElement

/**
 * UptimeTicker — self-contained uptime display with its own 1s interval.
 * Prevents uptime ticks from re-rendering App or StatusBar's parent.
 */
const UptimeTicker = React.memo(function UptimeTicker({ status, startTimeRef }) {
  const [display, setDisplay] = useState('00:00:00')

  useEffect(() => {
    if (status !== 'running' || !startTimeRef?.current) {
      setDisplay('00:00:00')
      return
    }
    setDisplay(formatUptime(startTimeRef.current))
    const timer = setInterval(() => {
      if (startTimeRef?.current) {
        setDisplay(formatUptime(startTimeRef.current))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [status, startTimeRef])

  if (status !== 'running') return null
  return h(Text, { color: '#00C4FF' }, `  ⏱ ${display}`)
})

/**
 * StatusBar — colorful footer with server status, uptime, devices, throttles, tunnel.
 *
 * Props:
 *   status: 'starting' | 'running' | 'stopped'
 *   pid: number | null
 *   startTimeRef: React.MutableRefObject<number | null>
 *   connectedCount: number
 *   totalCount: number
 *   throttleCount: number
 *   activeThrottleCount: number (throttles with speed !== 0)
 *   tunnelUrl: string | null
 *   selectedPort: string | null
 */
export const StatusBar = React.memo(function StatusBar({
  status, pid, startTimeRef,
  connectedCount = 0, totalCount = 0,
  throttleCount = 0, activeThrottleCount = 0,
  tunnelUrl, selectedPort,
}) {
  // Status icon + color
  const statusColor = status === 'running' ? 'green' : status === 'stopped' ? 'red' : 'yellow'
  const statusIcon  = status === 'running' ? '● ' : status === 'starting' ? '◐ ' : '○ '
  const statusLabel = status === 'running' ? 'running' : status === 'starting' ? 'starting' : 'stopped'

  // Device connection health color
  const deviceColor = totalCount === 0
    ? undefined
    : connectedCount === totalCount
      ? 'green'
      : connectedCount > 0
        ? 'yellow'
        : 'red'

  // Throttle activity indicator
  const throttleColor = activeThrottleCount > 0 ? '#00FF88' : '#00FFFF'

  return h(Box, null,
    // Server status
    h(Text, { color: statusColor, bold: true }, statusIcon),
    h(Text, { color: statusColor, bold: status === 'running' }, statusLabel),

    // PID
    pid ? h(Text, { dimColor: true }, `  #${pid}`) : null,

    // Uptime (self-contained ticker)
    h(UptimeTicker, { status, startTimeRef }),

    // Separator
    (totalCount > 0 || throttleCount > 0 || tunnelUrl || selectedPort)
      ? h(Text, { dimColor: true }, '  │')
      : null,

    // Device connections
    totalCount > 0
      ? h(Text, { color: deviceColor },
          `  🔌 ${connectedCount}/${totalCount}`)
      : null,

    // Throttles
    throttleCount > 0
      ? h(Text, { color: throttleColor },
          `  🚂 ${activeThrottleCount > 0 ? `${activeThrottleCount}↑` : ''}${throttleCount}`)
      : null,

    // Serial port
    selectedPort
      ? h(Text, { color: '#A078FF' }, `  ⬡ ${selectedPort}`)
      : null,

    // Tunnel
    tunnelUrl
      ? h(Text, { color: '#00FF88' }, `  🔒 ${tunnelUrl}`)
      : null,
  )
})
