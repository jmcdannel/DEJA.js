import { computed, type ComputedRef, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useLocos, type Loco, type Throttle } from '@repo/modules/locos'
import type { Command } from '../types'

export function useThrottleCommands(): ComputedRef<Command[]> {
  const router = useRouter()
  const layoutId = useStorage('@DEJA/layoutId', '')
  const { getLocos, getThrottles, acquireThrottle } = useLocos()
  const locos = getLocos() as unknown as Ref<Loco[]>
  const throttles = getThrottles() as unknown as Ref<Throttle[]>

  async function openThrottle(address: number) {
    await acquireThrottle(address)
    await router.push({ name: 'throttle', params: { address } })
  }

  async function stopAll() {
    if (!layoutId.value) return
    const list = throttles.value || []
    await Promise.all(
      list.map((t) =>
        setDoc(
          doc(db, `layouts/${layoutId.value}/throttles`, String(t.address)),
          { speed: 0, direction: false, timestamp: serverTimestamp() },
          { merge: true },
        ),
      ),
    )
  }

  function rosterLocoCommands(): Command[] {
    const list = locos.value || []
    return list.map((l) => ({
      id: `throttle.loco.${l.address}`,
      title: `Open throttle for ${l.name || `Loco ${l.address}`}`,
      description: `#${l.address}${l.meta?.roadname ? ` · ${l.meta.roadname}` : ''}`,
      icon: 'mdi-train',
      category: 'throttle' as const,
      keywords: [
        String(l.address),
        l.name || '',
        l.meta?.roadname || '',
      ].filter(Boolean),
      run: () => openThrottle(l.address),
    }))
  }

  const stopAllCommand: Command = {
    id: 'throttle.stop-all',
    title: 'Stop all throttles',
    description: 'Set every running throttle to speed 0',
    icon: 'mdi-stop',
    category: 'throttle',
    keywords: ['halt', 'zero'],
    run: stopAll,
  }

  return computed<Command[]>(() => [
    ...rosterLocoCommands(),
    stopAllCommand,
  ])
}
