import type { VercelRequest } from '@vercel/node'
import { getAuth } from 'firebase-admin/auth'
import './firebase' // ensure admin app is initialized

interface FirebaseAuthResult {
  valid: boolean
  uid?: string
  status?: number
  message?: string
}

export async function verifyFirebaseAuth(
  req: VercelRequest,
): Promise<FirebaseAuthResult> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return { valid: false, status: 401, message: 'Missing authorization token' }
  }

  try {
    const token = header.slice(7)
    const decoded = await getAuth().verifyIdToken(token)
    return { valid: true, uid: decoded.uid }
  } catch {
    return { valid: false, status: 401, message: 'Invalid or expired token' }
  }
}
