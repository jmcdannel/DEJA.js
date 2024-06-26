import mqtt from 'mqtt'
import log from './utils/logger.mjs'
import dcc from './dcc.mjs'

const layoutId = process.env.LAYOUT_ID
const mqttBroker = process.env.VITE_MQTT_BROKER
const mqttPort = process.env.VITE_MQTT_PORT
const subscriptionTopics = [`@ttt/dcc/${layoutId}`]
const publishTopics = [`@ttt/DEJA.js/${layoutId}`]

let mqttClient = null

const handleSubscribeError = (error) => {
  if (error) {
    log.error('MQTT subscribe to topics error', error)
    return
  }
};

function handleConnect() {
  try {
    log.start('MQTT client connected', layoutId)
    subscriptionTopics.map((topic) =>
      mqttClient.subscribe(topic, handleSubscribeError)
    );
    publishTopics.map((topic) =>
      mqttClient.publish(
        topic,
        JSON.stringify({ action: 'ack', payload: { layoutId } })
      )
    )
  } catch (error) {
    log.error('MQTT Error in handleConnect:', error)
  }
}

function handleError(error) {
  try {
    log.error('MQTT mqttClient error', error)
    mqttClient.end()
  } catch (error) {
    log.error('MQTT Error in handleConnect:', error)
  }
}

function handleMessage(topic, message) {
  try {
    log.log(
      `MQTT mqttClient received message: ${message} from topic: ${topic}`
    )
    dcc.handleMessage(message.toString())
  } catch (error) {
    log.error('MQTT Error in onMessage:', error)
  }
}

// Function to connect to MQTT broker
const connect = () => {
  try {
    mqttClient = mqtt.connect(mqttBroker, { port: mqttPort })

    // https://github.com/mqttjs/MQTT.js#event-connect
    mqttClient.on('connect', handleConnect)

    // https://github.com/mqttjs/MQTT.js#event-error
    mqttClient.on('error', handleError)

    // https://github.com/mqttjs/MQTT.js#event-message
    mqttClient.on('message', handleMessage)

    // https://github.com/mqttjs/MQTT.js#event-reconnect
    // mqttClient.on('reconnect', () => {
    //   log.log('mqttClient reconnecting')
    // })
  } catch (err) {
    log.error('MQTT Error connecting:', err)
  }
};

// Function to disconnect from MQTT broker
const disconnect = () => {
  try {
    mqttClient.end()
  } catch (err) {
    log.error('MQTT Error disconnecting:', err)
  }
};

const send = (message) => {
  try {
    mqttClient &&
      publishTopics.map((topic) => mqttClient.publish(topic, message))
    log.log(
      `MQTT mqttClient sent message: ${message} from topic: ${publishTopics.join(', ')}`
    )
  } catch (err) {
    log.error('MQTT Error sending message:', err)
  }
};

export default { connect, send, disconnect }
