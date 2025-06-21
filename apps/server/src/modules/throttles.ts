import {
  type DocumentData,
  collection,
  onSnapshot,
  getDocs,
  query,
} from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase-node'
import type { Loco } from '@repo/modules/locos'
import { log } from '../utils/logger.js'
import { dcc, type ThrottlePayload } from '../lib/dcc.js'

const layoutId = process.env.LAYOUT_ID
let locos: Loco[] = []

async function init(): Promise<void> {
  onSnapshot(query(collection(db, `layouts/${layoutId}/locos`)), (snapshot) => {
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
      const locosCol = await collection(db, `layouts/${layoutId}/locos`)
      const querySnapshot = await getDocs(locosCol)
      const locosData: Loco[] = []
      querySnapshot.forEach((doc) => {
        locosData.push({ ...doc.data(), id: doc.id } as Loco)
      })
      locos = locosData
    }
    return locos
  } catch (error) {
    log.error('Error loading locos', error)
    return []
  }
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
      loco?.
      consist.forEach(async (consistLoco) => {
        let consistSpeed
        if (throttleCmd.speed > 0) {
          //moving forward
          if (consistLoco.direction) {
            // facing forward
            consistSpeed = throttleCmd.speed + consistLoco.trim
            if (consistSpeed < 0) {
              consistSpeed = 1
            }
          } else {
            // facing backward
            consistSpeed = -throttleCmd.speed - consistLoco.trim
            if (consistSpeed > 0) {
              consistSpeed = -1
            }
          }
        } else if (throttleCmd.speed <= 0 && consistLoco.direction) {
          // facing forward
          consistSpeed = throttleCmd.speed - consistLoco.trim
          if (consistSpeed > 0) {
            consistSpeed = -1
          }
        } else {
          // facing backward
          consistSpeed = -throttleCmd.speed + consistLoco.trim
          if (consistSpeed < 0) {
            consistSpeed = 1
          }
        }
        
        const consistCmd:ThrottlePayload = {
          address: consistLoco.address,
          speed: consistSpeed,
        }
        // console.log('Consist loco', consistLoco, throttleCmd, consistCmd, loco)
        await dcc.sendSpeed(consistCmd)
      })
    }

    await dcc.sendSpeed(throttleCmd)
  })
}

init()

export default {
  handleThrottleChange,
}
