import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'
import { generateSessionSecret, hashSessionSecret } from './lib/sessionSecret'
import { signInstallJwt } from './lib/installJwt'

const INSTALL_BASE_URL = process.env.INSTALL_BASE_URL ?? 'https://install.dejajs.com'
const ALLOWED_STATUSES = ['active', 'trialing', 'past_due']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) {
    return res.status(auth.status ?? 401).json({ error: auth.message ?? 'Unauthorized' })
  }

  const label = typeof req.body?.label === 'string' && req.body.label.trim().length > 0
    ? req.body.label.slice(0, 80)
    : 'DEJA Server'
  const layoutId = typeof req.body?.layoutId === 'string' ? req.body.layoutId : null

  const userSnap = await db.doc(`users/${auth.uid}`).get()
  const subscription = userSnap.data()?.subscription as { status?: string } | undefined
  if (!subscription?.status || !ALLOWED_STATUSES.includes(subscription.status)) {
    return res.status(403).json({ error: 'Active subscription required to pair a device' })
  }

  const sessionSecret = generateSessionSecret()
  const pairingRef = db.collection('devicePairings').doc()

  await pairingRef.set({
    uid: auth.uid,
    layoutId,
    label,
    secretHash: hashSessionSecret(sessionSecret),
    revoked: false,
    createdAt: FieldValue.serverTimestamp(),
    lastAuthAt: null,
    userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null,
  })

  const token = signInstallJwt({
    pairingId: pairingRef.id,
    sessionSecret,
    uid: auth.uid,
    layoutId,
  })

  return res.status(200).json({
    installUrl: `${INSTALL_BASE_URL}/i/${token}`,
    pairingId: pairingRef.id,
  })
}
