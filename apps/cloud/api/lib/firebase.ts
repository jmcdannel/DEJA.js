import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccount = {
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

const databaseURL =
  process.env.VITE_FIREBASE_DATABASE_URL ||
  `https://${process.env.VITE_FIREBASE_PROJECT_ID || 'demo'}-default-rtdb.firebaseio.com`

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount), databaseURL })
}

export const rtdb = getDatabase()
export const db = getFirestore()
