import React from 'react'
import { Box, Text } from 'ink'

const h = React.createElement

const SECTIONS = [
  {
    title: 'Track Power',
    rows: [
      ['* 1',              'Power ON (all tracks)'],
      ['* 0',              'Power OFF (all tracks)'],
      ['* 1 MAIN',         'Main track ON'],
      ['* 0 MAIN',         'Main track OFF'],
    ],
  },
  {
    title: 'Throttle & Functions',
    rows: [
      ['* t addr spd dir', 'Speed 0–126, dir 1=fwd 0=rev'],
      ['* F addr fn 1|0',  'Function ON/OFF (fn 0–28)'],
    ],
  },
  {
    title: 'Turnouts & Outputs',
    rows: [
      ['* T idx 1|0',      'Throw (1) / Close (0) turnout'],
      ['* Z pin 1|0',      'Output pin ON / OFF'],
    ],
  },
  {
    title: 'System',
    rows: [
      ['* =',              'Query status'],
      ['* D RESET',        'Hardware reset'],
      ['* E',              'Save to EEPROM'],
      ['* Z',              'List outputs'],
    ],
  },
]

/**
 * DccExReference — quick-reference panel for DCC-EX commands.
 * Commands use the "* " prefix to send to all connected devices.
 *
 * Props:
 *   cols: terminal width (for centering)
 */
export const DccExReference = React.memo(function DccExReference({ cols }) {
  const width = 60
  const pad = Math.max(0, Math.floor((cols - width) / 2))
  const cmdWidth = 20

  return h(Box, { flexDirection: 'column', paddingLeft: pad },
    h(Box, {
      borderStyle: 'round',
      borderColor: '#00C4FF',
      width,
      flexDirection: 'column',
      paddingX: 1,
    },
      h(Text, { bold: true, color: '#00FFFF' }, ' ⚡ DCC-EX Quick Reference'),
      h(Text, { dimColor: true }, '  Type * followed by a command to send to all devices'),
      h(Text, null, ''),

      ...SECTIONS.flatMap((section) => [
        h(Text, { key: `h-${section.title}`, bold: true, color: '#A078FF' },
          `  ${section.title}`),
        ...section.rows.map(([cmd, desc], i) =>
          h(Box, { key: `${section.title}-${i}` },
            h(Text, { color: '#FFD600' }, `    ${cmd.padEnd(cmdWidth)}`),
            h(Text, { dimColor: true }, desc),
          )
        ),
      ]),

      h(Text, null, ''),
      h(Text, { dimColor: true }, '  addr: 1–9999 · speed: 0–126 · dir: 1=fwd 0=rev'),
      h(Text, { dimColor: true }, '  [Esc] back'),
    )
  )
})
