import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) return res.status(auth.status ?? 401).json({ error: auth.message ?? 'Unauthorized' })

  const snap = await db.collection('devicePairings').where('uid', '==', auth.uid).get()
  const devices = snap.docs.map((doc) => {
    const d = doc.data() as {
      label?: string
      layoutId?: string | null
      createdAt?: { toDate: () => Date }
      lastAuthAt?: { toDate: () => Date } | null
      revoked?: boolean
      userAgent?: string | null
    }
    return {
      id: doc.id,
      label: d.label ?? 'DEJA Server',
      layoutId: d.layoutId ?? null,
      createdAt: d.createdAt?.toDate().toISOString() ?? null,
      lastAuthAt: d.lastAuthAt?.toDate().toISOString() ?? null,
      revoked: Boolean(d.revoked),
      userAgent: d.userAgent ?? null,
    }
  })
  return res.status(200).json({ devices })
}
