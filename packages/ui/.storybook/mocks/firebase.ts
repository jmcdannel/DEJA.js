/**
 * Mock for vuefire — stubs useDocument, useCollection, useCurrentUser,
 * and useFirestore so components render without a live Firebase backend.
 *
 * Wired in via Vite resolve alias in .storybook/main.ts.
 * Do NOT import from vuefire here — that would be circular.
 */

import { fn } from '@storybook/test'
import { ref, computed } from 'vue'

// ---------------------------------------------------------------------------
// useDocument — returns a reactive ref, defaulting to null
// ---------------------------------------------------------------------------
export const useDocument = fn((_docRef?: unknown, _options?: unknown) => {
  return ref(null)
}).mockName('useDocument')

// ---------------------------------------------------------------------------
// useCollection — returns a reactive ref wrapping an empty array
// ---------------------------------------------------------------------------
export const useCollection = fn((_colRef?: unknown, _options?: unknown) => {
  return ref([])
}).mockName('useCollection')

// ---------------------------------------------------------------------------
// useCurrentUser — returns a ref to a mock user (or null)
// ---------------------------------------------------------------------------
const mockUser = {
  uid: 'mock-user-uid-123',
  email: 'user@example.com',
  displayName: 'Mock User',
  photoURL: null,
  emailVerified: true,
}

export const useCurrentUser = fn(() => {
  return ref(mockUser)
}).mockName('useCurrentUser')

// ---------------------------------------------------------------------------
// useFirestore — returns a mock db object
// ---------------------------------------------------------------------------
export const useFirestore = fn(() => {
  return {} as unknown
}).mockName('useFirestore')

// ---------------------------------------------------------------------------
// VueFire plugin stubs (no-ops to prevent import errors)
// ---------------------------------------------------------------------------
export const VueFire = {
  install: fn().mockName('VueFire.install'),
}

export const VueFireAuth = fn(() => ({})).mockName('VueFireAuth')

// ---------------------------------------------------------------------------
// useFirebaseAuth — returns null auth instance (safe no-op for signOut)
// ---------------------------------------------------------------------------
export const useFirebaseAuth = fn(() => {
  return null
}).mockName('useFirebaseAuth')

// ---------------------------------------------------------------------------
// getCurrentUser — async version (used server-side / in guards)
// ---------------------------------------------------------------------------
export const getCurrentUser = fn(async () => {
  return mockUser
}).mockName('getCurrentUser')
