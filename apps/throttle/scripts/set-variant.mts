/**
 * Set the demo user's throttle variant preference.
 * Usage: pnpm tsx apps/throttle/scripts/set-variant.mts <variant>
 *   variant: buttons | slider | dashboard
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

dotenv.config()

const UID = 'QugkMJJvbVPjqctbNtuN7FLtxMZ2'
const variant = process.argv[2] || 'slider'

if (!['buttons', 'slider', 'dashboard'].includes(variant)) {
  console.error(`❌ variant must be buttons|slider|dashboard, got: ${variant}`)
  process.exit(1)
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  })
}

const db = getFirestore()

await db.doc(`users/${UID}`).set(
  {
    throttleSettings: {
      variant,
      showFunctions: true,
      showSpeedometer: true,
      showConsist: true,
    },
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
)

console.log(`✅ Set throttleSettings.variant = ${variant} for user ${UID}`)
process.exit(0)
