import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { log } from '../utils/logger.js'
import { wsServer } from './ws-server'

// Track which device each port belongs to
const portToDevice: Map<SerialPort, string> = new Map()

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
  deviceId?: string  // Add device ID for tracking
}

export const isSensorData = (data: string): boolean => {
  return data.startsWith('{ "sensor')
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
    return new Promise((resolve, reject) => {
      if (!path) {
        reject(new Error(`[SERIAL] No serial port specified: ${path}`))
        return
      }
      log.await('[SERIAL] Attempting to connect to:', path, deviceId ? `for device: ${deviceId}` : '')
      // Create a port
      const port = new SerialPort({ autoOpen: false, baudRate, lock: false, path })
      port.setEncoding('utf8')
      port.on('open', () => {
        log.complete('[SERIAL] Port opened:', path, deviceId ? `for device: ${deviceId}` : '')
        
        // Track which device this port belongs to
        if (deviceId) {
          portToDevice.set(port, deviceId)
          log.debug('[SERIAL] Port mapped to device:', path, deviceId)
        }
        
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
      port.open(handleOpen)
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
      log.debug('[SERIAL] Port unmapped from device:', device)
    }
    
    if (_port && _port.isOpen) {
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

export const serial = {
  connect,
  disconnect,
  disconnectAll,
  send,
}

export default serial
