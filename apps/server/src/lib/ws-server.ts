import os from 'node:os'
import type { IncomingMessage } from 'node:http'
import WebSocket, { WebSocketServer } from 'ws';
import { log } from '../utils/logger.js'
// import { dcc } from './dcc.js'

const layoutId = process.env.LAYOUT_ID
const port = process.env.VITE_WS_PORT || '8082'
const serverId = process.env.VITE_WS_ID || 'DEJA.js'
let weServer: WebSocketServer | null = null

const connections: WebSocket[] = []
let latestConnection: WebSocket | null = null

const MSG_CONNECTED = JSON.stringify({
  action: 'ack',
  payload: { layoutId, serverId },
})

const handleClose = (server: WebSocket): void => {
  log.info('[Connection closed', serverId, layoutId, connections.indexOf(server))
  const position = connections.indexOf(server) // get the client's position in the array
  if (server) { 
    connections.splice(position, 1)
  }
}

const handleError = (err: Error): void => {
  log.error('WebSocket unexpected error occurred', err)
}

const handlenMessage = async (payload: JSON | string): Promise<void> =>
  log.note('WebSocket message received:', payload)

const handleConnectionMessage = (ws: WebSocket) => {
  log.note('WebSocket connection message received')
  // dcc.handleConnectionMessage(payload)
  // broadcast({ action: 'broadcast', payload })
  ws.emit('message', JSON.stringify({ action: 'ack', payload: { layoutId, serverId } }))
}

const handleConnection = (ws: WebSocket, req: IncomingMessage): boolean => {
  try {
    log.success('WebSocket client connected', req?.socket?.remoteAddress)
    connections.push(ws) // add this client to the connections array
    latestConnection = ws
    ws.on('error', handleError)
    ws.on('close', handleClose)
    ws.on('message', handlenMessage)
    ws.on('connection', handleConnectionMessage)
    ws.send(MSG_CONNECTED)
    ws.send(JSON.stringify({ action: 'wsconnected', payload: { ip: req?.socket?.remoteAddress, serverId  } }))
    return Boolean(ws)
  } catch (err) {
    log.error('Error handling WebSocket connection', err)
    return false
  }
}

export const send = (data: JSON): void => {
  try {
    connections.map((ws) => ws.send(JSON.stringify(data)))
    if (latestConnection) {
      latestConnection.send(JSON.stringify(data))
    }
  } catch (err) {
    log.error('[Error sending data to WebSocket server:', err)
  }
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

export const wsServer = { 
  connect,
  send
}

export default wsServer
