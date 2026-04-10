import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'

// 🎭 Guest effect update endpoint
//
// Replaces the removed `effects.allowGuest` Firestore rules carve-out. Under
// the new owner-only subcollection rules, non-owner users (tour guests, open
// house visitors) cannot write effect state directly. This route runs as the
// admin SDK and validates the effect's `allowGuest: true` flag before writing.
//
// Known limitations (tracked as follow-ups):
//  - No authentication. Anonymous callers are expected; the `allowGuest` flag
//    on the effect doc is the access gate.
//  - No rate limiting. If abuse becomes a problem, add Vercel KV / Upstash
//    throttling or promote to an authenticated endpoint.
//  - Only top-level `state` is writable; `timestamp` is server-generated.

const MAX_STATE_LENGTH = 100
const ALLOWED_STATE_TYPES = new Set(['string', 'boolean', 'number'])

// Path-component charset — matches the characters real layoutIds and effectIds
// use across the codebase (slugify output, Firestore push IDs, numeric indices).
const ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/

interface EffectDoc {
  allowGuest?: boolean
  state?: unknown
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const layoutId = typeof req.body?.layoutId === 'string' ? req.body.layoutId : null
  const effectId = typeof req.body?.effectId === 'string' ? req.body.effectId : null
  const state = req.body?.state

  if (!layoutId || !effectId) {
    return res.status(400).json({ error: 'layoutId and effectId required' })
  }

  if (!ID_PATTERN.test(layoutId) || !ID_PATTERN.test(effectId)) {
    return res.status(400).json({ error: 'layoutId or effectId has invalid characters' })
  }

  // State must be a primitive (string, boolean, or number) with reasonable size.
  if (state === undefined || state === null) {
    return res.status(400).json({ error: 'state required' })
  }
  if (!ALLOWED_STATE_TYPES.has(typeof state)) {
    return res.status(400).json({ error: 'state must be a string, boolean, or number' })
  }
  if (typeof state === 'string' && state.length > MAX_STATE_LENGTH) {
    return res.status(400).json({ error: `state too long (max ${MAX_STATE_LENGTH} chars)` })
  }

  // Fetch the effect doc and verify allowGuest is true.
  const effectRef = db.doc(`layouts/${layoutId}/effects/${effectId}`)
  const snap = await effectRef.get()
  if (!snap.exists) {
    return res.status(404).json({ error: 'Effect not found' })
  }

  const effect = snap.data() as EffectDoc
  if (effect.allowGuest !== true) {
    // 🔒 Return 404 instead of 403 to avoid leaking which effects are
    // guest-accessible (mild information-disclosure hardening).
    return res.status(404).json({ error: 'Effect not found' })
  }

  // Write only the allowed fields. Client cannot set arbitrary fields and
  // `timestamp` is server-generated.
  await effectRef.update({
    state,
    timestamp: FieldValue.serverTimestamp(),
  })

  return res.status(200).json({ ok: true })
}
