import { ref, readonly, onUnmounted } from 'vue'
import { ref as rtdbRef, onValue, type Unsubscribe } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'

const log = createLogger('Connection')

/** Shared reactive connection state (singleton across the app) */
const isFirebaseConnected = ref(true)
const isBrowserOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
const isOnline = ref(true)
const wasOffline = ref(false)

let firebaseUnsubscribe: Unsubscribe | undefined
let listenerCount = 0

function startFirebaseListener() {
  if (firebaseUnsubscribe) return

  const connectedRef = rtdbRef(rtdb, '.info/connected')
  firebaseUnsubscribe = onValue(connectedRef, (snapshot) => {
    const connected = snapshot.val() === true
    isFirebaseConnected.value = connected

    if (connected) {
      log.debug('Firebase RTDB connected')
    } else {
      log.debug('Firebase RTDB disconnected')
    }

    updateOnlineStatus()
  })
}

function stopFirebaseListener() {
  if (firebaseUnsubscribe) {
    firebaseUnsubscribe()
    firebaseUnsubscribe = undefined
  }
}

function handleOnline() {
  isBrowserOnline.value = true
  updateOnlineStatus()
}

function handleOffline() {
  isBrowserOnline.value = false
  updateOnlineStatus()
}

function updateOnlineStatus() {
  const previous = isOnline.value
  isOnline.value = isBrowserOnline.value && isFirebaseConnected.value

  if (!isOnline.value && previous) {
    wasOffline.value = true
    log.debug('Connection lost')
  }

  if (isOnline.value && !previous) {
    log.debug('Connection restored')
  }
}

/**
 * Monitors Firebase RTDB connectivity and browser online status.
 *
 * Uses Firebase `.info/connected` for real-time database connectivity and
 * the browser `navigator.onLine` API as a secondary signal.
 *
 * The underlying state is a singleton — multiple callers share the same refs.
 */
export function useConnectionStatus() {
  listenerCount++

  if (listenerCount === 1) {
    startFirebaseListener()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }

  onUnmounted(() => {
    listenerCount--
    if (listenerCount === 0) {
      stopFirebaseListener()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  /** Reset the wasOffline flag (call after flushing queued commands) */
  function acknowledgeReconnection() {
    wasOffline.value = false
  }

  return {
    /** Whether the app is fully connected (browser online + Firebase connected) */
    isOnline: readonly(isOnline),
    /** Whether the browser reports being online */
    isBrowserOnline: readonly(isBrowserOnline),
    /** Whether Firebase RTDB is connected */
    isFirebaseConnected: readonly(isFirebaseConnected),
    /** Whether the app has been offline at any point since last acknowledgment */
    wasOffline: readonly(wasOffline),
    /** Clear the wasOffline flag after handling reconnection */
    acknowledgeReconnection,
  }
}
