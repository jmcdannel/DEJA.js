// 🔥 Firebase Admin data fetcher for IO automation
// Reads device config, effects, and turnouts from Firestore

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { Device, Effect, Turnout, DeviceConfigInput, Layout } from '@repo/modules'

let initialized = false

function initFirebase() {
  if (initialized) return

  // Support both service account JSON and individual env vars
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID

  if (serviceAccount) {
    const parsed = JSON.parse(serviceAccount) as ServiceAccount
    initializeApp({ credential: cert(parsed) })
  } else if (projectId) {
    // Use application default credentials or project ID
    initializeApp({ projectId })
  } else {
    throw new Error(
      '🔥 Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY or VITE_FIREBASE_PROJECT_ID in .env'
    )
  }

  initialized = true
}

/**
 * Fetch device config + effects + turnouts for a specific device
 */
export async function getDeviceConfig(layoutId: string, deviceId: string): Promise<DeviceConfigInput> {
  initFirebase()
  const db = getFirestore()

  const layoutRef = db.collection('layouts').doc(layoutId)

  const [deviceSnap, effectsSnap, turnoutsSnap] = await Promise.all([
    layoutRef.collection('devices').doc(deviceId).get(),
    layoutRef.collection('effects').where('device', '==', deviceId).get(),
    layoutRef.collection('turnouts').where('device', '==', deviceId).get(),
  ])

  if (!deviceSnap.exists) {
    throw new Error(`❌ Device "${deviceId}" not found in layout "${layoutId}"`)
  }

  const device = { id: deviceSnap.id, ...deviceSnap.data() } as Device
  const effects = effectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Effect)
  const turnouts = turnoutsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Turnout)

  return { device, effects, turnouts }
}

/**
 * List all layouts owned by a given email address.
 * Used by `pnpm build` (no args) to build every layout the caller owns.
 */
export async function listLayoutsByOwner(ownerEmail: string): Promise<Layout[]> {
  initFirebase()
  const db = getFirestore()

  const snapshot = await db
    .collection('layouts')
    .where('owner', '==', ownerEmail)
    .get()

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Layout)
}

/**
 * List all devices for a layout (for interactive selection)
 */
export async function listDevices(layoutId: string): Promise<Device[]> {
  initFirebase()
  const db = getFirestore()

  const snapshot = await db
    .collection('layouts')
    .doc(layoutId)
    .collection('devices')
    .get()

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Device)
}
