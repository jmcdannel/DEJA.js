import { WebSocketServer } from 'ws';
import log from './utils/logger.mjs';
import dcc from './dcc.mjs';

let server;
let queue = [];
const connections = [];
const port = 8082; // TODO: move to config
const serverId = 'EX-JS-API-WebSocketServer'; // TODO: move to config

const MSG_CONNECTED = JSON.stringify({
  action: 'socketConnected',
  payload: { serverId }
});

async function processQueeue() {
  log.log('[EX-JS-API] Process queeue', queue);
  queue.map(async (data) => {
    // await server.send(JSON.stringify(data));
    broadcast(JSON.stringify(data));
  });
  queue = [];
}

// function handleConnection(client) {
//   console.log("New Connection"); // you have a new client
//   connections.push(client); // add this client to the connections array
 
//   client.on('message', sendToSerial); // when a client sends a message,
 
//   client.on('close', function() { // when a client closes its connection
//     console.log("connection closed"); // print it out
//     let position = connections.indexOf(client); // get the client's position in the array
//     connections.splice(position, 1); // and delete it from the array
//   });
// }

const handleClose = () => {
  log.info('[EX-JS-API] Connection closed', serverId);
  let position = connections.indexOf(server); // get the client's position in the array
  connections.splice(position, 1);
}

const handleError = err => {
  log.error('[EX-JS-API] Unexpected error occurred', serverId, err);
}

const handleConnection = (ws, resolve) => {
  log.success('[EX-JS-API] New client connected', serverId);
  connections.push(ws); // add this client to the connections array
  ws.onerror = handleError;
  ws.on('close', handleClose);
  ws.on('message', dcc.handleMessage);
  ws.on('connection', handleConnection);
 
  ws.send(MSG_CONNECTED);
  queue.length && processQueeue();
  resolve(ws);
}

const send = async (data) => {
  if (connections.length > 0) {
    broadcast(JSON.stringify(data));
    // await server.send(JSON.stringify(data));
  } else {
    queue.push(data);
  }
}

// This function broadcasts messages to all webSocket clients
function broadcast(data) {
  let myConnection;
  for (myConnection in connections) {   // iterate over the array of connections
    connections[myConnection].send(data); // send the data to each connection
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
