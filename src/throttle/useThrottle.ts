import { storeToRefs } from 'pinia'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useDcc } from '@/api/dccApi'
import { db } from '@/firebase'
import { useConnectionStore } from '@/connections/connectionStore'
import type { ConsistLoco } from './types'

const SWITCH_DIR_DELAY = 1000 // delay in ms to switch direction - occurs when slider goes from positive to negative value - which an occur quickly

export const useThrottle = () => {
  const dccApi = useDcc()
  const connStore = useConnectionStore()
  const { layoutId } = storeToRefs(connStore)

  async function acquireThrottle(address) {
    console.log('useThrottle aquireThrottle', address)
    try {
      const data = {
        address: parseInt(address),
        speed: 0,
        direction: false,
        timestamp: serverTimestamp(),
      }
      const newThrottleDoc = await setDoc(
        doc(db, `layouts/${layoutId.value}/throttles`, address.toString()),
        data
      )
      console.log('throttle written with ID: ', newThrottleDoc)
      return newThrottleDoc
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function updateSpeed(
    address: number,
    consist: ConsistLoco[],
    newSpeed: number,
    oldSpeed: number
  ) {
    if (!address) {
      return
    }
    let delay = 0

    if (newSpeed > 0 && oldSpeed < 0) {
      //change direction to forward
      stop(address, consist)
      delay = SWITCH_DIR_DELAY
    } else if (newSpeed < 0 && oldSpeed > 0) {
      //change direction to reverse
      stop(address, consist)
      delay = SWITCH_DIR_DELAY
    }

    console.log('updateSpeed', newSpeed, consist)

    if (newSpeed === 0) {
      // stop
      stop(address, consist)
    } else {
      // set speed
      setTimeout(() => {
        dccApi.setSpeed(address, newSpeed)
        consist &&
          consist.forEach((cloco) => {
            const clocoSpeed = calculateConsistSpeed(newSpeed, cloco)
            dccApi.sendDccCommand({
              action: 'throttle',
              payload: {
                address: cloco.address,
                speed: clocoSpeed,
                direction: clocoSpeed || 0 < 0 ? false : true,
              },
            })
          })
      }, delay)
    }
  }

  function stop(address: number, consist: ConsistLoco[]) {
    dccApi.setSpeed(address, 0)
    consist &&
      consist.forEach((cloco) => {
        dccApi.sendDccCommand({
          action: 'throttle',
          payload: {
            address: cloco.address,
            speed: 0,
          },
        })
      })
  }

  function calculateConsistSpeed(
    newSpeed: number,
    consistLoco: ConsistLoco
  ): number | undefined {
    if (!consistLoco.trim) {
      return consistLoco.direction ? newSpeed : -newSpeed
    }
    let consistSpeed = newSpeed
    if (consistLoco.direction) {
      consistSpeed =
        newSpeed > 0
          ? consistSpeed + consistLoco.trim
          : -consistSpeed - consistLoco.trim
    } else {
      consistSpeed =
        newSpeed > 0
          ? consistSpeed - consistLoco.trim
          : -consistSpeed + consistLoco.trim
    }

    // if (newSpeed > 0 && consistSpeed <= 0) {
    //   consistSpeed = 1
    // } else if (newSpeed < 0 && consistSpeed >= 0) {
    //   consistSpeed = -1
    // }

    return consistSpeed
  }

  return {
    updateSpeed,
    acquireThrottle,
  }
}

export default useThrottle
