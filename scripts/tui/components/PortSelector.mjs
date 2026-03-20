import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

export const PortSelector = React.memo(function PortSelector({ ports, portIndex, currentPort, cols }) {
  const width        = 50
  const pad          = Math.max(0, Math.floor((cols - width) / 2))
  const displayPorts = ports.length > 0 ? ports : ['(no serial ports detected)']
  const hasPort      = ports.length > 0

  return h(Box, { flexDirection: 'column', paddingLeft: pad },
    h(Box, {
      borderStyle: 'round',
      borderColor: '#00C4FF',
      width,
      flexDirection: 'column',
      paddingX: 1,
    },
      h(Text, { bold: true, color: '#00FFFF' }, ' Select Serial Port'),
      h(Text, { dimColor: true }, `  current: ${currentPort || 'none'}`),
      h(Text, null, ''),
      ...displayPorts.map((port, i) => {
        const selected  = i === portIndex
        const isCurrent = port === currentPort
        return h(Box, { key: i },
          h(Text, { color: selected ? '#00FFFF' : undefined, bold: selected },
            `  ${selected ? '▸' : ' '} ${port}${isCurrent ? '  ✓' : ''}`
          )
        )
      }),
      h(Text, null, ''),
      hasPort
        ? h(Text, { dimColor: true }, '  [↑↓] navigate  [Enter] save  [Esc] back')
        : h(Text, { dimColor: true }, '  [Esc] back')
    )
  )
})
