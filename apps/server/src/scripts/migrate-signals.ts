import { FieldValue } from 'firebase-admin/firestore'
import { db } from '@repo/firebase-config/firebase-admin-node'

interface Options {
  dryRun: boolean
  deleteOriginals: boolean
  layoutFilter?: Set<string>
}

interface SignalEffectPayload {
  id?: string
  name?: string
  device?: string
  red?: number | string
  yellow?: number | string
  green?: number | string
  aspect?: 'red' | 'yellow' | 'green' | null
  commonAnode?: boolean
  description?: string
  tags?: string[]
  config?: string
  [key: string]: unknown
}

function normalizePin(pin?: number | string | null): number | undefined {
  if (pin === undefined || pin === null || pin === '') {
    return undefined
  }

  const parsed = typeof pin === 'string' ? parseInt(pin, 10) : pin
  return Number.isFinite(parsed) ? Number(parsed) : undefined
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
  const signalsRef = db.collection('layouts').doc(layoutId).collection('signals')
  const snapshot = await effectsRef.where('type', '==', 'signal').get()

  if (snapshot.empty) {
    console.log(`[${layoutId}] no signal effects found, skipping.`)
    return
  }

  console.log(`[${layoutId}] migrating ${snapshot.size} signal effect(s).`)

  for (const docSnap of snapshot.docs) {
    const effectId = docSnap.id
    const data = docSnap.data() as SignalEffectPayload

    const {
      type: _type,
      state: _state,
      timestamp: _timestamp,
      allowGuest: _allowGuest,
      pin: _pin,
      on: _on,
      off: _off,
      color: _color,
      pattern: _pattern,
      point1: _point1,
      point2: _point2,
      range: _range,
      sound: _sound,
      soundBlobUrl: _soundBlobUrl,
      soundDuration: _soundDuration,
      order: _order,
      ...rest
    } = data

    // Extract signal properties, handling both direct properties and config string
    const signalPayload = {
      id: effectId,
      name: data.name || '',
      device: data.device,
      red: normalizePin(data.red),
      yellow: normalizePin(data.yellow),
      green: normalizePin(data.green),
      aspect: (data.aspect === 'red' || data.aspect === 'yellow' || data.aspect === 'green' ? data.aspect : null) as 'red' | 'yellow' | 'green' | null,
      commonAnode: Boolean(data.commonAnode),
      description: data.description,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
      migratedFromEffectId: effectId,
      migratedFromEffectPath: docSnap.ref.path,
      migratedAt: FieldValue.serverTimestamp(),
    }

    // Remove undefined values
    Object.keys(signalPayload).forEach((key) => {
      if (signalPayload[key as keyof typeof signalPayload] === undefined) {
        delete signalPayload[key as keyof typeof signalPayload]
      }
    })

    const signalDocRef = signalsRef.doc(effectId)
    const existingSignal = await signalDocRef.get()

    if (existingSignal.exists) {
      console.log(`  [${layoutId}] signal ${effectId} already exists in signals collection, skipping copy.`)
    } else if (options.dryRun) {
      console.log(`  [${layoutId}] would create signal ${effectId} in signals collection.`)
      console.log(`    Data:`, JSON.stringify(signalPayload, null, 2))
    } else {
      await signalDocRef.set(signalPayload, { merge: true })
      console.log(`  [${layoutId}] created signal ${effectId}.`)
    }

    if (options.deleteOriginals && !options.dryRun) {
      await docSnap.ref.delete()
      console.log(`  [${layoutId}] deleted original effect ${effectId}.`)
    } else if (!options.dryRun) {
      await docSnap.ref.update({
        migratedToSignals: true,
        migratedSignalRef: signalDocRef.path,
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
  console.error('Signal migration failed:', error)
  process.exit(1)
})

