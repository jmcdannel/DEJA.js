import { SerialPort } from 'serialport'
import serial from './serial.mjs'
import { broadcast } from './broadcast.mjs'
import log from './utils/logger.mjs'

let port // serial port instance
let isConnected = false // serial port connection status
const baudRate = 115200

const getPorts = async () => {
  try {
    const availablePorts = await SerialPort.list()
    return availablePorts.map((port) => port.path)
  } catch (err) {
    log.fatal(err)
  }
};

const handleMessage = async (msg) => {
  log.note('[DCC] handleMessage', msg)
  try {
    const { action, payload } = JSON.parse(msg)
    switch (action) {
      case 'connect':
        connect(payload)
        break;
      case 'dcc':
        send(payload)
        break;
      case 'listPorts':
        listPorts()
        break;
      case 'power':
        power(payload)
        break;
      case 'throttle':
        sendSpeed(payload)
        break;
      case 'turnout':
        sendTurnout(payload)
        break;
      case 'output':
        sendOutput(payload)
        break;
      case 'function':
        sendFunction(payload)
        break;
      case 'getStatus':
      case 'status':
        getStatus()
        break;
      default:
        //noop
        log.warn('[DCC] Unknown action in `handleMessage`', action, payload)
    }
  } catch (err) {
    log.fatal('[DCC] Error handling message:', err)
  }
}

const handleConnectionMessage = async (payload) =>
  await broadcast({ action: 'broadcast', payload });

const send = async (data) => {
  try {
    const cmd = `<${data}>\n`
    log.await('[DCC] Writing to port', data)
    serial.send(cmd)
  } catch (err) {
    log.fatal('[DCC] Error writting to port:', err)
  }
}

const connect = async (payload) => {
  try {
    log.star('[DCC] connect', payload)
    const path = payload.serial
    if (isConnected && port) {
      await broadcast({ action: 'connected', payload: { path, baudRate } })
      return Promise.resolve(port)
    } else {
      port = await serial.connect({ path, baudRate, handleConnectionMessage })
      await broadcast({ action: 'connected', payload: { path, baudRate } })
      isConnected = true
      return Promise.resolve(port)
    }
  } catch (err) {
    log.fatal('[DCC] Error opening port: ', err)
  }
}

const listPorts = async () => {
  const payload = await getPorts()
  await broadcast({ action: 'listPorts', payload })
  log.star('[DCC] List ports', payload)
}

const getStatus = async () => {
  await broadcast({ action: 'status', payload: { isConnected } })
  log.star('[DCC] getStatus', { action: 'status', payload: { isConnected } })
}

const power = async (state) => {
  await send(state)
  log.star('[DCC] Power', state)
}

const sendSpeed = async ({ address, speed }) => {
  const direction = speed > 0 ? 1 : 0
  const absSpeed = Math.abs(speed)
  log.star('[DCC] Throttle', address, speed, direction)
  const cmd = `t ${address} ${absSpeed} ${direction}`
  await send(cmd)
}

const sendTurnout = async ({ turnoutId, state }) => {
  log.star('[DCC] Turnout', turnoutId, state)
  const cmd = `T ${turnoutId} ${state ? 1 : 0}`
  await send(cmd)
}

const sendFunction = async ({ address, func, state }) => {
  log.star('[DCC] Function', address, func)
  const cmd = `F ${address} ${func} ${state ? 1 : 0}`
  await send(cmd)
}

const sendOutput = async (payload) => {
  log.star('[DCC] Output', payload)
  const cmd = `Z ${payload.pin} ${payload.state ? 1 : 0}`
  await send(cmd)
}

export default {
  handleMessage,
}
