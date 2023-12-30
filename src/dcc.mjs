import serial from './serial.mjs';
import getPorts from './utils/listPorts.mjs';
import server from './server.mjs'; // TODO: refactor to use event emitter
import log from './utils/logger.mjs';

let port; // serial port instance
let isConnected = false; // serial port connection status
const baudRate = 115200; // TODO: move to config

const handleMessage = async (msg) => {
  const { action, payload } = JSON.parse(msg);
  log.note('[DCC] handleMessage', action, payload);
  switch (action) {
    case 'connect':
      connect(payload);
      break;
    case 'dcc':
      send(payload);
      break;
    case 'listPorts':
      listPorts();
      break;
    case 'power':
      power(payload);
      break;
    case 'throttle':
      sendSpeed(payload);
      break;
    case 'turnout':
      sendTurnout(payload);
      break;
    case 'output':
      sendOutput(payload);
      break;
    case 'function':
      log.star('sendFunction',payload);
      sendFunction(payload);
      break;
    default:
      //noop
      log.warn('[DCC] Unknown action in `handleMessage`', action, payload);
  }
};

const send = async (data) => {
  try {
    const cmd = `<${data}>\n`
    log.await('[DCC] Writing to port', data);
    await port.write(cmd, err => {
      if (err) {
        return log.error('[DCC] Error on write:', err.message);
      }
      log.complete('[DCC] Data written to port', cmd);
    });
  } catch (err) {
    log.fatal('[DCC] Error writting to port:', err);
  }
};

const handleDccMessage = async (payload) => {
  log.complete('handleDccMessage: broadcast', payload)
  if (payload.startsWith('<p')) {
    console.log('POWER STATUS',  payload)
  }
  server.send({ action: 'broadcast', payload });
};

const connect = async (payload) => {
  try {
    log.star('[DCC] connect', payload);
    const path = payload.serial;
    if (isConnected && port) {
      await server.send({ 'action': 'connected', payload: { path, baudRate } });
      return Promise.resolve(port);
    } else {
      port = await serial.connect({ path, baudRate, handleMessage: handleDccMessage });
      await server.send({ 'action': 'connected', payload: { path, baudRate } });
      isConnected = true;
      return Promise.resolve(port);
    }
  } catch (err) {
    log.fatal('[DCC] Error opening port: ', err);
  }
};

const listPorts = async () => {
  const payload = await getPorts();
  await server.send({ 'action': 'listPorts', payload });
  log.star('[DCC] List ports', payload);
};

const power = async (state) => {
  await send(state);
  log.star('[DCC] Power', state);
};

const sendSpeed = async ({ address, speed }) => {
  const direction = speed > 0 ? 1 : 0;
  const absSpeed = Math.abs(speed);
  log.star('[DCC] Throttle', address, speed, direction);
  const cmd = `t ${address} ${absSpeed} ${direction}`;
  await send(cmd);
};

const sendTurnout = async ({ turnoutId, state }) => {
  log.star('[DCC] Turnout', turnoutId, state);
  const cmd = `T ${turnoutId} ${state ? 1 : 0}`;
  await send(cmd);
};

const sendFunction = async ({ address, func, state }) => {
  log.star('[DCC]  Function', address, func);
  const cmd = `F ${address} ${func} ${state ? 1 : 0}`;
  await send(cmd);
};

const initializeOutput = async (payload) => {
  log.star('[DCC]  INIT OUTPUT', payload);
  payload.map(async out => {
    const cmd = `Z ${out.id} ${out.pin} 1`;
    await send(cmd);
  });
};

const sendOutput = async (payload) => {
  log.star('[DCC] Output', payload);
  const cmd = `Z ${payload.pin} ${payload.state ? 1 : 0}`;
  await send(cmd);
};

// TODO: complete command ref, split to separate file(s) for each feature (command station, cab, turnouts, sensors, outputs)

export default {
  handleMessage
}