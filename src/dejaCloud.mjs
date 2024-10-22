import serial from './serial.mjs'
import { broadcast } from './broadcast.mjs'
import { 
  collection, 
  onSnapshot,
  query,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  limit,
  orderBy 
} from 'firebase/firestore'
import log from './utils/logger.mjs'
import dcc from './dcc.mjs'
import { getEffectCommand } from './effects.mjs'
import { turnoutCommand } from './turnouts.mjs'
import { getMacroCommand } from './macro.mjs'
import { db } from './firebase.mjs'

const layoutId = process.env.LAYOUT_ID
const baudRate = 115200
const devices = []

function handleDccCommands(snapshot) {
  log.note('handleDccCommands')
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const { action, payload: payloadRaw } = change.doc.data()
      const payload = JSON.parse(payloadRaw)
      log.log("handleDccCommands: ", action, payload)
      dcc.handleMessage(JSON.stringify({ action, payload }))
    }
  })
}

async function handleDejaCommands(snapshot) {
  log.note('handleDejaCommands')
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === "added") {
      const { action, payload } = change.doc.data()
      log.log("handleDejaCommands: ", action, payload)
      // dcc.handleMessage(JSON.stringify({ action, payload }))
      switch (action) {
        case 'connect':
          await connectDevice(payload)
          break
        case 'effects':
          await handleEffectCommand(payload)
          break
        case 'macro':
          await handleMacroCommand(payload)
          break
        case 'turnouts':
          await handleTurnoutCommand(payload)
          break
        default:
          //noop
          log.warn('Unknown action in `handleMessage`', action, payload)
      }
    }
  })
}

async function handleTurnoutCommand(payload) {
  log.log('handleTurnoutCommand', payload)
  const device = devices?.[payload.device]
  if (device?.isConnected) {
    const commands = turnoutCommand(payload)
    await device.send(device.port, JSON.stringify([commands]))
  } else {
    log.error('Device not connected', commands)
  }
}

async function handleMacroCommand({ macro}) {
  log.log('handleMacroCommand', macro)
  
  Object.keys(macro).forEach(async (deviceId) => {
    const device = devices?.[deviceId]
    if (device?.isConnected) {
      const commands = getMacroCommand(macro[deviceId]?.effects, macro[deviceId]?.turnouts)
      log.log('macro commands', commands, deviceId)
      await device.send(device.port, JSON.stringify(commands))
    } else {
      log.error('Device not connected',device , devices, deviceId)
    }
  })
}

async function handleEffectCommand(payload) {
  const command = getEffectCommand(payload)
  log.log('handleEffectCommand', payload, command)
  const device = devices?.[payload.device]
  if (device?.isConnected) {
    await device.send(device.port, JSON.stringify([command]))
  } else {
    log.error('Device not connected', command?.device)
  }
}

function handleThrottleCommands(snapshot) {
  log.note('handleThrottleCommands')
  snapshot.docChanges().forEach(async (change) => {
    const throttleCmd = {
      address: parseInt(change.doc.data().address),
      speed: change.doc.data().direction
        ? change.doc.data().speed
        : -change.doc.data().speed,
    }
    console.log(
      "Throttle change",
      change.type,
      change.doc.data(),
      throttleCmd
    )
    // const consist = locos?.value
    //   ? unref(locos.value).find((loco) => loco.locoId == throttleCmd.address)
    //       ?.consist || []
    //   : []
    // console.log(
    //   "Consist",
    //   consist,
    //   throttleCmd,
    //   unref(locos.value).find((loco) => loco.locoId == throttleCmd.address),
    //   locos.value
    // )
    // if (consist.length > 0) {
    //   consist.forEach(async (consistLoco) => {
    //     let consistSpeed
    //     if (consistLoco.direction) {
    //       // forward
    //       consistSpeed = throttleCmd.speed + consistLoco.trim
    //     } else {
    //       // backward
    //       consistSpeed = throttleCmd.speed - consistLoco.trim
    //     }
    //     const consistCmd = {
    //       address: consistLoco.address,
    //       speed: consistSpeed,
    //     }
    //     await sendSpeed(consistCmd)
    //   })
    // }

    // await sendSpeed(throttleCmd)
    await dcc.handleMessage(JSON.stringify({ action: 'throttle', payload: throttleCmd }))

  })
}
const handleConnectionMessage = async (payload) =>
  await broadcast({ action: 'broadcast', payload })

async function connectDevice({ device, serial: path }) {
  try {
    log.star('[dejaCloud] connect', device, path)
    if (devices[device]) {
      await broadcast({ action: 'connected', payload: { device, path, baudRate } })
      return devices[device].isConnected
    } else {
      const port = await serial.connect({ path, baudRate, handleMessage: handleConnectionMessage })
      await broadcast({ action: 'connected', payload: { device, path, baudRate } })
      
      devices[device] = {
        isConnected: true,
        send: serial.send,
        port
      }
      return devices[device]
    }
  } catch (err) {
    log.fatal('Error connectDevice: ', err)
  }

}

export async function load() {
  // const layout = await loadLayout()
  const devices = await loadDevices()
  await autoConnect(devices)
}

async function autoConnect(devices) {
  devices.map(device => {
    log.log('Auto connect device', device.autoConnect, { device: device.id, serial: device.port })
    if (device.autoConnect && device.port) {
      connectDevice({ device: device.id, serial: device.port })
    }
  })
}

async function loadLayout() {
  try {
    const layoutRef = doc(db, `layouts`, layoutId)
    const docSnap = await getDoc(layoutRef)
    
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id }
    } else {
      console.error('No such document!')
    }
    return data
  } catch (error) {
    log.error('Error loading layout', error)
  }
}

async function loadDevices() {
  try {
    const devices = await collection(db, `layouts/${layoutId}/devices`)
    const querySnapshot = await getDocs(devices)
    const devicesData = []
    querySnapshot.forEach((doc) => {
      devicesData.push({ ...doc.data(), id: doc.id })
    })
    return devicesData
  } catch (error) {
    log.error('Error loading layout', error)
  }
}

export async function listen() {
  log.start( "Listen for dccCommands", layoutId)

  // await wipe(layoutId)
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/dccCommands`),
      orderBy("timestamp", "desc"),
      limit(10)
    ),
    handleDccCommands
  )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/dejaCommands`),
      orderBy("timestamp", "desc"),
      limit(10)
    ),
    handleDejaCommands
  )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/throttles`),
      orderBy("timestamp", "desc"),
      limit(10)
    ),
    handleThrottleCommands
  )
  // locos.value = useCollection(collection(db, `layouts/${layoutId}/locos`))
  
}

export async function send(data) {
  try {
    log.log('dejaClound.broadcast.send', data)
    const { action, payload } = data
    switch (action) {
      case 'portList':
        await updateDoc(doc(db, 'layouts', layoutId), { ports: payload }, { merge: true })
        break
      case 'status':
      case 'getStatus':
        if (payload.isConnected) {
          await updateDoc(doc(db, 'layouts', layoutId), { 'dccEx.lastConnected': serverTimestamp(), 'dccEx.client': 'dejaJS' }, { merge: true })
        } else {
          await updateDoc(doc(db, 'layouts', layoutId), { 'dccEx.lastConnected': null, 'dccEx.client': null }, { merge: true })
        }
        break
      case 'connected':
        log.log('dejaClound.connected!!', data)
        if (payload.device === 'dccex') {
          await updateDoc(doc(db, 'layouts', layoutId), { 'dccEx.lastConnected': serverTimestamp(), 'dccEx.client': 'dejaJS' }, { merge: true })
        }
        await updateDoc(doc(db, `layouts/${layoutId}/devices`, payload.device), { isConnected: true, lastConnected: serverTimestamp(), client: 'dejaJS', port: payload.path }, { merge: true })
        break
      default:
        //noop
        // log.warn('Unknown action in `send`', action, payload)
    }
  } catch (err) {
    log.fatal('Error handling message:', err)
  }

}
async function wipe() {
  Promise.all([wipeDcc(), wipeDeja(), wipeThrottles()])
}

async function wipeDcc() {
  log.complete("wipe dccCommands", layoutId)
  const querySnapshot = await getDocs(
    query(
      collection(db, `layouts/${layoutId}/dccCommands`),
      orderBy("timestamp", "asc")
    )
  )
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref)
  })
}

async function wipeDeja() {
  log.complete("wipe dejaCommands", layoutId)
  const querySnapshot = await getDocs(
    query(
      collection(db, `layouts/${layoutId}/dejaCommands`),
      orderBy("timestamp", "asc")
    )
  )
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref)
  })
}

async function wipeThrottles() {
  log.complete("wipe throttles", layoutId)
  const querySnapshot = await getDocs(
    query(
      collection(db, `layouts/${layoutId}/throttles`),
      orderBy("timestamp", "asc")
    )
  )
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref)
  })
}

async function reset() {
  // TODO: reset all thr
  await resetDevices()
  await updateDoc(doc(db, 'layouts', layoutId), { 'dccEx.lastConnected': null, 'dccEx.client': null }, { merge: true })
}

async function resetDevices() {
  const querySnapshot = await getDocs(collection(db, `layouts/${layoutId}/devices`))
  querySnapshot.forEach((doc) => {
    updateDoc(doc.ref, { isConnected: false, lastConnected: null, client: null })
  })
}

export async function connect() {
  try {
    log.start('Connecting to DejaCloud', layoutId)
    await wipe()
    await reset()
    await listen()
    await load()
    log.success('Connected to DejaCloud', layoutId)
    return true
  } catch (error) {
    log.error('Error in connect:', error)
  }
}

export default {
  listen,
  connect,
  send
}