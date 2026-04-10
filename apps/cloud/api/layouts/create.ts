import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db, rtdb } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'

const ALLOWED_STATUSES = ['active', 'trialing', 'past_due']

// 🎵 Kept in sync with packages/modules/layouts/constants.ts defaultLayoutSounds.
// Duplicated here to avoid pulling the frontend modules package into the API runtime.
const DEFAULT_LAYOUT_SOUNDS = [
  { effectId: 'deja-server-sound-default-horn', label: 'Horn', icon: 'mdi-bullhorn' },
  { effectId: 'bell', label: 'Bell', icon: 'mdi-bell' },
  { effectId: 'coupler', label: 'Coupler', icon: 'mdi-link-variant' },
  { effectId: 'wheel-squeal', label: 'Wheel Squeal', icon: 'mdi-sine-wave' },
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) {
    return res.status(auth.status ?? 401).json({ error: auth.message ?? 'Unauthorized' })
  }

  // 🔐 Gate layout creation on subscription — matches devices/pair-approve.ts.
  const userSnap = await db.doc(`users/${auth.uid}`).get()
  const subscription = userSnap.data()?.subscription as { status?: string } | undefined
  if (!subscription?.status || !ALLOWED_STATUSES.includes(subscription.status)) {
    return res.status(403).json({ error: 'Active subscription required to create a layout' })
  }

  const name =
    typeof req.body?.name === 'string' && req.body.name.trim().length > 0
      ? req.body.name.trim().slice(0, 80)
      : 'New Layout'

  const description =
    typeof req.body?.description === 'string' ? req.body.description.slice(0, 500) : null

  // 🆔 Slug is optional — if provided, use it as the doc ID; otherwise auto-generate.
  const slug =
    typeof req.body?.slug === 'string' && /^[a-z0-9-]{1,80}$/.test(req.body.slug)
      ? req.body.slug
      : null

  const layoutRef = slug ? db.collection('layouts').doc(slug) : db.collection('layouts').doc()

  if (slug) {
    const existing = await layoutRef.get()
    if (existing.exists) return res.status(409).json({ error: 'Layout slug already taken' })
  }

  // 📝 Write the layout doc. ownerUid comes from the verified token — NEVER from req.body.
  // Preserves the existing Layout schema fields written by useLayout().createLayout():
  //   - approved, defaultSounds, dcc.client, owner (deprecated email, now null), created, timestamp
  await layoutRef.set({
    id: layoutRef.id,
    name,
    description,
    ownerUid: auth.uid,
    owner: null, // ⚠️ deprecated email field — kept for back-compat during rollout
    approved: true,
    defaultSounds: DEFAULT_LAYOUT_SOUNDS,
    dcc: { client: 'dejaJs' },
    created: FieldValue.serverTimestamp(),
    timestamp: FieldValue.serverTimestamp(),
  })

  // 🪞 Mirror ownership to RTDB so the new database.rules.json (Phase 1) can authorize
  // dccCommands / dejaCommands / dccLog / serverStatus / portList writes by ownerUid.
  // Client-side cannot write this path — RTDB rules will deny — so the admin SDK is required.
  await rtdb.ref(`layoutOwners/${layoutRef.id}`).set(auth.uid)

  return res.status(200).json({ layoutId: layoutRef.id })
}
