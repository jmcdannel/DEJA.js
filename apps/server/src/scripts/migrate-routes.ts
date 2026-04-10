// ⚠️ Operator-run one-shot migration script — NOT part of the running server.
// Requires a service-account JSON file on the operator's machine:
//
//   FIREBASE_SERVICE_ACCOUNT=./sa.json \
//   tsx apps/server/src/scripts/migrate-routes.ts [--dry-run] [--layout id1,id2] [--delete-originals]
//
// Uses the Firebase Admin SDK directly (bypasses Firestore rules) so it
// can read/write every layout document. Do not import from production
// server code.

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const saPath = process.env.FIREBASE_SERVICE_ACCOUNT
if (!saPath) {
  console.error('ERROR: Set FIREBASE_SERVICE_ACCOUNT to the path of a service-account JSON file')
  process.exit(2)
}
const sa = JSON.parse(readFileSync(resolve(saPath), 'utf8'))
if (!getApps().length) {
  initializeApp({ credential: cert(sa) })
}
const db = getFirestore()

interface Options {
  dryRun: boolean
  deleteOriginals: boolean
  layoutFilter?: Set<string>
}

interface RouteTurnoutConfig {
  id?: string | number
  name?: string
  device?: string
  state?: boolean
  type?: string
  direction?: boolean | string
}

interface RouteEffectPayload {
  id?: string
  name?: string
  point1?: string
  point2?: string
  on?: any[]
  off?: any[]
  turnouts?: RouteTurnoutConfig[]
  color?: string
  tags?: string[]
  order?: number
  description?: string
  [key: string]: unknown
}

function parseArgs(): Options {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const deleteOriginals = args.includes('--delete-originals')
  const layoutIndex = args.findIndex((arg) => arg === '--layout')
  let layoutFilter: Set<string> | undefined

  if (layoutIndex !== -1) {
    const next = args[layoutIndex + 1]
    if (!next) {
      throw new Error('--layout flag requires a comma-separated list of layout ids')
    }
    layoutFilter = new Set(next.split(',').map((id) => id.trim()).filter(Boolean))
  }

  return { dryRun, deleteOriginals, layoutFilter }
}

async function migrateLayout(layoutId: string, options: Options) {
  const effectsRef = db.collection('layouts').doc(layoutId).collection('effects')
  const routesRef = db.collection('layouts').doc(layoutId).collection('routes')
  const snapshot = await effectsRef.where('type', '==', 'route').get()

  if (snapshot.empty) {
    console.log(`[${layoutId}] no route effects found, skipping.`)
    return
  }

  console.log(`[${layoutId}] migrating ${snapshot.size} route effect(s).`)

  for (const docSnap of snapshot.docs) {
    const effectId = docSnap.id
    const data = docSnap.data() as RouteEffectPayload

    const {
      type: _type,
      state: _state,
      timestamp: _timestamp,
      on,
      off,
      allowGuest: _allowGuest,
      turnouts: existingTurnouts,
      ...rest
    } = data

    // Use existing turnouts if available, otherwise convert from on/off arrays
    let turnouts: RouteTurnoutConfig[] = []
    
    if (Array.isArray(existingTurnouts) && existingTurnouts.length > 0) {
      // If turnouts already exist, use them directly
      turnouts = existingTurnouts.map((item) => ({
        ...item,
        type: item?.type ?? 'turnout',
      }))
    } else {
      // Convert legacy on/off arrays to turnouts format
      if (Array.isArray(on)) {
        turnouts.push(
          ...on.map((item) => ({
            ...item,
            state: item?.state ?? true,
            type: item?.type ?? 'turnout',
          }))
        )
      }
      if (Array.isArray(off)) {
        turnouts.push(
          ...off.map((item) => ({
            ...item,
            state: item?.state ?? false,
            type: item?.type ?? 'turnout',
          }))
        )
      }
    }

    const routePayload: RouteEffectPayload = {
      ...rest,
      id: effectId,
      turnouts,
      migratedFromEffectId: effectId,
      migratedFromEffectPath: docSnap.ref.path,
      migratedAt: FieldValue.serverTimestamp(),
    }

    const routeDocRef = routesRef.doc(effectId)
    const existingRoute = await routeDocRef.get()

    if (existingRoute.exists) {
      console.log(`  [${layoutId}] route ${effectId} already exists in routes collection, skipping copy.`)
    } else if (options.dryRun) {
      console.log(`  [${layoutId}] would create route ${effectId} in routes collection.`)
    } else {
      await routeDocRef.set(routePayload, { merge: true })
      console.log(`  [${layoutId}] created route ${effectId}.`)
    }

    if (options.deleteOriginals && !options.dryRun) {
      await docSnap.ref.delete()
      console.log(`  [${layoutId}] deleted original effect ${effectId}.`)
    } else if (!options.dryRun) {
      await docSnap.ref.update({
        migratedToRoutes: true,
        migratedRouteRef: routeDocRef.path,
        migratedAt: FieldValue.serverTimestamp(),
      })
      console.log(`  [${layoutId}] marked effect ${effectId} as migrated.`)
    } else {
      console.log(`  [${layoutId}] would mark effect ${effectId} as migrated.`)
    }
  }
}

async function main() {
  const options = parseArgs()
  const layoutsSnap = await db.collection('layouts').get()

  for (const layout of layoutsSnap.docs) {
    if (options.layoutFilter && !options.layoutFilter.has(layout.id)) {
      continue
    }
    await migrateLayout(layout.id, options)
  }

  console.log('Migration complete.')
}

main().catch((error) => {
  console.error('Route migration failed:', error)
  process.exit(1)
})
