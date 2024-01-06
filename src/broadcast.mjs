
import server from './server.mjs'; // TODO: refactor to use event emitter
import mqtt from './mqtt.mjs';
import log from './utils/logger.mjs';

export const broadcast = async (data) => {
  try {
    mqtt.send('DCCEX.js', JSON.stringify(data));
    await server.send(data);
  } catch (err) {
    log.fatal('[BROADCAST] Error sending broadcast:', err);
  }
}

export default { broadcast }
