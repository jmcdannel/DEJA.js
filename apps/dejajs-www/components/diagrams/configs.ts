import type { DiagramConfig } from './types'

export const DIAGRAM_CONFIGS: DiagramConfig[] = [
  {
    id: 'tabletop',
    label: 'Starter',
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
    id: 'shelf',
    label: 'Shelf',
    apps: ['throttle', 'cloud'],
    server: true,
    devices: ['dccex', 'arduino'],
    track: true,
    mqtt: true,
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    apps: ['throttle', 'cloud', 'monitor'],
    server: true,
    devices: ['dccex', 'arduino', 'pico-w'],
    track: true,
    mqtt: true,
  },
  {
    id: 'basement',
    label: 'Basement',
    apps: ['throttle', 'throttle', 'cloud', 'monitor'],
    server: true,
    devices: ['dccex', 'dccex', 'arduino', 'arduino', 'pico-w'],
    track: true,
    mqtt: true,
  },
  {
    id: 'club',
    label: 'Club',
    apps: ['throttle', 'throttle', 'throttle', 'cloud', 'monitor', 'tour'],
    server: true,
    devices: ['dccex', 'dccex', 'arduino', 'arduino', 'pico-w', 'pico-w'],
    track: true,
    mqtt: true,
  },
]

export const CONFIG_MAP = Object.fromEntries(
  DIAGRAM_CONFIGS.map(c => [c.id, c])
) as Record<string, DiagramConfig>
