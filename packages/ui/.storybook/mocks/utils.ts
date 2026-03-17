/**
 * Mock for @repo/utils — provides lightweight stubs for createLogger,
 * slugify, and formatUptime so UI components render without the real
 * workspace dependency.
 *
 * Wired in via Vite resolve alias in .storybook/main.ts.
 * Do NOT import from @repo/utils here — that would be circular.
 */

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success' | 'start' | 'fatal'

const noop = (..._args: unknown[]) => {
  /* no-op in Storybook */
}

interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  success: (...args: unknown[]) => void
  start: (...args: unknown[]) => void
  fatal: (...args: unknown[]) => void
}

export function createLogger(_scope?: string): Logger {
  return {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    success: noop,
    start: noop,
    fatal: noop,
  }
}

export const log = createLogger('default')

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------
export default function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim()
}

export { slugify }

// ---------------------------------------------------------------------------
// formatUptime
// ---------------------------------------------------------------------------
export function formatUptime(ms: number): string {
  if (!ms || ms <= 0) return '0s'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function toMillis(value: unknown): number {
  if (typeof value === 'number') return value
  if (value instanceof Date) return value.getTime()
  return 0
}
