import { getAuth } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'

const log = createLogger('createLayout')

export interface CreateLayoutInput {
  /** Human-readable layout name */
  name: string
  /** Optional description */
  description?: string
  /** Optional URL-safe slug (lowercase letters, numbers, hyphens). If omitted, Firestore auto-generates an ID. */
  slug?: string
}

export interface CreateLayoutResult {
  layoutId: string
}

/**
 * 🏗️ Create a new layout via the server API.
 *
 * The server route writes the layout doc to Firestore with `ownerUid` set from the
 * verified Firebase ID token, and mirrors ownership to RTDB at `layoutOwners/{layoutId}`
 * so the new RTDB rules (Phase 1) can authorize dccCommands / dejaCommands writes.
 *
 * After the API returns, this helper also creates the default `dccex` device
 * subcollection doc — the layout owner can write subcollection docs directly.
 */
export async function createLayout(input: CreateLayoutInput): Promise<CreateLayoutResult> {
  log.debug('createLayout', input)

  const token = await getAuth().currentUser?.getIdToken()
  if (!token) throw new Error('Not signed in')

  const res = await fetch('/api/layouts/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? `Failed to create layout (HTTP ${res.status})`)
  }

  const data = (await res.json()) as { layoutId: string }

  // 🚂 Create the default dccex device as a subcollection doc. This is a client-side
  // write because the layout owner is allowed to write to their own subcollections.
  try {
    await setDoc(doc(db, `layouts/${data.layoutId}/devices`, 'dccex'), {
      id: 'dccex',
      name: 'dccex',
      type: 'dcc-ex',
      connection: 'usb',
      timestamp: serverTimestamp(),
    })
  } catch (e) {
    log.error('Failed to create default dccex device (layout was still created)', e)
  }

  return { layoutId: data.layoutId }
}
