import { randomBytes, createHash, timingSafeEqual } from 'node:crypto'

/** Generates a 32-byte URL-safe session secret. */
export function generateSessionSecret(): string {
  return randomBytes(32).toString('base64url')
}

/** Hashes a session secret with SHA-256. No salt — secrets are single-use per pairing and hashes are stored server-side. */
export function hashSessionSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/** Timing-safe comparison of a presented secret against the stored hash. */
export function verifySessionSecret(presented: string, storedHash: string): boolean {
  const presentedHash = hashSessionSecret(presented)
  const a = Buffer.from(presentedHash, 'hex')
  const b = Buffer.from(storedHash, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
