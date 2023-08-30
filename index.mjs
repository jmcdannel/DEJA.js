import server from './src/server.mjs';
import log from './src/utils/logger.mjs';

async function main() {
  try {
    log.start('EX-JS-API', '[MAIN]');
    await server.connect();
  } catch (err) {
    log.fatal(err);
  }
}

await main();
