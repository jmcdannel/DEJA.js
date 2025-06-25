import mqtt from 'mqtt'
import { log } from '../utils/logger.js'

const layoutId = process.env.LAYOUT_ID
const mqttBroker = process.env.VITE_MQTT_BROKER
const mqttPort = process.env.VITE_MQTT_PORT
const subscriptionTopics: string[] = []
const publishTopics: string[] = []

let mqttClient: mqtt.MqttClient | null = null

function handleConnect(): void {
  try {
    if (mqttClient) {
      log.start('MQTT client connected', layoutId)
      subscriptionTopics.map((topic) => mqttClient?.subscribe(topic))
      publishTopics.map((topic) =>
        mqttClient?.publish(
          topic,
          JSON.stringify({ action: 'ack', payload: { layoutId } })
        )
      )
    } else {
      log.error('MQTT Error in handleConnect:', mqttClient)
    }
  } catch (error) {
    log.error('MQTT Error in handleConnect:', error)
  }
}

function handleError(error: Error): void {
  log.error('MQTT mqttClient error', error)
  disconnect()
}

function handleMessage(topic: string, message: Buffer): void {
  try {
    // log.log(`MQTT mqttClient received message: ${message.toString()} from topic: ${topic}`)
    // dcc.handleMessage(message.toString())
  } catch (error) {
    log.error('MQTT Error in onMessage:', error)
  }
}

// Function to connect to MQTT broker
const connect = (): void => {
  try {
    if (!mqttBroker || !mqttPort) {
      log.error('MQTT broker or port not specified')
      return
    }
    mqttClient = mqtt.connect(mqttBroker, { port: parseInt(mqttPort) })

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
}

// Function to disconnect from MQTT broker
const disconnect = (): void => {
  try {
    mqttClient?.end()
  } catch (err) {
    log.error('MQTT Error disconnecting:', err)
  }
}

const send = (message: string): void => {
  try {
    // log.log('[MQTT]', message, publishTopics)
    publishTopics.map((topic) => publish(topic, message))
    // log.log(
    //   `MQTT mqttClient sent message: ${message} from topic: ${publishTopics.join(
    //     ', '
    //   )}`
    // )
  } catch (err) {
    log.error('MQTT Error sending message:', err)
  }
}

const subscribe = (topic: string, keepAlive = true): void => {
  try {
    mqttClient?.subscribe(topic)
    if (keepAlive && !publishTopics.includes(topic)) {
      publishTopics.push(topic)
    }
  } catch (err) {
    log.error('MQTT Error subscribing:', err)
  }
}

const publish = (topic: string, message: string, keepAlive = true) => {
  try {
    // log.log('mqtt pub', topic, message)
    mqttClient?.publish(topic, message)
    if (keepAlive && !publishTopics.includes(topic)) {
      publishTopics.push(topic)
    }
  } catch (err) {
    log.error('MQTT Error publishing:', err)
  }
}

export const dejaMqtt = {
  connect,
  disconnect,
  publish,
  send,
  subscribe,
}

export default dejaMqtt
