import React from 'react'
import { Text } from 'ink'

const h = React.createElement

/**
 * ContextHintRow — shows system hints (priority) or contextual tips (fallback).
 *
 * - When `hint` is set: shows `▸ {hint}` in cyan (system feedback, auto-clears after 5s)
 * - When `hint` is null and `tip` is set: shows `💡 {tip}` in dim (contextual guidance)
 * - When both are null: renders a single space (layout stability)
 *
 * Wrapped in React.memo to skip re-renders when props are unchanged.
 */
export const ContextHintRow = React.memo(function ContextHintRow({ hint, tip }) {
  if (hint) return h(Text, { color: '#00C4FF' }, `  ▸ ${hint}`)
  if (tip)  return h(Text, { dimColor: true },    `  💡 ${tip}`)
  return h(Text, null, ' ')
})
