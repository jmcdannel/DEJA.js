import { ref, watch } from 'vue'
import { isObject, useWebSocket } from '@vueuse/core'
import { createLogger } from '@repo/utils'
import { useWsConnection } from '../../../composables/useWsConnection'
import type { LogEntry } from './types'
import { defuaultEntry, dccMessages } from './constants'

const logger = createLogger('DccLog')

export function useDccLog(isEnabled: boolean) {
  if (!isEnabled) {
    return {
      log: ref<LogEntry[]>([]),
      status: ref('CLOSED'),
      append: (_entry: string) => {},
    }
  }
  const { wsUrl } = useWsConnection()
  const dccRegex = /<\*\s(.*?)\s\*>/

  const log = ref<LogEntry[]>([])
  const { data, status } = useWebSocket(wsUrl, {
    autoReconnect: {
      delay: 1000,
      retries: 10,
    },
  })

  function append(entry: string) {
    logger.debug('append', entry, log.value)
    const formattedEntry = parseEntry(entry)
    if (formattedEntry) {
      log.value = [...log.value, formattedEntry]
      logger.debug('appended', log.value)
    }
    }

  function parseEntry(entry: string) {
    const { action, payload } = JSON.parse(entry)
    let formattedEntry = { ...defuaultEntry, id: Date.now(), action, payload }
    if (action === 'dcc' && !isObject(payload)) {
      // parse message
      const dcc =
        action === 'dcc' &&
        !isObject(payload) &&
        dccMessages.find((m) => m.key === payload?.charAt(1))
      const match = payload && payload?.match(dccRegex)
      formattedEntry = {
        ...formattedEntry,
        payload: match?.[1] || payload,
        ...dcc,
      }
      return formattedEntry
    } 
      return null
    
      
  }


  watch(data, (newData) => {
    append(newData)
  })

  return {
    log,
    status,
    append,
  }
}

export default useDccLog
