/**
 * 🔍 Broad Firestore snoop — watches ALL key subcollections and user prefs.
 * Catches the runaway write whatever doc it's hitting.
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, type DocumentChange } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

dotenv.config()

const app = initializeApp({
  credential: cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
})

const db = getFirestore(app)
const startedAt = Date.now()
let total = 0
const perCollection = new Map<string, number>()

function fmt(ts: number) {
  return `+${((ts - startedAt) / 1000).toFixed(2).padStart(7)}s`
}

function summarize(data: FirebaseFirestore.DocumentData | undefined) {
  if (!data) return '<empty>'
  const keys = Object.keys(data).slice(0, 6)
  const parts: string[] = []
  for (const k of keys) {
    const v = data[k]
    if (v && typeof v === 'object' && 'toDate' in v) parts.push(`${k}=<ts>`)
    else if (v && typeof v === 'object') parts.push(`${k}={…}`)
    else parts.push(`${k}=${String(v).slice(0, 20)}`)
  }
  return parts.join(' ')
}

function watchGroup(name: string) {
  const prevSkipFirst = new Set<string>()
  let isInitialLoad = true

  db.collectionGroup(name).onSnapshot(
    (snap) => {
      snap.docChanges().forEach((change: DocumentChange) => {
        // Skip the initial "added" burst so we only see live changes
        if (isInitialLoad && change.type === 'added') {
          prevSkipFirst.add(change.doc.ref.path)
          return
        }

        total++
        const now = Date.now()
        const path = change.doc.ref.path
        perCollection.set(name, (perCollection.get(name) ?? 0) + 1)
        const data = change.doc.data()
        console.log(
          `${fmt(now)} [${change.type.padEnd(8)}] ${path}  ${summarize(data)}`,
        )
      })
      isInitialLoad = false
    },
    (err) => console.error(`❌ ${name} error:`, err.message),
  )
}

// User preferences doc listener (users/{uid})
function watchUsers() {
  let isInitialLoad = true
  db.collection('users').onSnapshot(
    (snap) => {
      snap.docChanges().forEach((change: DocumentChange) => {
        if (isInitialLoad && change.type === 'added') return
        total++
        const now = Date.now()
        perCollection.set('users', (perCollection.get('users') ?? 0) + 1)
        const data = change.doc.data()
        console.log(
          `${fmt(now)} [${change.type.padEnd(8)}] users/${change.doc.id}  ${summarize(data)}`,
        )
      })
      isInitialLoad = false
    },
    (err) => console.error(`❌ users error:`, err.message),
  )
}

console.log(`🔍 Broad snoop — ${new Date().toISOString()}`)
console.log(`   Watching: throttles, turnouts, signals, effects, locos, devices, users`)
console.log(`   (initial existing docs skipped — showing LIVE changes only)\n`)

for (const group of ['throttles', 'turnouts', 'signals', 'effects', 'locos', 'devices']) {
  watchGroup(group)
}
watchUsers()

setInterval(() => {
  const elapsed = (Date.now() - startedAt) / 1000
  const rate = total / Math.max(elapsed, 1)
  if (total > 0) {
    const parts = [...perCollection.entries()].map(([k, v]) => `${k}:${v}`).join(' ')
    console.log(`\n📊 ${elapsed.toFixed(1)}s — ${total} live events (${rate.toFixed(2)}/s)  ${parts}\n`)
  }
}, 5000)

process.on('SIGINT', () => {
  const elapsed = (Date.now() - startedAt) / 1000
  console.log(`\n🛑 Stopped after ${elapsed.toFixed(1)}s — ${total} total events`)
  process.exit(0)
})
