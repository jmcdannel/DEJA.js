import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  signInWithCustomToken,
  onIdTokenChanged,
  type Auth,
  type User,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getDatabase, type Database } from 'firebase/database'

export interface FirebaseClientConfig {
  apiKey: string
  authDomain: string
  projectId: string
  databaseURL: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let rtdb: Database | null = null
let currentUser: User | null = null

export function initFirebaseClient(config: FirebaseClientConfig): void {
  if (app) throw new Error('firebase-client: already initialized')
  app = initializeApp(config)
  auth = getAuth(app)
  db = getFirestore(app)
  rtdb = getDatabase(app)
  onIdTokenChanged(auth, (user) => {
    currentUser = user
  })
}

export async function signInWithDeviceToken(customToken: string): Promise<User> {
  if (!auth)
    throw new Error('firebase-client: not initialized — call initFirebaseClient first')
  const cred = await signInWithCustomToken(auth, customToken)
  currentUser = cred.user
  return cred.user
}

export function getDb(): Firestore {
  if (!db) throw new Error('firebase-client: not initialized')
  return db
}

export function getRtdb(): Database {
  if (!rtdb) throw new Error('firebase-client: not initialized')
  return rtdb
}

export function getCurrentUser(): User | null {
  return currentUser
}

/** Test-only: reset module state. Do not call from production code. */
export function __resetForTests(): void {
  app = null
  auth = null
  db = null
  rtdb = null
  currentUser = null
}
