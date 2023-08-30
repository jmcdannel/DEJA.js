import { SerialPort } from 'serialport';
import log from './logger.mjs';

export const getPorts = async () => {
  try {
    const ports = await SerialPort.list();
    return ports.map(port => port.path);
  } catch (err) {
    log.fatal(err);
  }
}

export default getPorts;
