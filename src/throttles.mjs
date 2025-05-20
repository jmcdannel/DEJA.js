import {
  collection,
  onSnapshot,
  getDocs,
  query,
  limit,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase.mjs'
import log from './utils/logger.mjs'
import dcc from './dcc.mjs'

const layoutId = process.env.LAYOUT_ID
let locos = []

async function init() {
  onSnapshot(query(collection(db, `layouts/${layoutId}/locos`)), (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const loco = change.doc.data()
      // log.log('Loco change', change.type, loco)
      if (change.type === 'added') {
        locos.push({ ...loco, id: change.doc.id })
      } else if (change.type === 'modified') {
        const index = locos.findIndex((l) => l.id === change.doc.id)
        locos[index] = { ...loco, id: change.doc.id }
      } else if (change.type === 'removed') {
        locos = locos.filter((l) => l.id !== change.doc.id)
      }
    })
    // console.log('Locos', JSON.stringify(locos, null, 2))
  })
  console.log('Throttles listening for loco changes')
}

async function getLocos() {
  try {
    if (locos.length === 0) {
      const locosCol = await collection(db, `layouts/${layoutId}/locos`)
      const querySnapshot = await getDocs(locosCol)
      const locosData = []
      querySnapshot.forEach((doc) => {
        locosData.push({ ...doc.data(), id: doc.id })
      })
      locos = locosData
    }
    return locos
  } catch (error) {
    log.error('Error loading locos', error)
  }
}

export async function handleThrottleChange(snapshot) {
  log.note('handleThrottleChange')
  snapshot.docChanges().forEach(async (change) => {
    const throttleCmd = {
      address: parseInt(change.doc.data().address),
      speed: change.doc.data().direction
        ? change.doc.data().speed
        : -change.doc.data().speed,
    }
    const _locos = await getLocos()
    const loco = _locos.find((loco) => loco.locoId == throttleCmd.address)
    console.log(
      'Throttle change',
      change.type,
      change.doc.data(),
      throttleCmd,
      loco
    )
    if (loco?.consist?.length > 0) {
      loco?.consist.forEach(async (consistLoco) => {
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
            consistSpeed = throttleCmd.speed - consistLoco.trim
            if (consistSpeed > 0) {
              consistSpeed = -1
            }
          }
        } else {
          //moving backward
          if (consistLoco.direction) {
            // facing forward
            consistSpeed = throttleCmd.speed - consistLoco.trim
            if (consistSpeed > 0) {
              consistSpeed = -1
            }
          } else {
            // facing backward
            consistSpeed = throttleCmd.speed + consistLoco.trim
            if (consistSpeed < 0) {
              consistSpeed = 1
            } else {
              consistSpeed = 0
            }
          }
        }
        const consistCmd = {
          address: consistLoco.address,
          speed: consistSpeed,
        }
        console.log('Consist loco', consistLoco, throttleCmd, consistCmd, loco)
        await dcc.sendSpeed(consistCmd)
      })
    }

    // await sendSpeed(throttleCmd)
    await dcc.sendSpeed(throttleCmd)
    // await dcc.handleMessage(
    //   JSON.stringify({ action: 'throttle', payload: throttleCmd })
    // )
  })
}

init()

export default {
  handleThrottleChange,
}
