/**
 * Factory functions for realistic mock data used in Storybook stories.
 * Each factory returns a fully-typed default and accepts partial overrides.
 *
 * IMPORTANT: These types are duplicated here intentionally — the mock files
 * must NOT import from @repo/modules because Vite aliases redirect
 * @repo/modules to the mocks/modules.ts file, which would create a circular dependency.
 */

// ---------------------------------------------------------------------------
// Duplicated type interfaces (sourced from @repo/modules)
// ---------------------------------------------------------------------------

export interface Turnout {
  color?: string
  desc?: string
  device: string
  divergent?: number
  effectId?: string
  id: string
  lastUpdated?: string
  name: string
  order?: number
  state: boolean
  straight?: number
  tags?: string[]
  timestamp?: number
  turnoutIdx?: number
  type: string
}

export interface ConsistLoco {
  address: number
  direction: boolean
  trim: number
}

export interface LocoFunction {
  id: number
  label: string
  icon: string | null | undefined
  isFavorite: boolean | undefined
  isMomentary: boolean | undefined
}

export interface Loco {
  address: number
  name: string
  consist?: ConsistLoco[]
  functions?: LocoFunction[]
  hasSound?: boolean
  id: string
  meta?: {
    color?: string
    roadname?: string
  }
}

export interface Throttle {
  id?: number
  address: number
  direction: boolean
  speed: number
  timesstamp: number
}

export interface LocoThrottle {
  address: number
  loco: Loco
  throttle: Throttle
}

export interface MacroItem {
  device?: string
  direction?: boolean | string
  name?: string
  type?: string
  speed?: number
  state?: boolean
  id?: string | number
}

export interface Effect {
  device?: string
  name?: string
  pin?: number
  on?: MacroItem[]
  off?: MacroItem[]
  type: string
  state: boolean
  color?: string
  pattern?: string
  point1?: string
  point2?: string
  range?: string
  config?: string
  order?: number
  sound?: string
  soundBlobUrl?: string
  soundDuration?: number
  tags?: string[]
  allowGuest?: boolean
  id: string
}

export interface EffectType {
  value: string
  label: string
  icon: string
  color: string
  require?: string[]
  defaultDevice?: string
}

export type SignalAspect = 'red' | 'yellow' | 'green' | null

export interface Signal {
  id: string
  name: string
  device?: string
  red?: number
  yellow?: number
  green?: number
  aspect?: SignalAspect
  commonAnode?: boolean
  description?: string
  tags?: string[]
  timestamp?: null
}

export type SensorType = 'digital' | 'analog' | 'dcc-ex'
export type SensorInputType = 'ir' | 'current' | 'reed' | 'optical' | 'pressure' | 'custom'

export interface Sensor {
  id: string
  name: string
  device?: string
  pin?: number
  index: number
  type: SensorType
  inputType?: SensorInputType
  state: boolean
  enabled: boolean
  blockId?: string
  effectId?: string
  automationId?: string
  debounceMs?: number
  cooldownMs?: number
  maxRetries?: number
  retryWindowMs?: number
  invertState?: boolean
  pullup?: boolean
  analogValue?: number
  analogThreshold?: number
  description?: string
  tags?: string[]
  timestamp?: null
}

export interface Tag {
  color?: string
  icon?: string
  id: string
  name: string
}

export interface Layout {
  approved?: boolean
  author?: string
  createdAt?: Date
  description?: string
  defaultSounds?: LayoutDefaultSound[]
  devices?: string[]
  effects?: string[]
  id: string
  image?: string
  isArchived?: boolean
  isDefault?: boolean
  isFavorite?: boolean
  isPublic?: boolean
  locos?: string[]
  meta?: Record<string, unknown>
  name: string
  owner?: string
  routes?: string[]
  scripts?: string[]
  sensors?: string[]
  blocks?: string[]
  tags?: Tag[]
  thumbnail?: string
  turnouts?: string[]
  updatedAt?: Date
  version?: string
  dccEx?: {
    power?: boolean
    trackA?: string
    trackB?: string
    LCD2?: string
    LCD3?: string
    client?: string
    isConnected?: boolean
    lastConnected?: Date
  }
  throttleConnection?: {
    type: 'deja-server' | 'withrottle'
    host?: string
    port?: number
  }
}

export interface LayoutDefaultSound {
  effectId: string
  label: string
  icon: string
}

export interface ServerStatus {
  online: boolean
  lastSeen: Date | number
  version?: string
}

export interface Device {
  autoConnect?: boolean
  client?: string
  config?: Record<string, unknown>
  connection?: 'usb' | 'wifi'
  description?: string
  id: string
  isConnected?: boolean
  lastConnected?: Date
  name: string
  port?: string
  strips?: number[]
  tags?: Tag[]
  timestamp?: Date
  topic?: string
  type: 'dcc-ex' | 'deja-arduino' | 'deja-arduino-led' | 'deja-mqtt'
}

export interface RouteTurnoutConfig {
  id?: string | number
  name?: string
  device?: string
  state?: boolean
  type?: string
  direction?: boolean | string
}

export interface Route {
  id: string
  name: string
  point1?: string
  point2?: string
  color?: string
  tags?: string[]
  turnouts?: RouteTurnoutConfig[]
  order?: number
  description?: string
}

export interface Block {
  id: string
  name: string
  sensorIds: string[]
  signalIds?: string[]
  color?: string
  occupied: boolean
  description?: string
  tags?: string[]
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  rotation?: number
  connections?: string[]
  timestamp?: null
}

export interface SensorAutomation {
  id: string
  name: string
  sensorId: string
  triggerOn: 'activate' | 'deactivate' | 'both'
  actions: SensorAction[]
  enabled: boolean
  delay?: number
  description?: string
  timestamp?: null
}

export interface SensorAction {
  type: 'effect' | 'turnout' | 'signal' | 'route' | 'macro' | 'throttle'
  id: string
  state?: boolean
  speed?: number
  direction?: boolean
  aspect?: 'red' | 'yellow' | 'green'
}

export interface RoadName {
  value: string
  label: string
  color: string
}

// ---------------------------------------------------------------------------
// Factory Functions
// ---------------------------------------------------------------------------

let _idCounter = 0
function nextId(prefix: string): string {
  _idCounter += 1
  return `${prefix}-${_idCounter}`
}

/** Reset the ID counter between test runs if needed */
export function resetIdCounter(): void {
  _idCounter = 0
}

export function createTurnout(overrides?: Partial<Turnout>): Turnout {
  return {
    id: nextId('turnout'),
    name: 'Yard Entry',
    desc: 'Controls the yard entry track switch',
    type: 'servo',
    state: false,
    color: 'blue',
    device: 'arduino-01',
    tags: ['yard', 'mainline'],
    order: 1,
    turnoutIdx: 100,
    ...overrides,
  }
}

export function createLocoFunction(overrides?: Partial<LocoFunction>): LocoFunction {
  return {
    id: 0,
    label: 'Headlight',
    icon: 'mdi-lightbulb',
    isFavorite: true,
    isMomentary: false,
    ...overrides,
  }
}

export function createConsistLoco(overrides?: Partial<ConsistLoco>): ConsistLoco {
  return {
    address: 1234,
    direction: true,
    trim: 0,
    ...overrides,
  }
}

export function createLoco(overrides?: Partial<Loco>): Loco {
  return {
    id: nextId('loco'),
    address: 3,
    name: 'BNSF GP38-2',
    hasSound: true,
    functions: [
      createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: true }),
      createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell', isFavorite: true }),
      createLocoFunction({ id: 2, label: 'Horn', icon: 'mdi-bullhorn', isFavorite: true }),
    ],
    meta: {
      color: '#FF6600',
      roadname: 'BNSF',
    },
    ...overrides,
  }
}

export function createThrottle(overrides?: Partial<Throttle>): Throttle {
  return {
    address: 3,
    direction: true,
    speed: 0,
    timesstamp: Date.now(),
    ...overrides,
  }
}

export function createLocoThrottle(overrides?: Partial<LocoThrottle>): LocoThrottle {
  const loco = overrides?.loco ?? createLoco()
  const throttle = overrides?.throttle ?? createThrottle({ address: loco.address })
  return {
    address: loco.address,
    loco,
    throttle,
    ...overrides,
  }
}

export function createEffect(overrides?: Partial<Effect>): Effect {
  return {
    id: nextId('effect'),
    name: 'Yard Lights',
    type: 'light',
    state: false,
    color: 'yellow',
    device: 'arduino-01',
    pin: 22,
    order: 1,
    tags: ['yard', 'lighting'],
    ...overrides,
  }
}

export function createSoundEffect(overrides?: Partial<Effect>): Effect {
  return createEffect({
    name: 'Station Announcement',
    type: 'sound',
    device: 'deja-server',
    sound: 'station-announce.mp3',
    soundBlobUrl: 'https://example.com/sounds/station-announce.mp3',
    soundDuration: 5.2,
    pin: undefined,
    ...overrides,
  })
}

export function createMacroEffect(overrides?: Partial<Effect>): Effect {
  return createEffect({
    name: 'Arrival Sequence',
    type: 'macro',
    device: undefined,
    pin: undefined,
    on: [
      { type: 'effect', id: 'effect-1', state: true },
      { type: 'turnout', id: 'turnout-1', state: true },
    ],
    off: [
      { type: 'effect', id: 'effect-1', state: false },
      { type: 'turnout', id: 'turnout-1', state: false },
    ],
    ...overrides,
  })
}

export function createSignal(overrides?: Partial<Signal>): Signal {
  return {
    id: nextId('signal'),
    name: 'Main Line Signal',
    device: 'arduino-01',
    red: 30,
    yellow: 31,
    green: 32,
    aspect: 'green',
    commonAnode: false,
    description: 'Controls the main line approach signal',
    tags: ['mainline'],
    ...overrides,
  }
}

export function createSensor(overrides?: Partial<Sensor>): Sensor {
  return {
    id: nextId('sensor'),
    name: 'Block 1 Detector',
    index: 1,
    type: 'digital',
    inputType: 'ir',
    enabled: true,
    state: false,
    device: 'arduino-01',
    pin: 40,
    description: 'IR sensor for block 1 occupancy detection',
    tags: ['block-detection'],
    ...overrides,
  }
}

export function createBlock(overrides?: Partial<Block>): Block {
  return {
    id: nextId('block'),
    name: 'Main Block 1',
    sensorIds: ['sensor-1'],
    signalIds: ['signal-1'],
    color: 'blue',
    occupied: false,
    description: 'Main line block 1',
    tags: ['mainline'],
    ...overrides,
  }
}

export function createSensorAutomation(overrides?: Partial<SensorAutomation>): SensorAutomation {
  return {
    id: nextId('automation'),
    name: 'Block 1 Signal Automation',
    sensorId: 'sensor-1',
    triggerOn: 'activate',
    actions: [
      { type: 'signal', id: 'signal-1', aspect: 'red' },
    ],
    enabled: true,
    description: 'Sets signal to red when block is occupied',
    ...overrides,
  }
}

export function createTag(overrides?: Partial<Tag>): Tag {
  return {
    id: nextId('tag'),
    name: 'Mainline',
    color: 'blue',
    icon: 'mdi-train',
    ...overrides,
  }
}

export function createDevice(overrides?: Partial<Device>): Device {
  return {
    id: nextId('device'),
    name: 'DCC-EX CommandStation',
    type: 'dcc-ex',
    connection: 'usb',
    isConnected: true,
    autoConnect: true,
    port: '/dev/ttyUSB0',
    description: 'Main DCC-EX command station',
    tags: [createTag({ name: 'primary' })],
    ...overrides,
  }
}

export function createLayout(overrides?: Partial<Layout>): Layout {
  return {
    id: nextId('layout'),
    name: 'HO Scale Mountain Division',
    description: 'A mountain-themed HO scale layout with two mainline loops',
    owner: 'user@example.com',
    approved: true,
    isPublic: false,
    isDefault: true,
    isFavorite: false,
    isArchived: false,
    version: '1.0.0',
    devices: ['dccex'],
    tags: [createTag({ name: 'HO Scale' }), createTag({ name: 'Mountain' })],
    dccEx: {
      power: true,
      isConnected: true,
      client: 'dejaJs',
    },
    ...overrides,
  }
}

export function createRoute(overrides?: Partial<Route>): Route {
  return {
    id: nextId('route'),
    name: 'Main to Siding',
    color: 'purple',
    point1: 'Main Line',
    point2: 'Industrial Siding',
    description: 'Routes from main line to the industrial siding',
    order: 1,
    tags: ['mainline', 'siding'],
    turnouts: [
      { id: 'turnout-1', name: 'Yard Entry', state: true, type: 'servo' },
      { id: 'turnout-2', name: 'Siding Switch', state: false, type: 'servo' },
    ],
    ...overrides,
  }
}

export function createServerStatus(overrides?: Partial<ServerStatus>): ServerStatus {
  return {
    online: true,
    lastSeen: Date.now(),
    version: '1.2.3',
    ...overrides,
  }
}

export function createRoadName(overrides?: Partial<RoadName>): RoadName {
  return {
    value: 'BNSF',
    label: 'BNSF Railway',
    color: '#FF6600',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Bulk helpers
// ---------------------------------------------------------------------------

export function createTurnouts(count: number): Turnout[] {
  return Array.from({ length: count }, (_, i) =>
    createTurnout({
      name: `Turnout ${i + 1}`,
      order: i + 1,
      turnoutIdx: 100 + i,
    }),
  )
}

export function createLocos(count: number): Loco[] {
  return Array.from({ length: count }, (_, i) =>
    createLoco({
      name: `Locomotive ${i + 1}`,
      address: i + 1,
    }),
  )
}

export function createEffects(count: number): Effect[] {
  return Array.from({ length: count }, (_, i) =>
    createEffect({
      name: `Effect ${i + 1}`,
      order: i + 1,
      pin: 20 + i,
    }),
  )
}

export function createSignals(count: number): Signal[] {
  return Array.from({ length: count }, (_, i) =>
    createSignal({
      name: `Signal ${i + 1}`,
      red: 30 + i * 3,
      yellow: 31 + i * 3,
      green: 32 + i * 3,
    }),
  )
}

export function createSensors(count: number): Sensor[] {
  return Array.from({ length: count }, (_, i) =>
    createSensor({
      name: `Sensor ${i + 1}`,
      index: i + 1,
      pin: 40 + i,
    }),
  )
}

export function createRoutes(count: number): Route[] {
  return Array.from({ length: count }, (_, i) =>
    createRoute({
      name: `Route ${i + 1}`,
      order: i + 1,
    }),
  )
}

export function createDevices(count: number): Device[] {
  const deviceTypes: Array<Device['type']> = ['dcc-ex', 'deja-arduino', 'deja-arduino-led', 'deja-mqtt']
  return Array.from({ length: count }, (_, i) =>
    createDevice({
      name: `Device ${i + 1}`,
      type: deviceTypes[i % deviceTypes.length],
    }),
  )
}
