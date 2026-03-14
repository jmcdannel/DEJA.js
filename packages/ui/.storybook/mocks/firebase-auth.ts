/**
 * Mock for firebase/auth — prevents the real Firebase Auth SDK from loading
 * in Storybook. Components like Signout.vue import signOut directly from
 * firebase/auth; this mock ensures no real auth connections are made.
 *
 * Wired in via Vite resolve alias in .storybook/main.ts.
 */

import { fn } from '@storybook/test'

export const signOut = fn().mockName('signOut').mockResolvedValue(undefined)
export const getAuth = fn().mockName('getAuth').mockReturnValue(null)
export const onAuthStateChanged = fn().mockName('onAuthStateChanged').mockReturnValue(() => {})
export const signInWithEmailAndPassword = fn().mockName('signInWithEmailAndPassword').mockResolvedValue({ user: null })
export const createUserWithEmailAndPassword = fn().mockName('createUserWithEmailAndPassword').mockResolvedValue({ user: null })
export const sendPasswordResetEmail = fn().mockName('sendPasswordResetEmail').mockResolvedValue(undefined)
export const GoogleAuthProvider = class {}
export const signInWithPopup = fn().mockName('signInWithPopup').mockResolvedValue({ user: null })
