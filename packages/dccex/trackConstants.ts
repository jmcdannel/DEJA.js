import type { TrackMode, TrackOutputLetter } from './types'

export const TRACK_OUTPUT_LETTERS: TrackOutputLetter[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
]

export const TRACK_MODES: { value: TrackMode; label: string; description: string }[] = [
  { value: 'MAIN', label: 'Main', description: 'DCC main track' },
  { value: 'MAIN_INV', label: 'Main (Inverted)', description: 'DCC main track, inverted signal' },
  {
    value: 'MAIN_AUTO',
    label: 'Main (Auto-reverse)',
    description: 'DCC main track with auto-reverser',
  },
  { value: 'PROG', label: 'Programming', description: 'DCC programming track' },
  { value: 'DC', label: 'DC', description: 'DC analog output (requires cab address)' },
  { value: 'DCX', label: 'DC (Inverted)', description: 'DC analog output, inverted polarity' },
  { value: 'BOOST', label: 'Booster', description: 'DCC booster output (ESP32 only)' },
  {
    value: 'BOOST_INV',
    label: 'Booster (Inverted)',
    description: 'DCC booster, inverted (ESP32 only)',
  },
  {
    value: 'BOOST_AUTO',
    label: 'Booster (Auto-reverse)',
    description: 'DCC booster with auto-reverser (ESP32 only)',
  },
  { value: 'NONE', label: 'Disabled', description: 'Output disabled' },
]

export const DC_MODES: TrackMode[] = ['DC', 'DCX']

export const BOOST_MODES: TrackMode[] = ['BOOST', 'BOOST_INV', 'BOOST_AUTO']

export const CAB_ADDRESS_MIN = 1

export const CAB_ADDRESS_MAX = 10239

export const DEFAULT_MAX_OUTPUTS = 2

export function isValidCabAddress(address: number): boolean {
  return Number.isInteger(address) && address >= CAB_ADDRESS_MIN && address <= CAB_ADDRESS_MAX
}

export function requiresCabAddress(mode: TrackMode): boolean {
  return DC_MODES.includes(mode)
}

export function isBoostMode(mode: TrackMode): boolean {
  return BOOST_MODES.includes(mode)
}
