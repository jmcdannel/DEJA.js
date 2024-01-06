import mqtt from "mqtt";
import log from './utils/logger.mjs';
import dcc from './dcc.mjs';

const mqttBroker = 'mqtt://joshs-mac-mini.local'
const mqttPort = 5005;

let mqttClient;

const handleSubscribeError = (error) => {
  if (error) {
    console.log('Subscribe to topics error', error)
    return
  }
}

// Function to connect to MQTT broker
const connect = () => {
  mqttClient = mqtt.connect(mqttBroker);
  // https://github.com/mqttjs/MQTT.js#event-connect
  mqttClient.on('connect', () => {
    log.log('mqttClient connection successful')
    mqttClient.publish('DCCEX.js', 'Hello mqtt')
    mqttClient.subscribe('ttt-dispatcher', handleSubscribeError)
    mqttClient.subscribe('ttt-dcc', handleSubscribeError)
  })

  // https://github.com/mqttjs/MQTT.js#event-error
  mqttClient.on('error', (err) => {
    log.error('mqttClient Connection error: ', err)
    mqttClient.end()
  })

  // https://github.com/mqttjs/MQTT.js#event-reconnect
  mqttClient.on('reconnect', () => {
    log.log('mqttClient reconnecting')
  })

  // https://github.com/mqttjs/MQTT.js#event-message
  mqttClient.on('message', (topic, message) => {
    console.log(`mqttClient received message: ${message} from topic: ${topic}`)
    dcc.handleMessage(message.toString());
  })
};

// Function to disconnect from MQTT broker
const disconnect = () => {
  mqttClient.end();
  setMqttStatus(CONNECTION_STATUS.DISCONNECTED);
};

const send = (topic, message) => {
  if (mqttClient) {
    mqttClient.publish(topic, message);
  }
}

export default { connect, send, disconnect }