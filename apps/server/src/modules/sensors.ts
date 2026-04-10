import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type DocumentData,
  type DocumentChange,
  type QuerySnapshot,
} from 'firebase/firestore'
import { getDb } from '../lib/firebase-client.js'
import { log } from '../utils/logger'
import { broadcast } from '../broadcast'
import { handleMacro } from './effects.js'

const layoutId = process.env.LAYOUT_ID

// In-memory debounce/cooldown tracking
interface SensorTracking {
  lastActivated: number
  retryCount: number
  retryWindowStart: number
}

const sensorTracking = new Map<string, SensorTracking>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- sensor documents have flexible schema from Firestore
function shouldProcess(sensor: any): boolean {
  if (!sensor.enabled) return false

  const tracking = sensorTracking.get(sensor.id)
  const now = Date.now()

  if (tracking) {
    // Debounce check
    if (sensor.debounceMs && (now - tracking.lastActivated) < sensor.debounceMs) {
      log.debug(`[SENSORS] Debounced sensor ${sensor.id}`)
      return false
    }

    // Cooldown check
    if (sensor.cooldownMs && (now - tracking.lastActivated) < sensor.cooldownMs) {
      log.debug(`[SENSORS] Cooldown active for sensor ${sensor.id}`)
      return false
    }

    // Retry limit check
    if (sensor.maxRetries && sensor.retryWindowMs) {
      if ((now - tracking.retryWindowStart) < sensor.retryWindowMs) {
        if (tracking.retryCount >= sensor.maxRetries) {
          log.warn(`[SENSORS] Retry limit reached for sensor ${sensor.id}`)
          return false
        }
      } else {
        // Reset retry window
        tracking.retryWindowStart = now
        tracking.retryCount = 0
      }
    }
  }

  // Update tracking
  const existing = sensorTracking.get(sensor.id)
  sensorTracking.set(sensor.id, {
    lastActivated: now,
    retryCount: (existing?.retryCount ?? 0) + 1,
    retryWindowStart: existing?.retryWindowStart ?? now,
  })

  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- sensor documents have flexible schema from Firestore
async function handleSensorActivation(sensor: any): Promise<void> {
  if (!layoutId) return

  const state = sensor.invertState ? !sensor.state : sensor.state

  const db = getDb()

  // Trigger linked effect
  if (sensor.effectId) {
    try {
      await setDoc(
        doc(db, `layouts/${layoutId}/effects/${sensor.effectId}`),
        { state, timestamp: serverTimestamp() },
        { merge: true },
      )
      log.success(`[SENSORS] Triggered effect ${sensor.effectId} for sensor ${sensor.id}`)
    } catch (error) {
      log.error(`[SENSORS] Failed to trigger effect for sensor ${sensor.id}:`, error)
    }
  }

  // Trigger linked automation
  if (sensor.automationId) {
    try {
      const automationDoc = await getDoc(
        doc(db, `layouts/${layoutId}/automations/${sensor.automationId}`),
      )
      if (automationDoc.exists()) {
        const automation = { id: automationDoc.id, ...automationDoc.data() }
        await handleSensorAutomation(sensor, automation)
      }
    } catch (error) {
      log.error(`[SENSORS] Failed to trigger automation for sensor ${sensor.id}:`, error)
    }
  }

  // Update block occupancy
  if (sensor.blockId) {
    try {
      const { updateBlockOccupancy } = await import('./blocks.js')
      await updateBlockOccupancy(sensor.blockId)
    } catch (error) {
      log.error(`[SENSORS] Failed to update block for sensor ${sensor.id}:`, error)
    }
  }

  // Broadcast state change to WebSocket clients
  broadcast({
    action: 'sensor',
    payload: { id: sensor.id, state: sensor.state, blockId: sensor.blockId },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- automation documents have flexible schema from Firestore
async function handleSensorAutomation(sensor: any, automation: any): Promise<void> {
  if (!layoutId || !automation.enabled) return

  const shouldTrigger = automation.triggerOn === 'both'
    || (automation.triggerOn === 'activate' && sensor.state)
    || (automation.triggerOn === 'deactivate' && !sensor.state)

  if (!shouldTrigger) return

  // Apply delay if configured
  if (automation.delay && automation.delay > 0) {
    await new Promise(resolve => setTimeout(resolve, automation.delay))
  }

  // Process actions sequentially
  for (const action of automation.actions || []) {
    try {
      await processAction(action)
    } catch (error) {
      log.error(`[SENSORS] Failed to process automation action:`, error)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- action documents have flexible schema from Firestore
async function processAction(action: any): Promise<void> {
  if (!layoutId) return

  const db = getDb()

  switch (action.type) {
    case 'effect':
      await setDoc(
        doc(db, `layouts/${layoutId}/effects/${action.id}`),
        { state: action.state ?? true, timestamp: serverTimestamp() },
        { merge: true },
      )
      break
    case 'turnout':
      await setDoc(
        doc(db, `layouts/${layoutId}/turnouts/${action.id}`),
        { state: action.state ?? false, timestamp: serverTimestamp() },
        { merge: true },
      )
      break
    case 'signal':
      await setDoc(
        doc(db, `layouts/${layoutId}/signals/${action.id}`),
        { aspect: action.aspect ?? null, timestamp: serverTimestamp() },
        { merge: true },
      )
      break
    case 'throttle':
      await setDoc(
        doc(db, `layouts/${layoutId}/throttles/${action.id}`),
        {
          speed: action.speed ?? 0,
          direction: action.direction ?? true,
          timestamp: serverTimestamp(),
        },
        { merge: true },
      )
      break
    case 'route': {
      const routeDoc = await getDoc(
        doc(db, `layouts/${layoutId}/routes/${action.id}`),
      )
      if (!routeDoc.exists()) {
        log.warn(`[SENSORS] Route ${action.id} not found`)
        break
      }
      const route = routeDoc.data()
      const turnouts: Array<{ id?: string | number; state?: boolean }> = route?.turnouts || []
      for (const turnout of turnouts) {
        if (turnout.id) {
          await setDoc(
            doc(db, `layouts/${layoutId}/turnouts/${turnout.id.toString()}`),
            { state: turnout.state ?? true, timestamp: serverTimestamp() },
            { merge: true },
          )
        }
      }
      log.success(`[SENSORS] Executed route ${action.id} (${turnouts.length} turnouts)`)
      break
    }
    case 'macro': {
      const macroDoc = await getDoc(
        doc(db, `layouts/${layoutId}/effects/${action.id}`),
      )
      if (!macroDoc.exists()) {
        log.warn(`[SENSORS] Macro effect ${action.id} not found`)
        break
      }
      const macro = { id: macroDoc.id, ...macroDoc.data() } as any
      macro.state = action.state ?? true
      await handleMacro(macro)
      log.success(`[SENSORS] Executed macro ${action.id}`)
      break
    }
    default:
      log.warn(`[SENSORS] Unknown action type: ${action.type}`)
  }
}

export async function handleSensorChange(snapshot: QuerySnapshot<DocumentData>): Promise<void> {
  if (!layoutId) {
    log.error('Layout ID is not set')
    return
  }
  if (!snapshot || !snapshot.docChanges) {
    log.error('Invalid snapshot data', snapshot)
    return
  }

  snapshot.docChanges().forEach(async (change: DocumentChange<DocumentData>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sensor documents have flexible schema from Firestore
    const sensor = { id: change.doc.id, ...change.doc.data() } as any
    if (change.type === 'modified') {
      log.log('[SENSORS] Sensor modified', sensor.id, Boolean(sensor.state))
      if (shouldProcess(sensor)) {
        await handleSensorActivation(sensor)
      }
    }
  })
}

export default { handleSensorChange }
