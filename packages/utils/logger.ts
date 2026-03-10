type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

function getLogLevel(): LogLevel {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LOG_LEVEL) {
    return import.meta.env.VITE_LOG_LEVEL as LogLevel
  }
  if (typeof process !== 'undefined' && process.env?.LOG_LEVEL) {
    return process.env.LOG_LEVEL as LogLevel
  }
  const isDev =
    typeof import.meta !== 'undefined'
      ? import.meta.env?.DEV
      : process?.env?.NODE_ENV !== 'production'
  return isDev ? 'debug' : 'info'
}

function createLogger(scope?: string) {
  const prefix = scope ? `[${scope}]` : '[DEJA]'
  const level = getLogLevel()
  const threshold = LEVELS[level]

  return {
    debug: (...args: unknown[]) => {
      if (threshold <= 0) console.debug(prefix, ...args)
    },
    info: (...args: unknown[]) => {
      if (threshold <= 1) console.info(prefix, ...args)
    },
    warn: (...args: unknown[]) => {
      if (threshold <= 2) console.warn(prefix, ...args)
    },
    error: (...args: unknown[]) => {
      if (threshold <= 3) console.error(prefix, ...args)
    },
  }
}

export const log = createLogger()
export { createLogger }
export type { LogLevel }
