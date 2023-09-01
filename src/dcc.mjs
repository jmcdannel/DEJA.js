import { SerialPort } from 'serialport';
import log from './utils/logger.mjs';
import getPorts from './utils/listPorts.mjs';
import server from './server.mjs';

let path;
let port;
let isConnected = false;
const baudRate = 115200;

const openSerialPort = (resolve, reject) => {

  const handleOpen = err => {
    if (err) {
      log.fatal('[DCC] Error opening port: ', err.message);
      reject(`[DCC] Error opening port: ${err.message}`);
      return;
    }
    log.start('[DCC] open');
  
    isConnected = true;
  
    port.write('main screen turn on\n');
  }
  
  const handleOpened = async () => {
     log.start('[DCC] Serial port opened', path, baudRate);
     await server.send({ 'action': 'connected', payload: { serial: path, baudRate } });
     resolve(port);
  }

  log.await('[DCC] attempting to connect to:', path);
  // Create a port
  port = new SerialPort({ path, baudRate, autoOpen: false });
  port.open(handleOpen);
  port.on('open', handleOpened);
};

const handleMessage = async (msg) => {
  const { action, payload } = JSON.parse(msg);
  log.star('[DCC] handleMessage', action, payload);
  switch (action) {
    case 'connect':
      connect(payload);
      break;
    case 'listPorts':
      listPorts(payload);
      break;
    case 'power':
      send(payload);
      break;
    case 'throttle':
      sendSpeed(payload);
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

const initializeOutput = async (payload) => {
  log.star('initializeOutput', payload);
  payload.map(async out => {
    const cmd = `Z ${out.id} ${out.pin} 1`;
    await send(cmd);
  });
}

const sendOutput = async (payload) => {
  log.star('sendOutput', payload);
  const cmd = `Z ${payload.pin} ${payload.state ? 1 : 0}`;
  await send(cmd);
}

const connect = async (payload) => {
  try {
    log.star('[DCC] connect', payload);
    path = payload.serial;
    if (isConnected) {
      await server.send({ 'action': 'connected', payload: { serial: path, baudRate } });
      return Promise.resolve(true);
    } else {
      return new Promise(openSerialPort);
    }
  } catch (err) {
    log.fatal('[DCC] Error opening port: ', err.message);
  }
};

const listPorts = async () => {
  const payload = await getPorts();
  server.send({ 'action': 'listPorts', payload });
  log.info('[DCC] listPorts', payload);
};

const send = async (data) => {
  const cmd = `<${data}>\n`
  log.await('[DCC] writing to port', data);
  await port.write(cmd, err => {
    if (err) {
      return log.error('[DCC] Error on write: ', err.message);
    }
    log.log('data written', cmd);
  });
};

const sendSpeed = ({ address, speed }) => {
  const direction = speed > 0 ? 1 : 0;
  const absSpeed = Math.abs(speed);
  log.star('sendSpeed', address, speed, direction);
  const cmd = `t 01 ${address} ${absSpeed} ${direction}`;
  send(cmd);
}

const sendFunction = ({ address, func, state }) => {
  log.star('sendFunction', address, func);
  const cmd = `F ${address} ${func} ${state ? 1 : 0}`;
  send(cmd);
}

const powerOn = () => {
  send('1');
}

const powerOff = () => {
  send('0');
}

export default {
  connect,
  send,
  sendSpeed,
  powerOn,
  powerOff,
  handleMessage
}