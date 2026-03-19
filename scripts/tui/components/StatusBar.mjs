import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

export function StatusBar({ status, pid, uptime, tunnelUrl, selectedPort }) {
  const color      = status === 'running' ? 'green' : status === 'stopped' ? 'red' : 'yellow'
  const icon       = status === 'running' ? '●' : '○'
  const pidText    = pid ? `  pid ${pid}` : ''
  const uptimeText = status === 'running' ? `  uptime ${uptime}` : ''
  const portText   = selectedPort ? `  ⬡ ${selectedPort}` : ''
  const tunnelText = tunnelUrl ? `  🔒 ${tunnelUrl}` : ''
  return h(Box, null,
    h(Text, { color }, icon),
    h(Text, null, ` ${status}${pidText}${uptimeText}`),
    h(Text, { dimColor: true }, `${portText}${tunnelText}`)
  )
}
