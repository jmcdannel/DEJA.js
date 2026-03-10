type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

interface ViteEnv {
  VITE_LOG_LEVEL?: string
  DEV?: boolean
  [key: string]: unknown
}

interface ProcessEnv {
  env?: { LOG_LEVEL?: string; NODE_ENV?: string; [key: string]: string | undefined }
}

const LEVELS: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3, silent: 4
}

function getViteEnv(): ViteEnv | undefined {
  try {
    // eslint-disable-next-line -- import.meta.env is Vite-specific; cast to access safely at runtime
    const meta = import.meta as unknown as { env?: ViteEnv }
    return meta.env
  } catch {
    return undefined
  }
}

function getProcess(): ProcessEnv | undefined {
  try {
    // Access process safely in environments where @types/node may not be available
    const g = globalThis as unknown as { process?: ProcessEnv }
    return g.process
  } catch {
    return undefined
  }
}

function getLogLevel(): LogLevel {
  const viteEnv = getViteEnv()
  if (viteEnv?.VITE_LOG_LEVEL) {
    return viteEnv.VITE_LOG_LEVEL as LogLevel
  }
  const proc = getProcess()
  if (proc?.env?.LOG_LEVEL) {
    return proc.env.LOG_LEVEL as LogLevel
  }
  if (viteEnv?.DEV !== undefined) {
    return viteEnv.DEV ? 'debug' : 'info'
  }
  if (proc?.env?.NODE_ENV !== undefined && proc.env.NODE_ENV !== 'production') {
    return 'debug'
  }
  return 'info'
}

function createLogger(scope?: string) {
  const prefix = scope ? `[${scope}]` : '[DEJA]'
  const level = getLogLevel()
  const threshold = LEVELS[level]

  return {
    debug: (...args: unknown[]) => { if (threshold <= 0) console.debug(prefix, ...args) },
    info: (...args: unknown[]) => { if (threshold <= 1) console.info(prefix, ...args) },
    warn: (...args: unknown[]) => { if (threshold <= 2) console.warn(prefix, ...args) },
    error: (...args: unknown[]) => { if (threshold <= 3) console.error(prefix, ...args) },
  }
}

const log = createLogger()
export { log, createLogger }
export type { LogLevel }
