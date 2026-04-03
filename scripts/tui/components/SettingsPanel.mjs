/**
 * scripts/tui/components/SettingsPanel.mjs
 * Settings panel — toggle server features and edit connection parameters.
 */

import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

/**
 * Settings item definitions.
 * - key:        config.json property name
 * - label:      display label
 * - type:       'toggle' (boolean) | 'text' | 'number'
 * - envKey:     process.env key synced on change (null = TUI-only setting)
 * - defaultVal: fallback when neither config nor env is set
 */
export const SETTINGS_ITEMS = [
  { key: 'enableMqtt',   label: 'MQTT',         type: 'toggle', envKey: 'ENABLE_MQTT',      defaultVal: false },
  { key: 'enableWs',     label: 'WebSocket',    type: 'toggle', envKey: 'ENABLE_WS',        defaultVal: true },
  { key: 'enableTunnel', label: 'Tunnel',       type: 'toggle', envKey: null,                defaultVal: true },
  { key: 'mqttPort',     label: 'MQTT Port',    type: 'number', envKey: 'VITE_MQTT_PORT',   defaultVal: '1883' },
  { key: 'mqttBroker',   label: 'MQTT Broker',  type: 'text',   envKey: 'VITE_MQTT_BROKER', defaultVal: 'mqtt://localhost' },
  { key: 'wsPort',       label: 'WS Port',      type: 'number', envKey: 'VITE_WS_PORT',     defaultVal: '8082' },
]

/**
 * Build initial settings object from config + env + defaults.
 */
export function getInitialSettings(config) {
  return {
    enableMqtt:   config.enableMqtt   ?? (process.env.ENABLE_MQTT === 'true'),
    enableWs:     config.enableWs     ?? (process.env.ENABLE_WS !== 'false'),
    enableTunnel: config.enableTunnel ?? true,
    mqttPort:     config.mqttPort     ?? process.env.VITE_MQTT_PORT ?? '1883',
    mqttBroker:   config.mqttBroker   ?? process.env.VITE_MQTT_BROKER ?? 'mqtt://localhost',
    wsPort:       config.wsPort       ?? process.env.VITE_WS_PORT ?? '8082',
  }
}

/**
 * SettingsPanel component.
 *
 * Props:
 *   settings:      { enableMqtt, enableWs, enableTunnel, mqttPort, mqttBroker, wsPort }
 *   selectedIndex: number
 *   editingKey:    string | null   — which field is in text-edit mode
 *   editBuffer:    string          — current edit text
 *   cols:          number
 */
export const SettingsPanel = React.memo(function SettingsPanel({
  settings, selectedIndex, editingKey, editBuffer, cols,
}) {
  const width = 52
  const pad   = Math.max(0, Math.floor((cols - width) / 2))

  return h(Box, { flexDirection: 'column', paddingLeft: pad },
    h(Box, {
      borderStyle: 'round',
      borderColor: '#00C4FF',
      width,
      flexDirection: 'column',
      paddingX: 1,
    },
      h(Text, { bold: true, color: '#00FFFF' }, ' ⚙  Settings'),
      h(Text, null, ''),

      ...SETTINGS_ITEMS.map((item, i) => {
        const selected  = i === selectedIndex
        const isEditing = editingKey === item.key
        const value     = settings[item.key]
        const pointer   = selected ? '▸' : ' '
        const color     = selected ? '#00FFFF' : undefined

        if (item.type === 'toggle') {
          const on = Boolean(value)
          return h(Box, { key: item.key },
            h(Text, { color, bold: selected },
              `  ${pointer} ${item.label.padEnd(14)}`
            ),
            h(Text, { color: on ? 'green' : 'red' },
              on ? '● enabled' : '○ disabled'
            ),
          )
        }

        // text / number field
        return h(Box, { key: item.key },
          h(Text, { color, bold: selected },
            `  ${pointer} ${item.label.padEnd(14)}`
          ),
          isEditing
            ? h(Text, { color: '#FFD700' }, `${editBuffer}█`)
            : h(Text, null, String(value)),
        )
      }),

      h(Text, null, ''),
      editingKey
        ? h(Text, { dimColor: true }, '  [Enter] save  [Esc] cancel')
        : h(Text, { dimColor: true }, '  [↑↓] navigate  [Enter] toggle/edit  [Esc] back'),
      h(Text, { dimColor: true, color: '#666' }, '  ⚠  Server settings take effect on restart'),
    )
  )
})
