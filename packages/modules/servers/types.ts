import type { Timestamp } from 'firebase/firestore'

export interface ServerRecord {
  /** User-supplied label, e.g. "Basement Pi". 1–60 chars. */
  name: string
  /** Server creation timestamp. */
  createdAt: Timestamp
  /** Updated by the server on every cold start. Null until first connection. */
  lastSeenAt: Timestamp | null
  /** Soft-revoke flag — toggled from the Settings UI. */
  revoked: boolean
}

export interface ServerRecordWithId extends ServerRecord {
  /** ULID (Firestore doc id). */
  id: string
}
