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
import { slugify, createLogger } from '@repo/utils'
import type { Block, BlockInput } from './types'

const log = createLogger('Blocks')

const VALID_BLOCK_SORT_FIELDS = new Set(['name'])
const DEFAULT_BLOCK_SORT = 'name'

function validBlockSortField(field: string | undefined): string {
  return field && VALID_BLOCK_SORT_FIELDS.has(field) ? field : DEFAULT_BLOCK_SORT
}

export const useBlocks = () => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)
  const sortBy = useStorage<string[]>('@DEJA/prefs/blocks/Sort', ['name'])

  const blocksCol = () => {
    if (!layoutId.value) return null
    const sortField = validBlockSortField(sortBy.value?.[0])
    return query(collection(db, `layouts/${layoutId.value}/blocks`), orderBy(sortField))
  }

  function getBlocks() {
    return useCollection<Block>(blocksCol, { ssrKey: 'blocks' })
  }

  async function getBlock(id: string): Promise<Block | undefined> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return undefined
    }
    try {
      const docRef = doc(db, `layouts/${layoutId.value}/blocks`, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as BlockInput
        return {
          ...data,
          id: docSnap.id,
        }
      }
    } catch (error) {
      log.error('Error fetching block:', error)
    }
    return undefined
  }

  async function setBlock(blockId: string, block: BlockInput): Promise<boolean> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return false
    }

    if (!block) {
      log.error('Block data is not provided')
      return false
    }

    try {
      const id = blockId || slugify(block.name || 'block')
      const payload: BlockInput & { id: string } = {
        ...block,
        id,
        occupied: Boolean(block.occupied),
      }

      await setDoc(doc(db, `layouts/${layoutId.value}/blocks`, id), {
        ...payload,
        timestamp: serverTimestamp(),
      }, { merge: true })
      return true
    } catch (error) {
      log.error('Error saving block:', error)
      return false
    }
  }

  async function deleteBlock(blockId: string): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }

    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/blocks`, blockId))
    } catch (error) {
      log.error('Error deleting block:', error)
    }
  }

  async function setBlockOccupied(blockId: string, occupied: boolean): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }
    if (!blockId) {
      log.error('Block ID is required to set occupied state')
      return
    }
    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/blocks`, blockId), {
        occupied: Boolean(occupied),
        timestamp: serverTimestamp(),
      }, { merge: true })
    } catch (error) {
      log.error('Error setting block occupied state:', error)
    }
  }

  return {
    blocksCol,
    deleteBlock,
    getBlock,
    getBlocks,
    setBlock,
    setBlockOccupied,
  }
}

export default useBlocks
