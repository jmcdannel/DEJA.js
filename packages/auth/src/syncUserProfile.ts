import { doc, getFirestore, setDoc, serverTimestamp } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import type { User } from 'firebase/auth'
import { createLogger } from '@repo/utils'

const log = createLogger('Auth')

/**
 * Syncs OAuth user profile data to Firestore `users/{uid}`.
 * Uses `merge: true` to avoid overwriting existing fields (subscription, preferences, etc.).
 * Silently catches errors — profile sync failure must never block login.
 */
export async function syncUserProfile(user: User): Promise<void> {
  try {
    const db = getFirestore(getApp())

    // Only include non-null values to avoid overwriting with blanks
    // (e.g., Apple may not provide displayName)
    const profileData: Record<string, unknown> = {
      lastLoginAt: serverTimestamp(),
    }

    if (user.email) {
      profileData.email = user.email
    }
    if (user.displayName) {
      profileData.displayName = user.displayName
    }
    if (user.photoURL) {
      profileData.photoURL = user.photoURL
    }

    await setDoc(doc(db, 'users', user.uid), profileData, { merge: true })
    log.debug('Synced user profile for', user.uid)
  } catch (err) {
    // Profile sync is best-effort — never block the login flow
    log.error('Failed to sync user profile:', err)
  }
}
