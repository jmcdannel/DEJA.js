import React from 'react'
import { Box, Text } from 'ink'
import { getLogLineColor, getLogLineDim } from '../lib/helpers.mjs'

const h = React.createElement

/**
 * LogPane — renders a fixed-height scrollable log area.
 *
 * Props:
 *   visibleLines  — array of { id: number, text: string } objects
 *   paddingLines  — number of empty lines to fill above content
 *   logHeight     — total height of the pane (terminal rows minus chrome)
 *   filter        — 'all' | 'error' | 'warn'
 *
 * Each line uses line.id as React key for stable identity across re-renders.
 * Wrapped in React.memo to skip re-renders when props are unchanged.
 */
export const LogPane = React.memo(function LogPane({ visibleLines, paddingLines, logHeight, filter }) {
  return h(Box, { flexDirection: 'column', height: logHeight },
    filter !== 'all'
      ? h(Text, { color: 'yellow', dimColor: true }, `  ── showing ${filter} logs only ──`)
      : null,
    ...Array.from({ length: paddingLines }, (_, i) =>
      h(Text, { key: `pad-${i}` }, ' ')
    ),
    ...visibleLines.map((line) => {
      const color = getLogLineColor(line.text)
      const dim   = getLogLineDim(line.text)
      return h(Text, { key: line.id, wrap: 'truncate', color, dimColor: dim }, line.text)
    })
  )
})
