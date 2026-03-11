import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { log } from '../utils/logger.js'
import { ReconnectManager } from '../utils/reconnect.js'
import { wsServer } from './ws-server'

// Track which device each port belongs to
const portToDevice: Map<SerialPort, string> = new Map()

// Track reconnect managers per device for auto-reconnect on disconnect
const reconnectManagers: Map<string, ReconnectManager> = new Map()

// Store original connection options so we can reconnect
const connectionOptions: Map<string, ConnectOptions> = new Map()

function handleOpen(err: Error | null): boolean | void {
  if (err) {
    log.error('[SERIAL] Error opening port:', err.message)
    return
  }
  return true
}

interface ConnectOptions {
  baudRate: number
  handleMessage: (data: string) => void
  path: string
  deviceId?: string
}

export const isSensorData = (data: string): boolean => {
  return data.startsWith('{ "sensor')
}

/**
 * Set up event listeners on a serial port that trigger reconnection
 * when the port closes unexpectedly or encounters an error.
 */
function setupReconnectListeners(port: SerialPort, options: ConnectOptions): void {
  const { deviceId, path } = options

  // Store options for potential reconnection
  if (deviceId) {
    connectionOptions.set(deviceId, options)
  }

  port.on('close', () => {
    log.warn(`[SERIAL] Port closed: ${path}${deviceId ? ` (device: ${deviceId})` : ''}`)

    // Clean up the device mapping
    portToDevice.delete(port)

    if (deviceId) {
      scheduleReconnect(deviceId)
    }
  })

  port.on('error', (err: Error) => {
    log.error(`[SERIAL] Port error on ${path}:`, err.message)
    // The 'close' event usually follows an error, so reconnection
    // will be triggered there. We only log here.
  })
}

/**
 * Schedule a reconnection for a specific device using exponential backoff.
 */
function scheduleReconnect(deviceId: string): void {
  const options = connectionOptions.get(deviceId)
  if (!options) {
    log.warn(`[SERIAL] No stored connection options for device ${deviceId}, cannot reconnect`)
    return
  }

  let manager = reconnectManagers.get(deviceId)
  if (!manager) {
    manager = new ReconnectManager({
      label: `[SERIAL:${deviceId}]`,
      baseDelay: 1000,
      maxDelay: 30_000,
    })
    reconnectManagers.set(deviceId, manager)
  }

  manager.schedule(async () => {
    try {
      const port = await connectPort(options)
      if (port) {
        log.success(`[SERIAL] Reconnected to ${options.path} for device ${deviceId}`)
        return true
      }
      return false
    } catch {
      return false
    }
  })
}

/**
 * Internal function that opens a serial port and wires up data handling.
 * Returns the SerialPort on success, or undefined on failure.
 */
async function connectPort(options: ConnectOptions): Promise<SerialPort | undefined> {
  const { path, baudRate, handleMessage, deviceId } = options

  return new Promise((resolve, reject) => {
    try {
      const port = new SerialPort({ autoOpen: false, baudRate, lock: false, path })
      port.setEncoding('utf8')

      port.on('open', () => {
        log.complete('[SERIAL] Port opened:', path, deviceId ? `for device: ${deviceId}` : '')

        if (deviceId) {
          portToDevice.set(port, deviceId)
          log.debug('[SERIAL] Port mapped to device:', path, deviceId)

          // Reset the reconnect manager on successful connection
          const manager = reconnectManagers.get(deviceId)
          if (manager) {
            manager.reset()
          }
        }

        // Set up listeners that will trigger reconnect on unexpected close
        setupReconnectListeners(port, options)

        resolve(port)
      })

      const parser = port.pipe(new ReadlineParser())
      parser.on('data', (data) => {
        // Send device-specific serial data if we know the device (but filter out sensor data)
        const device = portToDevice.get(port)
        if (device && !isSensorData(data)) {
          const serialEvent = {
            action: 'serial-data',
            payload: {
              deviceId: device,
              data: data,
              timestamp: new Date().toISOString(),
              direction: 'incoming'
            }
          }

          wsServer.sendToDevice(device, serialEvent)
          log.debug('[SERIAL] Device data sent to WebSocket:', device, data)
        }

        // Call the original handler (always process sensor data for internal handling)
        handleMessage(data)
      })

      port.open((err) => {
        if (err) {
          log.error('[SERIAL] Error opening port:', err.message)
          reject(err)
        }
      })
    } catch (err) {
      log.fatal('[SERIAL] Error creating port:', err)
      reject(err)
    }
  })
}

const connect = ({
  path,
  baudRate,
  handleMessage,
  deviceId,
}: ConnectOptions): Promise<SerialPort | void> => {
  try {
    if (!path) {
      return Promise.reject(path)
    }

    log.await('[SERIAL] Attempting to connect to:', path, deviceId ? `for device: ${deviceId}` : '')

    return connectPort({ path, baudRate, handleMessage, deviceId }).catch((err) => {
      log.error('[SERIAL] Connection failed:', (err as Error).message)

      // If the initial connection fails and we have a deviceId, schedule reconnect
      if (deviceId) {
        connectionOptions.set(deviceId, { path, baudRate, handleMessage, deviceId })
        scheduleReconnect(deviceId)
      }
    })
  } catch (err) {
    log.fatal('[SERIAL] Error opening port: ', err)
    return Promise.reject(err)
  }
}

function handleSend(err: Error | null | undefined): void {
  if (err) {
    log.error('[SERIAL] Error on write:', err?.message)
  } else {
    // log.complete('[SERIAL] Data written to port')
  }
}

const send = (_port: SerialPort, data: string): void => {
  try {
    log.await('[SERIAL] writing to port', data)
    if (_port) {
      // Send device-specific serial data if we know the device
      const device = portToDevice.get(_port)
      if (device) {
        const serialEvent = {
          action: 'serial-data',
          payload: {
            deviceId: device,
            data: data,
            timestamp: new Date().toISOString(),
            direction: 'outgoing'
          }
        }
        wsServer.sendToDevice(device, serialEvent)
        log.debug('[SERIAL] Device command sent to WebSocket:', device, data)
      }

      _port.write(data, handleSend)
    }
  } catch (err) {
    log.fatal('[SERIAL] Error writing to port:', err)
  }
}

const disconnect = (_port: SerialPort): void => {
  try {
    // Clean up device mapping
    const device = portToDevice.get(_port)
    if (device) {
      portToDevice.delete(_port)

      // Stop any reconnect manager for this device since this is an intentional disconnect
      const manager = reconnectManagers.get(device)
      if (manager) {
        manager.stop()
        reconnectManagers.delete(device)
      }

      // Remove stored connection options
      connectionOptions.delete(device)

      log.debug('[SERIAL] Port unmapped from device:', device)
    }

    if (_port && _port.isOpen) {
      // Remove all listeners to prevent reconnect on intentional close
      _port.removeAllListeners('close')

      _port.close((err) => {
        if (err) {
          log.error('[SERIAL] Error closing port:', err.message)
        } else {
          log.complete('[SERIAL] Port closed successfully')
        }
      })
    } else {
      log.warn('[SERIAL] Port is not open or already closed')
    }
  } catch (err) {
    log.fatal('[SERIAL] Error disconnecting from port:', err)
  }
}

// Disconnect all serial ports
const disconnectAll = (): void => {
  try {
    log.info('[SERIAL] Disconnecting all serial ports...')

    // Stop all reconnect managers
    for (const [deviceId, manager] of reconnectManagers) {
      manager.stop()
    }
    reconnectManagers.clear()
    connectionOptions.clear()

    // Get all connected ports
    const connectedPorts = Array.from(portToDevice.keys())

    // Disconnect each port
    connectedPorts.forEach(port => {
      disconnect(port)
    })

    // Clear the port mapping
    portToDevice.clear()

    log.success('[SERIAL] All serial ports disconnected')
  } catch (err) {
    log.error('[SERIAL] Error disconnecting all ports:', err)
  }
}

/**
 * Stop reconnection attempts for a specific device.
 */
const stopReconnect = (deviceId: string): void => {
  const manager = reconnectManagers.get(deviceId)
  if (manager) {
    manager.stop()
    reconnectManagers.delete(deviceId)
  }
  connectionOptions.delete(deviceId)
}

export const serial = {
  connect,
  disconnect,
  disconnectAll,
  send,
  stopReconnect,
}

export default serial
