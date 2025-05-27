import os from 'node:os'
import type { IncomingMessage } from 'node:http'
import { WebSocketServer } from 'ws'
import { log } from './utils/logger.js'
import { dcc } from './dcc.js'

const layoutId = process.env.LAYOUT_ID
const port = process.env.VITE_WS_PORT || '8082'
const serverId = process.env.VITE_WS_ID || 'DEJA.js'

const connections: WebSocketServer[] = []

const MSG_CONNECTED = JSON.stringify({
  action: 'ack',
  payload: { layoutId, serverId },
})

const handleClose = (server: WebSocketServer): void => {
  log.info('[Connection closed', serverId, layoutId)
  const position = connections.indexOf(server) // get the client's position in the array
  if (server) { 
    connections.splice(position, 1)
  }
}

const handleError = (err: Error): void => {
  log.error('WS unexpected error occurred', err)
}

const handleConnection = (ws: WebSocketServer, req: IncomingMessage): boolean => {
  try {
    log.success('WS client connected', req?.socket?.remoteAddress)
    connections.push(ws) // add this client to the connections array
    ws.on('error', handleError)
    ws.on('close', handleClose)
    ws.on('message', dcc.handleMessage)
    ws.on('connection', handleConnection)
    ws.emit(MSG_CONNECTED)
    ws.emit(JSON.stringify({ action: 'wsconnected', payload: { ip: req?.socket?.remoteAddress, serverId  } }))
    return Boolean(ws)
  } catch (err) {
    log.error('Error handling WS connection', err)
    return false
  }
}

export const send = (data: JSON): void => {
  try {
    connections.map((ws) => ws.emit(JSON.stringify(data)))
  } catch (err) {
    log.error('[Error sending data to WS server:', err)
  }
}

export const connect = async (): Promise<WebSocketServer> => {
  return new Promise((resolve, reject) => {
    try {
      const wss = new WebSocketServer({ port: parseInt(port) })
      wss.on('connection', (ws, req) => handleConnection(wss, req) && resolve(wss))
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

export const wsServer = { 
  connect,
  send
}

export default wsServer
