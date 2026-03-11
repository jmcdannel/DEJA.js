import type { CvDefinition } from './types'

/** Standard NMRA CV definitions for the reference table */
export const COMMON_CVS: CvDefinition[] = [
  { cv: 1, name: 'Primary Address', description: 'Short address (1-127)', min: 1, max: 127, defaultValue: 3 },
  { cv: 2, name: 'Vstart', description: 'Start voltage', min: 0, max: 255, defaultValue: 0 },
  { cv: 3, name: 'Acceleration Rate', description: 'Acceleration momentum', min: 0, max: 255, defaultValue: 0 },
  { cv: 4, name: 'Deceleration Rate', description: 'Braking momentum', min: 0, max: 255, defaultValue: 0 },
  { cv: 5, name: 'Vhigh', description: 'Maximum voltage', min: 0, max: 255, defaultValue: 0 },
  { cv: 6, name: 'Vmid', description: 'Mid-range voltage', min: 0, max: 255, defaultValue: 0 },
  { cv: 7, name: 'Manufacturer Version', description: 'Decoder firmware version', min: 0, max: 255, readOnly: true },
  { cv: 8, name: 'Manufacturer ID', description: 'NMRA manufacturer ID (write 8 to factory reset)', min: 0, max: 255, readOnly: true },
  { cv: 17, name: 'Extended Address High', description: 'Long address high byte', min: 192, max: 231 },
  { cv: 18, name: 'Extended Address Low', description: 'Long address low byte', min: 0, max: 255 },
  { cv: 19, name: 'Consist Address', description: 'Consist address (bit 7 = reversed)', min: 0, max: 127, defaultValue: 0 },
  { cv: 29, name: 'Configuration', description: 'Decoder configuration register', min: 0, max: 63 },
  { cv: 33, name: 'F0 Forward Output', description: 'Headlight forward output map', min: 0, max: 255 },
  { cv: 34, name: 'F0 Reverse Output', description: 'Headlight reverse output map', min: 0, max: 255 },
  { cv: 65, name: 'Kick Start', description: 'Brief voltage boost at startup', min: 0, max: 255 },
  { cv: 66, name: 'Forward Trim', description: 'Speed trim in forward direction', min: 0, max: 255 },
  { cv: 95, name: 'Reverse Trim', description: 'Speed trim in reverse direction', min: 0, max: 255 },
  { cv: 105, name: 'User ID #1', description: 'User-defined identification byte', min: 0, max: 255 },
  { cv: 106, name: 'User ID #2', description: 'User-defined identification byte', min: 0, max: 255 },
]

/** CV response timeout in milliseconds */
export const CV_RESPONSE_TIMEOUT_MS = 5000

/** Maximum number of CV log entries to keep */
export const CV_LOG_MAX_ENTRIES = 50

/** Delay between sequential CV reads in batch mode (ms) */
export const CV_BATCH_READ_DELAY_MS = 200

/** WebSocket action strings for CV operations */
export const CV_WS_ACTIONS = {
  REQUEST: 'cv-request',
  RESPONSE: 'cv-response',
} as const
