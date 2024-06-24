import { WebSocketServer } from 'ws'
import log from './utils/logger.mjs'
import dcc from './dcc.mjs'

const layoutId = process.env.LAYOUT_ID;
const port = process.env.VITE_WS_PORT || 8082
const serverId =  process.env.VITE_WS_ID ||'DEJA.js'

const connections = []

const MSG_CONNECTED = JSON.stringify({
  action: 'ack',
  payload: { serverId, layoutId },
})

const handleClose = (server) => {
  log.info('[Connection closed', serverId)
  let position = connections.indexOf(server) // get the client's position in the array
  server && connections.splice(position, 1)
}

const handleError = (err) => {
  log.error('WS unexpected error occurred', err)
};

const handleConnection = (ws) => {
  try {
    log.success('WS client connected')
    connections.push(ws) // add this client to the connections array
    ws.onerror = handleError
    ws.on('close', handleClose)
    ws.on('message', dcc.handleMessage)
    ws.on('connection', handleConnection)
    ws.send(MSG_CONNECTED)
    return !!ws
  } catch (err) {
    log.error('Error handling WS connection', err)
    return false
  }
}

export const send = async (data) => {
  try {
    await connections.map(ws => ws.send(JSON.stringify(data)))
  } catch (err) {
    log.error('[Error sending data to WS server:', err)
  }    
}

export const connect = async () => {
  return new Promise((resolve, reject) => {
    try {
      const wss = new WebSocketServer({ port })
      wss.on('connection', (ws) => handleConnection(ws) && resolve(ws))
      log.start('WebSocket server started', port, serverId)
    } catch (err) {
      log.error('error', err)
      reject(err)
    }
  });
};

export default { connect, send }
