import React from 'react'
import { Box, Text } from 'ink'
import { join } from 'node:path'
import { LOGO_LINES, LOGO_COLORS } from '../lib/brand.mjs'
import { CONFIG_FILE, LOG_DIR, DEJA_DIR } from '../lib/config.mjs'

const h = React.createElement

export function OnboardingScreen() {
  return h(Box, { flexDirection: 'column', paddingX: 2, paddingY: 1 },
    ...LOGO_LINES.map((line, i) =>
      h(Text, { key: i, color: LOGO_COLORS[i] ?? '#007FFF', bold: true }, line)
    ),
    h(Text, null, ''),
    h(Text, { bold: true, color: 'green' }, '  Welcome to DEJA.js!'),
    h(Text, null, ''),
    h(Text, null, '  Your model railroad control server is ready to run.'),
    h(Text, null, ''),
    h(Text, { dimColor: true }, `  Config:  ${CONFIG_FILE}`),
    h(Text, { dimColor: true }, `  Logs:    ${LOG_DIR}/`),
    h(Text, { dimColor: true }, `  Env:     ${join(DEJA_DIR, '.env')}`),
    h(Text, null, ''),
    h(Text, { color: '#00C4FF' }, '  Press any key to start the server...')
  )
}
