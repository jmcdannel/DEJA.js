import {
  exchangeRefreshTokenForCustomToken,
  initFirebaseUserAuth,
  getDb,
  AuthMissingError,
} from '@repo/firebase-config/firebase-user-node'
import { doc, getDoc } from 'firebase/firestore'
import { readConfig, writeConfigCache } from './subscription.js'
import { log } from '../utils/logger.js'

const REFRESH_URL =
  process.env.DEJA_INSTALL_API_BASE
    ? `${process.env.DEJA_INSTALL_API_BASE}/api/cli-auth/refresh`
    : 'https://install.dejajs.com/api/cli-auth/refresh'

const REFRESH_BUFFER_MS = 5 * 60 * 1000

let refreshTimer: ReturnType<typeof setTimeout> | null = null

function getFirebaseConfigFromEnv() {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ] as const
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`)
    }
  }
  return {
    apiKey: process.env.VITE_FIREBASE_API_KEY!,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN!,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL!,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.VITE_FIREBASE_APP_ID!,
  }
}

async function getStoredRefreshToken(): Promise<string | null> {
  if (process.env.DEJA_REFRESH_TOKEN) return process.env.DEJA_REFRESH_TOKEN
  try {
    const cfg = await readConfig()
    return (cfg as { refreshToken?: string }).refreshToken ?? null
  } catch {
    return null
  }
}

export async function bootstrapAuth(): Promise<{ uid: string; layoutId?: string }> {
  const refreshToken = await getStoredRefreshToken()
  if (!refreshToken) {
    throw new AuthMissingError(
      'No refresh token found in ~/.deja/config.json or DEJA_REFRESH_TOKEN env var. Run "deja login" first.',
    )
  }

  const { customToken, expiresIn, refreshToken: rotated } =
    await exchangeRefreshTokenForCustomToken({
      refreshToken,
      refreshUrl: REFRESH_URL,
    })

  if (rotated && rotated !== refreshToken) {
    try {
      await writeConfigCache({ refreshToken: rotated })
    } catch (err) {
      log.warn('Failed to persist rotated refresh token (non-fatal):', err)
    }
  }

  const result = await initFirebaseUserAuth({
    config: getFirebaseConfigFromEnv(),
    customToken,
  })

  const serverId = result.claims.serverId as string | undefined
  let layoutId: string | undefined

  if (serverId) {
    try {
      const cached = await readConfig().catch(() => ({})) as { layoutId?: string }
      if (cached.layoutId) {
        layoutId = cached.layoutId
      } else {
        const serverDoc = await getDoc(doc(getDb(), 'users', result.uid, 'servers', serverId))
        layoutId = serverDoc.data()?.layoutId as string | undefined
        if (layoutId) {
          await writeConfigCache({ layoutId, uid: result.uid })
          log.success(`[AUTH] Layout resolved from server doc: ${layoutId}`)
        }
      }
    } catch (err) {
      log.warn('[AUTH] Failed to read server doc for layoutId (non-fatal):', err)
    }
  }

  scheduleNextRefresh(expiresIn)
  log.success(`[AUTH] Authenticated as ${result.uid}`)
  return { uid: result.uid, layoutId }
}

function scheduleNextRefresh(expiresInSec: number): void {
  if (refreshTimer) clearTimeout(refreshTimer)
  const delayMs = Math.max(60_000, expiresInSec * 1000 - REFRESH_BUFFER_MS)
  refreshTimer = setTimeout(() => {
    bootstrapAuth().catch((err) => {
      log.error('[AUTH] Auto-refresh failed; existing session continues until ID token expiry:', err)
      scheduleNextRefresh(300)
    })
  }, delayMs)
  refreshTimer.unref?.()
}

export function stopAuthRefresh(): void {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = null
}
