import { SerialPort } from 'serialport'
import { FieldValue } from 'firebase-admin/firestore'
import { ServerValue } from 'firebase-admin/database'
import { rtdb, db } from '@repo/firebase-config/firebase-admin-node'
import { broadcast } from '../broadcast'
import { createRosterModule } from '../modules/roster.js'
import { log } from '../utils/logger'
import { serial } from './serial'

export interface SerialCom {
  isConnected: boolean
  port: SerialPort | null
}

export interface ThrottlePayload {
  address: number
  speed: number
}
export interface TurnoutPayload {
  state: boolean
  turnoutIdx: number
}

export interface FunctionPayload {
  address: number
  func: number
  state: boolean
}

export interface OutputPayload {
  pin: number
  state: boolean
}

export interface TrackPowerPayload {
  deviceId: string
  output: string
  power: boolean
}

// Allowed DCC-EX action types from Firebase
const VALID_ACTIONS = new Set([
  'dcc', 'listPorts', 'power', 'trackPower', 'throttle',
  'turnout', 'output', 'function', 'getStatus', 'status', 'ping',
  'syncRoster', 'importRoster',
])

/**
 * Validate and sanitize a raw DCC-EX command string.
 * Rejects commands containing protocol-breaking characters that could
 * allow injection of additional DCC-EX commands.
 */
function validateDccCommand(data: string): boolean {
  if (typeof data !== 'string') return false
  if (data.length > 200) return false
  // Block angle brackets and newlines — these break the <cmd>\n framing
  if (/[<>\n\r]/.test(data)) return false
  return true
}

/** Runtime check that a value is a finite number */
function isFiniteNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val)
}

// 🔧 Multi-device registry — replaces the old single `com` variable
const dccDevices: Map<string, SerialCom> = new Map()

const layoutId = process.env.LAYOUT_ID

const getPorts = async () => {
  try {
    const availablePorts = await SerialPort.list()
    return availablePorts.map((port) => port.path)
  } catch (err) {
    log.fatal(err)
  }
}

export function isPowerCommand(data: string): boolean {
  // Matches global: '1', '0', '1 MAIN', '0 MAIN', '1 PROG', '0 PROG'
  // Matches per-output: '1 A', '0 B', etc.
  return /^\s*[01](\s+(MAIN|PROG|[A-H]))?\s*$/.test(data)
}

function isGlobalPowerCommand(data: string): boolean {
  return /^\s*[01](\s+(MAIN|PROG))?\s*$/.test(data)
}

async function writePowerToFirestore(data: string): Promise<void> {
  try {
    if (!layoutId) return
    const isOn = /^\s*1(\s|$)/.test(data)
    await db.collection('layouts').doc(layoutId).set({
      dccEx: {
        power: isOn,
        client: 'dejaJS',
        timestamp: FieldValue.serverTimestamp(),
      },
    }, { merge: true })
  } catch (err) {
    log.error('Failed to write dccEx.power to Firestore', err)
  }
}

/**
 * Write a log entry to the dccLog RTDB path for cloud app consumption.
 * Uses ServerValue.TIMESTAMP so entries are ordered by server time.
 */
async function writeDccLog(
  type: 'cmd-out' | 'cmd-in' | 'info' | 'error' | 'system',
  message: string,
  deviceId?: string,
): Promise<void> {
  try {
    if (!layoutId) return
    const logRef = rtdb.ref(`dccLog/${layoutId}`)
    const entry: Record<string, unknown> = {
      type,
      message,
      timestamp: ServerValue.TIMESTAMP,
    }
    if (deviceId) {
      entry.deviceId = deviceId
    }
    await logRef.push(entry)
  } catch (err) {
    // Log locally but don't throw — logging failures must not break command flow
    log.error('[DCC] Failed to write dccLog entry:', err)
  }
}

// --- Multi-device registration ---

function registerDevice(deviceId: string, port: SerialPort): void {
  dccDevices.set(deviceId, { isConnected: true, port })
  log.success(`[DCC] Registered device: ${deviceId} (total: ${dccDevices.size})`)
}

function unregisterDevice(deviceId: string): void {
  dccDevices.delete(deviceId)
  log.note(`[DCC] Unregistered device: ${deviceId} (total: ${dccDevices.size})`)
}

/**
 * Get the first device ID (Device 1) — used for PROG-only commands.
 * "Device 1" is the first dcc-ex device by insertion order (which follows
 * Firestore document ID sort from layout.ts).
 */
function getDevice1Id(): string | undefined {
  const first = dccDevices.keys().next()
  return first.done ? undefined : first.value
}

// --- Command dispatch ---

/**
 * Send a command to ALL connected DCC-EX devices.
 * Per-device try-catch ensures one broken connection doesn't block others.
 */
async function broadcastToAll(data: string): Promise<void> {
  if (!validateDccCommand(data)) {
    log.error('[DCC] Rejected invalid command:', data)
    return
  }
  const cmd = `<${data}>\n`
  for (const [deviceId, device] of dccDevices) {
    try {
      if (device.port) {
        serial.send(device.port, cmd)
      }
    } catch (err) {
      log.error(`[DCC] Error sending to device ${deviceId}:`, err)
    }
  }
  broadcast({ action: 'dcc', payload: data })
  await writeDccLog('cmd-out', data)
  if (isGlobalPowerCommand(data)) {
    await writePowerToFirestore(data)
  }
}

/**
 * Send a command to a specific device by ID.
 * Used for track config, per-output power, and PROG commands.
 */
async function sendToDevice(deviceId: string, data: string): Promise<void> {
  if (!validateDccCommand(data)) {
    log.error('[DCC] Rejected invalid command:', data)
    return
  }
  const device = dccDevices.get(deviceId)
  if (!device?.port) {
    log.error(`[DCC] Device not found or not connected: ${deviceId}`)
    return
  }
  try {
    const cmd = `<${data}>\n`
    serial.send(device.port, cmd)
    broadcast({ action: 'dcc', payload: data })
    await writeDccLog('cmd-out', data, deviceId)
  } catch (err) {
    log.error(`[DCC] Error sending to device ${deviceId}:`, err)
  }
}

// --- Message handling ---

const handleMessage = async (msg: string): Promise<void> => {
  try {
    const { action, payload } = JSON.parse(msg)
    switch (action) {
      case 'dcc':
        await broadcastToAll(payload)
        break
      case 'listPorts':
        await listPorts()
        break
      case 'power':
        await power(payload)
        break
      case 'trackPower':
        await handleTrackPower(payload)
        break
      case 'throttle':
        await sendSpeed(payload)
        break
      case 'turnout':
        await sendTurnout(payload)
        break
      case 'output':
        await sendOutput(payload)
        break
      case 'function':
        await sendFunction(payload)
        break
      case 'getStatus':
      case 'status':
      case 'ping':
        await getStatus()
        break
      case 'syncRoster':
        await rosterModule.sendRosterSync(payload?.locos ?? [])
        break
      case 'importRoster':
        await rosterModule.startRosterImport()
        break
      default:
        log.warn('Unknown action in `dcc handleMessage`', action, payload)
    }
  } catch (err) {
    log.fatal('Error handling message:', err)
  }
}

const listPorts = async (): Promise<void> => {
  const payload = await getPorts()
  await broadcast({ action: 'portList', payload })
  log.star('[DCC] List ports', payload)
}

const getStatus = async (): Promise<void> => {
  const connected = dccDevices.size > 0
  await broadcast({
    action: 'status',
    payload: { client: 'dejaJS', isConnected: connected },
  })
  log.star('[DCC] getStatus', { action: 'status', payload: { isConnected: connected } })
}

const power = async (state: string): Promise<void> => {
  if (!isGlobalPowerCommand(state)) {
    log.error('[DCC] Rejected invalid power command:', state)
    return
  }
  await broadcastToAll(state)
  log.star('Power', state)
}

const handleTrackPower = async (payload: TrackPowerPayload): Promise<void> => {
  const { deviceId, output, power: powerState } = payload
  if (!deviceId || !output) {
    log.error('[DCC] Rejected invalid trackPower payload:', payload)
    return
  }
  const cmd = `${powerState ? '1' : '0'} ${output}`
  await sendToDevice(deviceId, cmd)
  log.star('TrackPower', deviceId, output, powerState)
}

const sendSpeed = async ({
  address,
  speed,
}: ThrottlePayload): Promise<void> => {
  if (!isFiniteNumber(address) || !isFiniteNumber(speed)) {
    log.error('[DCC] Rejected invalid throttle payload:', { address, speed })
    return
  }
  const direction = speed > 0 ? 1 : 0
  const absSpeed = Math.abs(speed)
  log.star('Throttle', address, speed, direction)
  const cmd = `t ${address} ${absSpeed} ${direction}`
  await broadcastToAll(cmd)
}

const sendTurnout = async (
  { turnoutIdx, state }: TurnoutPayload,
  deviceId?: string,
): Promise<void> => {
  if (!isFiniteNumber(turnoutIdx) || typeof state !== 'boolean') {
    log.error('[DCC] Rejected invalid turnout payload:', { turnoutIdx, state })
    return
  }
  log.star('Turnout', turnoutIdx, state, deviceId ? `→ ${deviceId}` : '→ all')
  const cmd = `T ${turnoutIdx} ${state ? 1 : 0}`
  if (deviceId) {
    await sendToDevice(deviceId, cmd)
  } else {
    await broadcastToAll(cmd)
  }
}

const sendFunction = async ({
  address,
  func,
  state,
}: FunctionPayload): Promise<void> => {
  if (!isFiniteNumber(address) || !isFiniteNumber(func) || typeof state !== 'boolean') {
    log.error('[DCC] Rejected invalid function payload:', { address, func, state })
    return
  }
  log.star('Function', address, func)
  const cmd = `F ${address} ${func} ${state ? 1 : 0}`
  await broadcastToAll(cmd)
}

const sendOutput = async (payload: OutputPayload, deviceId?: string) => {
  if (!isFiniteNumber(payload.pin) || typeof payload.state !== 'boolean') {
    log.error('[DCC] Rejected invalid output payload:', payload)
    return
  }
  log.star('Output', payload, deviceId ? `→ ${deviceId}` : '→ all')
  const cmd = `z ${payload.state ? payload.pin : -payload.pin}`
  if (deviceId) {
    await sendToDevice(deviceId, cmd)
  } else {
    await broadcastToAll(cmd)
  }
}

interface SensorDefinition {
  id: number
  pin: number
  pullup?: boolean
}

const defineSensor = async ({ id, pin, pullup }: SensorDefinition): Promise<void> => {
  if (!isFiniteNumber(id) || !isFiniteNumber(pin)) {
    log.error('[DCC] Rejected invalid sensor definition:', { id, pin })
    return
  }
  const cmd = `S ${id} ${pin} ${pullup ? 1 : 0}`
  await broadcastToAll(cmd)
}

const querySensors = async (): Promise<void> => {
  await broadcastToAll('Q')
}

const querySensor = async (id: number): Promise<void> => {
  if (!isFiniteNumber(id)) {
    log.error('[DCC] Rejected invalid sensor query id:', id)
    return
  }
  await broadcastToAll(`q ${id}`)
}

export async function handleDccChange(snapshot: any, key: string): Promise<void> {
  try {
    const { action, payload } = snapshot
    if (typeof action !== 'string' || !VALID_ACTIONS.has(action)) {
      log.error('[DCC] Rejected unknown action from RTDB:', action)
      return
    }
    await handleMessage(
      JSON.stringify({ action, payload: JSON.parse(payload) })
    )
  } catch (err) {
    log.fatal('Error handling dcc command:', err)
  } finally {
    if (key) {
      const cmd = rtdb.ref(`dccCommands/${layoutId}/${key}`)
      cmd.remove()
    }
  }
}

// Roster sync module — broadcastToAll for sync, Device 1 for import (PROG access)
const rosterModule = createRosterModule(
  async (cmd: string) => {
    // Roster sync broadcasts to all devices
    await broadcastToAll(cmd)
  },
  () => dccDevices.size > 0,
  serial.addDataListener,
)

// Register serial data listener to log incoming responses to RTDB
serial.addDataListener((data: string) => {
  // Don't log sensor JSON data — it's high-frequency noise
  if (data.startsWith('{ "sensor')) return
  writeDccLog('cmd-in', data)
})

export const dcc = {
  broadcastToAll,
  defineSensor,
  getDevice1Id,
  handleDccChange,
  handleMessage,
  querySensor,
  querySensors,
  registerDevice,
  sendToDevice,
  sendOutput,
  sendSpeed,
  sendTurnout,
  unregisterDevice,
}

export default dcc
