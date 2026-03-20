import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { formatUptime } from '../lib/helpers.mjs'

const h = React.createElement

/**
 * UptimeTicker — self-contained uptime display with its own 1s interval.
 * Prevents uptime ticks from re-rendering App or StatusBar's parent.
 * Only ticks when status === 'running' and startTimeRef.current is set.
 */
const UptimeTicker = React.memo(function UptimeTicker({ status, startTimeRef }) {
  const [display, setDisplay] = useState('00:00:00')

  useEffect(() => {
    if (status !== 'running' || !startTimeRef?.current) {
      setDisplay('00:00:00')
      return
    }
    // Update immediately
    setDisplay(formatUptime(startTimeRef.current))
    const timer = setInterval(() => {
      if (startTimeRef?.current) {
        setDisplay(formatUptime(startTimeRef.current))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [status, startTimeRef])

  if (status !== 'running') return null
  return h(Text, null, `  uptime ${display}`)
})

/**
 * StatusBar — footer with server status, PID, uptime, device/throttle counts, tunnel URL.
 *
 * Props:
 *   status: 'starting' | 'running' | 'stopped'
 *   pid: number | null
 *   startTimeRef: React.MutableRefObject<number | null> (from useServerProcess)
 *   connectedCount: number
 *   totalCount: number
 *   throttleCount: number
 *   tunnelUrl: string | null
 */
export const StatusBar = React.memo(function StatusBar({
  status, pid, startTimeRef,
  connectedCount = 0, totalCount = 0, throttleCount = 0,
  tunnelUrl
}) {
  const color   = status === 'running' ? 'green' : status === 'stopped' ? 'red' : 'yellow'
  const icon    = status === 'running' ? '●' : '○'
  const pidText = pid ? `  pid ${pid}` : ''

  return h(Box, null,
    h(Text, { color }, icon),
    h(Text, null, ` ${status}${pidText}`),
    h(UptimeTicker, { status, startTimeRef }),
    totalCount > 0
      ? h(Text, { color: connectedCount > 0 ? '#00FFFF' : undefined, dimColor: connectedCount === 0 },
          `  ⬡ ${connectedCount}/${totalCount} devices`)
      : null,
    throttleCount > 0
      ? h(Text, { color: '#00FFFF' }, `  🚂 ${throttleCount} throttles`)
      : null,
    tunnelUrl
      ? h(Text, { dimColor: true }, `  🔒 ${tunnelUrl}`)
      : null,
  )
})
