import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline'
import log from './utils/logger.mjs';

let isConnected = false;
let port;

const connect = ({ path, baudRate, handleMessage }) => {
  try {
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
        port.setEncoding('utf8');
        port.on('open', handleOpened);

        const parser = port.pipe(new ReadlineParser())
        parser.on('data', handleMessage);
        // parser.on('data', handleMessage);
        // Read data that is available but keep the stream in "paused mode"
        // port.on('readable', function () {
        //   log.fav('readable:', port.read())
        // })

        // // Switches the port into "flowing mode"
        // port.on('data', handleMessage);
        
        port.open(handleOpen);

        log.info('[SERIAL] Port Status', port.isOpen, port.settings);

      });
    }
  } catch (err) {
    log.fatal('[SERIAL] Error opening port: ', err);
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