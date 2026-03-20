import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

const DEVICE_TYPE_LABELS = {
  'dcc-ex':            'DCC-EX CommandStation',
  'deja-arduino':      'DEJA Arduino (MEGA)',
  'deja-arduino-led':  'DEJA LED Arduino',
  'deja-mqtt':         'DEJA MQTT (Pico W)',
  'deja-server':       'DEJA Server',
}

export const DeviceList = React.memo(function DeviceList({ devices, selectedIndex, cols }) {
  const width = 52
  const pad   = Math.max(0, Math.floor((cols - width) / 2))
  const hasDevices = devices && devices.length > 0

  return h(Box, { flexDirection: 'column', paddingLeft: pad },
    h(Box, {
      borderStyle: 'round',
      borderColor: '#00C4FF',
      width,
      flexDirection: 'column',
      paddingX: 1,
    },
      h(Text, { bold: true, color: '#00FFFF' }, ' 🔌 DEJA Devices'),
      h(Text, null, ''),
      hasDevices
        ? devices.map((device, i) => {
            const selected = i === selectedIndex
            const isConn = device.isConnected || device.connected
            const dot = isConn ? '●' : '○'
            const dotColor = isConn ? 'green' : undefined
            const typeLabel = DEVICE_TYPE_LABELS[device.type] || device.type || 'Unknown'
            const endpoint = device.port || device.topic || ''
            return h(Box, { key: device.id || i },
              h(Text, { color: selected ? '#00FFFF' : undefined, bold: selected },
                `  ${selected ? '▸' : ' '} `
              ),
              h(Text, { color: dotColor }, dot),
              h(Text, { color: selected ? '#00FFFF' : undefined },
                ` ${typeLabel}${endpoint ? `  ${endpoint}` : ''}`
              )
            )
          })
        : [h(Text, { key: 'empty', dimColor: true }, '  (no devices configured)')],
      h(Text, null, ''),
      h(Text, { dimColor: true }, '  [↑↓] navigate  [Enter] connect  [p] port  [Esc] back')
    )
  )
})
