import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData
} from 'firebase/firestore'
import type { SerialPort } from 'serialport'
import type { Layout, Device, Sensor } from '@repo/modules/layouts'
import { db } from '@repo/firebase-config/firebase-node'
import { serial } from '../serial.js'
import { log }  from '../utils/logger.js'
import { dcc } from '../dcc.js'
import { dejaMqtt as mqtt } from '../mqtt.js'
import { broadcast } from '../broadcast.js'

interface Connection {
  isConnected: boolean
  port?: SerialPort
  publish?: (topic: string, message: string, keepAlive: boolean) => void
  send?: (_port: SerialPort, data: string) => void
  topic?: string
}

const baudRate = 115200

const layoutId = process.env.LAYOUT_ID || 'betatrack'
const _connections: { [key: string]: Connection } = {}
let _devices: Device[] = []
let sensors: Sensor[] = []

export async function load(): Promise<Layout | undefined> {
  log.start('Load layout', layoutId)
  const layout = await loadLayout()
  _devices = await loadDevices()
  sensors = await loadSensors()
  await autoConnect(_devices)
  return layout
}

async function autoConnect(devices: Device[]): Promise<void> {
  devices.forEach((device) => {
    log.log('Auto connect device', device.autoConnect, {
      device: device.id,
      serial: device.port,
    })
    if (device.autoConnect && device.port) {
      connectDevice(device)
    }
  })
}

async function loadLayout(): Promise<Layout | undefined> {
  try {
    const layoutRef = doc(db, `layouts`, layoutId)
    const docSnap = await getDoc(layoutRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Layout
    }
    log.error('No such layout!', layoutId)
  } catch (error) {
    log.error('Error loading layout', error)
  }
}

async function loadDevices(): Promise<Device[]> {
  try {
    const q = query(collection(db, `layouts/${layoutId}/devices`))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Device);
  } catch (error) {
    log.error('Error loading devices', error)
    return []
  }
}

async function loadSensors(): Promise<Sensor[]> {
  try {
    const q = query(collection(db, `layouts/${layoutId}/sensors`))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Sensor);
  } catch (error) {
    log.error('Error loading sensors', error)
    return []
  }
}

export async function connectDevice(device: Device): Promise<void> {
  try {
    if (device?.connection === 'usb') {
      await connectUsbDevice(device)
    } else if (device?.connection === 'wifi') {
      await connectMqttDevice(device)
    }
  } catch (err) {
    log.fatal('Error connectDevice: ', err)
  }
}

async function connectUsbDevice(device: Device): Promise<void> {
  try {
    if (_connections[device.id]) {
      await broadcast({
        action: 'connected',
        payload: { device: device.id },
      })
      return
    } 
    const port = await serial.connect({
      baudRate,
      handleMessage: handleConnectionMessage,
      path: device.port || '',
    })
    const updates = {
      client: 'dejaJS',
      isConnected: true,
      lastConnected: new Date(),
      port: device.port,
    }

    await setDoc(
      doc(db, `layouts/${layoutId}/devices`, device.id),
      { ...updates }, { merge: true }
    )

    _connections[device.id] = {
      isConnected: true,
      port: port ? port : undefined,
      send: serial.send,
    }
    if (device.type === 'dcc-ex' && port) {
      dcc.setConnection(port)
    }

    
  } catch (err) {
    log.fatal('Error connectUsbDevice: ', err)
    return undefined
  }
}

async function connectMqttDevice(device: Device): Promise<void> {
  try {
    if (_connections[device.id]) {
      await broadcast({
        action: 'connected',
        payload: { device },
      })
    } else {
      const topic = `DEJA/${layoutId}/${device}`
      mqtt.subscribe(topic)

      // await broadcast({
      //   action: 'connected',
      //   payload: { device, topic },
      // })

      await setDoc(
        doc(db, `layouts/${layoutId}/devices`, device.id),
        {
          client: 'dejaJS',
          isConnected: true,
          timestamp: serverTimestamp(),
          topic,
        }, { merge: true }
      )

      _connections[device.id] = {
        isConnected: true,
        publish: mqtt.publish,
        topic,
      }
    }
  } catch (err) {
    log.fatal('Error connectMqttDevice: ', err)
  }
}

async function handleConnectionMessage(payload: string): Promise<void> {
  if (payload?.startsWith('{ "sensor')) {
    const data = JSON.parse(payload)
    const sensorId = sensors.find((sensor) => sensor.index === data.sensor)?.id
    log.debug('handleConnectionMessage', data, payload, sensorId)
    if (sensorId) {
      await setDoc(
        doc(db, `layouts/${layoutId}/sensors`, sensorId),
        {
          state: data.state,
        },
        { merge: true }
      )
    } else {
      log.error('Sensor not found', data, sensors)
    }
  }
  await broadcast({ action: 'broadcast', payload })
}

export async function wipe(): Promise<void> {
  Promise.all([wipeDcc(), wipeDeja(), wipeThrottles()])
}

async function wipeDcc(): Promise<void> {
  log.complete('wipe dccCommands', layoutId)
  const querySnapshot = await getDocs(
    collection(db, `layouts/${layoutId}/dccCommands`)
  )
  querySnapshot.forEach((d: DocumentData) => {
    deleteDoc(d.ref)
  })
}

async function wipeDeja(): Promise<void> {
  log.complete('wipe dejaCommands', layoutId)
  const querySnapshot = await getDocs(
    collection(db, `layouts/${layoutId}/dejaCommands`)
  )
  querySnapshot.forEach((d: DocumentData) => {
    deleteDoc(d.ref)
  })
}

async function wipeThrottles(): Promise<void> {
  // log.complete('wipe throttles', layoutId)
  // const querySnapshot = await getDocs(
  //   collection(db, `layouts/${layoutId}/throttles`)
  // )
  // querySnapshot.forEach((doc) => {
  //   deleteDoc(doc.ref)
  // })
}

export async function reset(): Promise<void> {
  // TODO: reset all thr
  await resetDevices()
  await setDoc(
    doc(db, 'layouts', layoutId),
    { 'dccEx.client': null, 'dccEx.lastConnected': null },
    { merge: true }
  )
}

async function resetDevices(): Promise<void> {
  const querySnapshot = await getDocs(
    collection(db, `layouts/${layoutId}/devices`)
  )
  querySnapshot.forEach((d: DocumentData) => {
    setDoc(d.ref, {
      client: null,
      isConnected: false,
      lastConnected: null,
    })
  })
}

export const layout = {
  connectDevice,
  connections: () => _connections,
  devices: () => _devices,
  load,
  reset,
  wipe,
}

export default layout