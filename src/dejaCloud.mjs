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
  orderBy,
} from 'firebase/firestore'
import log from './utils/logger.mjs'
import dcc from './dcc.mjs'
import mqtt from './mqtt.mjs'
import { getEffectCommand } from './effects.mjs'
import { turnoutCommand } from './turnouts.mjs'
import { getMacroCommand } from './macro.mjs'
import { db } from './firebase.mjs'

const layoutId = process.env.LAYOUT_ID
const baudRate = 115200
const connections = []
let devices = []

function handleDccCommands(snapshot) {
  log.note('handleDccCommands')
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      const { action, payload: payloadRaw } = change.doc.data()
      const payload = JSON.parse(payloadRaw)
      log.log('handleDccCommands: ', action, payload)
      dcc.handleMessage(JSON.stringify({ action, payload }))
    }
  })
}

async function handleDejaCommands(snapshot) {
  log.note('handleDejaCommands')
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'added') {
      const { action, payload } = change.doc.data()
      log.log('handleDejaCommands: ', action, payload)
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
  const conn = connections?.[payload.device]
  if (!conn?.isConnected) {
    log.error('Device not connected', payload.device)
    return
  }
  const command = turnoutCommand(payload)
  const layoutDevice = devices.find(({ id }) => id === payload.device)
  log.log('handleTurnoutCommand', payload, command, conn, layoutDevice)
  if (layoutDevice?.connection === 'usb') {
    await conn.send(conn.port, JSON.stringify([command]))
  } else if (layoutDevice?.connection === 'wifi') {
    await conn.send(conn.topic, JSON.stringify(command))
  }

  // log.log('handleTurnoutCommand', payload)
  // const conn = connections?.[payload.device]
  // if (conn?.isConnected) {
  //   const commands = turnoutCommand(payload)
  //   await conn.send(conn.port, JSON.stringify([commands]))
  // } else {
  //   log.error('Device not connected', conn)
  // }
}

async function handleTurnoutChange(snapshot) {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'modified') {
      console.log('handleTurnoutChange', change.type, change.doc.data())
      await handleTurnoutCommand(change.doc.data())
    }
  })
}

async function handleMacroCommand({ macro }) {
  log.log('handleMacroCommand', macro)

  Object.keys(macro).forEach(async (deviceId) => {
    const conn = connections?.[deviceId]
    if (conn?.isConnected) {
      const commands = getMacroCommand(
        macro[deviceId]?.effects,
        macro[deviceId]?.turnouts
      )
      log.log('macro commands', commands, deviceId)
      await conn.send(device.port, JSON.stringify(commands))
    } else {
      log.error('Device not connected', conn, connections, deviceId)
    }
  })
}

async function handleEffectCommand(payload) {
  const conn = connections?.[payload.device]
  if (!conn?.isConnected) {
    log.error('Device not connected', payload.device)
    return
  }
  const command = getEffectCommand(payload)
  const layoutDevice = devices.find(({ id }) => id === payload.device)
  log.log('handleEffectCommand', payload, command, conn, layoutDevice)
  if (layoutDevice?.connection === 'usb') {
    await conn.send(device.port, JSON.stringify([command]))
  } else if (layoutDevice?.connection === 'wifi') {
    await conn.send(conn.topic, JSON.stringify(command))
  }
}

async function handleEffectChange(snapshot) {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'modified') {
      console.log('handleEffectChange', change.type, change.doc.data())
      await handleEffectCommand(change.doc.data())
    }
  })
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
    console.log('Throttle change', change.type, change.doc.data(), throttleCmd)
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
    await dcc.handleMessage(
      JSON.stringify({ action: 'throttle', payload: throttleCmd })
    )
  })
}

const handleConnectionMessage = async (payload) =>
  await broadcast({ action: 'broadcast', payload })

async function connectDevice(payload) {
  try {
    const layoutDevice = devices.find(({ id }) => id === payload.device)
    if (layoutDevice?.connection === 'usb') {
      await connectUsbDevice(payload, layoutDevice?.type)
    } else if (layoutDevice?.connection === 'wifi') {
      await connectMqttDevice(payload, layoutDevice)
    }
  } catch (err) {
    log.fatal('Error connectDevice: ', err)
  }
}

async function connectUsbDevice({ device, serial: path }, deviceType) {
  try {
    if (connections[device]) {
      await broadcast({
        action: 'connected',
        payload: { device, path, baudRate },
      })
      return connections[device].isConnected
    } else {
      const port = await serial.connect({
        path,
        baudRate,
        handleMessage: handleConnectionMessage,
      })
      // await broadcast({
      //   action: 'connected',
      //   payload: { device, path, baudRate },
      // })
      await updateDoc(
        doc(db, `layouts/${layoutId}/devices`, device),
        {
          isConnected: true,
          lastConnected: serverTimestamp(),
          client: 'dejaJS',
          port: path,
        },
        { merge: true }
      )

      connections[device] = {
        isConnected: true,
        send: serial.send,
        port,
      }
      if (deviceType === 'dcc-ex') {
        dcc.setConnection(port)
      }

      return connections[device]
    }
  } catch (err) {
    log.fatal('Error connectUsbDevice: ', err)
  }
}

async function connectMqttDevice({ device }) {
  try {
    if (connections[device]) {
      await broadcast({
        action: 'connected',
        payload: { device },
      })
      return connections[device].isConnected
    } else {
      const topic = `DEJA/${layoutId}/${device}`
      mqtt.subscribe(topic)

      // await broadcast({
      //   action: 'connected',
      //   payload: { device, topic },
      // })

      await updateDoc(
        doc(db, `layouts/${layoutId}/devices`, device),
        {
          isConnected: true,
          lastConnected: serverTimestamp(),
          client: 'dejaJS',
          topic,
        },
        { merge: true }
      )

      connections[device] = {
        isConnected: true,
        send: mqtt.publish,
        topic,
      }

      return connections[device]
    }
  } catch (err) {
    log.fatal('Error connectMqttDevice: ', err)
  }
}

export async function load() {
  // const layout = await loadLayout()
  devices = await loadDevices()
  await autoConnect(devices)
}

async function autoConnect(devices) {
  devices.map((device) => {
    log.log('Auto connect device', device.autoConnect, {
      device: device.id,
      serial: device.port,
    })
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
    const devicesCol = await collection(db, `layouts/${layoutId}/devices`)
    const querySnapshot = await getDocs(devicesCol)
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
  log.start('Listen for dccCommands', layoutId)

  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/dccCommands`),
      orderBy('timestamp', 'desc'),
      limit(10)
    ),
    handleDccCommands
  )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/dejaCommands`),
      orderBy('timestamp', 'desc'),
      limit(10)
    ),
    handleDejaCommands
  )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/throttles`),
      orderBy('timestamp', 'desc'),
      limit(10)
    ),
    handleThrottleCommands
  )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/effects`),
      orderBy('timestamp', 'desc')
    ),
    handleEffectChange
  )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/turnouts`),
      orderBy('timestamp', 'desc')
    ),
    handleTurnoutChange
  )
}

export async function send(data) {
  try {
    log.log('dejaClound.broadcast.send', data)
    const { action, payload } = data
    switch (action) {
      case 'portList':
        await updateDoc(
          doc(db, 'layouts', layoutId),
          { ports: payload },
          { merge: true }
        )
        break
      case 'status':
      case 'getStatus':
        if (payload.isConnected) {
          await updateDoc(
            doc(db, 'layouts', layoutId),
            {
              'dccEx.lastConnected': serverTimestamp(),
              'dccEx.client': 'dejaJS',
            },
            { merge: true }
          )
        } else {
          await updateDoc(
            doc(db, 'layouts', layoutId),
            { 'dccEx.lastConnected': null, 'dccEx.client': null },
            { merge: true }
          )
        }
        break
      case 'connected':
        log.log('dejaClound.connected!!', data)
        if (payload.device === 'dccex') {
          await updateDoc(
            doc(db, 'layouts', layoutId),
            {
              'dccEx.lastConnected': serverTimestamp(),
              'dccEx.client': 'dejaJS',
            },
            { merge: true }
          )
        }
        await updateDoc(
          doc(db, `layouts/${layoutId}/devices`, payload.device),
          {
            isConnected: true,
            lastConnected: serverTimestamp(),
            client: 'dejaJS',
            port: payload.path,
          },
          { merge: true }
        )
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
  log.complete('wipe dccCommands', layoutId)
  const querySnapshot = await getDocs(
    query(
      collection(db, `layouts/${layoutId}/dccCommands`),
      orderBy('timestamp', 'asc')
    )
  )
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref)
  })
}

async function wipeDeja() {
  log.complete('wipe dejaCommands', layoutId)
  const querySnapshot = await getDocs(
    query(
      collection(db, `layouts/${layoutId}/dejaCommands`),
      orderBy('timestamp', 'asc')
    )
  )
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref)
  })
}

async function wipeThrottles() {
  log.complete('wipe throttles', layoutId)
  const querySnapshot = await getDocs(
    query(
      collection(db, `layouts/${layoutId}/throttles`),
      orderBy('timestamp', 'asc')
    )
  )
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref)
  })
}

async function reset() {
  // TODO: reset all thr
  await resetDevices()
  await updateDoc(
    doc(db, 'layouts', layoutId),
    { 'dccEx.lastConnected': null, 'dccEx.client': null },
    { merge: true }
  )
}

async function resetDevices() {
  const querySnapshot = await getDocs(
    collection(db, `layouts/${layoutId}/devices`)
  )
  querySnapshot.forEach((doc) => {
    updateDoc(doc.ref, {
      isConnected: false,
      lastConnected: null,
      client: null,
    })
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
  send,
}
