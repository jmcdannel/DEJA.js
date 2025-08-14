import os from 'node:os'
import type { IncomingMessage } from 'node:http'
import WebSocket, { WebSocketServer } from 'ws';
import { log } from '../utils/logger.js'

const layoutId = process.env.LAYOUT_ID
const port = process.env.VITE_WS_PORT || '8082'
const serverId = process.env.VITE_WS_ID || 'DEJA.js'
let weServer: WebSocketServer | null = null

// General connections for broadcast messages
const connections: WebSocket[] = []
let latestConnection: WebSocket | null = null

// Device-specific connections for serial monitoring
const deviceConnections: Map<string, WebSocket[]> = new Map()

const MSG_CONNECTED = JSON.stringify({
  action: 'ack',
  payload: { layoutId, serverId },
})

const handleClose = (server: WebSocket, deviceId?: string): void => {
  if (deviceId) {
    // Remove from device-specific connections
    const deviceConns = deviceConnections.get(deviceId) || []
    const position = deviceConns.indexOf(server)
    if (position > -1) {
      deviceConns.splice(position, 1)
      if (deviceConns.length === 0) {
        deviceConnections.delete(deviceId)
      } else {
        deviceConnections.set(deviceId, deviceConns)
      }
    }
    log.info('[Device connection closed]', deviceId, serverId, layoutId)
  } else {
    // Remove from general connections
    const position = connections.indexOf(server)
    if (position > -1) {
      connections.splice(position, 1)
    }
    log.info('[General connection closed]', serverId, layoutId, position)
  }
}

const handleError = (err: Error): void => {
  log.error('WebSocket unexpected error occurred', err)
}

const handleMessage = async (ws: WebSocket, payload: string, deviceId?: string): Promise<void> => {
  try {
    const data = JSON.parse(payload)
    log.note('WebSocket message received:', data)
    
    // Handle device subscription for serial monitoring
    if (data.action === 'subscribe-device' && data.deviceId) {
      const targetDeviceId = data.deviceId
      const deviceConns = deviceConnections.get(targetDeviceId) || []
      deviceConns.push(ws)
      deviceConnections.set(targetDeviceId, deviceConns)
      
      // Send confirmation
      ws.send(JSON.stringify({
        action: 'device-subscribed',
        payload: { deviceId: targetDeviceId, success: true }
      }))
      
      log.success('[Device subscription]', targetDeviceId, 'connected to serial monitor')
    }
    
    // Handle device unsubscription
    if (data.action === 'unsubscribe-device' && data.deviceId) {
      const targetDeviceId = data.deviceId
      const deviceConns = deviceConnections.get(targetDeviceId) || []
      const position = deviceConns.indexOf(ws)
      if (position > -1) {
        deviceConns.splice(position, 1)
        if (deviceConns.length === 0) {
          deviceConnections.delete(targetDeviceId)
        } else {
          deviceConnections.set(targetDeviceId, deviceConns)
        }
        
        ws.send(JSON.stringify({
          action: 'device-unsubscribed',
          payload: { deviceId: targetDeviceId, success: true }
        }))
        
        log.success('[Device unsubscription]', targetDeviceId, 'disconnected from serial monitor')
      }
    }
    
  } catch (err) {
    log.error('Error handling WebSocket message:', err)
  }
}

const handleConnectionMessage = (ws: WebSocket) => {
  log.note('WebSocket connection message received')
  ws.emit('message', JSON.stringify({ action: 'ack', payload: { layoutId, serverId } }))
}

const handleConnection = (ws: WebSocket, req: IncomingMessage): boolean => {
  try {
    log.success('WebSocket client connected', req?.socket?.remoteAddress)
    connections.push(ws) // add this client to the general connections array
    latestConnection = ws
    ws.on('error', handleError)
    ws.on('close', () => handleClose(ws))
    ws.on('message', (data) => handleMessage(ws, data.toString()))
    ws.on('connection', handleConnectionMessage)
    ws.send(MSG_CONNECTED)
    ws.send(JSON.stringify({ action: 'wsconnected', payload: { ip: req?.socket?.remoteAddress, serverId  } }))
    return Boolean(ws)
  } catch (err) {
    log.error('Error handling WebSocket connection', err)
    return false
  }
}

// Send to all general connections (for broadcast messages)
export const send = (data: JSON): void => {
  try {
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data))
      }
    })
  } catch (err) {
    log.error('[Error sending data to general WebSocket connections:', err)
  }
}

// Send to device-specific connections (for serial monitoring)
export const sendToDevice = (deviceId: string, data: any): void => {
  try {
    const deviceConns = deviceConnections.get(deviceId)
    if (deviceConns && deviceConns.length > 0) {
      deviceConns.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data))
        }
      })
      log.debug('[Device serial]', deviceId, 'sent to', deviceConns.length, 'connections')
    }
  } catch (err) {
    log.error('[Error sending data to device WebSocket connections:', err)
  }
}

// Get list of all device IDs with active connections
export const getActiveDevices = (): string[] => {
  return Array.from(deviceConnections.keys())
}

export const connect = async (): Promise<WebSocketServer | null> => {
  return new Promise((resolve, reject) => {
    try {
      weServer = new WebSocketServer({ port: parseInt(port) })
      weServer.on('connection', (ws, req) => handleConnection(ws, req) && resolve(weServer))
      const serverIp =
        os?.networkInterfaces()
        ?.['en0']
        ?.find(details => details.family === 'IPv4')?.address
        ||
        os?.networkInterfaces()
        ?.['en1']
        ?.find(details => details.family === 'IPv4')?.address
      log.start('WebSocket server started', port, serverId, serverIp)
    } catch (err) {
      log.error('error', err)
      reject(err)
    }
  })
}

export const disconnect = async (): Promise<void> => {
  try {
    if (weServer) {
      // Close all client connections
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'Server shutting down')
        }
      })
      connections.length = 0
      
      // Close all device connections
      deviceConnections.forEach((deviceConns) => {
        deviceConns.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close(1000, 'Server shutting down')
          }
        })
      })
      deviceConnections.clear()
      
      // Close the WebSocket server
      weServer.close(() => {
        log.success('WebSocket server closed successfully')
        weServer = null
      })
      
      log.info('WebSocket server shutdown initiated')
    }
  } catch (err) {
    log.error('Error during WebSocket server shutdown:', err)
  }
}

export const isConnected = (): boolean => {
  return weServer !== null
}

export const wsServer = { 
  connect,
  disconnect,
  send,
  sendToDevice,
  getActiveDevices,
  isConnected
}

export default wsServer
