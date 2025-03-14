import { storeToRefs } from 'pinia'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useSerial } from '@/api/serialApi'
import { useDejaJs } from '@/api/useDejaJs'
import { useConnectionStore } from '@/connections/connectionStore'
import { useDejaCloud } from '@/deja-cloud/useDejaCloud'

export function useDcc() {
  const connStore = useConnectionStore()
  const serialApi = useSerial()
  const dejaJsApi = useDejaJs()
  const dejaCloud = useDejaCloud()
  const {
    layoutId,
    isDejaJS,
    isDejaServer,
    isEmulated,
    isSerial,
    mqttConnected,
  } = storeToRefs(connStore)

  async function setPower(payload: object) {
    try {
      console.log('[DCC API].setPower', payload)
      await send('power', payload)
    } catch (err: any) {
      console.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function setSpeed(address: any, speed: any) {
    try {
      await send('throttle', { address, speed })
    } catch (err: any) {
      console.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function setTurnout(turnoutId: any, state: any) {
    try {
      send('turnout', { turnoutId, state })
    } catch (err: any) {
      console.error('[DCC API].setTurnout', err)
      throw new Error(err)
    }
  }

  async function setFunction(address: any, func: any, state: any) {
    try {
      await send('function', { address, func, state })
    } catch (err: any) {
      console.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function sendOutput(pin: any, state: any) {
    try {
      console.log('[DCC API].sendOutput', pin, state)
      await send('output', { pin, state })
    } catch (err: any) {
      console.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function sendDccCommand({ action, payload }) {
    // console.log('dejaCloud SEND', action, payload)
    try {
      const command = {
        action,
        payload: JSON.stringify(payload),
        timestamp: serverTimestamp(),
      }

      await addDoc(
        collection(db, `layouts/${layoutId.value}/dccCommands`),
        command
      )
      // console.log('Document written with ID: ', command)
    } catch (e) {
      console.error('sendDccCommand: ', e)
    }
  }

  async function send(action: string, payload?: object) {
    try {
      if (isEmulated.value) {
        console.log('[DEJA EMULATOR] send', action, payload)
        return
      } else if (isSerial.value) {
        console.log('[SERIAL] send', action, payload)
        serialApi.send(action, payload)
        return
      } else if (isDejaJS.value || mqttConnected.value || isDejaServer.value) {
        console.log(
          '[dejaCloud] send',
          `@ttt/dcc/${layoutId.value}`,
          action,
          payload
        )
        dejaCloud.send({ action, payload })
      } else {
        console.error('[DISCONNECTED] !send', action, payload)
      }
    } catch (err) {
      console.error('[DCC API].send', err)
    }
  }

  return {
    sendDccCommand,
    send,
    setPower,
    setSpeed,
    setFunction,
    sendOutput,
    setTurnout,
  }
}

export default useDcc
