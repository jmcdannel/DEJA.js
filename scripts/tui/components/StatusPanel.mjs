import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

export function StatusPanel({ version, status, pid, uptime, tunnelUrl, selectedPort, layoutId, wsPort }) {
  const stColor = status === 'running' ? 'green' : 'red'
  return h(Box, { flexDirection: 'column', paddingX: 2, paddingY: 1 },
    h(Text, { bold: true, color: '#00FFFF' }, 'System Status'),
    h(Text, { dimColor: true }, '─'.repeat(32)),
    h(Text, null, ''),
    h(Text, { color: stColor }, `  ${status === 'running' ? '● running' : '○ stopped'}`),
    pid ? h(Text, null, `  PID       ${pid}`) : null,
    status === 'running' ? h(Text, null, `  Uptime    ${uptime}`) : null,
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
}
