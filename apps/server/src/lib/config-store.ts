import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  chmodSync,
  renameSync,
} from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export interface DejaAuthConfig {
  pairingId: string
  sessionSecret: string
}

export interface DejaSubscriptionCache {
  status: string
  plan?: string
  validatedAt: string
}

export interface DejaConfig {
  uid?: string
  layoutId?: string
  auth?: DejaAuthConfig
  subscription?: DejaSubscriptionCache
  mqtt?: { enabled?: boolean; broker?: string; port?: number }
  ws?: { enabled?: boolean; port?: number; id?: string }
  cloud?: { enabled?: boolean }
  audio?: { cacheSizeMb?: number; cacheDir?: string }
  onboardingComplete?: boolean
}

export interface ConfigStore {
  read(): DejaConfig | null
  write(config: DejaConfig): void
  update(partial: Partial<DejaConfig>): DejaConfig
  path(): string
}

export function getDefaultDejaDir(): string {
  return process.env.DEJA_DIR ?? join(homedir(), '.deja')
}

export function createConfigStore(dejaDir: string = getDefaultDejaDir()): ConfigStore {
  const configPath = join(dejaDir, 'config.json')

  function read(): DejaConfig | null {
    if (!existsSync(configPath)) return null
    try {
      return JSON.parse(readFileSync(configPath, 'utf8')) as DejaConfig
    } catch (err) {
      throw new Error(
        `config-store: failed to parse ${configPath}: ${(err as Error).message}`,
      )
    }
  }

  function write(config: DejaConfig): void {
    if (!existsSync(dejaDir)) mkdirSync(dejaDir, { recursive: true, mode: 0o700 })
    const tmp = `${configPath}.tmp`
    writeFileSync(tmp, JSON.stringify(config, null, 2), { mode: 0o600 })
    chmodSync(tmp, 0o600)
    renameSync(tmp, configPath)
  }

  function update(partial: Partial<DejaConfig>): DejaConfig {
    const current = read() ?? {}
    const next = { ...current, ...partial }
    write(next)
    return next
  }

  return { read, write, update, path: () => configPath }
}
