import React from 'react'
import { Text } from 'ink'

const h = React.createElement

/**
 * ContextHintRow — auto-clearing contextual hint displayed for 5 seconds.
 *
 * Always occupies exactly 1 line for layout stability: renders a single
 * space when no hint is active, or `▸ {hint}` in cyan when a hint is set.
 *
 * Wrapped in React.memo to skip re-renders when the hint prop is unchanged.
 */
export const ContextHintRow = React.memo(function ContextHintRow({ hint }) {
  if (!hint) return h(Text, null, ' ')
  return h(Text, { color: '#00C4FF' }, `  ▸ ${hint}`)
})
