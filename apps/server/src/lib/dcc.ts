import { SerialPort } from 'serialport'
import { FieldValue } from 'firebase-admin/firestore'
import { rtdb } from '@repo/firebase-config/firebase-admin-node'
import { serial } from './serial'
import { broadcast } from '../broadcast'
import { log } from '../utils/logger'

export interface ConnectCommand {
  device: string
  serial: string
}

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

let isConnected = false // serial port connection status
const baudRate = 115200
let com: SerialCom = {
  isConnected: false,
  port: null as SerialPort | null,
}
const layoutId = process.env.LAYOUT_ID

const getPorts = async () => {
  try {
    const availablePorts = await SerialPort.list()
    return availablePorts.map((port) => port.path)
  } catch (err) {
    log.fatal(err)
  }
}

const handleMessage = async (msg: string): Promise<void> => {
  try {
    const { action, payload } = JSON.parse(msg)
    // log.note('handleMessage', action, payload, msg)
    switch (action) {
      case 'connect':
        await connect(payload)
        break
      case 'dcc':
        await send(payload)
        break
      case 'listPorts':
        await listPorts()
        break
      case 'power':
        await power(payload)
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
      default:
        //noop
        log.warn('Unknown action in `dcc handleMessage`', action, payload)
    }
  } catch (err) {
    log.fatal('Error handling message:', err)
  }
}

const handleConnectionMessage = async (payload: JSON | string): Promise<void> =>
  await broadcast({ action: 'broadcast', payload })

const send = async (data: string): Promise<void> => {
  try {
    const cmd = `<${data}>\n`
    // log.await('Writing to port', data)
    if (com.port) {
      serial.send(com.port, cmd)
    }
  } catch (err) {
    log.fatal('Error writting to port:', err)
  }
}

const connect = async (payload: ConnectCommand): Promise<boolean> => {
  try {
    log.star('[DCC] connect', payload)
    const { serial: path, device } = payload
    if (isConnected) {
      await broadcast({ action: 'connected', payload: { baudRate, path } })
      return isConnected
    }
    const port = await serial.connect({
      baudRate,
      handleMessage: handleConnectionMessage,
      path,
    })
    await broadcast({
      action: 'connected',
      payload: { baudRate, device, path },
    })
    isConnected = true
    if (port) {
      com = { isConnected, port }
    }
    return isConnected
  } catch (err) {
    log.fatal('Error opening port: ', err)
    return false
  }
}

const setConnection = async (port: SerialPort): Promise<SerialCom> => {
  // log.log('setConnection', Boolean(port))
  com = { isConnected: true, port }
  isConnected = true
  return com
}

const listPorts = async (): Promise<void> => {
  const payload = await getPorts()
  await broadcast({ action: 'portList', payload })
  log.star('[DCC] List ports', payload)
}

const getStatus = async (): Promise<void> => {
  await broadcast({
    action: 'status',
    payload: { client: 'dejaJS', isConnected },
  })
  log.star('[DCC] getStatus', { action: 'status', payload: { isConnected } })
}

const power = async (state: string): Promise<void> => {
  await send(state)
  log.star('Power', state)
}

const sendSpeed = async ({
  address,
  speed,
}: ThrottlePayload): Promise<void> => {
  const direction = speed > 0 ? 1 : 0
  const absSpeed = Math.abs(speed)
  log.star('Throttle', address, speed, direction)
  const cmd = `t ${address} ${absSpeed} ${direction}`
  await send(cmd)
}

const sendTurnout = async ({
  turnoutIdx,
  state,
}: TurnoutPayload): Promise<void> => {
  log.star('Turnout', turnoutIdx, state)
  const cmd = `T ${turnoutIdx} ${state ? 1 : 0}`
  await send(cmd)
}

const sendFunction = async ({
  address,
  func,
  state,
}: FunctionPayload): Promise<void> => {
  log.star('Function', address, func)
  const cmd = `F ${address} ${func} ${state ? 1 : 0}`
  await send(cmd)
}

const sendOutput = async (payload: OutputPayload) => {
  log.star('Output', payload)
  const cmd = `Z ${payload.pin} ${payload.state ? 1 : 0}`
  await send(cmd)
}

export async function handleDccChange(snapshot, key): Promise<void> {
  try {
    const { action, payload } = snapshot
    // log.log('handleDccChange: ', action, payload, snapshot.key)
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

export const dcc = {
  dccSerial: com,
  handleDccChange,
  handleMessage,
  sendCommand: send,
  sendOutput,
  sendSpeed,
  sendTurnout,
  setConnection,
}

export default dcc
