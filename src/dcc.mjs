import { SerialPort } from 'serialport'
import serial from './serial.mjs'
import { broadcast } from './broadcast.mjs'
import log from './utils/logger.mjs'

let isConnected = false // serial port connection status
const baudRate = 115200

const getPorts = async () => {
  try {
    const availablePorts = await SerialPort.list()
    return availablePorts.map((port) => port.path)
  } catch (err) {
    log.fatal(err)
  }
}

const handleMessage = async (msg) => {
  log.note('handleMessage', msg)
  try {
    const { action, payload } = JSON.parse(msg)
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
        await getStatus()
        break
      default:
        //noop
        log.warn('Unknown action in `handleMessage`', action, payload)
    }
  } catch (err) {
    log.fatal('Error handling message:', err)
  }
}

const handleConnectionMessage = async (payload) =>
  await broadcast({ action: 'broadcast', payload })

const send = async (data) => {
  try {
    const cmd = `<${data}>\n`
    log.await('Writing to port', data)
    serial.send(cmd)
  } catch (err) {
    log.fatal('Error writting to port:', err)
  }
}

const connect = async (payload) => {
  try {
    log.star('connect', payload)
    const path = payload.serial
    if (isConnected) {
      await broadcast({ action: 'connected', payload: { path, baudRate } })
      return isConnected
    } else {
      await serial.connect({
        path,
        baudRate,
        handleMessage: handleConnectionMessage,
      })
      await broadcast({ action: 'connected', payload: { path, baudRate } })
      isConnected = true
      return isConnected
    }
  } catch (err) {
    log.fatal('Error opening port: ', err)
  }
}

const listPorts = async () => {
  const payload = await getPorts()
  await broadcast({ action: 'portList', payload })
  log.star('List ports', payload)
}

const getStatus = async () => {
  await broadcast({ action: 'status', payload: { isConnected } })
  log.star('getStatus', { action: 'status', payload: { isConnected } })
}

const power = async (state) => {
  await send(state)
  log.star('Power', state)
}

const sendSpeed = async ({ address, speed }) => {
  const direction = speed > 0 ? 1 : 0
  const absSpeed = Math.abs(speed)
  log.star('Throttle', address, speed, direction)
  const cmd = `t ${address} ${absSpeed} ${direction}`
  await send(cmd)
}

const sendTurnout = async ({ turnoutId, state }) => {
  log.star('Turnout', turnoutId, state)
  const cmd = `T ${turnoutId} ${state ? 1 : 0}`
  await send(cmd)
}

const sendFunction = async ({ address, func, state }) => {
  log.star('Function', address, func)
  const cmd = `F ${address} ${func} ${state ? 1 : 0}`
  await send(cmd)
}

const sendOutput = async (payload) => {
  log.star('Output', payload)
  const cmd = `Z ${payload.pin} ${payload.state ? 1 : 0}`
  await send(cmd)
}

export default {
  handleMessage,
}
