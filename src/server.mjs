import { WebSocketServer } from 'ws';
import log from './utils/logger.mjs';
import dcc from './dcc.mjs';

let server;
let queue = [];
const port = 8082; // TODO: move to config
const serverId = 'EX-JS-API-WebsocketServer'; // TODO: move to config

const MSG_CONNECTED = JSON.stringify({
  action: 'socketConnected',
  payload: { serverId }
});

async function processQueeue() {
  log.log('[EX-JS-API] processQueeue', queue);
  queue.map(async (data) => {
    await server.send(JSON.stringify(data));
  });
  queue = [];
}

const handleClose = () => {
  log.info('[EX-JS-API] connection closed', serverId);
}

const handleError = err => {
  log.error('[EX-JS-API] Unexpected error occurred', serverId, err);
}

const handleConnection = (ws, resolve) => {
  log.success('[EX-JS-API] new client connected', serverId);
  server = ws;
  server.onerror = handleError;
  server.on('close', handleClose);
  server.on('message', dcc.handleMessage);
  server.send(MSG_CONNECTED);
  processQueeue();
  resolve(ws);
}

const send = async (data) => {
  if (server) {
    await server.send(JSON.stringify(data));
  } else {
    queue.push(data);
  }
}

const connect = async () => {
  return new Promise((resolve, reject) => {
    try {
      const wss = new WebSocketServer({ port });
      wss.on('connection', (ws) => handleConnection(ws, resolve));
      log.start('[EX-JS-API] WebSocket server started', port, serverId);
    } catch (err) {
      log.error('[EX-JS-API] error', err);
      reject(err);
    }
  });
}

export default { connect, send };
