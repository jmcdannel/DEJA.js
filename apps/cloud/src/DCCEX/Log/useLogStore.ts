// store.js
import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { useDccLog } from '@/DCCEX/Log/useDccLog'

export const useLogStore = createGlobalState(() => {
  const { parseEntry } = useDccLog()
  const log = ref([])

  function append(entry) {
    console.log('append', entry, log.value)
    log.value = [...log.value, parseEntry(entry)]
    console.log('appended', log.value)
  }

  return { log, append }
})

export default useLogStore
