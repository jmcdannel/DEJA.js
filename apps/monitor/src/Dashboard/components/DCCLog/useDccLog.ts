import { ref, watch } from 'vue'
import { isObject, useStorage, useWebSocket } from '@vueuse/core'
import type { LogEntry } from './types'
import { defuaultEntry, dccMessages} from './constants'

export function useDccLog(isEnabled: boolean) {
  if (!isEnabled) {
    return {
      log: ref<LogEntry[]>([]),
      append: (_entry: string) => {},
    }
  }
  const wshost = useStorage('@DEJA/pref/ws-host', '192.168.86.22:8082')
  const dccRegex = /<\*\s(.*?)\s\*>/

  const log = ref<LogEntry[]>([])
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
