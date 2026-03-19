import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

export function HelpBar({ mode, logFilter }) {
  if (mode !== 'logs') return null
  const filterLabel = logFilter === 'all' ? 'filter' : `filter:${logFilter}`
  return h(Box, null,
    h(Text, { dimColor: true },
      `  [r]estart  [s]top  [t]unnel  [l]${filterLabel}  [e]xport  [m]enu  [?]help`
    )
  )
}
