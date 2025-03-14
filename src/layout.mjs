import serial from './serial.mjs'
import log from './utils/logger.mjs'
import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase.mjs'
import dcc from './dcc.mjs'
import mqtt from './mqtt.mjs'
import { broadcast } from './broadcast.mjs'

const baudRate = 115200

const layoutId = process.env.LAYOUT_ID
const _connections = {}
let _devices = []

export async function load() {
  log.start('Load layout', layoutId)
  const layout = await loadLayout()
  const devices = await loadDevices()
  _devices = devices
  await autoConnect(devices)
  return layout
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

export async function connectDevice(payload) {
  try {
    const layoutDevice = _devices.find(({ id }) => id === payload.device)
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
    if (_connections[device]) {
      await broadcast({
        action: 'connected',
        payload: { device, path, baudRate },
      })
      return _connections[device].isConnected
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

      _connections[device] = {
        isConnected: true,
        send: serial.send,
        port,
      }
      if (deviceType === 'dcc-ex') {
        dcc.setConnection(port)
      }

      return _connections[device]
    }
  } catch (err) {
    log.fatal('Error connectUsbDevice: ', err)
  }
}

async function connectMqttDevice({ device }) {
  try {
    if (_connections[device]) {
      await broadcast({
        action: 'connected',
        payload: { device },
      })
      return _connections[device].isConnected
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

      _connections[device] = {
        isConnected: true,
        send: mqtt.publish,
        topic,
      }

      return _connections[device]
    }
  } catch (err) {
    log.fatal('Error connectMqttDevice: ', err)
  }
}

async function handleConnectionMessage(payload) {
  await broadcast({ action: 'broadcast', payload })
}

export async function wipe() {
  Promise.all([wipeDcc(), wipeDeja(), wipeThrottles()])
}

async function wipeDcc() {
  log.complete('wipe dccCommands', layoutId)
  const querySnapshot = await getDocs(
    collection(db, `layouts/${layoutId}/dccCommands`)
  )
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref)
  })
}

async function wipeDeja() {
  log.complete('wipe dejaCommands', layoutId)
  const querySnapshot = await getDocs(
    collection(db, `layouts/${layoutId}/dejaCommands`)
  )
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref)
  })
}

async function wipeThrottles() {
  // log.complete('wipe throttles', layoutId)
  // const querySnapshot = await getDocs(
  //   collection(db, `layouts/${layoutId}/throttles`)
  // )
  // querySnapshot.forEach((doc) => {
  //   deleteDoc(doc.ref)
  // })
}

export async function reset() {
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

export default {
  wipe,
  reset,
  load,
  connectDevice,
  devices: () => _devices,
  connections: () => _connections,
}
