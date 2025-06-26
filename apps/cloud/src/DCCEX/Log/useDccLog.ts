import { ref, watch } from 'vue'
import { isObject, useStorage, useWebSocket } from '@vueuse/core'
import type { LogEntry } from './types'
import { defuaultEntry, dccMessages} from './constants'

export function useDccLog(isEnabled: boolean) {
  console.log('useDccLog', isEnabled)
  if (!isEnabled) {
    return {
      append: (_entry: string) => {},
      log: ref<LogEntry[]>([]),
    }
  }
  const wshost = useStorage('@DEJA/pref/ws-host', '192.168.86.34:8082')
  const dccRegex = /<\*\s(.*?)\s\*>/

  const log = ref<LogEntry[]>([])
  const { status, data, send, open, close } = useWebSocket(`ws://${wshost.value}/`)

  function append(entry: string): void {
    console.log('append', entry, log.value)
    log.value = [...log.value, parseEntry(entry)]
    console.log('appended', log.value)
  }

  function parseEntry(entry: string): LogEntry {
    const { action, payload } = JSON.parse(entry)
    let formattedEntry = { ...defuaultEntry, action, id: Date.now(), payload }
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

  append('{"action":"web hook initialized","payload":{"serverId":"DEJA.js"}}')


  watch(data, (newData) => {
    append(newData)
  })

  return {
    append,
    close,
    data,
    log,
    open,
    send,
    status
  }
}

export default useDccLog
