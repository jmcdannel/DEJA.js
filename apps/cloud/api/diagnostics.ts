import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyAuth } from './lib/verifyAuth'
import { rtdb } from './lib/firebase'

const LOG_PATHS = ['dccLog', 'dccCommands', 'dejaCommands'] as const

interface PathStats {
  count: number
  oldest?: number
  newest?: number
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = verifyAuth(req)
  if (!auth.valid) {
    return res.status(auth.status!).json({ error: auth.message })
  }

  try {
    const layouts: Record<string, Record<string, PathStats>> = {}

    for (const path of LOG_PATHS) {
      const rootRef = rtdb.ref(path)
      const layoutsSnapshot = await rootRef.once('value')

      if (!layoutsSnapshot.exists()) {
        continue
      }

      const data = layoutsSnapshot.val() as Record<
        string,
        Record<string, { timestamp?: number }>
      >

      for (const layoutId of Object.keys(data)) {
        if (!layouts[layoutId]) {
          layouts[layoutId] = {}
        }

        const entries = data[layoutId]
        if (!entries || typeof entries !== 'object') {
          layouts[layoutId][path] = { count: 0 }
          continue
        }

        const timestamps: number[] = []
        for (const entry of Object.values(entries)) {
          if (entry?.timestamp) {
            timestamps.push(entry.timestamp)
          }
        }

        const stats: PathStats = { count: Object.keys(entries).length }
        if (timestamps.length > 0) {
          stats.oldest = Math.min(...timestamps)
          stats.newest = Math.max(...timestamps)
        }

        layouts[layoutId][path] = stats
      }
    }

    // Ensure all layouts have all paths represented
    for (const layoutId of Object.keys(layouts)) {
      for (const path of LOG_PATHS) {
        if (!layouts[layoutId][path]) {
          layouts[layoutId][path] = { count: 0 }
        }
      }
    }

    return res.status(200).json({ layouts })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res
      .status(500)
      .json({ error: 'Diagnostics failed', details: message })
  }
}
