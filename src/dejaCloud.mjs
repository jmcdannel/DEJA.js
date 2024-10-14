import { 
  collection, 
  onSnapshot,
  query,
  doc,
  deleteDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  limit,
  orderBy 
} from 'firebase/firestore'
import log from './utils/logger.mjs'
import dcc from './dcc.mjs'
import { db } from './firebase.mjs'

const layoutId = process.env.LAYOUT_ID

function handleDccCommands(snapshot) {
  log.note('handleDccCommands')
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const { action, payload: payloadRaw } = change.doc.data()
      const payload = JSON.parse(payloadRaw)
      log.log("handleDccCommands: ", action, payload)
      dcc.handleMessage(JSON.stringify({ action, payload }))
    }
  })
}

function handleThrottleCommands(snapshot) {
  log.note('handleThrottleCommands')
  snapshot.docChanges().forEach(async (change) => {
    const throttleCmd = {
      address: parseInt(change.doc.data().address),
      speed: change.doc.data().direction
        ? change.doc.data().speed
        : -change.doc.data().speed,
    }
    console.log(
      "Throttle change",
      change.type,
      change.doc.data(),
      throttleCmd
    )
    // const consist = locos?.value
    //   ? unref(locos.value).find((loco) => loco.locoId == throttleCmd.address)
    //       ?.consist || []
    //   : []
    // console.log(
    //   "Consist",
    //   consist,
    //   throttleCmd,
    //   unref(locos.value).find((loco) => loco.locoId == throttleCmd.address),
    //   locos.value
    // )
    // if (consist.length > 0) {
    //   consist.forEach(async (consistLoco) => {
    //     let consistSpeed
    //     if (consistLoco.direction) {
    //       // forward
    //       consistSpeed = throttleCmd.speed + consistLoco.trim
    //     } else {
    //       // backward
    //       consistSpeed = throttleCmd.speed - consistLoco.trim
    //     }
    //     const consistCmd = {
    //       address: consistLoco.address,
    //       speed: consistSpeed,
    //     }
    //     await sendSpeed(consistCmd)
    //   })
    // }

    // await sendSpeed(throttleCmd)
    await dcc.handleMessage(JSON.stringify({ action: 'throttle', payload: throttleCmd }))

  })
}

export async function listen() {
  log.start( "Listen for dccCommands", layoutId)

  // await wipe(layoutId)
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/dccCommands`),
      orderBy("timestamp", "desc"),
      limit(10)
    ),
    handleDccCommands
  )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/throttles`),
      orderBy("timestamp", "desc"),
      limit(10)
    ),
    handleThrottleCommands
  )
  // locos.value = useCollection(collection(db, `layouts/${layoutId}/locos`))
  
}

export async function send(data) {
  try {
    log.log('dejaClound.broadcast.send', data)
    const { action, payload } = data
    switch (action) {
      case 'portList':
        await updateDoc(doc(db, 'layouts', layoutId), { ports: payload }, { merge: true })
        break
      case 'status':
      case 'getStatus':
        if (payload.isConnected) {
          await updateDoc(doc(db, 'layouts', layoutId), { 'dccEx.lastConnected': serverTimestamp(), 'dccEx.client': 'dejaJS' }, { merge: true })
        } else {
          await updateDoc(doc(db, 'layouts', layoutId), { 'dccEx.lastConnected': null, 'dccEx.client': null }, { merge: true })
        }
        break
      case 'connected':
        await updateDoc(doc(db, 'layouts', layoutId), { 'dccEx.lastConnected': serverTimestamp(), 'dccEx.client': 'dejaJS' }, { merge: true })
        break
      default:
        //noop
        // log.warn('Unknown action in `send`', action, payload)
    }
  } catch (err) {
    log.fatal('Error handling message:', err)
  }

}

async function wipe() {
  log.complete("wipe dccCommands", layoutId)
  const querySnapshot = await getDocs(
    query(
      collection(db, `layouts/${layoutId}/dccCommands`),
      orderBy("timestamp", "asc")
    )
  )
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref)
  })
}

async function reset() {
  await updateDoc(doc(db, 'layouts', layoutId), { 'dccEx.lastConnected': null, 'dccEx.client': null }, { merge: true })
}

export async function connect() {
  try {
    log.start('Connecting to DejaCloud', layoutId)
    await wipe()
    await reset()
    await listen()
    log.success('Connected to DejaCloud', layoutId)
    return true
  } catch (error) {
    log.error('Error in connect:', error)
  }
}

export default {
  listen,
  connect,
  send
}