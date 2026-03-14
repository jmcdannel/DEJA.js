/**
 * Mock for @repo/modules — all composables return fn()-wrapped stubs.
 *
 * This file is wired in via a Vite resolve alias in .storybook/main.ts so that
 * every `import { useTurnouts } from '@repo/modules'` inside components
 * resolves here instead of the real Firebase-dependent code.
 *
 * IMPORTANT: Do NOT import from @repo/modules here — that would be circular.
 */

import { fn } from '@storybook/test'
import { ref, computed } from 'vue'

// ---------------------------------------------------------------------------
// Re-export all types and constants from the data file so that components
// doing `import type { Turnout } from '@repo/modules'` still resolve.
// ---------------------------------------------------------------------------
export type {
  Turnout,
  Loco,
  ConsistLoco,
  LocoFunction,
  Throttle,
  LocoThrottle,
  Effect,
  EffectType,
  MacroItem,
  Signal,
  SignalAspect,
  Sensor,
  SensorType,
  SensorInputType,
  Layout,
  LayoutDefaultSound,
  Device,
  ServerStatus,
  Tag,
  Route,
  RouteTurnoutConfig,
  Block,
  SensorAutomation,
  SensorAction,
  RoadName,
} from './data'

// Re-export preference types
export interface AppBackgroundPrefs {
  default: string
  pages: Record<string, string>
}

export interface UserPreferences {
  backgrounds: {
    [appName: string]: AppBackgroundPrefs
  }
}

// Re-export route constants
export const routeType = {
  value: 'route',
  label: 'Route',
  icon: 'mdi-map',
  color: 'purple',
} as const

// Re-export effect type constants
export const efxTypes = [
  { value: 'ialed', label: 'IALED', icon: 'mdi-led-strip-variant', color: 'teal', require: ['device', 'strip', 'pattern', 'range', 'config'] },
  { value: 'light', label: 'Light', icon: 'mdi-lightbulb', color: 'yellow', require: ['device', 'pin'] },
  { value: 'led', label: 'LED', icon: 'mdi-led-variant-on', color: 'lime', require: ['device', 'pin'] },
  { value: 'streetlight', label: 'Street Light', icon: 'mdi-post-lamp', color: 'yellow', require: ['device', 'pin'] },
  { value: 'relay', label: 'Relay', icon: 'mdi-electric-switch', color: 'indigo', require: ['device', 'pin'] },
  { value: 'frog', label: 'Frog Juicer', icon: 'mdi-blender', color: 'green', require: ['device', 'pin'] },
  { value: 'power', label: 'Power', icon: 'mdi-power', color: 'red', require: ['device', 'pin'] },
  { value: 'pin', label: 'PIN', icon: 'mdi-pin', color: 'orange', require: ['device', 'pin'] },
  { value: 'sound', label: 'Sound', icon: 'mdi-volume-high', color: 'cyan', require: ['device'], defaultDevice: 'deja-server' },
  { value: 'macro', label: 'Macro', icon: 'mdi-magic-staff', color: 'purple' },
]

// Re-export loco constants
export const ROADNAMES = [
  { value: 'BNSF', label: 'BNSF Railway', color: '#FF6600' },
  { value: 'UP', label: 'Union Pacific', color: '#FFD700' },
  { value: 'CSX', label: 'CSX Transportation', color: '#003DA5' },
  { value: 'NS', label: 'Norfolk Southern', color: '#000000' },
  { value: 'CN', label: 'Canadian National', color: '#FF0000' },
]

// Re-export sensor constants (SCREAMING_CASE for legacy, camelCase for sub-path imports)
export const SENSOR_TYPES = [
  { value: 'digital', label: 'Digital' },
  { value: 'analog', label: 'Analog' },
  { value: 'dcc-ex', label: 'DCC-EX' },
]

export const SENSOR_INPUT_TYPES = [
  { value: 'ir', label: 'Infrared' },
  { value: 'current', label: 'Current Detection' },
  { value: 'reed', label: 'Reed Switch' },
  { value: 'optical', label: 'Optical' },
  { value: 'pressure', label: 'Pressure' },
  { value: 'custom', label: 'Custom' },
]

// Sub-path import names (used by components importing from '@repo/modules/sensors')
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

// Standalone deviceTypes export (used by components importing from '@repo/modules/layouts/constants')
export const deviceTypes = [
  { value: 'dcc-ex', label: 'DCC-EX CommandStation', icon: 'mdi-memory', color: 'yellow' },
  { value: 'deja-arduino', label: 'DEJA Arduino (MEGA)', icon: 'mdi-usb', color: 'lime' },
  { value: 'deja-arduino-led', label: 'DEJA LED Arduino', icon: 'mdi-led-strip', color: 'teal' },
  { value: 'deja-mqtt', label: 'DEJA MQTT (Pico W)', icon: 'mdi-wifi', color: 'blue' },
  { value: 'deja-server', label: 'DEJA Server', icon: 'mdi-server', color: 'purple' },
]

// Re-export CV types (plans module types and constants are pass-through)
export type CvProgrammingMode = 'service' | 'pom'
export type CvOperation = 'read' | 'write' | 'write-bit' | 'verify' | 'read-address' | 'write-address'
export interface CvRequest {
  requestId: string
  mode: CvProgrammingMode
  operation: CvOperation
  cv?: number
  value?: number
  bit?: number
  address?: number
}
export interface CvResponse {
  requestId: string
  success: boolean
  cv?: number
  value?: number
  bit?: number
  address?: number
  error?: string
}

// Plans types
export type PlanTier = 'hobbyist' | 'engineer' | 'conductor'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired'
export type BillingCycle = 'monthly' | 'annual'

// Signal re-exports
export type SignalInput = Omit<import('./data').Signal, 'id'>
export type SensorInput = Omit<import('./data').Sensor, 'id'>
export type RouteInput = Omit<import('./data').Route, 'id'>
export type BlockInput = Omit<import('./data').Block, 'id'>

export interface ConsistSettingsProps {
  locos: import('./data').Loco[]
  loco: import('./data').Loco
}

export interface RoutesPreferences {
  sortBy: string[]
}

// ---------------------------------------------------------------------------
// useTurnouts
// ---------------------------------------------------------------------------
export const useTurnouts = fn(() => ({
  getTurnout: fn().mockName('getTurnout'),
  getTurnouts: fn().mockName('getTurnouts').mockReturnValue(ref([])),
  getTurnoutsByDevice: fn().mockName('getTurnoutsByDevice').mockReturnValue(null),
  getTurnoutsByIds: fn().mockName('getTurnoutsByIds').mockReturnValue(null),
  setTurnout: fn().mockName('setTurnout').mockResolvedValue(true),
  switchTurnout: fn().mockName('switchTurnout').mockResolvedValue(undefined),
})).mockName('useTurnouts')

export default useTurnouts

// ---------------------------------------------------------------------------
// useEfx
// ---------------------------------------------------------------------------
export const useEfx = fn(() => ({
  deleteEfx: fn().mockName('deleteEfx').mockResolvedValue(undefined),
  efxCol: fn().mockName('efxCol').mockReturnValue(null),
  getEffect: fn().mockName('getEffect').mockResolvedValue(undefined),
  getEffects: fn().mockName('getEffects').mockReturnValue(ref([])),
  getGuestEffects: fn().mockName('getGuestEffects').mockReturnValue(ref([])),
  getEffectsByDevice: fn().mockName('getEffectsByDevice').mockReturnValue(null),
  getEffectsByType: fn().mockName('getEffectsByType').mockReturnValue(null),
  getEfxType: fn().mockName('getEfxType').mockReturnValue(undefined),
  setEfx: fn().mockName('setEfx').mockResolvedValue(true),
  runEffect: fn().mockName('runEffect').mockResolvedValue(undefined),
})).mockName('useEfx')

// ---------------------------------------------------------------------------
// useLocos
// ---------------------------------------------------------------------------
export const useLocos = fn(() => ({
  createLoco: fn().mockName('createLoco').mockResolvedValue(3),
  deleteLoco: fn().mockName('deleteLoco').mockResolvedValue(undefined),
  getLoco: fn().mockName('getLoco').mockReturnValue(ref(null)),
  getLocos: fn().mockName('getLocos').mockReturnValue(ref([])),
  getLocoThrottle: fn().mockName('getLocoThrottle').mockResolvedValue(null),
  getRoadname: fn().mockName('getRoadname').mockReturnValue(undefined),
  getThrottles: fn().mockName('getThrottles').mockReturnValue(ref([])),
  getThrottlesWithLocos: fn().mockName('getThrottlesWithLocos').mockReturnValue([]),
  throttlesWithLocos: [],
  updateFunctions: fn().mockName('updateFunctions').mockResolvedValue(undefined),
  updateLoco: fn().mockName('updateLoco').mockResolvedValue(undefined),
  updateConsist: fn().mockName('updateConsist').mockResolvedValue(undefined),
  acquireThrottle: fn().mockName('acquireThrottle').mockResolvedValue(undefined),
})).mockName('useLocos')

// ---------------------------------------------------------------------------
// useLayout
// ---------------------------------------------------------------------------
export const useLayout = fn(() => ({
  getLayout: fn().mockName('getLayout').mockReturnValue(ref(null)),
  getLayouts: fn().mockName('getLayouts').mockReturnValue(ref([])),
  createLayout: fn().mockName('createLayout').mockResolvedValue(true),
  updateLayout: fn().mockName('updateLayout').mockResolvedValue(true),
  getDevice: fn().mockName('getDevice').mockResolvedValue(undefined),
  getLayoutDevices: fn().mockName('getLayoutDevices').mockResolvedValue(ref([])),
  getDevices: fn().mockName('getDevices').mockReturnValue(ref([])),
  createDevice: fn().mockName('createDevice').mockResolvedValue(true),
  autoConnectDevice: fn().mockName('autoConnectDevice').mockResolvedValue(undefined),
  deviceTypes: [
    { value: 'dcc-ex', label: 'DCC-EX CommandStation', icon: 'mdi-memory', color: 'pink' },
    { value: 'deja-arduino', label: 'DEJA Arduino (MEGA)', icon: 'mdi-usb', color: 'lime' },
    { value: 'deja-arduino-led', label: 'DEJA LED Arduino', icon: 'mdi-led-strip', color: 'teal' },
    { value: 'deja-mqtt', label: 'DEJA MQTT (Pico W)', icon: 'mdi-wifi', color: 'blue' },
    { value: 'deja-server', label: 'DEJA Server', icon: 'mdi-laptop', color: 'purple' },
  ],
  connectDevice: fn().mockName('connectDevice').mockResolvedValue(undefined),
  disconnectDevice: fn().mockName('disconnectDevice').mockResolvedValue(undefined),
  getTags: fn().mockName('getTags').mockResolvedValue([]),
  setTags: fn().mockName('setTags').mockResolvedValue(undefined),
  setTag: fn().mockName('setTag').mockResolvedValue(undefined),
  getTagsByIds: fn().mockName('getTagsByIds').mockResolvedValue([]),
})).mockName('useLayout')

// ---------------------------------------------------------------------------
// useFunctions
// ---------------------------------------------------------------------------
export const useFunctions = fn(() => ({
  updateFunctions: fn().mockName('updateFunctions').mockResolvedValue(undefined),
})).mockName('useFunctions')

// ---------------------------------------------------------------------------
// useFunctionIcon
// ---------------------------------------------------------------------------
export const useFunctionIcon = fn(() => ({
  getIconComponent: fn().mockName('getIconComponent').mockReturnValue('mdi-train'),
  getAllIcons: fn().mockName('getAllIcons').mockReturnValue([
    { name: 'light', icon: 'mdi-lightbulb' },
    { name: 'bell', icon: 'mdi-bell' },
    { name: 'horn', icon: 'mdi-bullhorn' },
  ]),
  DEFAULT_ICON: 'mdi-train',
})).mockName('useFunctionIcon')

// ---------------------------------------------------------------------------
// useSignals
// ---------------------------------------------------------------------------
export const useSignals = fn(() => ({
  deleteSignal: fn().mockName('deleteSignal').mockResolvedValue(undefined),
  getSignal: fn().mockName('getSignal').mockResolvedValue(undefined),
  getSignals: fn().mockName('getSignals').mockReturnValue(ref([])),
  setSignal: fn().mockName('setSignal').mockResolvedValue(true),
  setSignalAspect: fn().mockName('setSignalAspect').mockResolvedValue(undefined),
  signalsCol: fn().mockName('signalsCol').mockReturnValue(null),
})).mockName('useSignals')

// ---------------------------------------------------------------------------
// useRoutes
// ---------------------------------------------------------------------------
export const useRoutes = fn(() => ({
  deleteRoute: fn().mockName('deleteRoute').mockResolvedValue(undefined),
  getRoute: fn().mockName('getRoute').mockResolvedValue(undefined),
  getRoutes: fn().mockName('getRoutes').mockReturnValue(ref([])),
  routesCol: fn().mockName('routesCol').mockReturnValue(null),
  runRoute: fn().mockName('runRoute').mockResolvedValue(undefined),
  setRoute: fn().mockName('setRoute').mockResolvedValue(true),
})).mockName('useRoutes')

// ---------------------------------------------------------------------------
// useLayoutRoutes
// ---------------------------------------------------------------------------
export const useLayoutRoutes = fn(() => ({
  isRunning: ref(false),
  percentComplete: ref(0),
  runRoute: fn().mockName('runRoute').mockResolvedValue(undefined),
})).mockName('useLayoutRoutes')

// ---------------------------------------------------------------------------
// useSensors
// ---------------------------------------------------------------------------
export const useSensors = fn(() => ({
  deleteSensor: fn().mockName('deleteSensor').mockResolvedValue(undefined),
  getSensor: fn().mockName('getSensor').mockResolvedValue(undefined),
  getSensors: fn().mockName('getSensors').mockReturnValue(ref([])),
  getSensorsByDevice: fn().mockName('getSensorsByDevice').mockReturnValue(null),
  sensorsCol: fn().mockName('sensorsCol').mockReturnValue(null),
  setSensor: fn().mockName('setSensor').mockResolvedValue(true),
  setSensorState: fn().mockName('setSensorState').mockResolvedValue(undefined),
})).mockName('useSensors')

// ---------------------------------------------------------------------------
// useBlocks
// ---------------------------------------------------------------------------
export const useBlocks = fn(() => ({
  blocksCol: fn().mockName('blocksCol').mockReturnValue(null),
  deleteBlock: fn().mockName('deleteBlock').mockResolvedValue(undefined),
  getBlock: fn().mockName('getBlock').mockResolvedValue(undefined),
  getBlocks: fn().mockName('getBlocks').mockReturnValue(ref([])),
  setBlock: fn().mockName('setBlock').mockResolvedValue(true),
  setBlockOccupied: fn().mockName('setBlockOccupied').mockResolvedValue(undefined),
})).mockName('useBlocks')

// ---------------------------------------------------------------------------
// useAutomations
// ---------------------------------------------------------------------------
export const useAutomations = fn(() => ({
  automationsCol: fn().mockName('automationsCol').mockReturnValue(null),
  deleteAutomation: fn().mockName('deleteAutomation').mockResolvedValue(undefined),
  getAutomation: fn().mockName('getAutomation').mockResolvedValue(undefined),
  getAutomations: fn().mockName('getAutomations').mockReturnValue(ref([])),
  getAutomationsBySensor: fn().mockName('getAutomationsBySensor').mockReturnValue(null),
  setAutomation: fn().mockName('setAutomation').mockResolvedValue(true),
})).mockName('useAutomations')

// ---------------------------------------------------------------------------
// useUserPreferences
// ---------------------------------------------------------------------------
export const useUserPreferences = fn(() => ({
  preferences: computed(() => null),
  isLoaded: computed(() => true),
  getPreference: fn().mockName('getPreference').mockReturnValue(computed(() => null)),
  setPreference: fn().mockName('setPreference').mockResolvedValue(undefined),
  getBackground: fn().mockName('getBackground').mockReturnValue(computed(() => 'none')),
  setAppBackground: fn().mockName('setAppBackground').mockResolvedValue(undefined),
  setPageBackground: fn().mockName('setPageBackground').mockResolvedValue(undefined),
  clearPageBackground: fn().mockName('clearPageBackground').mockResolvedValue(undefined),
})).mockName('useUserPreferences')

// ---------------------------------------------------------------------------
// useServerStatus
// ---------------------------------------------------------------------------
export const useServerStatus = fn(() => ({
  serverStatus: ref(null),
})).mockName('useServerStatus')

// ---------------------------------------------------------------------------
// useSubscription (from plans module)
// ---------------------------------------------------------------------------
export const useSubscription = fn(() => ({
  plan: computed(() => 'hobbyist' as const),
  status: computed(() => 'active' as const),
  limits: computed(() => ({
    locos: 5,
    turnouts: 10,
    signals: 5,
    effects: 10,
    sounds: 3,
    routes: 5,
    layouts: 1,
    tourApp: false,
  })),
  isTrialing: computed(() => false),
  isActive: computed(() => true),
  trialDaysLeft: computed(() => 0),
  canAdd: fn().mockName('canAdd').mockReturnValue(true),
  requiresPlan: fn().mockName('requiresPlan').mockReturnValue(false),
  subscription: computed(() => null),
  userDoc: ref(null),
})).mockName('useSubscription')

// ---------------------------------------------------------------------------
// Plans constants (pass-through)
// ---------------------------------------------------------------------------
export const PLAN_LIMITS = {
  hobbyist: { locos: 5, turnouts: 10, signals: 5, effects: 10, sounds: 3, routes: 5, layouts: 1, tourApp: false },
  engineer: { locos: 20, turnouts: 50, signals: 20, effects: 50, sounds: 20, routes: 20, layouts: 3, tourApp: true },
  conductor: { locos: Infinity, turnouts: Infinity, signals: Infinity, effects: Infinity, sounds: Infinity, routes: Infinity, layouts: Infinity, tourApp: true },
}

export const TIER_ORDER = ['hobbyist', 'engineer', 'conductor']

// CV constants stub
export const COMMON_CVS: Array<{
  cv: number
  name: string
  description: string
  min: number
  max: number
  defaultValue?: number
  readOnly?: boolean
}> = []

// Loco default functions (mirrors @repo/modules/locos/constants.ts)
export const defaultFunctions: import('./data').LocoFunction[] = Array.from({ length: 32 }, (_, id) => ({
  id,
  label: `F${id}`,
  icon: null,
  isFavorite: false,
  isMomentary: false,
}))

// Layout constants
export const defaultLayoutSounds = [
  { effectId: 'train-horn', label: 'Train Horn', icon: 'mdi-bullhorn' },
  { effectId: 'bell', label: 'Bell', icon: 'mdi-bell' },
]
