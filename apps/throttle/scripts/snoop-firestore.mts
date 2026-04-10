/**
 * 🔍 Firestore snoop for the throttle multi-instance bug.
 *
 * Listens to ALL writes on layouts/{LAYOUT_ID}/throttles and reports them
 * with timestamps, so we can see what's actually writing and at what rate.
 *
 * Usage:
 *   pnpm tsx apps/throttle/scripts/snoop-firestore.mts
 *
 * While this is running, open the throttle app in 2 browser tabs, pick the
 * same loco, and watch the output. Ctrl+C to stop.
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, type DocumentChange } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

dotenv.config()

const LAYOUT_ID = process.env.LAYOUT_ID
if (!LAYOUT_ID) throw new Error('LAYOUT_ID not set')

const app = initializeApp({
  credential: cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
})

const db = getFirestore(app)
// Collection group listener — catches ALL throttle subcollections across ALL layouts
const throttlesRef = db.collectionGroup('throttles')

console.log(`🔍 Snooping collectionGroup('throttles') across all layouts`)
console.log(`📅 Started: ${new Date().toISOString()}`)
console.log(`   Open throttle in 2 tabs, pick same loco, watch below.`)
console.log(`   Ctrl+C to stop.\n`)

const writeCounts = new Map<string, { added: number; modified: number; removed: number; lastAt: number }>()
let totalEvents = 0
const startedAt = Date.now()

function fmt(ts: number) {
  const secs = ((ts - startedAt) / 1000).toFixed(2)
  return `+${secs.padStart(6)}s`
}

function summarize(data: FirebaseFirestore.DocumentData | undefined) {
  if (!data) return '<empty>'
  const { speed, direction, address, timestamp, ...rest } = data
  const restKeys = Object.keys(rest)
  const extra = restKeys.length > 0 ? ` +{${restKeys.join(',')}}` : ''
  const ts = timestamp?.toDate ? timestamp.toDate().toISOString() : timestamp
  return `speed=${speed} dir=${direction}${ts ? ` ts=${ts}` : ''}${extra}`
}

throttlesRef.onSnapshot(
  (snap) => {
    snap.docChanges().forEach((change: DocumentChange) => {
      totalEvents++
      const now = Date.now()
      const id = change.doc.id
      const stats = writeCounts.get(id) ?? { added: 0, modified: 0, removed: 0, lastAt: 0 }

      if (change.type === 'added') stats.added++
      else if (change.type === 'modified') stats.modified++
      else if (change.type === 'removed') stats.removed++

      const deltaSinceLast = stats.lastAt ? `${((now - stats.lastAt) / 1000).toFixed(2)}s since last` : 'first'
      stats.lastAt = now
      writeCounts.set(id, stats)

      const data = change.doc.data()
      const layoutId = change.doc.ref.parent.parent?.id ?? '?'
      console.log(
        `${fmt(now)} [${change.type.padEnd(8)}] ${layoutId}/throttles/${id.padEnd(4)} ${summarize(data)} (${deltaSinceLast})`,
      )
    })
  },
  (err) => {
    console.error('❌ Snapshot error:', err)
    process.exit(1)
  },
)

// Summary every 5s
setInterval(() => {
  const elapsed = (Date.now() - startedAt) / 1000
  const rate = totalEvents / elapsed
  console.log(
    `\n📊 ${elapsed.toFixed(1)}s elapsed — ${totalEvents} events total — ${rate.toFixed(2)} events/sec`,
  )
  if (writeCounts.size > 0) {
    const sorted = [...writeCounts.entries()]
      .sort((a, b) => (b[1].added + b[1].modified + b[1].removed) - (a[1].added + a[1].modified + a[1].removed))
      .slice(0, 5)
    console.log('   Top docs by activity:')
    for (const [id, s] of sorted) {
      console.log(`     throttle/${id}: ${s.added}a ${s.modified}m ${s.removed}r`)
    }
  }
  console.log()
}, 5000)

process.on('SIGINT', () => {
  const elapsed = (Date.now() - startedAt) / 1000
  console.log(`\n\n🛑 Stopped after ${elapsed.toFixed(1)}s`)
  console.log(`Total events: ${totalEvents} (${(totalEvents / elapsed).toFixed(2)}/sec)`)
  console.log('Per-doc breakdown:')
  for (const [id, s] of writeCounts.entries()) {
    console.log(`  throttle/${id}: ${s.added} added, ${s.modified} modified, ${s.removed} removed`)
  }
  process.exit(0)
})
