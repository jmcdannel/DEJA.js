import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyAuth } from './lib/verifyAuth'
import { rtdb } from './lib/firebase'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

const LOG_PATHS = ['dccLog', 'dccCommands', 'dejaCommands'] as const

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = verifyAuth(req)
  if (!auth.valid) {
    return res.status(auth.status!).json({ error: auth.message })
  }

  const cutoff = Date.now() - TWENTY_FOUR_HOURS_MS
  let totalDeleted = 0

  try {
    for (const path of LOG_PATHS) {
      const rootRef = rtdb.ref(path)
      const layoutsSnapshot = await rootRef.once('value')

      if (!layoutsSnapshot.exists()) {
        continue
      }

      const layouts = layoutsSnapshot.val() as Record<
        string,
        Record<string, { timestamp?: number }>
      >

      for (const layoutId of Object.keys(layouts)) {
        const entries = layouts[layoutId]
        if (!entries || typeof entries !== 'object') continue

        const keysToDelete: string[] = []

        for (const [key, entry] of Object.entries(entries)) {
          if (
            !entry ||
            typeof entry !== 'object' ||
            !entry.timestamp ||
            entry.timestamp < cutoff
          ) {
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

    return res.status(200).json({ status: 'ok', deleted: totalDeleted })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: 'Cleanup failed', details: message })
  }
}
