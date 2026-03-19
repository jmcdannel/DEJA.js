import React from 'react'
import { Box, Text } from 'ink'
import { LOGO_LINES, LOGO_COLORS } from '../lib/brand.mjs'

const h = React.createElement

export function LogoHeader({ version, startupTip }) {
  return h(Box, { flexDirection: 'column' },
    ...LOGO_LINES.map((line, i) =>
      h(Text, { key: i, color: LOGO_COLORS[i] ?? '#007FFF', bold: true }, line)
    ),
    h(Box, null,
      h(Text, { dimColor: true }, `  v${version}  ·  `),
      h(Text, { color: '#00C4FF', dimColor: true }, startupTip)
    )
  )
}
