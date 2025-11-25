import {
  type DocumentData,
  collection,
  onSnapshot,
  getDocs,
  query,
} from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase-admin-node'
import type { Loco } from '@repo/modules'
import { log } from '../utils/logger.js'
import { dcc, type ThrottlePayload } from '../lib/dcc.js'

const layoutId = process.env.LAYOUT_ID
let locos: Loco[] = []

export async function listenToLocoChanges(): Promise<void> {
  if (!layoutId) {
    log.error('Layout ID is not set')
    return
  }
  log.start('Throttles listening for loco changes on layout: ', layoutId)
  db.collection(`layouts/${layoutId}/locos`).onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const loco = change.doc.data()
      // log.log('Loco change', change.type, loco)
      if (change.type === 'added') {
        locos.push({ ...loco, id: change.doc.id } as Loco)
      } else if (change.type === 'modified') {
        const index = locos.findIndex((l) => l.id === change.doc.id)
        locos[index] = { ...loco, id: change.doc.id } as Loco
      } else if (change.type === 'removed') {
        locos = locos.filter((l) => l.id !== change.doc.id)
      }
    })
    // console.log('Locos', JSON.stringify(locos, null, 2))
  })
  // console.log('Throttles listening for loco changes')
}

async function getLocos(): Promise<Loco[]> {
  try {
    if (locos.length === 0) {
      const locosData = await db.collection(`layouts/${layoutId}/locos`).get()
      locos = locosData.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Loco))
    }
    return locos
  } catch (error) {
    log.error('Error loading locos', error)
    return []
  }
}
function calculateConsistSpeed(baseSpeed: number, trim: number, consistDirection: boolean): number {
  // baseSpeed: signed speed of the lead loco (positive = forward, negative = backward)
  // trim: non-negative adjustment to apply when appropriate
  // consistDirection: true = loco is oriented "forward", false = oriented "backward"

  if (baseSpeed === 0) return 0

  const leaderSign = Math.sign(baseSpeed) || 1
  const absSpeed = Math.abs(baseSpeed)

  // If leader speed is less than or equal to the trim threshold, don't apply trim.
  const appliedMagnitude = absSpeed <= trim ? absSpeed : absSpeed + trim

  // Ensure moving speeds are never 0 (use at least 1) when leader is moving.
  const finalMagnitude = Math.max(1, appliedMagnitude)

  // If the consist's orientation is the same as "forward", it uses leaderSign;
  // otherwise it must invert the sign so the consist moves in the same rail direction.
  const finalSign = consistDirection ? leaderSign : -leaderSign

  return finalSign * finalMagnitude

}

export async function handleThrottleChange(snapshot: DocumentData): Promise<void> {
  snapshot.docChanges().forEach(async (change: DocumentData) => {
    const throttleCmd: ThrottlePayload = {
      address: change.doc.data().address,
      speed: change.doc.data().direction
        ? change.doc.data().speed
        : -change.doc.data().speed,
    }
    const _locos = await getLocos()
    const loco = _locos.find((_loco) => _loco.address == throttleCmd.address)
    // console.log(
    //   'Throttle change',
    //   change.type,
    //   change.doc.data(),
    //   throttleCmd,
    //   loco
    // )
    if (loco?.consist && loco?.consist?.length > 0) {
      loco?.consist.forEach(async (consistLoco) => {
        
        const consistCmd:ThrottlePayload = {
          address: consistLoco.address,
          speed: calculateConsistSpeed(throttleCmd.speed, consistLoco.trim, consistLoco.direction),
        }
        // console.log('Consist loco', consistLoco, throttleCmd, consistCmd, loco)
        await dcc.sendSpeed(consistCmd)
      })
    }

    await dcc.sendSpeed(throttleCmd)
  })
}


export default {
  handleThrottleChange,
  listenToLocoChanges
}
