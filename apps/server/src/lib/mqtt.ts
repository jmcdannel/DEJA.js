import mqtt from 'mqtt'
import type { IClientOptions } from 'mqtt'
import { dejaEmitter, type BroadcastMessage } from '../broadcast'
import { log } from '../utils/logger.js'
import { ReconnectManager } from '../utils/reconnect.js'

const layoutId = process.env.LAYOUT_ID
const mqttBroker = process.env.VITE_MQTT_BROKER || 'mqtt://localhost'
const mqttPort = process.env.VITE_MQTT_PORT || '1883'
const subscriptionTopics: string[] = []
const publishTopics: string[] = []

/** Connection states for the MQTT client */
type MqttConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'disconnecting'

let mqttClient: mqtt.MqttClient | null = null
let connectionState: MqttConnectionState = 'disconnected'

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

function handleConnect(): void {
  try {
    if (mqttClient) {
      log.start('[MQTT] Client connected', layoutId)
      connectionState = 'connected'

      // Reset the reconnect manager on successful connection
      reconnectManager.reset()

      resubscribeTopics()
    } else {
      log.error('[MQTT] Error in handleConnect: client is null')
    }
  } catch (error) {
    log.error('[MQTT] Error in handleConnect:', error)
  }
}

function handleError(error: Error): void {
  log.error('[MQTT] Client error:', error.message)

  if (connectionState === 'disconnecting') {
    return
  }

  // On connection-level errors, schedule a reconnect
  if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
    log.error('[MQTT] Broker not available. Will retry with exponential backoff.')
    if (connectionState !== 'reconnecting') {
      scheduleReconnect()
    }
  }
}

function handleDisconnect(): void {
  log.note('[MQTT] Client disconnected')

  if (connectionState === 'disconnecting') {
    connectionState = 'disconnected'
    return
  }

  // Unexpected disconnect — schedule reconnect
  if (connectionState !== 'reconnecting') {
    scheduleReconnect()
  }
}

function handleClose(): void {
  log.note('[MQTT] Connection closed')

  if (connectionState === 'disconnecting') {
    connectionState = 'disconnected'
    return
  }

  // Connection closed unexpectedly — schedule reconnect
  if (connectionState !== 'reconnecting') {
    scheduleReconnect()
  }
}

function handleOffline(): void {
  log.note('[MQTT] Client went offline')

  if (connectionState === 'disconnecting') {
    return
  }

  if (connectionState !== 'reconnecting') {
    scheduleReconnect()
  }
}

function handleMessage(topic: string, message: Buffer): void {
  try {
    log.log('[MQTT] Message received:', topic, message.toString())
  } catch (error) {
    log.error('[MQTT] Error in onMessage:', error)
  }
}

/**
 * Attempt a single MQTT connection. Returns true on success, false otherwise.
 */
function attemptConnect(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (!mqttBroker || !mqttPort) {
        log.error('[MQTT] Broker or port not specified')
        resolve(false)
        return
      }

      connectionState = 'connecting'
      const { brokerUrl, options } = buildConnectionParams()

      log.note('[MQTT] Connecting to broker:', brokerUrl, 'port:', mqttPort)

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
      connectionState = 'disconnected'
      log.error('[MQTT] Error connecting:', err)
      resolve(false)
    }
  })
}

/**
 * Schedule a reconnection using exponential backoff.
 */
function scheduleReconnect(): void {
  connectionState = 'reconnecting'

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

/** Handler for broadcast events — forwards messages to the MQTT broadcast topic. */
const handleBroadcastEvent = (data: BroadcastMessage): void => {
  send(JSON.stringify(data))
}

// Function to connect to MQTT broker
const connect = (): void => {
  if (connectionState === 'connecting' || connectionState === 'connected') {
    log.note('[MQTT] Already connected or connection in progress, skipping...')
    return
  }

  if (!mqttBroker || !mqttPort) {
    log.error('[MQTT] Broker or port not specified')
    return
  }

  // Subscribe to broadcast events from the event emitter
  dejaEmitter.onBroadcast(handleBroadcastEvent)

  // Reset the reconnect manager when starting a fresh connection
  reconnectManager.reset()

  attemptConnect().then((success) => {
    if (!success) {
      log.warn('[MQTT] Initial connection failed, scheduling reconnect...')
      scheduleReconnect()
    }
  }).catch((err) => {
    log.error('[MQTT] Unexpected error during connect:', err)
    scheduleReconnect()
  })
}

// Function to disconnect from MQTT broker (intentional — stops reconnection)
const disconnect = (): void => {
  try {
    // Unsubscribe from broadcast events
    dejaEmitter.offBroadcast(handleBroadcastEvent)

    // Stop all reconnection attempts
    reconnectManager.stop()
    connectionState = 'disconnecting'

    if (mqttClient) {
      mqttClient.removeAllListeners()
      mqttClient.end()
      mqttClient = null
      log.note('[MQTT] Client disconnected')
    }

    connectionState = 'disconnected'
  } catch (err) {
    log.error('[MQTT] Error disconnecting:', err)
    connectionState = 'disconnected'
  }
}

// Get the current connection state
const getConnectionState = (): MqttConnectionState => connectionState

// Check if the client is currently connected
const isConnected = (): boolean => connectionState === 'connected'

// Function to subscribe to a topic
const subscribe = (topic: string): void => {
  try {
    if (mqttClient?.connected) {
      mqttClient.subscribe(topic)
      subscriptionTopics.push(topic)
      log.note('[MQTT] Subscribed to topic:', topic)
    } else {
      // Store the topic so it gets subscribed on (re)connect
      if (!subscriptionTopics.includes(topic)) {
        subscriptionTopics.push(topic)
      }
      log.error('[MQTT] Client not connected, topic queued for subscription:', topic)
    }
  } catch (err) {
    log.error('[MQTT] Error subscribing:', err)
  }
}

// Function to publish to a topic
const publish = (topic: string, message: string): void => {
  try {
    if (mqttClient?.connected) {
      mqttClient.publish(topic, message)
      publishTopics.push(topic)
      log.note('[MQTT] Published to topic:', topic, message)
    } else {
      log.error('[MQTT] Client not connected, cannot publish to:', topic)
    }
  } catch (err) {
    log.error('[MQTT] Error publishing:', err)
  }
}

// Function to send data (alias for publish)
const send = (data: string): void => {
  try {
    if (mqttClient?.connected) {
      const topic = `DEJA/${layoutId}/broadcast`
      mqttClient.publish(topic, data)
      log.note('[MQTT] Sent data to topic:', topic, data)
    } else {
      log.error('[MQTT] Client not connected, cannot send data')
    }
  } catch (err) {
    log.error('[MQTT] Error sending:', err)
  }
}

export const dejaMqtt = {
  connect,
  disconnect,
  getConnectionState,
  isConnected,
  publish,
  send,
  subscribe,
}

export default dejaMqtt
