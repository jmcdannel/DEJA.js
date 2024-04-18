import mqtt from './src/mqtt.mjs';

await mqtt.connect();

async function setPower(payload, track = 'MAIN') {
  try {
    if (typeof payload === 'undefined') {
      console.log('[DCC API].setPower', 'payload undefined');
      return;
    }
    console.log('[DCC API].setPower', payload);
    send('power', `${payload ? 1 : 0} ${track}`);
  } catch (err) {
    console.error('[DCC API].setPower', err);
    throw new Error('Unable to read', err);
  }
}

async function setSpeed(address, speed) {
  try {   
    send('throttle', { address, speed });
  } catch (err) {
    console.error('[DCC API].setSpeed', err);
    throw new Error('Unable to read', err);
  }
}

async function setTurnout(turnoutId, state) {
  try {   
    send('turnout', { turnoutId, state });
  } catch (err) {
    console.error('[DCC API].setTurnout', err);
    throw new Error('Unable to read', err);
  }
}

async function setOutput(pin, state) {
  try {   
    send('output', { pin, state });
  } catch (err) {
    console.error('[DCC API].setTurnout', err);
    throw new Error('Unable to read', err);
  }
}

async function setFunction(address, func, state) {
  try {   
    send('function', { address, func, state });
  } catch (err) {
    console.error('[DCC API].setPower', err);
    throw new Error('Unable to read', err);
  }
}

async function send(action, payload) {
  try { 
    mqtt.send('ttt-dcc', JSON.stringify({ action, payload }))
    console.log('DCC send', action, payload)
  } catch (err) {
    console.error('[DCC API].send', err, action, payload)
  }
}

export default { setPower, setSpeed, setTurnout, setOutput, setFunction, send }
