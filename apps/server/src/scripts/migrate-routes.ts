import { FieldValue } from 'firebase-admin/firestore'
import { db } from '@repo/firebase-config/firebase-admin-node'

interface Options {
  dryRun: boolean
  deleteOriginals: boolean
  layoutFilter?: Set<string>
}

interface RouteEffectPayload {
  id?: string
  name?: string
  point1?: string
  point2?: string
  on?: any[]
  off?: any[]
  turnouts?: any[]
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
      turnouts: _legacyTurnouts,
      ...rest
    } = data

    const turnouts: any[] = []
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
