import type { DiagramConfig } from './types'

export const DIAGRAM_CONFIGS: DiagramConfig[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    apps: ['throttle'],
    server: true,
    devices: ['dccex'],
    track: true,
    mqtt: false,
  },
  {
    id: 'withrottle',
    label: 'WiThrottle Direct',
    apps: ['throttle'],
    server: false,
    devices: ['dccex'],
    track: true,
    mqtt: false,
  },
  {
    id: 'standard',
    label: 'Standard',
    apps: ['throttle', 'cloud'],
    server: true,
    devices: ['dccex', 'arduino'],
    track: true,
    mqtt: true,
  },
  {
    id: 'full',
    label: 'Full',
    apps: ['throttle', 'cloud', 'monitor', 'tour'],
    server: true,
    devices: ['dccex', 'dccex', 'arduino', 'arduino', 'pico-w', 'pico-w'],
    track: true,
    mqtt: true,
  },
]

export const CONFIG_MAP = Object.fromEntries(
  DIAGRAM_CONFIGS.map(c => [c.id, c])
) as Record<string, DiagramConfig>
