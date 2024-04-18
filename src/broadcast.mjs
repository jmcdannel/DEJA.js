
import server from './server.mjs'; // TODO: refactor to use event emitter
import mqtt from './mqtt.mjs';
import log from './utils/logger.mjs';

const layoutId = process.env.LAYOUT_ID

export const broadcast = async (data) => {
  try {
    mqtt.send(`@ttt/DCCEX.js/${layoutId}`, JSON.stringify(data));
    await server.send(data);
  } catch (err) {
    log.fatal('[BROADCAST] Error sending broadcast:', err);
  }
}

export default { broadcast }
