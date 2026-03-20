import { useRef, useCallback } from 'react'
import admin from 'firebase-admin'
import { readConfig } from '../lib/config.mjs'

// ── Firebase singleton — init once at module scope ──────────────────────────
let firebaseApp = null
let db = null
let rtdb = null

try {
  const projectId   = process.env.VITE_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL

  if (projectId && clientEmail && privateKey) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      databaseURL,
    })
    db   = admin.firestore()
    rtdb = admin.database()
  }
} catch {
  // Gracefully handle missing/invalid credentials
}

export const ServerValue = admin.database.ServerValue

/**
 * useFirebase — provides Firebase Admin SDK singletons and the active layout ID.
 *
 * Firebase is initialized once at module scope from env vars. The layout ID is
 * read from ~/.deja/config.json (cached in a ref so the file is read at most
 * once per component mount), with a fallback to the LAYOUT_ID env var.
 *
 * @returns {{ db, rtdb, layoutId, cleanup }}
 */
export function useFirebase() {
  // Cache config in ref — don't re-read from disk every render
  const configRef = useRef(readConfig())

  const layoutId = configRef.current.layoutId || process.env.LAYOUT_ID || null

  const cleanup = useCallback(() => {
    if (firebaseApp) {
      firebaseApp.delete().catch(() => {})
      firebaseApp = null
      db   = null
      rtdb = null
    }
  }, [])

  return { db, rtdb, layoutId, cleanup }
}
