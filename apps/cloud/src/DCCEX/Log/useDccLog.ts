import { ref } from 'vue'
import { createGlobalState, isObject } from '@vueuse/core'
import type { LogEntry } from './types'
import { defuaultEntry, dccMessages} from './constants'

export function useDccLog() {
  const dccRegex = /<\*\s(.*?)\s\*>/

  const useLogState = createGlobalState(() => {
    const log = ref<LogEntry[]>([])

    function append(entry: string) {
      console.log('append', entry, log.value)
      log.value = [...log.value, parseEntry(entry)]
      console.log('appended', log.value)
    }

    return { log, append }
  })

  const logState = useLogState()

  function parseEntry(entry: string) {
    const { action, payload } = JSON.parse(entry)
    console.log('parseEntry', isObject(payload), payload)
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

  return {
    parseEntry,
    log: logState.log.value,
    append: logState.append,
  }
}

export default useDccLog
