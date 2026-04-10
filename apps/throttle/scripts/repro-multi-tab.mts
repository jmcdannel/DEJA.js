/**
 * 🐛 Multi-instance throttle bug reproduction.
 *
 * Simulates two "tabs" each running the useThrottle.ts logic against the same
 * Firestore throttle document. Counts writes from each tab and prints a verdict.
 *
 * Run: pnpm tsx apps/throttle/scripts/repro-multi-tab.mts
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, type DocumentSnapshot } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

dotenv.config()

const LAYOUT_ID = process.env.LAYOUT_ID
if (!LAYOUT_ID) throw new Error('LAYOUT_ID not set')

const TEST_ADDRESS = 9999 // reserved test address — won't collide with real throttles
const DURATION_MS = 5000
const DOC_PATH = `layouts/${LAYOUT_ID}/throttles/${TEST_ADDRESS}`

const app = initializeApp({
  credential: cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
})

const db = getFirestore(app)
const docRef = db.doc(DOC_PATH)

// Mirror of apps/throttle/src/throttle/utils.ts
function getSignedSpeed({ speed, direction }: { speed: number; direction?: boolean }): number {
  if (typeof speed !== 'number' || isNaN(speed)) return 0
  if (typeof direction !== 'boolean') return speed
  return speed && Boolean(direction) ? speed : -speed || 0
}

type Throttle = { speed: number; direction: boolean }

interface TabState {
  name: string
  snapshotsReceived: number
  writesSent: number
  // Mirrors Vue's watch(currentSpeed) — only fires when primitive value changes
  lastSeenSpeed: number | undefined
}

function makeTab(name: string): TabState {
  return { name, snapshotsReceived: 0, writesSent: 0, lastSeenSpeed: undefined }
}

// Mirror of updateSpeed() in useThrottle.ts
async function updateSpeed(tab: TabState, speed: number) {
  tab.writesSent++
  console.log(`  [${tab.name}] → write speed=${speed}`)
  await docRef.set(
    { direction: speed > 0, speed: Math.abs(speed) },
    { merge: true },
  )
}

// Mirror of the reactive chain: useDocument → currentSpeed computed → watch(currentSpeed, updateSpeed)
function attachTab(tab: TabState) {
  return docRef.onSnapshot((snap: DocumentSnapshot) => {
    tab.snapshotsReceived++
    const data = snap.data() as Throttle | undefined
    const currentSpeed = data ? getSignedSpeed(data) : 0
    console.log(`  [${tab.name}] ← snapshot #${tab.snapshotsReceived} speed=${data?.speed} dir=${data?.direction} → currentSpeed=${currentSpeed}`)

    // Vue watch semantics: fire only when value changes.
    // On the very first snapshot, lastSeen is undefined → treat as initial read, don't fire.
    if (tab.lastSeenSpeed === undefined) {
      tab.lastSeenSpeed = currentSpeed
      return
    }
    if (currentSpeed !== tab.lastSeenSpeed) {
      tab.lastSeenSpeed = currentSpeed
      void updateSpeed(tab, currentSpeed)
    }
  })
}

async function run() {
  console.log(`\n🧪 Multi-tab throttle repro`)
  console.log(`📍 Doc: ${DOC_PATH}`)
  console.log(`⏱  Duration: ${DURATION_MS}ms\n`)

  // Clean slate
  console.log('🧹 Resetting test doc...')
  await docRef.set({ speed: 0, direction: true }, { merge: true })

  const tabA = makeTab('A')
  const tabB = makeTab('B')

  console.log('📡 Attaching listeners for Tab A and Tab B...\n')
  const unsubA = attachTab(tabA)
  const unsubB = attachTab(tabB)

  // Let both tabs settle on the initial snapshot
  await new Promise((r) => setTimeout(r, 500))

  // Simulate user interaction: Tab A sets speed to 50
  console.log('\n👆 Simulated user action: Tab A setSpeed(50)')
  await updateSpeed(tabA, 50)
  tabA.lastSeenSpeed = 50 // mirror: updateSpeed called from setSpeed() also updates local state

  // Observe for DURATION_MS
  await new Promise((r) => setTimeout(r, DURATION_MS))

  unsubA()
  unsubB()

  console.log('\n📊 Results:')
  console.log(`  Tab A: ${tabA.writesSent} writes, ${tabA.snapshotsReceived} snapshots`)
  console.log(`  Tab B: ${tabB.writesSent} writes, ${tabB.snapshotsReceived} snapshots`)

  const totalWrites = tabA.writesSent + tabB.writesSent
  if (totalWrites <= 3) {
    console.log(`\n✅ BOUNDED — ${totalWrites} writes. Feedback loop hypothesis NOT confirmed.`)
  } else if (totalWrites < 15) {
    console.log(`\n⚠️  SUSPICIOUS — ${totalWrites} writes in ${DURATION_MS}ms. Some amplification.`)
  } else {
    console.log(`\n🔥 RUNAWAY LOOP CONFIRMED — ${totalWrites} writes in ${DURATION_MS}ms.`)
  }

  console.log('\n🧹 Cleaning up test doc...')
  await docRef.delete()
  console.log('✅ Done.')
  process.exit(0)
}

run().catch((err) => {
  console.error('💥 Repro failed:', err)
  process.exit(1)
})
