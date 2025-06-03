import type { EffectType } from './types'

export const efxTypes: EffectType[] = [
  {
    value: 'ialed',
    label: 'IALED',
    icon: 'mdi-led-strip-variant',
    color: 'teal',
    require: ['device', 'strip', 'pattern', 'range', 'config'],
  },
  {
    value: 'light',
    label: 'Light',
    icon: 'mdi-lightbulb',
    color: 'yellow',
    require: ['device', 'pin'],
  },
  {
    value: 'led',
    label: 'LED',
    icon: 'mdi-led-variant-on',
    color: 'lime',
    require: ['device', 'pin'],
  },
  {
    value: 'streetlight',
    label: 'Street Light',
    icon: 'mdi-post-lamp',
    color: 'yellow',
    require: ['device', 'pin'],
  },
  {
    value: 'relay',
    label: 'Relay',
    icon: 'mdi-electric-switch',
    color: 'indigo',
    require: ['device', 'pin'],
  },
  {
    value: 'frog',
    label: 'Frog Juicer',
    icon: 'mdi-blender',
    color: 'green',
    require: ['device', 'pin'],
  },
  {
    value: 'power',
    label: 'Power',
    icon: 'mdi-power',
    color: 'red',
    require: ['device', 'pin'],
  },
  {
    value: 'pin',
    label: 'PIN',
    icon: 'mdi-pin',
    color: 'orange',
    require: ['device', 'pin'],
  },
  {
    value: 'sound',
    label: 'Sound',
    icon: 'mdi-volume-high',
    color: 'cyan',
  },
  {
    value: 'macro',
    label: 'Macro',
    icon: 'mdi-magic-staff',
    color: 'purple',
  },
]
