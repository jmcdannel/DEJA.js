import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let cached: { auth: Auth; db: Firestore } | null = null

/**
 * Lazy-init firebase-admin from env vars. Cached across warm invocations.
 * Throws a clear error if required env vars are missing.
 */
export function getAdmin(): { auth: Auth; db: Firestore } {
  if (cached) return cached

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env vars',
    )
  }

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })

  cached = {
    auth: getAuth(app),
    db: getFirestore(app),
  }
  return cached
}
