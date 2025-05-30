import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import type { SerialPort } from 'serialport'
import type { Layout, Device, Sensor } from '@repo/modules/layouts'
import { db } from '@repo/firebase-config/firebase-node'
import { serial } from '../lib/serial'
import { log } from '../utils/logger'
import { dcc } from '../lib/dcc'
import { dejaMqtt as mqtt } from '../lib/mqtt'
import { broadcast } from '../broadcast'

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

export async function initialize(): Promise<Layout | undefined> {
  log.start('Load layout', layoutId)
  const layout = await loadLayout()
  _devices = await loadDevices()
  sensors = await loadSensors()
  await autoConnect(_devices)
  return layout
}

async function autoConnect(devices: Device[]): Promise<void> {
  devices.forEach((device) => {
    if (device.autoConnect && device.port) {
      log.star('Auto connect device', device.autoConnect, {
        device: device.id,
        serial: device.port,
      })
      connectDevice({ device: device.id, serial: device.port })
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
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Device))
  } catch (error) {
    log.error('Error loading devices', error)
    return []
  }
}

async function loadSensors(): Promise<Sensor[]> {
  try {
    const q = query(collection(db, `layouts/${layoutId}/sensors`))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Sensor))
  } catch (error) {
    log.error('Error loading sensors', error)
    return []
  }
}

export async function connectDevice({
  device: deviceId,
  serial,
  topic,
}: {
  device: string
  serial?: string
  topic?: string
}): Promise<void> {
  try {
    log.start('Connecting device', serial, deviceId)
    const device = _devices.find((d) => d.id === deviceId)
    if (!device) {
      log.error('Device not found', device)
      return
    }
    if (device.connection === 'usb' && serial) {
      await connectUsbDevice(device, serial)
    } else if (device.connection === 'wifi' && topic) {
      device.topic = topic
      await connectMqttDevice(device)
    }
  } catch (err) {
    log.fatal('Error connectDevice: ', err)
  }
}

async function connectUsbDevice(
  device: Device,
  serialPort: string
): Promise<void> {
  try {
    if (_connections[device.id]) {
      broadcast({
        action: 'connected',
        payload: { device: device.id },
      })
      return
    }
    const port = await serial.connect({
      baudRate,
      handleMessage: handleConnectionMessage,
      path: serialPort,
    })
    const updates = {
      client: 'dejaJS',
      isConnected: true,
      lastConnected: new Date(),
      timestamp: serverTimestamp(),
      port: serialPort,
    }

    await setDoc(
      doc(db, `layouts/${layoutId}/devices`, device.id),
      { ...updates },
      { merge: true }
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
          lastConnected: new Date(),
          timestamp: serverTimestamp(),
          topic,
        },
        { merge: true }
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

export const layout = {
  connectDevice,
  connections: () => _connections,
  devices: () => _devices,
  initialize,
}

export default layout
