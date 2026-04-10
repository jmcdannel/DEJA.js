import { createHmac, timingSafeEqual } from 'node:crypto'

const ALG = 'HS256'
const TTL_SECONDS = 15 * 60 // 15 minutes

export interface InstallJwtPayload {
  pairingId: string
  sessionSecret: string
  uid: string
  layoutId: string | null
  iat: number
  exp: number
}

export type InstallJwtInput = Omit<InstallJwtPayload, 'iat' | 'exp'>

function getSecret(): string {
  const secret = process.env.INSTALL_JWT_SECRET
  if (!secret) {
    throw new Error('installJwt: INSTALL_JWT_SECRET environment variable is not set')
  }
  return secret
}

function base64UrlEncode(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

function base64UrlDecode<T>(str: string): T {
  return JSON.parse(Buffer.from(str, 'base64url').toString('utf8')) as T
}

export function signInstallJwt(input: InstallJwtInput): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: InstallJwtPayload = { ...input, iat: now, exp: now + TTL_SECONDS }
  const header = base64UrlEncode({ alg: ALG, typ: 'JWT' })
  const body = base64UrlEncode(payload)
  const sig = createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

export function verifyInstallJwt(token: string): InstallJwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts
  const expected = createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  let payload: InstallJwtPayload
  try {
    payload = base64UrlDecode<InstallJwtPayload>(body)
  } catch {
    return null
  }
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
  if (typeof payload.pairingId !== 'string' || typeof payload.sessionSecret !== 'string' || typeof payload.uid !== 'string') return null
  return payload
}
