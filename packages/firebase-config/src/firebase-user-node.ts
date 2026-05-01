import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  initializeAuth,
  inMemoryPersistence,
  signInWithCustomToken,
  type Auth,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getDatabase, type Database } from 'firebase/database'

export class AuthMissingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthMissingError'
  }
}

interface RefreshResponse {
  customToken: string
  expiresIn: number
  refreshToken: string
}

export async function exchangeRefreshTokenForCustomToken(opts: {
  refreshToken: string
  refreshUrl: string
}): Promise<RefreshResponse> {
  if (!opts.refreshToken) {
    throw new AuthMissingError('No refresh token available. Run "deja login" first.')
  }
  const res = await fetch(opts.refreshUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: opts.refreshToken }),
  })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new AuthMissingError(
        'Server credential is invalid or revoked. Run "deja login" again to reconnect.',
      )
    }
    throw new Error(`Refresh failed with status ${res.status}`)
  }
  return (await res.json()) as RefreshResponse
}

let firebaseApp: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null
let _rtdb: Database | null = null

interface InitOptions {
  config: {
    apiKey: string
    authDomain: string
    databaseURL: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
  customToken: string
}

export async function initFirebaseUserAuth(opts: InitOptions): Promise<{
  firebaseApp: FirebaseApp
  auth: Auth
  db: Firestore
  rtdb: Database
  uid: string
  refreshToken: string
  claims: Record<string, unknown>
}> {
  if (firebaseApp) {
    throw new Error('initFirebaseUserAuth already called — Firebase app is already initialized')
  }

  const existingApps = getApps()
  firebaseApp = existingApps[0] ?? initializeApp(opts.config)
  _auth = initializeAuth(firebaseApp, { persistence: inMemoryPersistence })

  const credential = await signInWithCustomToken(_auth, opts.customToken)
  if (!credential.user) {
    throw new Error('signInWithCustomToken returned no user')
  }

  _db = getFirestore(firebaseApp)
  _rtdb = getDatabase(firebaseApp)

  const tokenResult = await credential.user.getIdTokenResult()

  return {
    firebaseApp,
    auth: _auth,
    db: _db,
    rtdb: _rtdb,
    uid: credential.user.uid,
    refreshToken: credential.user.refreshToken,
    claims: tokenResult.claims as Record<string, unknown>,
  }
}

export function getDb(): Firestore {
  if (!_db) throw new Error('Firebase user auth not initialized — call initFirebaseUserAuth first')
  return _db
}

export function getRtdb(): Database {
  if (!_rtdb) throw new Error('Firebase user auth not initialized — call initFirebaseUserAuth first')
  return _rtdb
}

export function getAuthInstance(): Auth {
  if (!_auth) throw new Error('Firebase user auth not initialized — call initFirebaseUserAuth first')
  return _auth
}

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const target = getDb() as unknown as Record<string | symbol, unknown>
    const value = target[prop]
    return typeof value === 'function' ? value.bind(target) : value
  },
})

export const rtdb: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const target = getRtdb() as unknown as Record<string | symbol, unknown>
    const value = target[prop]
    return typeof value === 'function' ? value.bind(target) : value
  },
})
