/**
 * scripts/tui/components/LogoHeader.mjs
 * ASCII logo with gradient colors, version text, and random startup tip.
 * Renders the full "DEJA.js" banner with per-segment coloring:
 *   DEJA  → cyan-to-blue gradient
 *   .     → green
 *   js    → magenta/pink
 * Wrapped in React.memo to prevent unnecessary re-renders (anti-flicker).
 */

import React from 'react'
import { Box, Text } from 'ink'
import {
  LOGO_SEGMENTS,
  LOGO_DEJA_COLORS,
  LOGO_DOT_COLOR,
  LOGO_JS_COLOR,
} from '../lib/brand.mjs'

const h = React.createElement

export const LogoHeader = React.memo(function LogoHeader({ version, startupTip }) {
  return h(Box, { flexDirection: 'column' },
    ...LOGO_SEGMENTS.map((seg, i) =>
      h(Box, { key: i },
        h(Text, { color: LOGO_DEJA_COLORS[i] ?? '#007FFF', bold: true }, seg.deja),
        seg.dot ? h(Text, { color: LOGO_DOT_COLOR, bold: true }, seg.dot) : null,
        seg.js  ? h(Text, { color: LOGO_JS_COLOR,  bold: true }, seg.js)  : null,
      )
    ),
    h(Box, null,
      h(Text, { dimColor: true }, `  ${version.startsWith('v') ? version : `v${version}`}  ·  `),
      h(Text, { color: '#00C4FF', dimColor: true }, startupTip)
    )
  )
})
