import { computed, ref, watch, onUnmounted } from 'vue'
import { isObject, useStorage, useWebSocket } from '@vueuse/core'
import type { LogEntry } from './types'
import { defuaultEntry, dccMessages} from './constants'


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

export function useDccLog(isEnabled: boolean) {
  if (!isEnabled) {
    return {
      log: ref<LogEntry[]>([]),
      append: (_entry: string) => {},
    }
  }
  const wshost = useStorage('@DEJA/pref/ws-host', getDefaultWsHost())
  const dccRegex = /<\*\s(.*?)\s\*>/

  const log = ref<LogEntry[]>([])
  // WebSocket connection
  const wsUrl = computed(() => resolveWsUrl(wshost.value))
  const { data } = useWebSocket(`ws://${wshost.value}/`)

  function append(entry: string) {
    console.log('append', entry, log.value)
    log.value = [...log.value, parseEntry(entry)]
    console.log('appended', log.value)
  }

  function parseEntry(entry: string) {
    const { action, payload } = JSON.parse(entry)
    let formattedEntry = { ...defuaultEntry, id: Date.now(), action, payload }
    if (action === 'broadcast' && !isObject(payload)) {
      // parse message
      const dcc =
        action === 'broadcast' &&
        !isObject(payload) &&
        dccMessages.find((m) => m.key === payload?.charAt(1))
      const match = payload && payload?.match(dccRegex)
      formattedEntry = {
        ...formattedEntry,
        payload: match?.[1] || payload,
        ...dcc,
      }
    }
    return formattedEntry
  }


  watch(data, (newData) => {
    append(newData)
  })

  return {
    log,
    append,
  }
}

export default useDccLog
