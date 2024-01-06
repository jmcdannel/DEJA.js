import server from './src/server.mjs';
import mqtt from './src/mqtt.mjs';
import log from './src/utils/logger.mjs';

async function main() {
  try {
    log.start('DCCEX.js', '[MAIN]');
    await mqtt.connect();
    await server.connect();
  } catch (err) {
    log.fatal(err);
  }
}

await main();
