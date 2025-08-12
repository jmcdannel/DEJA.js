import { ref, watch, onUnmounted } from 'vue'
import { useWebSocket } from '@vueuse/core'
import { useStorage } from '@vueuse/core'

export interface SerialMessage {
  id: string
  deviceId: string
  data: string
  direction: 'incoming' | 'outgoing'
  timestamp: string
}

export function useDeviceSerialMonitor(deviceId: string) {
  const wshost = useStorage('@DEJA/pref/ws-host', '192.168.86.22:8082')
  const enabled = ref(true)
  const messages = ref<SerialMessage[]>([])
  const maxMessages = ref(100) // Limit messages to prevent memory issues
  const isSubscribed = ref(false)
  
  // WebSocket connection
  const { data, status, open, close, send } = useWebSocket(`ws://${wshost.value}/`)
  
  // Subscribe to device
  function subscribe() {
    if (status.value === 'OPEN' && deviceId) {
      const subscribeMessage = {
        action: 'subscribe-device',
        deviceId: deviceId
      }
      
      // Send subscription message
      send(JSON.stringify(subscribeMessage))
      
      isSubscribed.value = true
      console.log(`[DeviceMonitor] Unsubscribed from device: ${deviceId}`)
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
    if (!newData || !enabled.value) return
    
    try {
      const message = JSON.parse(newData)
      
      // Handle subscription confirmation
      if (message.action === 'device-subscribed' && message.payload?.deviceId === deviceId) {
        console.log(`[DeviceMonitor] Successfully subscribed to device: ${deviceId}`)
        return
      }
      
      // Handle unsubscription confirmation
      if (message.action === 'device-unsubscribed' && message.payload?.deviceId === deviceId) {
        console.log(`[DeviceMonitor] Successfully unsubscribed from device: ${deviceId}`)
        return
      }
      
      // Handle serial data messages
      if (message.action === 'serial-data' && message.payload?.deviceId === deviceId) {
        const serialMessage: SerialMessage = {
          id: Date.now().toString(),
          deviceId: message.payload.deviceId,
          data: message.payload.data,
          direction: message.payload.direction,
          timestamp: message.payload.timestamp
        }
        
        addMessage(serialMessage)
        return
      }
      
      // Handle general broadcast messages (ignore these for device-specific monitors)
      if (message.action !== 'serial-data') {
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
  })
  
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