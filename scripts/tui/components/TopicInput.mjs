import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

/**
 * TopicInput — text input for entering an MQTT topic for a device.
 *
 * Props:
 *   deviceName: string — the device being configured
 *   currentTopic: string — existing topic value (if any)
 *
 * Ref API:
 *   getText() — return current input value
 *   handleChar(c) — append character
 *   handleBackspace() — remove last char
 *   handleClear() — reset to empty
 */
export const TopicInput = React.memo(forwardRef(function TopicInput({ deviceName, currentTopic }, ref) {
  const [text, setText] = useState(currentTopic || '')

  useImperativeHandle(ref, () => ({
    getText() { return text },
    handleChar(char) { setText(t => t + char) },
    handleBackspace() { setText(t => t.slice(0, -1)) },
    handleClear() { setText('') },
  }), [text])

  return h(Box, { flexDirection: 'column', paddingX: 2, paddingY: 1 },
    h(Text, { bold: true, color: '#00FFFF' }, 'Set MQTT Topic'),
    h(Text, { dimColor: true }, `Device: ${deviceName}`),
    h(Text, null, ''),
    h(Text, { dimColor: true }, 'Enter the MQTT topic for this device:'),
    h(Text, null, ''),
    h(Box, null,
      h(Text, { color: '#00C4FF' }, '> '),
      h(Text, { color: '#00FFFF' }, text),
      h(Text, { color: '#00C4FF' }, '▌'),
    ),
    h(Text, null, ''),
    h(Text, { dimColor: true }, '  [enter] save  [esc] cancel'),
  )
}))
