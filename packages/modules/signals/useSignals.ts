import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import { slugify } from '@repo/utils'
import type { Signal, SignalAspect, SignalInput } from './types'

function normalizePin(pin?: number | string | null): number | undefined {
  if (pin === undefined || pin === null || pin === '') {
    return undefined
  }
  const parsed = typeof pin === 'string' ? parseInt(pin, 10) : pin
  return Number.isFinite(parsed as number) ? Number(parsed) : undefined
}

const VALID_SIGNAL_SORT_FIELDS = new Set(['name', 'device', 'aspect'])
const DEFAULT_SIGNAL_SORT = 'name'

function validSignalSortField(field: string | undefined): string {
  return field && VALID_SIGNAL_SORT_FIELDS.has(field) ? field : DEFAULT_SIGNAL_SORT
}

export const useSignals = () => {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
  const sortBy = useStorage<string[]>('@DEJA/prefs/signals/Sort', ['name'])

  const signalsCol = () => {
    if (!layoutId.value) return null
    const sortField = validSignalSortField(sortBy.value?.[0])
    return query(collection(db, `layouts/${layoutId.value}/signals`), orderBy(sortField))
  }

  function getSignals() {
    return useCollection<Signal>(signalsCol, { ssrKey: 'signals' })
  }

  async function getSignal(id: string): Promise<Signal | undefined> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return undefined
    }
    try {
      const docRef = doc(db, `layouts/${layoutId.value}/signals`, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as SignalInput
        return {
          ...data,
          id: docSnap.id,
        }
      }
    } catch (error) {
      console.error('Error fetching signal:', error)
    }
    return undefined
  }

  async function setSignal(signalId: string, signal: SignalInput): Promise<boolean> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return false
    }

    if (!signal) {
      console.error('Signal data is not provided')
      return false
    }

    try {
      const id = signalId || slugify(`${signal.device || 'device'}-${signal.name || 'signal'}`)
      const payload: SignalInput & { id: string } = {
        ...signal,
        id,
        red: normalizePin(signal.red),
        yellow: normalizePin(signal.yellow),
        green: normalizePin(signal.green),
        aspect: signal.aspect ?? null,
        commonAnode: Boolean(signal.commonAnode),
      }

      await setDoc(doc(db, `layouts/${layoutId.value}/signals`, id), {
        ...payload,
        timestamp: serverTimestamp(),
      }, { merge: true })
      return true
    } catch (error) {
      console.error('Error saving signal:', error)
      return false
    }
  }

  async function deleteSignal(signalId: string): Promise<void> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return
    }

    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/signals`, signalId))
    } catch (error) {
      console.error('Error deleting signal:', error)
    }
  }

  async function setSignalAspect(signalId: string, aspect: SignalAspect): Promise<void> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return
    }
    if (!signalId) {
      console.error('Signal ID is required to set aspect')
      return
    }
    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/signals`, signalId), {
        aspect: aspect ?? null,
        timestamp: serverTimestamp(),
      }, { merge: true })
    } catch (error) {
      console.error('Error setting signal aspect:', error)
    }
  }

  return {
    deleteSignal,
    getSignal,
    getSignals,
    setSignal,
    setSignalAspect,
    signalsCol,
  }
}

export default useSignals
