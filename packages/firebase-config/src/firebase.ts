// @ts-nocheck
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const env = import.meta.env ?? {}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || `https://${env.VITE_FIREBASE_PROJECT_ID || 'demo'}-default-rtdb.firebaseio.com`,
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || ''
}

// Check if required config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Using console.warn directly here to avoid circular dependency with @repo/utils
  console.warn('[Firebase] Firebase configuration incomplete. Some environment variables may be missing.')
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const rtdb = getDatabase(firebaseApp)

export { getFirebaseStorage } from './storage'
