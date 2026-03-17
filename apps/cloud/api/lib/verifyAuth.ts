import { timingSafeEqual } from 'node:crypto'
import type { VercelRequest } from '@vercel/node'

interface AuthResult {
  valid: boolean
  status?: number
  message?: string
}

export function verifyAuth(req: VercelRequest): AuthResult {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return { valid: false, status: 500, message: 'CRON_SECRET not configured' }
  }

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return { valid: false, status: 401, message: 'Unauthorized' }
  }

  const token = header.slice(7)
  const tokenBuf = Buffer.from(token)
  const secretBuf = Buffer.from(cronSecret)
  if (tokenBuf.length !== secretBuf.length || !timingSafeEqual(tokenBuf, secretBuf)) {
    return { valid: false, status: 401, message: 'Unauthorized' }
  }

  return { valid: true }
}
