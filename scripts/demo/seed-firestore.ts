import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEMO_LAYOUT_ID = 'demo-betatrack'
const DEMO_OWNER = 'demo@dejajs.com'

// Initialize Firebase Admin
// Requires FIREBASE_SERVICE_ACCOUNT env var with service account JSON
const app = initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')),
})
const db = getFirestore(app)

interface SeedData {
  layout: Record<string, unknown>
  subCollections: Record<string, Record<string, Record<string, unknown>>>
}

async function seedDemoData() {
  const seedPath = resolve(__dirname, 'seed-data.json')
  const raw = readFileSync(seedPath, 'utf-8')
  const data: SeedData = JSON.parse(raw)

  console.log('🚂 Seeding demo layout data...')

  // 1. Write the layout document
  const layoutRef = db.collection('layouts').doc(DEMO_LAYOUT_ID)
  await layoutRef.set({
    ...data.layout,
    id: DEMO_LAYOUT_ID,
    owner: DEMO_OWNER,
    name: 'Demo - BetaTrack',
  })
  console.log(`  ✅ Layout document: layouts/${DEMO_LAYOUT_ID}`)

  // 2. Write sub-collections
  for (const [collectionName, docs] of Object.entries(data.subCollections)) {
    const collRef = layoutRef.collection(collectionName)

    // Batch delete existing + write new docs (atomic per sub-collection)
    const batch = db.batch()
    const existing = await collRef.listDocuments()
    for (const doc of existing) {
      batch.delete(doc)
    }

    let count = 0
    for (const [docId, docData] of Object.entries(docs)) {
      batch.set(collRef.doc(docId), docData)
      count++
    }
    await batch.commit()
    console.log(`  ✅ ${collectionName}: ${count} documents`)
  }

  console.log('\n🎉 Demo data seeded successfully!')
  console.log(`   Layout ID: ${DEMO_LAYOUT_ID}`)
  console.log(`   Owner: ${DEMO_OWNER}`)
}

seedDemoData().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
