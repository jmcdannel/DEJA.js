import { SerialPort } from 'serialport';
import log from './logger.mjs';

const path = '/dev/ttyACM0';
const baudRate = 115200;

export const connectPort = async () => {
  try {
    log.await('[SERIAL] Attempting to connect to:', path);

    const handleOpen = err => {
      if (err) {
        log.fatal(`[SERIAL] Error opening port: ${err.message}`);
        return;
      }
      log.complete('[SERIAL] Open');
    }

    const handleOpened = async () => {
      log.start('[SERIAL] Serial port opened', path, baudRate);
      resolve(port);
    }
    
    // Create a port
    const port = new SerialPort({ path, baudRate, autoOpen: false });
    port.open(handleOpen);
    port.on('open', handleOpened);
  } catch (err) {
    log.fatal(err);
  }
}

connectPort();
export default connectPort;