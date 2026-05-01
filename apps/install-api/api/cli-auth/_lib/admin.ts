import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let cached: { auth: Auth; db: Firestore } | null = null

/**
 * Lazy-init firebase-admin. Uses service-account env vars if available,
 * otherwise falls back to Application Default Credentials (gcloud ADC).
 */
export function getAdmin(): { auth: Auth; db: Firestore } {
  if (cached) return cached

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  const credential = (clientEmail && privateKey && projectId)
    ? cert({ projectId, clientEmail, privateKey })
    : applicationDefault()

  const app =
    getApps()[0] ??
    initializeApp({ credential, projectId })

  cached = {
    auth: getAuth(app),
    db: getFirestore(app),
  }
  return cached
}
