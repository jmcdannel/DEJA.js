
import type { LogEntry } from '../Dashboard/components/DCCLog/types'

// DCC Log: matches LogEntry interface
// The key field is used to match against dccMessages constants for color/icon
// but the pane renders action/color/icon directly from the entry
export const mockDccLog: LogEntry[] = [
  { action: 'Power', color: 'red', icon: 'mdi-power', id: 1, payload: 'Track power ON' },
  { action: 'Locomotive', color: 'yellow', icon: 'mdi-train', id: 2, payload: 'Loco 5 speed 50 fwd' },
  { action: 'Locomotive', color: 'yellow', icon: 'mdi-train', id: 3, payload: 'Loco 8 speed 75 fwd' },
  { action: 'Turnout', color: 'blue', icon: 'mdi-directions-fork', id: 4, payload: 'Turnout 1 thrown' },
  { action: 'Accessory', color: 'purple', icon: 'mdi-lightbulb', id: 5, payload: 'Output 5 ON' },
  { action: 'Locomotive', color: 'yellow', icon: 'mdi-train', id: 6, payload: 'Loco 5 function 0 ON' },
  { action: 'Status', color: 'green', icon: 'mdi-information', id: 7, payload: 'iDCC-EX V-5.2.13' },
  { action: 'Locomotive', color: 'yellow', icon: 'mdi-train', id: 8, payload: 'Loco 8 speed 0 fwd' },
]

// Turnout Log: matches DocumentData shape from useLayoutLogListeners
export const mockTurnoutChanges = [
  { device: 'dcc-ex-1', id: 'turnout-1', name: 'Main Line Switch', state: true },
  { device: 'dcc-ex-1', id: 'turnout-2', name: 'Yard Entry', state: false },
  { device: 'dcc-ex-1', id: 'turnout-3', name: 'Siding A', state: true },
  { device: 'dcc-ex-1', id: 'turnout-4', name: 'Loop Return', state: false },
  { device: 'dcc-ex-1', id: 'turnout-5', name: 'Engine House', state: true },
]

// Effect Log: matches DocumentData shape
export const mockEffectChanges = [
  { device: 'pico-w-1', id: 'effect-1', name: 'Station Lights', state: true },
  { device: 'pico-w-1', id: 'effect-2', name: 'Crossing Bell', state: true },
  { device: 'arduino-1', id: 'effect-3', name: 'Yard Lights', state: false },
  { device: 'arduino-1', id: 'effect-4', name: 'Smoke Generator', state: true },
]

// Sensor Log: matches DocumentData shape with type for icon mapping
// Note: getSensorIcon() checks inputType first, falling back to type.
// Omit inputType so the descriptive type value drives icon selection.
export const mockSensorChanges = [
  { device: 'pico-w-1', id: 'sensor-1', name: 'Block A Detector', state: true, type: 'ir' },
  { device: 'pico-w-1', id: 'sensor-2', name: 'Block B Detector', state: false, type: 'ir' },
  { device: 'arduino-1', id: 'sensor-3', name: 'Crossing Gate', state: true, type: 'reed' },
  { device: 'dcc-ex-1', id: 'sensor-4', name: 'Current Sensor', state: true, type: 'current' },
]
