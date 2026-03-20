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

const DEVICE_TYPE_ICONS = {
  'dcc-ex':            '🚂',
  'deja-arduino':      '🔧',
  'deja-arduino-led':  '💡',
  'deja-mqtt':         '📡',
  'deja-server':       '🖥️',
}

/**
 * DeviceList — interactive device panel with connection status.
 *
 * Props:
 *   devices: array of device objects from Firestore
 *   selectedIndex: currently highlighted device index
 *   cols: terminal width
 *   serverStatus: 'running' | 'starting' | 'stopped' — used to show deja-server as connected
 */
export const DeviceList = React.memo(function DeviceList({ devices, selectedIndex, cols, serverStatus }) {
  const width = 56
  const pad   = Math.max(0, Math.floor((cols - width) / 2))
  const hasDevices = devices && devices.length > 0

  // Build rows as a flat array (no nested arrays for Ink compatibility)
  const rows = []
  if (hasDevices) {
    for (let i = 0; i < devices.length; i++) {
      const device = devices[i]
      const selected = i === selectedIndex
      // deja-server reflects TUI server status
      const isConn = device.type === 'deja-server'
        ? serverStatus === 'running'
        : (device.isConnected || device.connected)
      const typeLabel = DEVICE_TYPE_LABELS[device.type] || device.type || 'Unknown'
      const icon = DEVICE_TYPE_ICONS[device.type] || '⬡'
      const endpoint = device.port || device.topic || ''
      const statusText = isConn ? 'connected' : 'disconnected'
      const statusColor = isConn ? 'green' : 'red'
      const nameColor = selected ? '#00FFFF' : '#FFFFFF'

      // Device name row
      rows.push(
        h(Box, { key: `${device.id}-name` },
          h(Text, { color: selected ? '#00FFFF' : undefined, bold: selected },
            `  ${selected ? '▸' : ' '} `
          ),
          h(Text, null, `${icon} `),
          h(Text, { color: nameColor, bold: selected }, typeLabel),
          h(Text, { color: statusColor }, `  ${statusText}`),
        )
      )

      // Endpoint row (indented)
      if (endpoint) {
        rows.push(
          h(Box, { key: `${device.id}-ep` },
            h(Text, { dimColor: true }, `       ${endpoint}`)
          )
        )
      }
    }
  } else {
    rows.push(h(Text, { key: 'empty', dimColor: true }, '  (no devices configured)'))
  }

  return h(Box, { flexDirection: 'column', paddingLeft: pad },
    h(Box, {
      borderStyle: 'round',
      borderColor: '#00C4FF',
      width,
      flexDirection: 'column',
      paddingX: 1,
    },
      h(Text, { bold: true, color: '#00FFFF' }, ' 🔌 DEJA IO Devices'),
      h(Text, null, ''),
      ...rows,
      h(Text, null, ''),
      h(Text, { dimColor: true }, '  [↑↓] navigate  [Enter] connect'),
      h(Text, { dimColor: true }, '  [p] port  [Esc] back'),
    )
  )
})
