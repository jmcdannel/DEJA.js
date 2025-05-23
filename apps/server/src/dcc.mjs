import { SerialPort } from 'serialport'
import { ref, remove } from 'firebase/database'
import { rtdb } from './firebase.mjs'
import serial from './serial.mjs'
import { broadcast } from './broadcast.mjs'
import log from './utils/logger.mjs'

let isConnected = false // serial port connection status
const baudRate = 115200
let com = {
  isConnected: false,
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

const handleMessage = async (msg) => {
  try {
    const { action, payload } = JSON.parse(msg)
    log.note('handleMessage', action, payload, msg)
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

const handleConnectionMessage = async (payload) =>
  await broadcast({ action: 'broadcast', payload })

const send = async (data) => {
  try {
    const cmd = `<${data}>\n`
    log.await('Writing to port', data)
    serial.send(com.port, cmd)
  } catch (err) {
    log.fatal('Error writting to port:', err)
  }
}

const connect = async (payload) => {
  try {
    log.star('[DCC] connect', payload)
    const { serial: path, device } = payload
    if (isConnected) {
      await broadcast({ action: 'connected', payload: { path, baudRate } })
      return isConnected
    } else {
      const port = await serial.connect({
        path,
        baudRate,
        handleMessage: handleConnectionMessage,
      })
      await broadcast({
        action: 'connected',
        payload: { path, baudRate, device },
      })
      isConnected = true
      com = { isConnected, port }
      return com
    }
  } catch (err) {
    log.fatal('Error opening port: ', err)
  }
}

const setConnection = async (port) => {
  console.log('setConnection', !!port)
  com = { isConnected: true, port }
  isConnected = true
  return com
}

const listPorts = async () => {
  const payload = await getPorts()
  await broadcast({ action: 'portList', payload })
  log.star('[DCC] List ports', payload)
}

const getStatus = async () => {
  await broadcast({
    action: 'status',
    payload: { isConnected, client: 'dejaJS' },
  })
  log.star('[DCC] getStatus', { action: 'status', payload: { isConnected } })
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

const sendFunction = async (payload) => {
  const { address, func, state } = payload
  log.star('Function', payload, typeof payload, address, func)
  const cmd = `F ${address} ${func} ${state ? 1 : 0}`
  await send(cmd)
}

const sendOutput = async (payload) => {
  log.star('Output', payload)
  const cmd = `Z ${payload.pin} ${payload.state ? 1 : 0}`
  await send(cmd)
}

export async function handleDccChange(snapshot) {
  try {
    log.note('handleDccChange')
    // snapshot.docChanges().forEach((change) => {
    //   if (change.type === 'added') {
    //     const { action, payload: payloadRaw } = change.doc.data()
    //     const payload = JSON.parse(payloadRaw)
    //     log.log('handleDccCommands: ', action, payload)
    //     handleMessage(JSON.stringify({ action, payload }))
    //   }
    // })
    const { action, payload } = snapshot.val()
    log.log('handleDccChange: ', action, payload, snapshot.key)
    await handleMessage(
      JSON.stringify({ action, payload: JSON.parse(payload) })
    )
    snapshot.key && remove(ref(rtdb, `dccCommands/${layoutId}/${snapshot.key}`))
  } catch (err) {
    log.fatal('Error handling dcc command:', err)
  }
}

export default {
  handleMessage,
  setConnection,
  sendSpeed,
  sendCommand: send,
  handleDccChange,
  dccSerial: com,
}
