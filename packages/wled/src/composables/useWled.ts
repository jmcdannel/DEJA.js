import { ref, readonly, onUnmounted } from 'vue'
import { WledClient } from '../client/WledClient'
import type { WledState, WledInfo } from '../types/state'

/**
 * Vue composable for connecting to a WLED device.
 * Wraps WledClient with reactive state.
 */
export function useWled(host: string, port?: number) {
  const client = new WledClient(host, port)
  const state = ref<WledState | null>(null)
  const info = ref<WledInfo | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)

  client.onStateChange((newState) => {
    state.value = newState
  })

  client.onDisconnect(() => {
    isConnected.value = false
  })

  async function connect() {
    try {
      error.value = null
      await client.connect()
      isConnected.value = true
      const [fetchedState, fetchedInfo] = await Promise.all([
        client.getState(),
        client.getInfo(),
      ])
      state.value = fetchedState
      info.value = fetchedInfo
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Connection failed'
      isConnected.value = false
    }
  }

  function disconnect() {
    client.disconnect()
    isConnected.value = false
  }

  function setState(partial: Partial<WledState>) {
    client.setState(partial)
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    state: readonly(state),
    info: readonly(info),
    isConnected: readonly(isConnected),
    error: readonly(error),
    connect,
    disconnect,
    setState,
    client,
  }
}
