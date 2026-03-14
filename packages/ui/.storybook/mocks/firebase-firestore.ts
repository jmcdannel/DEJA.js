/**
 * Mock for firebase/firestore — prevents the real Firestore SDK from loading
 * in Storybook. Most firestore imports in UI components are type-only and
 * erased at build time, but this ensures any runtime imports are safe.
 *
 * Wired in via Vite resolve alias in .storybook/main.ts.
 */

import { fn } from '@storybook/test'

// Type re-exports (erased at compile time)
export type DocumentData = Record<string, unknown>
export type DocumentReference = unknown
export type CollectionReference = unknown
export type QuerySnapshot = unknown

// Runtime function stubs
export const collection = fn().mockName('collection')
export const doc = fn().mockName('doc')
export const getDoc = fn().mockName('getDoc').mockResolvedValue({ exists: () => false, data: () => null })
export const getDocs = fn().mockName('getDocs').mockResolvedValue({ docs: [], empty: true })
export const setDoc = fn().mockName('setDoc').mockResolvedValue(undefined)
export const updateDoc = fn().mockName('updateDoc').mockResolvedValue(undefined)
export const deleteDoc = fn().mockName('deleteDoc').mockResolvedValue(undefined)
export const onSnapshot = fn().mockName('onSnapshot').mockReturnValue(() => {})
export const query = fn().mockName('query')
export const where = fn().mockName('where')
export const orderBy = fn().mockName('orderBy')
export const limit = fn().mockName('limit')
export const serverTimestamp = fn().mockName('serverTimestamp').mockReturnValue(null)
export const getFirestore = fn().mockName('getFirestore').mockReturnValue({})
