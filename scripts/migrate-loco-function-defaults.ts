/**
 * Backfill loco function defaults in Firestore based on loco.hasSound.
 *
 * Usage:
 *   tsx scripts/migrate-loco-function-defaults.ts [--force]
 *
 * --force  Overwrite even locos that have been customized (isFavorite or non-default labels).
 *
 * Requires in .env:
 *   LAYOUT_ID, VITE_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */
// scripts/migrate-loco-function-defaults.ts
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import 'dotenv/config'
import { soundLocoDefaultFunctions, silentLocoDefaultFunctions } from '../packages/modules/locos/constants'
import type { LocoFunction } from '../packages/modules/locos/types'

const serviceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

initializeApp({ credential: cert(serviceAccount) })

const db = getFirestore()

/**
 * A loco is considered customized if any function is marked as a favorite
 * OR has a non-default label (anything other than "F{id}").
 * Customized locos are skipped unless --force is passed.
 */
function isCustomized(functions: LocoFunction[]): boolean {
  return functions.some(f => f.isFavorite || f.label !== `F${f.id}`)
}

async function migrate(force: boolean): Promise<void> {
  const layoutId = process.env.LAYOUT_ID
  if (!layoutId) throw new Error('LAYOUT_ID is not set in .env')

  console.log(`🚂 Migrating locos for layout: ${layoutId}${force ? ' (--force)' : ''}`)

  const snapshot = await db.collection(`layouts/${layoutId}/locos`).get()
  let updated = 0
  let skipped = 0
  let errored = 0

  for (const docSnap of snapshot.docs) {
    try {
      const data = docSnap.data()
      const existingFunctions: LocoFunction[] = data.functions ?? []

      if (!force && isCustomized(existingFunctions)) {
        console.log(`⏭️  Skipped (customized): ${data.name || docSnap.id}`)
        skipped++
        continue
      }

      if (data.hasSound === undefined) {
        console.log(`⚠️  hasSound not set, using silent defaults: ${data.name || docSnap.id}`)
      }

      const defaults = data.hasSound
        ? soundLocoDefaultFunctions
        : silentLocoDefaultFunctions

      await docSnap.ref.set({ functions: defaults }, { merge: true })
      updated++
      console.log(`✅ Updated: ${data.name || docSnap.id} (hasSound: ${!!data.hasSound})`)
    } catch (e) {
      errored++
      console.error(`❌ Error updating ${docSnap.id}:`, e)
    }
  }

  console.log(`\n📊 Migration complete:`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Errored: ${errored}`)
  console.log(`   Total:   ${snapshot.size}`)
}

const force = process.argv.includes('--force')
migrate(force).catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
