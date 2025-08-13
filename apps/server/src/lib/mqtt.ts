import mqtt from 'mqtt'
import { log } from '../utils/logger.js'

const layoutId = process.env.LAYOUT_ID
const mqttBroker = process.env.VITE_MQTT_BROKER || 'mqtt://localhost'
const mqttPort = process.env.VITE_MQTT_PORT || '1883'
const subscriptionTopics: string[] = []
const publishTopics: string[] = []

let mqttClient: mqtt.MqttClient | null = null
let isConnecting = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 3
let hasReachedMaxAttempts = false

function handleConnect(): void {
  try {
    if (mqttClient) {
      log.start('MQTT client connected', layoutId)
      reconnectAttempts = 0 // Reset reconnect attempts on successful connection
      hasReachedMaxAttempts = false // Reset max attempts flag
      isConnecting = false
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
  isConnecting = false
  
  // Check if this is a connection refused error
  if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
    log.error('MQTT broker not available. Please check your MQTT configuration or disable MQTT.')
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      log.error('Max MQTT reconnection attempts reached. Stopping reconnection attempts.')
      hasReachedMaxAttempts = true
      return
    }
  }
}

function handleDisconnect(): void {
  log.note('MQTT client disconnected')
  isConnecting = false
}

function handleReconnect(): void {
  if (hasReachedMaxAttempts) {
    log.error('MQTT reconnection blocked - max attempts reached. Please restart server to try again.')
    return
  }
  
  reconnectAttempts++
  log.note('MQTT client reconnecting...', `Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
  
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    log.error('Max MQTT reconnection attempts reached. Stopping reconnection attempts.')
    hasReachedMaxAttempts = true
    // Disconnect the client to stop further attempts
    if (mqttClient) {
      mqttClient.end(true) // Force disconnect
      mqttClient = null
    }
    return
  }
}

function handleMessage(topic: string, message: Buffer): void {
  try {
    log.log('MQTT message received:', topic, message.toString())
  } catch (error) {
    log.error('MQTT Error in onMessage:', error)
  }
}

// Function to connect to MQTT broker
const connect = (): void => {
  try {
    if (isConnecting) {
      log.note('MQTT connection already in progress, skipping...')
      return
    }
    
    if (hasReachedMaxAttempts) {
      log.error('MQTT connection blocked - max attempts reached. Please restart server to try again.')
      return
    }
    
    if (!mqttBroker || !mqttPort) {
      log.error('MQTT broker or port not specified')
      return
    }
    
    log.note('Connecting to MQTT broker:', mqttBroker, 'port:', mqttPort)
    isConnecting = true
    
    // Parse the broker URL to determine protocol and host
    let brokerUrl = mqttBroker
    let options: any = { 
      port: parseInt(mqttPort),
      reconnectPeriod: 0, // Disable automatic reconnection - we'll handle it manually
      connectTimeout: 10000,  // 10 seconds
      maxReconnectAttempts: 3 // Disable automatic reconnection
    }
    
    // If using WebSocket Secure (wss://), we need to handle it differently
    if (brokerUrl.startsWith('wss://')) {
      // For WebSocket connections, use the full URL
      brokerUrl = `${brokerUrl}:${mqttPort}`
      options = {
        ...options,
        protocol: 'wss'
      }
    } else if (brokerUrl.startsWith('ws://')) {
      // For WebSocket connections, use the full URL
      brokerUrl = `${brokerUrl}:${mqttPort}`
      options = {
        ...options,
        protocol: 'ws'
      }
    }
    
    mqttClient = mqtt.connect(brokerUrl, options)

    // https://github.com/mqttjs/MQTT.js#event-connect
    mqttClient.on('connect', () => {
      isConnecting = false
      handleConnect()
    })

    // https://github.com/mqttjs/MQTT.js#event-error
    mqttClient.on('error', (error) => {
      isConnecting = false
      handleError(error)
    })

    // https://github.com/mqttjs/MQTT.js#event-disconnect
    mqttClient.on('disconnect', () => {
      isConnecting = false
      handleDisconnect()
    })

    // https://github.com/mqttjs/MQTT.js#event-reconnect
    mqttClient.on('reconnect', handleReconnect)
    
    // https://github.com/mqttjs/MQTT.js#event-close
    mqttClient.on('close', () => {
      log.note('MQTT connection closed')
      isConnecting = false
    })
    
    // https://github.com/mqttjs/MQTT.js#event-offline
    mqttClient.on('offline', () => {
      log.note('MQTT client went offline')
      isConnecting = false
    })

    // https://github.com/mqttjs/MQTT.js#event-message
    mqttClient.on('message', handleMessage)
    
  } catch (err) {
    isConnecting = false
    log.error('MQTT Error connecting:', err)
  }
}

// Function to disconnect from MQTT broker
const disconnect = (): void => {
  try {
    if (mqttClient) {
      mqttClient.end()
      mqttClient = null
      isConnecting = false
      reconnectAttempts = 0
      hasReachedMaxAttempts = false
      log.note('MQTT client disconnected')
    }
  } catch (err) {
    log.error('MQTT Error disconnecting:', err)
  }
}

// Function to reset connection attempts (useful for testing)
const resetConnectionAttempts = (): void => {
  reconnectAttempts = 0
  hasReachedMaxAttempts = false
  isConnecting = false
  log.note('MQTT connection attempts reset')
}

// Function to subscribe to a topic
const subscribe = (topic: string): void => {
  try {
    if (mqttClient && mqttClient.connected) {
      mqttClient.subscribe(topic)
      subscriptionTopics.push(topic)
      log.note('Subscribed to topic:', topic)
    } else {
      log.error('MQTT client not connected, cannot subscribe to:', topic)
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
      const topic = `${layoutId}/broadcast`
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
  resetConnectionAttempts,
}

export default dejaMqtt
