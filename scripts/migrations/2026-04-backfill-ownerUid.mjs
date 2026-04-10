#!/usr/bin/env node
// scripts/migrations/2026-04-backfill-ownerUid.mjs
//
// Backfills `ownerUid` on every layouts/{id} Firestore doc and mirrors
// the value to RTDB at layoutOwners/{id}. Required before deploying the
// new firestore.rules + database.rules.json (which key access on
// ownerUid instead of the legacy `owner` email field).
//
// Usage:
//   FIREBASE_SERVICE_ACCOUNT=./sa.json \
//   FIREBASE_DATABASE_URL=https://<project-id>-default-rtdb.firebaseio.com \
//   node scripts/migrations/2026-04-backfill-ownerUid.mjs [--dry-run]
//
// Requires:
//   - A service-account JSON file with admin permissions on the target project
//   - The RTDB URL for the same project
//
// Idempotent: layouts already carrying `ownerUid` are skipped.
// Layouts without an `owner` email and without `ownerUid` are skipped
// with a warning (cannot be backfilled — operator must fix manually).

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dryRun = process.argv.includes('--dry-run')

const saPath = process.env.FIREBASE_SERVICE_ACCOUNT
if (!saPath) {
  console.error('ERROR: Set FIREBASE_SERVICE_ACCOUNT to a path of a service-account JSON file')
  process.exit(2)
}

const dbUrl = process.env.FIREBASE_DATABASE_URL
if (!dbUrl) {
  console.error('ERROR: Set FIREBASE_DATABASE_URL (e.g. https://<project>-default-rtdb.firebaseio.com)')
  process.exit(2)
}

const sa = JSON.parse(readFileSync(resolve(saPath), 'utf8'))

initializeApp({
  credential: cert(sa),
  databaseURL: dbUrl,
})

const db = getFirestore()
const rtdb = getDatabase()
const auth = getAuth()

async function main() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Backfilling ownerUid on layouts...`)
  console.log(`Project: ${sa.project_id}`)
  console.log(`Database URL: ${dbUrl}`)
  console.log('')

  const snapshot = await db.collection('layouts').get()
  console.log(`Found ${snapshot.size} layout document(s)`)
  console.log('')

  let updated = 0
  let alreadyMigrated = 0
  let missingOwner = 0
  let userLookupFailed = 0
  const failures = []

  for (const doc of snapshot.docs) {
    const data = doc.data()

    if (data.ownerUid) {
      // Already migrated. Make sure the RTDB mirror exists too.
      try {
        const mirrorSnap = await rtdb.ref(`layoutOwners/${doc.id}`).get()
        if (!mirrorSnap.exists() || mirrorSnap.val() !== data.ownerUid) {
          console.log(`  ${dryRun ? '[dry-run] ' : ''}MIRROR ${doc.id}: writing layoutOwners/${doc.id} = ${data.ownerUid}`)
          if (!dryRun) {
            await rtdb.ref(`layoutOwners/${doc.id}`).set(data.ownerUid)
          }
        }
      } catch (err) {
        console.error(`  WARN ${doc.id}: failed to verify/write RTDB mirror — ${err.message}`)
      }
      alreadyMigrated++
      continue
    }

    if (!data.owner || typeof data.owner !== 'string') {
      console.warn(`  SKIP ${doc.id}: no 'owner' email field — cannot backfill`)
      missingOwner++
      continue
    }

    let userRecord
    try {
      userRecord = await auth.getUserByEmail(data.owner)
    } catch (err) {
      console.error(`  FAIL ${doc.id}: cannot find Firebase user for ${data.owner} — ${err.message}`)
      userLookupFailed++
      failures.push({ layoutId: doc.id, owner: data.owner, reason: err.message })
      continue
    }

    console.log(`  ${dryRun ? '[dry-run] ' : 'UPDATE '}${doc.id}: owner=${data.owner} → ownerUid=${userRecord.uid}`)
    if (!dryRun) {
      await doc.ref.update({ ownerUid: userRecord.uid })
      await rtdb.ref(`layoutOwners/${doc.id}`).set(userRecord.uid)
    }
    updated++
  }

  console.log('')
  console.log('Summary:')
  console.log(`  Updated:           ${updated}`)
  console.log(`  Already migrated:  ${alreadyMigrated}`)
  console.log(`  Missing owner:     ${missingOwner}`)
  console.log(`  User lookup fail:  ${userLookupFailed}`)
  console.log(`  Total layouts:     ${snapshot.size}`)

  if (failures.length > 0) {
    console.log('')
    console.log('Failures:')
    for (const f of failures) {
      console.log(`  - ${f.layoutId} (owner=${f.owner}): ${f.reason}`)
    }
  }

  if (dryRun) {
    console.log('')
    console.log('DRY RUN — no changes written. Re-run without --dry-run to apply.')
  }

  process.exit(failures.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
