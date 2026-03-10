export const sensorTypes = [
  { value: 'digital', label: 'Digital', icon: 'mdi-toggle-switch' },
  { value: 'analog', label: 'Analog', icon: 'mdi-sine-wave' },
  { value: 'dcc-ex', label: 'DCC-EX', icon: 'mdi-cpu-64-bit' },
] as const

export const sensorInputTypes = [
  { value: 'ir', label: 'Infrared', icon: 'mdi-remote' },
  { value: 'current', label: 'Current Detection', icon: 'mdi-flash' },
  { value: 'reed', label: 'Reed Switch', icon: 'mdi-magnet' },
  { value: 'optical', label: 'Optical', icon: 'mdi-eye' },
  { value: 'pressure', label: 'Pressure', icon: 'mdi-gauge' },
  { value: 'custom', label: 'Custom', icon: 'mdi-cog' },
] as const

export const sensorActionTypes = [
  { value: 'effect', label: 'Effect', icon: 'mdi-rocket-launch' },
  { value: 'turnout', label: 'Turnout', icon: 'mdi-call-split' },
  { value: 'signal', label: 'Signal', icon: 'mdi-traffic-light' },
  { value: 'route', label: 'Route', icon: 'mdi-map' },
  { value: 'macro', label: 'Macro', icon: 'mdi-play-box-multiple' },
  { value: 'throttle', label: 'Throttle', icon: 'mdi-speedometer' },
] as const
