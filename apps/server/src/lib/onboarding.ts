import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getDb } from './firebase-client.js'
import { log } from '../utils/logger.js'

/**
 * Mark that the server has started for the first time.
 * This is a write-once operation — if serverStarted is already true, it's a no-op.
 *
 * Runs as the currently signed-in device user via the Client SDK. Firestore
 * security rules must allow the user to write their own `users/{uid}` doc.
 */
export async function markServerStarted(uid: string): Promise<void> {
  try {
    log.info('markServerStarted')
    const db = getDb()
    const userRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userRef)
    const onboarding = (userDoc.data() as { onboarding?: { serverStarted?: boolean } } | undefined)?.onboarding

    log.info(onboarding)
    log.debug(uid)
    if (onboarding?.serverStarted) {
      log.info('Server already marked as started, skipping')
      return
    }

    await setDoc(
      userRef,
      {
        onboarding: {
          serverStarted: true,
          serverStartedAt: serverTimestamp(),
        },
      },
      { merge: true }
    )
    log.success('Marked server as started for first time')
  } catch (error) {
    // Non-fatal — don't prevent server startup if this fails
    log.warn('Failed to mark server as started:', error)
  }
}
