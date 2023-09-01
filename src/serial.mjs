import { SerialPort } from 'serialport';
import log from './utils/logger.mjs';

let isConnected = false;
let port;

const connect = ({ path, baudRate }) => {
  if (isConnected) {
    return Promise.resolve(port);
  } else {
    return new Promise(function(resolve, reject) {

      if (!path) reject({ message: '[SERIAL] No serial port specified' });

      log.await('[SERIAL] Attempting to connect to:', path);

      const handleOpen = err => {
        if (err) {
          reject(`[SERIAL] Error opening port: ${err.message}`);
          return;
        }
        log.complete('[SERIAL] Open');

        isConnected = true;
      }

      const handleOpened = async () => {
        log.start('[SERIAL] Serial port opened', path, baudRate);
        resolve(port);
      }
      
      // Create a port
      port = new SerialPort({ path, baudRate, autoOpen: false });
      port.open(handleOpen);
      port.on('open', handleOpened);

      log.info('[SERIAL] Port Status', port.isOpen, port.settings);

    });
  }
}

const send = (data) => {
  log.await('[SERIAL] writing to port', JSON.stringify(data));
  port.write(`${JSON.stringify(data)}\n`, err => {
    if (err) {
      return log.error('[SERIAL] Error on write: ', err.message);
    }
    // log.log('data written', data);
  });
};

export default {
  connect,
  send
}