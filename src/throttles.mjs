import log from './utils/logger.mjs'
import dcc from './dcc.mjs'

export async function handleThrottleChange(snapshot) {
  log.note('handleThrottleChange')
  snapshot.docChanges().forEach(async (change) => {
    const throttleCmd = {
      address: parseInt(change.doc.data().address),
      speed: change.doc.data().direction
        ? change.doc.data().speed
        : -change.doc.data().speed,
    }
    console.log('Throttle change', change.type, change.doc.data(), throttleCmd)
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
    await dcc.handleMessage(
      JSON.stringify({ action: 'throttle', payload: throttleCmd })
    )
  })
}

export default {
  handleThrottleChange,
}
