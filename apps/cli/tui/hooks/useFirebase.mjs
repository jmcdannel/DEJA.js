import { useState, useRef, useCallback } from 'react'
import admin from 'firebase-admin'
import { readConfig, loadEnvFile, DEJA_DIR } from '../lib/config.mjs'

// ── Firebase singleton — lazily initialized on first useFirebase() call ──────
let firebaseApp = null
let db = null
let rtdb = null
let initAttempted = false

function ensureFirebase() {
  if (initAttempted) return
  initAttempted = true

  // Make sure env is loaded (imports hoist above App.mjs module code)
  loadEnvFile(`${DEJA_DIR}/.env`)

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
}

export const ServerValue = admin.database.ServerValue

/**
 * useFirebase — provides Firebase Admin SDK singletons and the active layout ID.
 *
 * Firebase is lazily initialized on first call (not at import time) to ensure
 * env vars from ~/.deja/.env are loaded first.
 *
 * @returns {{ db, rtdb, layoutId, cleanup }}
 */
export function useFirebase() {
  // Lazy init on first render
  const [initialized] = useState(() => { ensureFirebase(); return true })

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
