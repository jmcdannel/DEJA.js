import mqtt from 'mqtt'
import type { IClientOptions } from 'mqtt'
import { log } from '../utils/logger.js'
import { ReconnectManager } from '../utils/reconnect.js'

const layoutId = process.env.LAYOUT_ID
const mqttBroker = process.env.VITE_MQTT_BROKER || 'mqtt://localhost'
const mqttPort = process.env.VITE_MQTT_PORT || '1883'
const subscriptionTopics: string[] = []
const publishTopics: string[] = []

let mqttClient: mqtt.MqttClient | null = null
let isConnecting = false

// Exponential backoff reconnection manager (no hard limit on attempts)
const reconnectManager = new ReconnectManager({
  label: '[MQTT]',
  baseDelay: 1000,
  maxDelay: 30_000,
})

function resubscribeTopics(): void {
  if (!mqttClient) return
  subscriptionTopics.forEach((topic) => mqttClient?.subscribe(topic))
  publishTopics.forEach((topic) =>
    mqttClient?.publish(
      topic,
      JSON.stringify({ action: 'ack', payload: { layoutId } })
    )
  )
}

function handleConnect(): void {
  try {
    if (mqttClient) {
      log.start('MQTT client connected', layoutId)
      isConnecting = false

      // Reset the reconnect manager on successful connection
      reconnectManager.reset()

      resubscribeTopics()
    } else {
      log.error('MQTT Error in handleConnect:', mqttClient)
    }
  } catch (error) {
    log.error('MQTT Error in handleConnect:', error)
  }
}

function handleError(error: Error): void {
  log.error('MQTT mqttClient error', error)
  isConnecting = false
}

function handleDisconnect(): void {
  log.note('MQTT client disconnected')
  isConnecting = false
}

function handleClose(): void {
  log.note('MQTT connection closed')
  isConnecting = false

  // Schedule a reconnection attempt when the connection is lost unexpectedly
  if (mqttClient && !reconnectManager.isStopped) {
    scheduleReconnect()
  }
}

function handleOffline(): void {
  log.note('MQTT client went offline')
  isConnecting = false
}

function handleMessage(topic: string, message: Buffer): void {
  try {
    log.log('MQTT message received:', topic, message.toString())
  } catch (error) {
    log.error('MQTT Error in onMessage:', error)
  }
}

/**
 * Build the broker URL and options based on environment configuration.
 */
function buildConnectionParams(): { brokerUrl: string; options: IClientOptions } {
  let brokerUrl = mqttBroker
  const options: IClientOptions = {
    port: parseInt(mqttPort),
    reconnectPeriod: 0, // Disable mqtt.js built-in reconnection — we handle it ourselves
    connectTimeout: 10_000,
  }

  if (brokerUrl.startsWith('wss://')) {
    brokerUrl = `${brokerUrl}:${mqttPort}`
    options.protocol = 'wss'
  } else if (brokerUrl.startsWith('ws://')) {
    brokerUrl = `${brokerUrl}:${mqttPort}`
    options.protocol = 'ws'
  }

  return { brokerUrl, options }
}

/**
 * Attempt a single MQTT connection. Returns true on success, false otherwise.
 */
function attemptConnect(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (isConnecting) {
        resolve(false)
        return
      }

      if (!mqttBroker || !mqttPort) {
        log.error('MQTT broker or port not specified')
        resolve(false)
        return
      }

      isConnecting = true
      const { brokerUrl, options } = buildConnectionParams()

      log.note('Connecting to MQTT broker:', brokerUrl, 'port:', mqttPort)

      mqttClient = mqtt.connect(brokerUrl, options)

      mqttClient.on('connect', () => {
        handleConnect()
        resolve(true)
      })

      mqttClient.on('error', (error) => {
        handleError(error)
        // Only resolve false if we haven't resolved yet (initial connect failed)
        resolve(false)
      })

      mqttClient.on('disconnect', handleDisconnect)
      mqttClient.on('close', handleClose)
      mqttClient.on('offline', handleOffline)
      mqttClient.on('message', handleMessage)
    } catch (err) {
      isConnecting = false
      log.error('MQTT Error connecting:', err)
      resolve(false)
    }
  })
}

/**
 * Schedule a reconnection using exponential backoff.
 */
function scheduleReconnect(): void {
  // Clean up the old client before reconnecting
  if (mqttClient) {
    try {
      mqttClient.removeAllListeners()
      mqttClient.end(true)
    } catch {
      // Ignore cleanup errors
    }
    mqttClient = null
  }

  reconnectManager.schedule(async () => {
    return attemptConnect()
  })
}

// Function to connect to MQTT broker
const connect = (): void => {
  try {
    if (isConnecting) {
      log.note('MQTT connection already in progress, skipping...')
      return
    }

    if (!mqttBroker || !mqttPort) {
      log.error('MQTT broker or port not specified')
      return
    }

    // Reset the reconnect manager when starting a fresh connection
    reconnectManager.reset()

    attemptConnect().then((success) => {
      if (!success) {
        log.warn('MQTT initial connection failed, scheduling reconnect...')
        scheduleReconnect()
      }
    }).catch((err) => {
      log.error('MQTT unexpected error during connect:', err)
      scheduleReconnect()
    })
  } catch (err) {
    isConnecting = false
    log.error('MQTT Error connecting:', err)
  }
}

// Function to disconnect from MQTT broker (intentional — stops reconnection)
const disconnect = (): void => {
  try {
    // Stop all reconnection attempts
    reconnectManager.stop()
    isConnecting = false

    if (mqttClient) {
      mqttClient.removeAllListeners()
      mqttClient.end()
      mqttClient = null
      log.note('MQTT client disconnected')
    }
  } catch (err) {
    log.error('MQTT Error disconnecting:', err)
  }
}

// Function to subscribe to a topic
const subscribe = (topic: string): void => {
  try {
    if (mqttClient && mqttClient.connected) {
      mqttClient.subscribe(topic)
      subscriptionTopics.push(topic)
      log.note('Subscribed to topic:', topic)
    } else {
      // Store the topic so it gets subscribed on (re)connect
      if (!subscriptionTopics.includes(topic)) {
        subscriptionTopics.push(topic)
      }
      log.error('MQTT client not connected, topic queued for subscription:', topic)
    }
  } catch (err) {
    log.error('MQTT Error subscribing:', err)
  }
}

// Function to publish to a topic
const publish = (topic: string, message: string): void => {
  try {
    if (mqttClient && mqttClient.connected) {
      mqttClient.publish(topic, message)
      publishTopics.push(topic)
      log.note('Published to topic:', topic, message)
    } else {
      log.error('MQTT client not connected, cannot publish to:', topic)
    }
  } catch (err) {
    log.error('MQTT Error publishing:', err)
  }
}

// Function to send data (alias for publish)
const send = (data: string): void => {
  try {
    if (mqttClient && mqttClient.connected) {
      const topic = `DEJA/${layoutId}/broadcast`
      mqttClient.publish(topic, data)
      log.note('Sent data to topic:', topic, data)
    } else {
      log.error('MQTT client not connected, cannot send data')
    }
  } catch (err) {
    log.error('MQTT Error sending:', err)
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
