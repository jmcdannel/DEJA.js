import { ref, onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'
import type { ConnectionStatus, ConnectionType } from '@capacitor/network'

export function useNetworkStatus() {
  const isConnected = ref(true)
  const connectionType = ref<ConnectionType>('unknown')

  let listenerHandle: Awaited<ReturnType<typeof Network.addListener>> | null = null

  function updateStatus(status: ConnectionStatus) {
    isConnected.value = status.connected
    connectionType.value = status.connectionType
  }

  onMounted(async () => {
    if (!Capacitor.isNativePlatform()) return

    const status = await Network.getStatus()
    updateStatus(status)

    listenerHandle = await Network.addListener('networkStatusChange', updateStatus)
  })

  onUnmounted(() => {
    listenerHandle?.remove()
  })

  return {
    isConnected,
    connectionType,
  }
}
