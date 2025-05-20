import { ref } from 'vue'
import { createGlobalState, isObject } from '@vueuse/core'

export function useDccLog() {
  const dccRegex = /<\*\s(.*?)\s\*>/

  const defuaultDcc = {
    color: 'gray',
    icon: 'mdi-information',
  }
  const defuaultEntry = {
    color: 'indogo',
    icon: 'mdi-information',
  }

  const dccMessages = [
    {
      key: '*',
      action: 'Status',
      color: 'green',
      icon: 'mdi-information',
    },
    {
      key: 'l',
      action: 'Locomotive',
      color: 'yellow',
      icon: 'mdi-train',
    },
    {
      key: 'p',
      action: 'Power',
      color: 'red',
      icon: 'mdi-power',
    },
    {
      key: 'H',
      action: 'Turnout',
      color: 'blue',
      icon: 'mdi-directions-fork',
    },
    {
      key: 'Y',
      action: 'Accessory',
      color: 'purple',
      icon: 'mdi-lightbulb',
    },
  ]
  const useLogState = createGlobalState(() => {
    const log = ref([])

    function append(entry) {
      console.log('append', entry, log.value)
      log.value = [...log.value, parseEntry(entry)]
      console.log('appended', log.value)
    }

    return { log, append }
  })

  const logState = useLogState()

  function parseEntry(entry) {
    const { action, payload } = JSON.parse(entry)
    console.log('parseEntry', isObject(payload), payload)
    let formattedEntry = { id: Date.now(), action, payload, ...defuaultEntry }
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
