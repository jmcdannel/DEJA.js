import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

const HELP_TEXT = {
  logs:    '  / commands  [r]estart  [s]top  [t]unnel  [?]help',
  menu:    '  [↑↓] navigate  [Enter] select  [Esc] back',
  devices: '  [↑↓] navigate  [Enter] connect  [p] port  [Esc] back',
  ports:   '  [↑↓] navigate  [Enter] save  [Esc] back',
  status:  '  [Esc] back to logs',
}

export const HelpBar = React.memo(function HelpBar({ mode, logFilter }) {
  const text = HELP_TEXT[mode]
  if (!text) return null

  // For logs mode, append filter label
  if (mode === 'logs' && logFilter && logFilter !== 'all') {
    return h(Box, null,
      h(Text, { dimColor: true }, `${text}  [l]filter:${logFilter}`)
    )
  }

  return h(Box, null, h(Text, { dimColor: true }, text))
})
