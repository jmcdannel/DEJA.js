import { randomBytes } from 'node:crypto'

// Unambiguous alphabet — no 0/O, 1/I/L, B/8 — optimized for verbal / handwritten entry
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_BYTES = 8

/** Generates a human-friendly device pairing code like "ABCD-2345". */
export function generatePairingCode(): string {
  const bytes = randomBytes(CODE_BYTES)
  const chars: string[] = []
  for (let i = 0; i < CODE_BYTES; i++) {
    chars.push(ALPHABET[bytes[i] % ALPHABET.length])
  }
  return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

/** Generates a 32-byte poll token the CLI uses to check pairing status without leaking identity. */
export function generatePollToken(): string {
  return randomBytes(32).toString('base64url')
}
