import { db } from '@repo/firebase-config/firebase-admin-node'
import { FieldValue } from 'firebase-admin/firestore'
import { log } from '../utils/logger.js'

/**
 * Mark that the server has started for the first time.
 * This is a write-once operation — if serverStarted is already true, it's a no-op.
 */
export async function markServerStarted(uid: string): Promise<void> {
  try {
    log.info('markServerStarted')
    const userRef = db.collection('users').doc(uid)
    const userDoc = await userRef.get()
    const onboarding = userDoc.data()?.onboarding

    log.info(onboarding)
    log.debug(uid)
    if (onboarding?.serverStarted) {
      log.info('Server already marked as started, skipping')
      return
    }

    await userRef.set(
      {
        onboarding: {
          serverStarted: true,
          serverStartedAt: FieldValue.serverTimestamp(),
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
