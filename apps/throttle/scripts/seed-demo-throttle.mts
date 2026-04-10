/**
 * 🌱 Seed a test loco + throttle in the demo layout for repro.
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

dotenv.config()

const LAYOUT_ID = 'demo'
const ADDRESS = 42

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

async function run() {
  // Seed loco
  await db.doc(`layouts/${LAYOUT_ID}/locos/${ADDRESS}`).set({
    address: ADDRESS,
    name: 'Repro Engine',
    hasSound: false,
    meta: { roadname: 'BNSF' },
    timestamp: FieldValue.serverTimestamp(),
  })
  console.log(`✅ Seeded loco ${ADDRESS} in layouts/${LAYOUT_ID}/locos`)

  // Seed throttle
  await db.doc(`layouts/${LAYOUT_ID}/throttles/${ADDRESS}`).set({
    address: ADDRESS,
    speed: 0,
    direction: true,
    timestamp: FieldValue.serverTimestamp(),
  })
  console.log(`✅ Seeded throttle ${ADDRESS} in layouts/${LAYOUT_ID}/throttles`)

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
