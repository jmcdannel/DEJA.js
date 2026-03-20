/**
 * scripts/tui/components/LogoHeader.mjs
 * ASCII logo with gradient colors, version text, and random startup tip.
 * Wrapped in React.memo to prevent unnecessary re-renders (anti-flicker).
 */

import React from 'react'
import { Box, Text } from 'ink'
import { LOGO_LINES, LOGO_COLORS } from '../lib/brand.mjs'

const h = React.createElement

export const LogoHeader = React.memo(function LogoHeader({ version, startupTip }) {
  return h(Box, { flexDirection: 'column' },
    ...LOGO_LINES.map((line, i) =>
      h(Text, { key: i, color: LOGO_COLORS[i] ?? '#007FFF', bold: true }, line)
    ),
    h(Box, null,
      h(Text, { dimColor: true }, `  ${version.startsWith('v') ? version : `v${version}`}  ·  `),
      h(Text, { color: '#00C4FF', dimColor: true }, startupTip)
    )
  )
})
