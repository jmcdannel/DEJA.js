import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { rtdb } from '@repo/firebase-config'
import { ref as dbRef, onValue, off } from 'firebase/database'
import type { ServerStatus } from './types'

const serverStatus = ref<ServerStatus | null>(null)
let currentServerStatusRef: ReturnType<typeof dbRef> | null = null
let currentListener: ReturnType<typeof onValue> | null = null

export function useServerStatus() {
  const layoutId = useStorage('@DEJA/layoutId', '')

  const subscribeToServerStatus = () => {
    // Unsubscribe from previous listener if one exists
    if (currentServerStatusRef && currentListener) {
      off(currentServerStatusRef, 'value', currentListener)
      currentServerStatusRef = null
      currentListener = null
    }

    if (!layoutId.value) {
      serverStatus.value = null
      return
    }

    currentServerStatusRef = dbRef(rtdb, `serverStatus/${layoutId.value}`)
    currentListener = onValue(currentServerStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        serverStatus.value = snapshot.val() as ServerStatus
      } else {
        serverStatus.value = null
      }
    }, (error) => {
      console.error('Error fetching server status:', error)
      serverStatus.value = null
    })
  }

  // Watch for layoutId changes and re-subscribe
  watch(layoutId, () => {
    subscribeToServerStatus()
  }, { immediate: true })

  return {
    serverStatus,
  }
}
