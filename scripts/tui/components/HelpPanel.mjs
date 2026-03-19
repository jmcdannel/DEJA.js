import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

export function HelpPanel({ visible }) {
  if (!visible) return null
  return h(Box, {
    flexDirection: 'column',
    borderStyle: 'single',
    borderColor: '#00C4FF',
    paddingX: 1,
  },
    h(Text, { bold: true, color: '#00FFFF' }, ' Keyboard Shortcuts'),
    h(Text, { dimColor: true }, ' ─────────────────────────────────'),
    h(Text, null, '  r        Restart server'),
    h(Text, null, '  s        Stop server & exit'),
    h(Text, null, '  t        Toggle Cloudflare tunnel'),
    h(Text, null, '  l        Cycle log filter  all → error → warn'),
    h(Text, null, '  e        Export logs to ~/.deja/logs/'),
    h(Text, null, '  m / Esc  Open command menu'),
    h(Text, null, '  ?        Toggle this help panel'),
    h(Text, null, '  Ctrl+C   Force exit'),
  )
}
