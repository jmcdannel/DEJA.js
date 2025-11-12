import { computed, ref, watch, onUnmounted } from 'vue'
import { useWebSocket } from '@vueuse/core'
import { useStorage } from '@vueuse/core'

export interface SerialMessage {
  id: string
  deviceId: string
  data: string
  direction: 'incoming' | 'outgoing'
  timestamp: string
}

const SERIAL_MESSAGE_ACTIONS = ['serial-data']

function getDefaultWsHost(): string {
  if (typeof window === 'undefined') {
    return 'localhost:8082'
  }

  return window.location.host || 'localhost:8082'
}

function resolveWsUrl(host: string | undefined): string | undefined {
  if (!host) {
    return undefined
  }

  const trimmed = host.trim()
  if (!trimmed) {
    return undefined
  }

  if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) {
    return trimmed
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    return `${protocol}${trimmed}`
  }

  return `ws://${trimmed}`
}

function createMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useDeviceSerialMonitor(deviceId: string) {
  const wshost = useStorage('@DEJA/pref/ws-host', getDefaultWsHost())
  const enabled = ref(true)
  const messages = ref<SerialMessage[]>([])
  const maxMessages = ref(100) // Limit messages to prevent memory issues
  const isSubscribed = ref(false)

  // WebSocket connection
  const wsUrl = computed(() => resolveWsUrl(wshost.value))

  console.log('[DeviceMonitor] WebSocket URL:', wsUrl.value)
  const { data, status, open, close, send } = useWebSocket(wsUrl, {
    autoReconnect: {
      delay: 1000,
      retries: 10
    }
  })
  
  // Subscribe to device
  function subscribe() {
    if (status.value === 'OPEN' && deviceId && !isSubscribed.value) {
      const subscribeMessage = {
        action: 'subscribe-device',
        deviceId: deviceId
      }

      // Send subscription message
      send(JSON.stringify(subscribeMessage))

      console.log(`[DeviceMonitor] Subscribing to device: ${deviceId}`)
    }
  }

  // Unsubscribe from device
  function unsubscribe() {
    if (status.value === 'OPEN' && deviceId && isSubscribed.value) {
      const unsubscribeMessage = {
        action: 'unsubscribe-device',
        deviceId: deviceId
      }

      // Send unsubscription message
      send(JSON.stringify(unsubscribeMessage))

      isSubscribed.value = false
      console.log(`[DeviceMonitor] Unsubscribed from device: ${deviceId}`)
    }
  }
  
  // Add a serial message
  function addMessage(message: SerialMessage) {
    messages.value.unshift(message)

    // Limit messages to prevent memory issues
    if (messages.value.length > maxMessages.value) {
      messages.value = messages.value.slice(0, maxMessages.value)
    }
  }
  
  // Clear messages
  function clearMessages() {
    messages.value = []
  }
  
  // Watch for WebSocket messages
  watch(data, (newData) => {
    console.log('[DeviceMonitor] Received WebSocket data:', newData)
    if (!newData || !enabled.value) return
    
    try {
      const message = JSON.parse(newData)
      
      // Handle subscription confirmation
      if (message.action === 'device-subscribed' && message.payload?.deviceId === deviceId) {
        isSubscribed.value = true
        console.log(`[DeviceMonitor] Successfully subscribed to device: ${deviceId}`)
        return
      }

      // Handle unsubscription confirmation
      if (message.action === 'device-unsubscribed' && message.payload?.deviceId === deviceId) {
        console.log(`[DeviceMonitor] Successfully unsubscribed from device: ${deviceId}`)
        isSubscribed.value = false
        return
      }

      // Handle serial data messages
      if (SERIAL_MESSAGE_ACTIONS.includes(message.action) && message.payload?.deviceId === deviceId) {
        const serialMessage: SerialMessage = {
          id: createMessageId(),
          deviceId: message.payload.deviceId,
          data: String(message.payload.data ?? ''),
          direction: (message.payload.direction as 'incoming' | 'outgoing') || 'incoming',
          timestamp: message.payload.timestamp || new Date().toISOString()
        }

        addMessage(serialMessage)
        return
      }
      
      // Handle general broadcast messages (ignore these for device-specific monitors)
      if (!SERIAL_MESSAGE_ACTIONS.includes(message.action)) {
        // const serialMessage: SerialMessage = {
        //   id: createMessageId(),
        //   deviceId: 'broadcast',
        //   data: `[Broadcast] ${JSON.stringify(message)}`,
        //   direction: 'incoming',
        //   timestamp: new Date().toISOString()
        // }

        // addMessage(serialMessage)
        return
      }
      
    } catch (error) {
      console.error('[DeviceMonitor] Error parsing WebSocket message:', error)
    }
  })
  
  // Watch WebSocket status and auto-subscribe when connected
  watch(status, (newStatus) => {
    if (newStatus === 'OPEN' && enabled.value && deviceId) {
      // Small delay to ensure connection is fully established
      setTimeout(() => {
        subscribe()
      }, 100)
    } else if (newStatus === 'CLOSED') {
      isSubscribed.value = false
    }
  }, { immediate: true })

  // Watch enabled state
  watch(enabled, (newEnabled) => {
    if (newEnabled && status.value === 'OPEN') {
      subscribe()
    } else if (!newEnabled) {
      unsubscribe()
    }
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    if (isSubscribed.value) {
      unsubscribe()
    }
    if (status.value === 'OPEN') {
      close()
    }
  })
  
  return {
    // State
    enabled,
    messages,
    status,
    isSubscribed,
    maxMessages,
    
    // Actions
    subscribe,
    unsubscribe,
    addMessage,
    clearMessages,
    open,
    close,
    send
  }
} 