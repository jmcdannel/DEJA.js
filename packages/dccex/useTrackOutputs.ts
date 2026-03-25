import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { doc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import { db } from '@repo/firebase-config'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import type { TrackOutput, TrackOutputLetter } from './types'

const log = createLogger('TrackOutputs')

export interface DeviceTrackOutputs {
  trackOutputs?: Record<string, TrackOutput>
  maxOutputs?: number
}

export const useTrackOutputs = (deviceId: () => string | null) => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

  const deviceDoc = useDocument<DeviceTrackOutputs>(() => {
    const id = deviceId()
    if (!layoutId.value || !id) return null
    return doc(db, `layouts/${layoutId.value}/devices`, id)
  })

  const trackOutputs = computed(() => deviceDoc.value?.trackOutputs ?? {})

  const maxOutputs = computed(() => deviceDoc.value?.maxOutputs ?? 2)

  const outputLetters = computed<TrackOutputLetter[]>(() => {
    const letters: TrackOutputLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    return letters.slice(0, maxOutputs.value)
  })

  async function sendTrackPower(
    targetDeviceId: string,
    output: string,
    power: boolean,
  ): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }
    try {
      const dccCommandsRef = ref(rtdb, `dccCommands/${layoutId.value}`)
      const newCommandRef = push(dccCommandsRef)
      await set(newCommandRef, {
        action: 'trackPower',
        payload: JSON.stringify({ deviceId: targetDeviceId, output, power }),
        timestamp: serverTimestamp(),
      })
    } catch (error) {
      log.error('Error sending track power command:', error)
    }
  }

  return {
    deviceDoc,
    maxOutputs,
    outputLetters,
    sendTrackPower,
    trackOutputs,
  }
}

export default useTrackOutputs
