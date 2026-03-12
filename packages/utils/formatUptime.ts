/**
 * Convert a timestamp value (number, Date, Firestore Timestamp, or date string)
 * into a human-readable uptime string like "3h 12m" or "5m".
 *
 * Returns an empty string when the value is missing, falsy, or unparseable.
 */
export function toMillis(value: unknown): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  // Firestore Timestamp with toDate()
  if (value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().getTime()
  }
  // Raw Firestore Timestamp shape { seconds, nanoseconds }
  if (value && typeof (value as { seconds?: unknown }).seconds === 'number') {
    return (value as { seconds: number }).seconds * 1000
  }
  if (typeof value === 'string') return new Date(value).getTime()
  return NaN
}

export default function formatUptime(timestamp: unknown): string {
  const ms = toMillis(timestamp)
  if (Number.isNaN(ms)) return ''

  const diff = Date.now() - ms
  if (diff < 0) return ''

  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
