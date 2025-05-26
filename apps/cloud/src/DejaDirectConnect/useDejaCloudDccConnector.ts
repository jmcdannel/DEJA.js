import { ref, unref } from 'vue'
import {
  doc,
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
} from 'firebase/firestore'
import { useCollection } from 'vuefire'
import { db } from '../firebase'
import useSerial from './useSerial'

export function useDejaCloudDccConnector() {
  const serial = useSerial(() => {})
  // const { notify } = useToast()
  const notify = () => {
    console.log('notify', arguments)
  }

  let handleCount = 0
  let listenCount = 0
  let currentLayoutId: string | null = null

  const locos = ref(null)

  function handleDccCommands(snapshot) {
    handleCount++
    if (handleCount > 0) {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          console.log('New: ', change.doc.data())
          parseDejaCommand(change.doc.data())
        }
      })
    }
  }

  function handleThrottleCommands(snapshot) {
    snapshot.docChanges().forEach(async (change) => {
      console.log(
        'Throttle change',
        change.type,
        change.doc.data(),
        locos.value
      )
      const throttleCmd = {
        address: parseInt(change.doc.data().address),
        speed: change.doc.data().direction
          ? change.doc.data().speed
          : -change.doc.data().speed,
      }
      const consist = locos?.value
        ? unref(locos.value).find((loco) => loco.locoId == throttleCmd.address)
            ?.consist || []
        : []
      console.log(
        'Consist',
        consist,
        throttleCmd,
        unref(locos.value).find((loco) => loco.locoId == throttleCmd.address),
        locos.value
      )
      if (consist.length > 0) {
        consist.forEach(async (consistLoco) => {
          let consistSpeed
          if (consistLoco.direction) {
            // forward
            consistSpeed = throttleCmd.speed + consistLoco.trim
          } else {
            // backward
            consistSpeed = throttleCmd.speed - consistLoco.trim
          }
          const consistCmd = {
            address: consistLoco.address,
            speed: consistSpeed,
          }
          await sendSpeed(consistCmd)
        })
      }

      await sendSpeed(throttleCmd)
    })
  }

  const send = async (data) => {
    try {
      const cmd = `<${data}>\n`
      console.log('Writing to ports', data)
      serial.send(cmd)
    } catch (err) {
      console.error('Error writting to port:', err)
    }
  }

  async function parseDejaCommand({ action, payload }) {
    try {
      const cmd = JSON.parse(payload)
      switch (action) {
        case 'power':
          await power(cmd)
          break
        case 'function':
          await sendFunction(cmd)
          break
        case 'getStatus':
        case 'status':
          await getStatus()
          break
        // case "output":
        //   await sendOutput(cmd)
        //   break
        // case "turnout":
        //   // await sendTurnout(payload)
        //   break
        // case "throttle":
        //   await sendSpeed(cmd)
        //   break
        // case "connect":
        //   await connect(payload)
        //   break
        // case "dcc":
        //   await send(payload)
        //   break
        // case "listPorts":
        //   await listPorts()
        //   break
        default:
          //noop
          console.warn('Unknown action in `handleMessage`', action, payload)
      }
    } catch (err) {
      console.error('Error handling message:', err)
    }
  }

  const getStatus = async () => {
    await send('s')
    notify({ message: 'Status reuested', position: 'bottom-right' })
  }

  const power = async (state) => {
    console.log('Powering', state, state.toString().startsWith('1'))
    await send(state)
    notify(
      state.toString().startsWith('1')
        ? { message: 'ON', color: 'success', position: 'bottom-right' }
        : { message: 'OFF', color: 'danger', position: 'bottom-right' }
    )
  }

  const sendSpeed = async ({ address, speed }) => {
    console.log('sendSpeed', address, speed)
    const direction = speed > 0 ? 1 : 0
    const absSpeed = Math.abs(speed)
    const cmd = `t ${address} ${absSpeed} ${direction}`
    await send(cmd)
    notify({
      message: `Locomotive ${address} set to speed ${absSpeed}`,
      color: 'info',
      position: 'bottom-right',
    })
  }

  const sendFunction = async ({ address, func, state }) => {
    console.log('sendFunction', address, func)
    const cmd = `F ${address} ${func} ${state ? 1 : 0}`
    await send(cmd)
    notify({
      message: `Locomotive ${address} function ${func} ${state ? 'ON' : 'OFF'}`,
      color: state ? '#03fcc2' : '#9e9e9e',
      position: 'bottom-right',
    })
  }

  async function listen(layoutId: string) {
    console.log(
      'Listen for dccCommands',
      layoutId,
      currentLayoutId,
      handleCount,
      listenCount
    )
    if (layoutId && currentLayoutId === layoutId) return // already listening

    await wipe(layoutId)
    onSnapshot(
      query(
        collection(db, `layouts/${layoutId}/dccCommands`),
        orderBy('timestamp', 'desc'),
        limit(10)
      ),
      handleDccCommands
    )
    onSnapshot(
      query(
        collection(db, `layouts/${layoutId}/throttles`),
        orderBy('timestamp', 'desc'),
        limit(10)
      ),
      handleThrottleCommands
    )
    locos.value = useCollection(collection(db, `layouts/${layoutId}/locos`))
    currentLayoutId = layoutId
    listenCount++
    console.log(
      'Listening for dccCommands',
      layoutId,
      currentLayoutId,
      handleCount,
      listenCount
    )
  }

  async function clear(layoutId: string, count = 10) {
    console.log('Clearing dccCommands', layoutId)
    const querySnapshot = await getDocs(
      query(
        collection(db, `layouts/${layoutId}/dccCommands`),
        orderBy('timestamp', 'asc'),
        limit(count)
      )
    )
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })
  }

  async function wipe(layoutId: string) {
    console.log('wipe dccCommands', layoutId)
    const querySnapshot = await getDocs(
      query(
        collection(db, `layouts/${layoutId}/dccCommands`),
        orderBy('timestamp', 'asc')
      )
    )
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })
  }

  return { listen, clear }
}

export default useDejaCloudDccConnector
