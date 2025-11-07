import { onUnmounted, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore'
import { db } from '@repo/firebase-config'

export function useLayoutLogListeners() {
  const layoutId = useStorage('@DEJA/layoutId', '')
  const turnoutChanges = ref<DocumentData[]>([])
  const effectChanges = ref<DocumentData[]>([])
  const signalChanges = ref<DocumentData[]>([])
  const sensorChanges = ref<DocumentData[]>([])

  let turnoutUnsubscribe: (() => void) | null = null
  let effectUnsubscribe: (() => void) | null = null
  let signalUnsubscribe: (() => void) | null = null
  let sensorUnsubscribe: (() => void) | null = null

  const cleanup = () => {
    if (turnoutUnsubscribe) {
      turnoutUnsubscribe()
      turnoutUnsubscribe = null
    }
    if (effectUnsubscribe) {
      effectUnsubscribe()
      effectUnsubscribe = null
    }
    if (signalUnsubscribe) {
      signalUnsubscribe()
      signalUnsubscribe = null
    }
    if (sensorUnsubscribe) {
      sensorUnsubscribe()
      sensorUnsubscribe = null
    }
  }

  const listenForLayout = (layout: string) => {
    turnoutUnsubscribe = onSnapshot(collection(db, `layouts/${layout}/turnouts`), snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          turnoutChanges.value.push({ id: change.doc.id, ...change.doc.data() })
        }
      })
    })

    effectUnsubscribe = onSnapshot(collection(db, `layouts/${layout}/effects`), snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          effectChanges.value.push({ id: change.doc.id, ...change.doc.data() })
        }
      })
    })

    signalUnsubscribe = onSnapshot(collection(db, `layouts/${layout}/signals`), snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          signalChanges.value.push({ id: change.doc.id, ...change.doc.data() })
        }
      })
    })

    sensorUnsubscribe = onSnapshot(collection(db, `layouts/${layout}/sensors`), snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          sensorChanges.value.push({ id: change.doc.id, ...change.doc.data() })
        }
      })
    })
  }

  watch(
    layoutId,
    newLayoutId => {
      cleanup()

      if (newLayoutId && newLayoutId.trim() !== '') {
        listenForLayout(newLayoutId)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    cleanup()
  })

  return {
    layoutId,
    turnoutChanges,
    effectChanges,
    signalChanges,
    sensorChanges,
  }
}
