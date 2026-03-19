import React from 'react'
import { Text } from 'ink'

const h = React.createElement

export function ContextHintRow({ hint }) {
  if (!hint) return h(Text, null, ' ')
  return h(Text, { color: '#00C4FF' }, `  ▸ ${hint}`)
}
