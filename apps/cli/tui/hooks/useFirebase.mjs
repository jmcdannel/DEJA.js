import { useRef, useCallback } from 'react'
import { readConfig } from '../lib/config.mjs'

// ── Firebase placeholder ─────────────────────────────────────────────────────
//
// Historically this hook initialized `firebase-admin` from
// FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL. That approach is incompatible
// with the device-auth migration — shipped CLIs must not carry raw service-
// account credentials.
//
// Until the TUI is migrated to the Firebase Client SDK + device custom-token
// sign-in flow (same bootstrap the server uses), this hook exposes a stub
// contract: `db` and `rtdb` are always null, and all downstream hooks
// (useDevices, useThrottles, connect/disconnectDevice, sendDccCommand) treat
// a null client as a no-op. The TUI remains fully functional for local
// server process management; the Firebase-backed dashboard panels simply
// show empty data until the Client-SDK migration lands.
//
// TODO(device-auth): port bootstrap-auth.ts logic into the TUI and return
// real Firestore / RTDB Client-SDK handles here.

const ServerValueStub = {
  TIMESTAMP: { '.sv': 'timestamp' },
}

export const ServerValue = ServerValueStub

/**
 * useFirebase — stub that used to return Firebase Admin SDK singletons.
 *
 * Currently returns `db = null`, `rtdb = null`. Downstream hooks gracefully
 * handle the null case.
 *
 * @returns {{ db, rtdb, layoutId, cleanup }}
 */
export function useFirebase() {
  const configRef = useRef(readConfig())
  const layoutId = configRef.current.layoutId || process.env.LAYOUT_ID || null

  const cleanup = useCallback(() => {}, [])

  return { db: null, rtdb: null, layoutId, cleanup }
}
