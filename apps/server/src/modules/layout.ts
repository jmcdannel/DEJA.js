import { FieldValue } from 'firebase-admin/firestore'
import type { SerialPort } from 'serialport'
import type { Layout, Device, Sensor } from '@repo/modules'
import { db } from '@repo/firebase-config/firebase-admin-node'
import { serial as serialLib } from '../lib/serial'
import { log } from '../utils/logger'
import { dcc } from '../lib/dcc'
import { dejaMqtt as mqtt } from '../lib/mqtt'
import { broadcast } from '../broadcast'

// Command pooling state for each connection
interface CommandPool {
  commands: string[]
  timer: NodeJS.Timeout | null
  lastSentAt: number | null
}

interface Connection {
  isConnected: boolean
  port?: SerialPort
  publish?: (topic: string, message: string, keepAlive: boolean) => void
  send?: (conn: Connection, data: string) => void
  topic?: string
  deviceType?: string
  commandPool?: CommandPool
}

const baudRate = 115200
const POOL_INTERVAL = 3000 // 3 seconds

const layoutId = process.env.LAYOUT_ID || 'betatrack'
const _connections: { [key: string]: Connection } = {}
let _devices: Device[] = []
let sensors: Sensor[] = []

// Flush the command pool for a specific connection
const flushCommandPool = (connection: Connection): void => {
  if (!connection.commandPool) {
    return
  }

  const commandPool = connection.commandPool

  if (commandPool.timer) {
    clearTimeout(commandPool.timer)
    commandPool.timer = null
  }

  if (commandPool.commands.length === 0) {
    return
  }

  const commands = [...commandPool.commands]
  commandPool.commands = []

  if (!connection.port || !connection.isConnected) {
    log.warn('[LAYOUT] Port not available for sending commands')
    return
  }

  const payload = `[${commands.join(',')}]`

  if (commands.length === 1) {
    // Single command - send directly
    log.await('[LAYOUT] Sending command:', commands[0])
  } else {
    // Multiple commands - join with newlines and send as batch
    log.await('[LAYOUT] Sending batched commands:', commands.length + ' commands')
    log.debug('[LAYOUT] Batched commands:', commands)
  }

  connection.port.write(payload, handleSend)
  commandPool.lastSentAt = Date.now()
}

// Start the command pool timer for a specific connection
const startCommandPoolTimer = (connection: Connection): void => {
  if (!connection.commandPool) {
    connection.commandPool = { commands: [], timer: null, lastSentAt: null }
  }

  const commandPool = connection.commandPool

  if (commandPool.timer) {
    return
  }

  const now = Date.now()
  const lastSentAt = commandPool.lastSentAt
  const delay = lastSentAt !== null
    ? Math.max(POOL_INTERVAL - (now - lastSentAt), 0)
    : POOL_INTERVAL

  if (delay === 0) {
    log.debug('[LAYOUT] Command pool flush executing immediately')
    flushCommandPool(connection)
    return
  }

  commandPool.timer = setTimeout(() => {
    flushCommandPool(connection)
  }, delay)

  log.debug('[LAYOUT] Command pool timer scheduled (delay: ' + delay + 'ms)')
}

// Stop the command pool timer for a specific connection
const stopCommandPoolTimer = (connection: Connection): void => {
  if (connection.commandPool?.timer) {
    clearTimeout(connection.commandPool.timer)
    connection.commandPool.timer = null
    log.debug('[LAYOUT] Command pool timer stopped')
  }
}

// Handle send errors
function handleSend(err: Error | null | undefined): void {
  if (err) {
    log.error('[LAYOUT] Error on write:', err?.message)
  }
}

// Pooled send function for connections
const sendPooled = (connection: Connection, data: string): void => {
  try {
    if (!connection.isConnected || !connection.port) {
      log.warn('[LAYOUT] Connection not available for sending command:', data)
      return
    }

    // If this device is an LED arduino, send immediately without pooling
    if (connection.deviceType === 'deja-arduino-led') {
      log.debug('[LAYOUT] Immediate send for deja-arduino-led:', data)
      if (connection.port) {
        connection.port.write(data, handleSend)
      } else if (connection.publish && connection.topic) {
        try {
          connection.publish(connection.topic, `[${data}]`, true)
        } catch (err) {
          log.error('[LAYOUT] MQTT publish error:', err)
        }
      } else {
        log.warn('[LAYOUT] No transport available for immediate send:', data)
      }
      return
    }

    // Initialize command pool if not exists
    if (!connection.commandPool) {
      connection.commandPool = { commands: [], timer: null, lastSentAt: null }
    }

    const commandPool = connection.commandPool
    const now = Date.now()
    const lastSentAt = commandPool.lastSentAt ?? 0
    const isCooldownComplete = !lastSentAt || now - lastSentAt >= POOL_INTERVAL

    if (commandPool.commands.length === 0 && isCooldownComplete) {
      // Send immediately when we're not in cooldown and no queued commands exist
      const payload = `[${data}]`
      log.await('[LAYOUT] Sending immediate command:', data)
      connection.port.write(payload, handleSend)
      commandPool.lastSentAt = now
      return
    }

    // Add command to the pool
    commandPool.commands.push(data)
    log.debug('[LAYOUT] Command queued:', data, '(queue size: ' + commandPool.commands.length + ')')

    // Start timer if not already running
    if (!commandPool.timer) {
      startCommandPoolTimer(connection)
    }
  } catch (err) {
    log.fatal('[LAYOUT] Error queuing command:', err)
  }
}

export async function initialize(): Promise<Layout | undefined> {
  log.start('Load layout', layoutId)
  const layout = await loadLayout()
  _devices = await loadDevices()
  // sensors = await loadSensors()
  await autoConnect(_devices)
  return layout
}

async function autoConnect(devices: Device[]): Promise<void> {
  devices.forEach((device) => {
    if (device.autoConnect && device.port) {
      log.start('Auto connect device', device.autoConnect, {
        device: device.id,
        serial: device.port,
      })
      connectDevice({ device: device.id, serial: device.port, topic: device.topic })
    } else if (device.autoConnect && device.connection === 'wifi' && device.topic) {  
      log.start('Auto connect device', device.autoConnect, {
        device: device.id,
        topic: device.topic,
      })
      connectDevice({ device: device.id, topic: device.topic })
    } else {
      log.start('Disconnecting device (autoConnect disabled)', device.autoConnect, {
        device: device.id,
      })
      disconnectDevice(device.id)
    }
  })
}

async function loadLayout(): Promise<Layout | undefined> {
  try {
    const layoutData = await db.collection('layouts').doc(layoutId).get()
    const layoutDoc = layoutData.exists ? layoutData.data() : undefined
    if (layoutDoc) {
      log.complete('Layout loaded', layoutId)
      return { ...layoutDoc, id: layoutData.id } as Layout
    }
    log.error('No such layout found!', layoutId)
  } catch (error) {
    log.error('Error loading layout', error)
  }
}

async function loadDevices(): Promise<Device[]> {
  try {
    const devicesSnapshot = await db.collection('layouts').doc(layoutId).collection('devices').get()
    const devices = devicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Device))
    return devices
  } catch (error) {
    log.error('Error loading devices', error)
    return []
  }
}

async function loadSensors(): Promise<Sensor[]> {
  try {
    const sensorsSnapshot = await db.collection('layouts').doc(layoutId).collection('sensors').get()
    const sensors = sensorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sensor))
    return sensors
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
    const port = await serialLib.connect({
      baudRate,
      handleMessage: (payload: string) => handleSerialMessage(payload, device),
      path: serialPort,
      deviceId: device.id,
    })
    const updates = {
      client: 'dejaJS',
      isConnected: true,
      lastConnected: new Date(),
      timestamp: FieldValue.serverTimestamp(),
      port: serialPort,
    }

    db.doc(`layouts/${layoutId}/devices/${device.id}`)
      .set(updates, { merge: true })

    const connection: Connection = {
      isConnected: true,
      port: port ? port : undefined,
      deviceType: device.type,
      send: (conn: Connection, data: string) => sendPooled(conn, data),
    }
    _connections[device.id] = connection
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
      const topic = `DEJA/${layoutId}/${device.id}`
      mqtt.subscribe(topic)

      db.doc(`layouts/${layoutId}/devices/${device.id}`)
        .set(
          {
            client: 'dejaJS',
            isConnected: true,
            lastConnected: new Date(),
            timestamp: FieldValue.serverTimestamp(),
            topic,
          },
          { merge: true }
        )

      _connections[device.id] = {
        isConnected: true,
        publish: mqtt.publish,
        deviceType: device.type,
        topic,
      }
    }
  } catch (err) {
    log.fatal('Error connectMqttDevice: ', err)
  }
}

async function handleSerialMessage(payload: string, device: Device): Promise<void> {
  try {
    if (payload?.startsWith('{ "sensor')) {
      const data = JSON.parse(payload)
      // Sensor handling omitted
    } else {
      // Parse DCC-EX status lines for power and tracks
      const text = payload.replace(/[<>]/g, '').trim()
      const updates: Record<string, any> = { timestamp: FieldValue.serverTimestamp(), client: 'dejaJS' }

      // Track A/B lines like "= A MAIN" or "= B PROG"
      const trackMatch = text.match(/^=\s([AB])\s(.+)$/)
      if (trackMatch) {
        const line = trackMatch[1] === 'A' ? 'trackA' : 'trackB'
        updates[`${line}`] = trackMatch[2].trim()
      }

      // Pattern: @ 0 2 "Power On|Off" (quoted form)
      const powerQuotedMatch = text.match(/@\s*\d+\s*\d+\s*"Power\s+(On|Off)"/i)
      if (powerQuotedMatch && powerQuotedMatch[1]) {
        updates['power'] = /on/i.test(powerQuotedMatch[1])
      }

      // const lcd2Match = text.match(/@\s*\d+\s*\d+\s*"Power\s+(SC|On|Off)"/i)
      // if (lcd2Match) {
      //   const lcd2Text = lcd2Match[1].trim()
      //   updates['dccEx.LCD2'] = lcd2Text
      //   if (/power\s*off/i.test(lcd2Text)) {
      //     updates['dccEx.power'] = false
      //   } else if (/\s*off/i.test(lcd2Text)) {
      //     updates['dccEx.power'] = false
      //   } else if (/power\s*on/i.test(lcd2Text)) {
      //     updates['dccEx.power'] = true
      //   } else if (/power\s*sc/i.test(lcd2Text)) {
      //     updates['dccEx.power'] = true
      //   } else if (/\s*sc/i.test(lcd2Text)) {
      //     updates['dccEx.power'] = true
      //   } else if (/\s*on/i.test(lcd2Text)) {
      //     updates['dccEx.power'] = true
      //   }
      // }

      // Version line e.g. "iDCC-EX V-5.0.9 / MEGA / ..."
      if (/^iDCC-EX\s/i.test(text)) {
        updates['version'] = text
      }

      // If any updates were collected other than timestamp/client, persist them
      const hasStateUpdate = Object.keys(updates).some(k => k !== 'timestamp' && k !== 'client')
      if (hasStateUpdate) {
        await db.collection('layouts').doc(layoutId).set({ dccEx: updates }, { merge: true })
      }

      await broadcast({ action: 'serial', payload: { payload } })
    }
  } catch (err) {
    log.fatal('Error handling serial message:', err)
  }
}

// Disconnect a device and clean up its command pool
export async function disconnectDevice(deviceId: string): Promise<void> {
  try {
    const connection = _connections[deviceId]
    if (connection) {
      // Flush any remaining commands before disconnecting
      if (connection.commandPool && connection.commandPool.commands.length > 0) {
        log.await('[LAYOUT] Flushing remaining commands before disconnect:', connection.commandPool.commands.length)
        flushCommandPool(connection)
      }

      // Stop the command pool timer
      stopCommandPoolTimer(connection)

      // Disconnect the port if it exists
      if (connection.port) {
        serialLib.disconnect(connection.port)
      }

      // Remove the connection
      delete _connections[deviceId]
      
      // Update the device status in the database
      db.doc(`layouts/${layoutId}/devices/${deviceId}`)
        .set(
          {
            isConnected: false,
            lastDisconnected: new Date(),
            timestamp: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )

      log.complete('[LAYOUT] Device disconnected:', deviceId)
    }
  } catch (err) {
    log.fatal('[LAYOUT] Error disconnecting device:', err)
  }
}

// Manually flush commands for a specific device
export function flushDeviceCommands(deviceId: string): void {
  const connection = _connections[deviceId]
  if (connection) {
    flushCommandPool(connection)
  }
}

export const layout = {
  connectDevice,
  disconnectDevice,
  flushDeviceCommands,
  connections: () => _connections,
  devices: () => _devices,
  initialize,
}

export default layout
