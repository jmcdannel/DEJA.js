import React from 'react'
import { Box, Text } from 'ink'
import { getLogLineColor, getLogLineDim } from '../lib/helpers.mjs'

const h = React.createElement

export function LogPane({ visibleLines, paddingLines, logHeight, filter }) {
  return h(Box, { flexDirection: 'column', height: logHeight },
    filter !== 'all'
      ? h(Text, { color: 'yellow', dimColor: true }, `  ── showing ${filter} logs only ──`)
      : null,
    ...Array.from({ length: paddingLines }, (_, i) =>
      h(Text, { key: `pad-${i}` }, ' ')
    ),
    ...visibleLines.map((line, i) => {
      const color = getLogLineColor(line)
      const dim   = getLogLineDim(line)
      return h(Text, { key: i, wrap: 'truncate', color, dimColor: dim }, line)
    })
  )
}
