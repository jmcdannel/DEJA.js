import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { formatUptime } from '../lib/helpers.mjs'

const h = React.createElement

const StatusUptime = React.memo(function StatusUptime({ status, startTimeRef }) {
  const [display, setDisplay] = useState('00:00:00')

  useEffect(() => {
    if (status !== 'running' || !startTimeRef?.current) {
      setDisplay('00:00:00')
      return
    }
    setDisplay(formatUptime(startTimeRef.current))
    const timer = setInterval(() => {
      if (startTimeRef?.current) setDisplay(formatUptime(startTimeRef.current))
    }, 1000)
    return () => clearInterval(timer)
  }, [status, startTimeRef])

  if (status !== 'running') return null
  return h(Text, null, `  Uptime    ${display}`)
})

export const StatusPanel = React.memo(function StatusPanel({
  version, status, pid, startTimeRef, tunnelUrl, selectedPort, layoutId, wsPort
}) {
  const stColor = status === 'running' ? 'green' : 'red'

  return h(Box, { flexDirection: 'column', paddingX: 2, paddingY: 1 },
    h(Text, { bold: true, color: '#00FFFF' }, 'System Status'),
    h(Text, { dimColor: true }, '─'.repeat(32)),
    h(Text, null, ''),
    h(Text, { color: stColor }, `  ${status === 'running' ? '● running' : '○ stopped'}`),
    pid ? h(Text, null, `  PID       ${pid}`) : null,
    h(StatusUptime, { status, startTimeRef }),
    h(Text, null, `  Version   ${version}`),
    h(Text, null, ''),
    h(Text, { bold: true }, 'Connections'),
    h(Text, { dimColor: true }, '─'.repeat(32)),
    h(Text, null, ''),
    h(Text, null, `  WebSocket   ws://localhost:${wsPort}`),
    selectedPort
      ? h(Text, null, `  Serial      ${selectedPort}`)
      : h(Text, { dimColor: true }, '  Serial      (not configured)'),
    tunnelUrl
      ? h(Text, { color: '#00C4FF' }, `  Tunnel      ${tunnelUrl}`)
      : h(Text, { dimColor: true }, '  Tunnel      not running'),
    layoutId
      ? h(Text, null, `  Layout      ${layoutId}`)
      : h(Text, { dimColor: true }, '  Layout      (not set)'),
    h(Text, null, ''),
    h(Text, { dimColor: true }, '  [Esc] back to logs')
  )
})
