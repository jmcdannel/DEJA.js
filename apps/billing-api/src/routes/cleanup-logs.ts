import { Hono } from 'hono'
import { rtdb } from '../lib/firebase'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

/** RTDB paths (relative to each layout) that accumulate log entries. */
const LOG_PATHS = ['dccLog', 'dccCommands', 'dejaCommands'] as const

export const cleanupLogsRoute = new Hono()

/**
 * POST /cleanup-logs
 *
 * Cron-triggered endpoint that deletes RTDB log entries older than 24 hours.
 * Protected by a CRON_SECRET bearer token (set in Vercel environment).
 */
cleanupLogsRoute.post('/cleanup-logs', async (c) => {
  // Verify CRON_SECRET bearer auth
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return c.json({ error: 'CRON_SECRET not configured' }, 500)
  }

  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ') || header.slice(7) !== cronSecret) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const cutoff = Date.now() - TWENTY_FOUR_HOURS_MS
  let totalDeleted = 0

  try {
    // Iterate over all layout roots under each log path
    for (const path of LOG_PATHS) {
      const rootRef = rtdb.ref(path)
      const layoutsSnapshot = await rootRef.once('value')

      if (!layoutsSnapshot.exists()) {
        continue
      }

      const layouts = layoutsSnapshot.val() as Record<string, Record<string, { timestamp?: number }>>

      for (const layoutId of Object.keys(layouts)) {
        const entries = layouts[layoutId]
        if (!entries || typeof entries !== 'object') continue

        const keysToDelete: string[] = []

        for (const [key, entry] of Object.entries(entries)) {
          // Delete entries older than 24 hours, or entries without a timestamp
          if (!entry || typeof entry !== 'object' || !entry.timestamp || entry.timestamp < cutoff) {
            keysToDelete.push(key)
          }
        }

        if (keysToDelete.length > 0) {
          const updates: Record<string, null> = {}
          for (const key of keysToDelete) {
            updates[`${path}/${layoutId}/${key}`] = null
          }
          await rtdb.ref().update(updates)
          totalDeleted += keysToDelete.length
        }
      }
    }

    return c.json({ status: 'ok', deleted: totalDeleted })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return c.json({ error: 'Cleanup failed', details: message }, 500)
  }
})
