import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) return res.status(auth.status ?? 401).json({ error: auth.message ?? 'Unauthorized' })

  const pairingId = typeof req.body?.pairingId === 'string' ? req.body.pairingId : null
  if (!pairingId) return res.status(400).json({ error: 'pairingId required' })

  const ref = db.doc(`devicePairings/${pairingId}`)
  const snap = await ref.get()
  if (!snap.exists) return res.status(404).json({ error: 'Not found' })
  if ((snap.data() as { uid?: string }).uid !== auth.uid) {
    return res.status(403).json({ error: 'Not yours to revoke' })
  }

  await ref.update({ revoked: true, revokedAt: FieldValue.serverTimestamp() })
  return res.status(200).json({ ok: true })
}
