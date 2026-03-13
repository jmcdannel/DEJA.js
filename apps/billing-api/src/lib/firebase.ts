import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL
  || `https://${process.env.VITE_FIREBASE_PROJECT_ID || 'demo'}-default-rtdb.firebaseio.com`

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount), databaseURL })
}

export const db = getFirestore()
export const rtdb = getDatabase()
export const auth = getAuth()
