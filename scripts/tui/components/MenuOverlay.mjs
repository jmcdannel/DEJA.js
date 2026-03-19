import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

export function MenuOverlay({ items, selectedIndex, cols }) {
  const width = 40
  const pad   = Math.max(0, Math.floor((cols - width) / 2))
  return h(Box, { flexDirection: 'column', paddingLeft: pad },
    h(Box, {
      borderStyle: 'round',
      borderColor: '#00C4FF',
      width,
      flexDirection: 'column',
      paddingX: 1,
    },
      h(Text, { bold: true, color: '#00FFFF' }, ' DEJA.js Menu'),
      h(Text, null, ''),
      ...items.map((item, i) => {
        const selected = i === selectedIndex
        return h(Box, { key: i },
          h(Text, { color: selected ? '#00FFFF' : undefined, bold: selected },
            `  ${selected ? '▸' : ' '} ${item.label}`
          )
        )
      }),
      h(Text, null, ''),
      h(Text, { dimColor: true }, '  [↑↓] navigate  [Enter] select  [Esc] back')
    )
  )
}
