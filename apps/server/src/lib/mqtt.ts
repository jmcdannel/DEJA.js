import mqtt from 'mqtt'
import { dejaEmitter, type BroadcastMessage } from '../broadcast'
import { log } from '../utils/logger.js'

const layoutId = process.env.LAYOUT_ID
const mqttBroker = process.env.VITE_MQTT_BROKER || 'mqtt://localhost'
const mqttPort = process.env.VITE_MQTT_PORT || '1883'
const subscriptionTopics: string[] = []
const publishTopics: string[] = []

/** Connection states for the MQTT client */
type MqttConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'disconnecting'

let mqttClient: mqtt.MqttClient | null = null
let connectionState: MqttConnectionState = 'disconnected'
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

/** Backoff configuration */
const INITIAL_BACKOFF_MS = 1000
const DEFAULT_MAX_BACKOFF_MS = 60_000
const maxBackoffMs = Number(process.env.MQTT_MAX_BACKOFF_MS) || DEFAULT_MAX_BACKOFF_MS

/** Calculate the next backoff delay using exponential backoff with a cap */
function getBackoffDelay(attempt: number): number {
  const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
  return Math.min(delay, maxBackoffMs)
}

/** Clear any pending reconnect timer */
function clearReconnectTimer(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

/** Schedule a reconnection attempt with exponential backoff */
function scheduleReconnect(): void {
  clearReconnectTimer()

  const delay = getBackoffDelay(reconnectAttempts)
  reconnectAttempts++
  connectionState = 'reconnecting'

  log.note(`[MQTT] Scheduling reconnect attempt ${reconnectAttempts} in ${delay / 1000}s`)

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    attemptReconnect()
  }, delay)
}

/** Attempt to reconnect to the MQTT broker */
function attemptReconnect(): void {
  if (connectionState === 'disconnecting' || connectionState === 'connected') {
    return
  }

  log.note(`[MQTT] Reconnect attempt ${reconnectAttempts}...`)
  connectionState = 'reconnecting'

  // Clean up the old client before creating a new one
  if (mqttClient) {
    try {
      mqttClient.removeAllListeners()
      mqttClient.end(true)
    } catch {
      // Ignore cleanup errors
    }
    mqttClient = null
  }

  // Re-use the connect logic
  connectInternal()
}

function handleConnect(): void {
  try {
    if (mqttClient) {
      log.start('[MQTT] Client connected', layoutId)
      reconnectAttempts = 0
      connectionState = 'connected'
      clearReconnectTimer()

      subscriptionTopics.forEach((topic) => mqttClient?.subscribe(topic))
      publishTopics.forEach((topic) =>
        mqttClient?.publish(
          topic,
          JSON.stringify({ action: 'ack', payload: { layoutId } })
        )
      )
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

/** Internal connect logic shared by initial connect and reconnect */
function connectInternal(): void {
  try {
    if (!mqttBroker || !mqttPort) {
      log.error('[MQTT] Broker or port not specified')
      return
    }

    log.note('[MQTT] Connecting to broker:', mqttBroker, 'port:', mqttPort)
    connectionState = 'connecting'

    // Parse the broker URL to determine protocol and host
    let brokerUrl = mqttBroker
    const options: mqtt.IClientOptions = {
      port: parseInt(mqttPort),
      reconnectPeriod: 0, // Disable mqtt.js built-in reconnection — we handle it ourselves
      connectTimeout: 10_000,
    }

    // If using WebSocket Secure (wss://), we need to handle it differently
    if (brokerUrl.startsWith('wss://')) {
      brokerUrl = `${brokerUrl}:${mqttPort}`
      options.protocol = 'wss'
    } else if (brokerUrl.startsWith('ws://')) {
      brokerUrl = `${brokerUrl}:${mqttPort}`
      options.protocol = 'ws'
    }

    mqttClient = mqtt.connect(brokerUrl, options)

    mqttClient.on('connect', handleConnect)
    mqttClient.on('error', handleError)
    mqttClient.on('disconnect', handleDisconnect)
    mqttClient.on('close', handleClose)
    mqttClient.on('offline', handleOffline)
    mqttClient.on('message', handleMessage)
  } catch (err) {
    log.error('[MQTT] Error connecting:', err)
    connectionState = 'disconnected'
    scheduleReconnect()
  }
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

  // Subscribe to broadcast events from the event emitter
  dejaEmitter.onBroadcast(handleBroadcastEvent)

  reconnectAttempts = 0
  clearReconnectTimer()
  connectInternal()
}

// Function to disconnect from MQTT broker
const disconnect = (): void => {
  try {
    // Unsubscribe from broadcast events
    dejaEmitter.offBroadcast(handleBroadcastEvent)

    connectionState = 'disconnecting'
    clearReconnectTimer()
    reconnectAttempts = 0

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
      log.error('[MQTT] Client not connected, cannot subscribe to:', topic)
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
