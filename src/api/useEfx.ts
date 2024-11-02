import { computed } from 'vue'
import {
  doc,
  collection,
  serverTimestamp,
  setDoc,
  getDoc,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@/firebase'
import { useLayout } from '@/api/useLayout'
// import { useTurnouts } from '@/api/useTurnouts'
import { useDcc } from '@/api/dccApi'
import { useDejaJs } from '@/api/useDejaJs'
// import { useEfxIcon } from '@/api/useEfxIcon'

export const useEfx = () => {
  const layoutId = useStorage('@DEJA/layoutId')
  const dccApi = useDcc()
  const { getDevice, getDevices } = useLayout()
  // const { getTurnout } = useTurnouts()
  // const { sendDccCommand } = useDcc()
  const { send: sendDejaCommand } = useDejaJs()
  // const { getIconComponent } = useEfxIcon()

  const efxCol = computed(() =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/effects`) : null
  )

  function getEffects() {
    console.log('getEffects')
    const layouts = useCollection(efxCol)
    return layouts
  }

  async function getEffect(id: string) {
    const deviceRef = doc(db, `layouts/${layoutId.value}/effects`, id)
    const docSnap = await getDoc(deviceRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id }
    } else {
      console.error('No such document!')
    }
  }

  // const efxTypes = [
  //   {
  //     value: 'light',
  //     label: 'Light',
  //     icon: getIconComponent('headlight'),
  //     color: 'yellow',
  //   },
  //   {
  //     value: 'led',
  //     label: 'LED',
  //     icon: getIconComponent('led'),
  //     color: 'lime',
  //   },
  //   {
  //     value: 'streetlight',
  //     label: 'Street Light',
  //     icon: getIconComponent('streetlight'),
  //     color: 'yellow',
  //   },
  //   {
  //     value: 'relay',
  //     label: 'Relay',
  //     icon: getIconComponent('relay'),
  //     color: 'indigo',
  //   },
  //   {
  //     value: 'frog',
  //     label: 'Frog Juicer',
  //     icon: getIconComponent('frog'),
  //     color: 'green',
  //   },
  //   {
  //     value: 'power',
  //     label: 'Power',
  //     icon: getIconComponent('power'),
  //     color: 'red',
  //   },
  //   {
  //     value: 'pin',
  //     label: 'PIN',
  //     icon: getIconComponent('pin'),
  //     color: 'orange',
  //   },
  //   {
  //     value: 'sound',
  //     label: 'Sound',
  //     icon: getIconComponent('sound'),
  //     color: 'cyan',
  //   },
  //   {
  //     value: 'macro',
  //     label: 'Macro',
  //     icon: getIconComponent('magic'),
  //     color: 'purple',
  //   },
  // ]

  // function getEfxType(value: string) {
  //   return efxTypes.find((item) => item.value === value)
  // }

  // const DEFAULT_TYPE = getEfxType('pin')

  async function setEfx(efxId, efx) {
    console.log('createEfx', name)
    try {
      // const newDoc = await collection(db, `layouts/${layoutId.value}/effects`)
      //   .doc(efx.id)
      //   .set(newEfx)
      const id = efxId
        ? efxId
        : slugify(`${efx['devcice'] || 'macro'}-${efx.type}-${efx.name}`)
      await setDoc(doc(db, `layouts/${layoutId.value}/effects`, id), {
        ...efx,
        timestamp: serverTimestamp(),
      })
      console.log('efx written with ID: ', layoutId.value)
      return true
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function runEffect(efx) {
    console.log('dejaCloud runEffect', efx, efx?.id)

    try {
      if (efx?.type === 'macro') {
        // await runMacro(efx)
        return
      }
      const device = await getDevice(efx['device'])
      console.log('device', device, device?.type)

      if (device?.type === 'dcc-ex') {
        dccApi.sendOutput(efx.pin, efx.state)
      } else if (device?.type === 'deja-arduino') {
        // sendDejaCommand({ action: 'effects', payload: { ...efx, id: efx?.id } })
        await setDoc(
          doc(db, `layouts/${layoutId.value}/effects`, efx.id),
          {
            state: efx.state,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        )
      }
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  // async function runMacro(efx) {
  //   try {
  //     console.log('dejaCloud runMacro', efx, efx?.id)
  //     const devices = await getDevices()
  //     const dccExDevice = devices.value.find(
  //       (device) => device.type === 'dcc-ex'
  //     ) // TODO: support multiple dcc-ex devices
  //     console.log('dccExDevice', dccExDevice, devices.value)
  //     const items = efx?.[efx.state ? 'on' : 'off']
  //     const effectItems = items.filter((i) => i.type === 'effect')
  //     const dejaEffectItems = effectItems.filter(
  //       (i) => i.device !== dccExDevice.id
  //     )
  //     const dccEffectItems = effectItems.filter(
  //       (i) => i.device === dccExDevice.id
  //     )
  //     const turnoutItems = items.filter((i) => i.type === 'turnout')
  //     const dejaTurnoutItems = turnoutItems.filter(
  //       (i) => i.device !== dccExDevice.id
  //     )
  //     const dccTurnoutItems = turnoutItems.filter(
  //       (i) => i.device === dccExDevice.id
  //     )
  //     console.log(
  //       'items',
  //       items,
  //       effectItems,
  //       dejaEffectItems,
  //       dccEffectItems,
  //       turnoutItems,
  //       dejaTurnoutItems,
  //       dccTurnoutItems
  //     )
  //     dccEffectItems.forEach(async (macroItem) => {
  //       const macroEfx = await getEffect(macroItem.id)
  //       dccApi.sendOutput(efx.pin, efx.state)
  //       dccApi.send('output', {
  //         ...macroEfx,
  //         state: efx.state ? macroItem.state : !macroItem.state,
  //       })
  //     })
  //     // dccTurnoutItems.forEach(async (macroItem) => {
  //     //   const macroTurnout = await getTurnout(macroItem.id)
  //     //   dccApi.send('turnout', {
  //     //     turnoutId: macroTurnout.turnoutIdx,
  //     //     state: efx.state ? macroItem.state : !macroItem.state,
  //     //   })
  //     // })
  //     const promisesDejaEffects = dejaEffectItems.map(async (macroItem) => {
  //       const macroEfx = await getEffect(macroItem.id)
  //       return {
  //         ...macroEfx,
  //         state: efx.state ? macroItem.state : !macroItem.state,
  //       }
  //     })
  //     const dejaEffects = await Promise.all(promisesDejaEffects)
  //     const promisesDejaTurnouts = dejaTurnoutItems.map(async (macroItem) => {
  //       const macroTurnout = await getTurnout(macroItem.id)
  //       return {
  //         ...macroTurnout,
  //         state: efx.state ? macroItem.state : !macroItem.state,
  //       }
  //     })
  //     const dejaTurnouts = await Promise.all(promisesDejaTurnouts)
  //     const dejaDevices = [
  //       ...new Set([...dejaEffects, ...dejaTurnouts].map((i) => i.device)),
  //     ]
  //     const macro = {}
  //     dejaDevices.map((device) => {
  //       macro[device] = {
  //         effects: dejaEffects.filter((i) => i.device === device),
  //         turnouts: dejaTurnouts.filter((i) => i.device === device),
  //       }
  //     })
  //     console.log('dejaEffects', macro, dejaDevices, dejaEffects, dejaTurnouts)
  //     sendDejaCommand({
  //       action: 'macro',
  //       payload: { macro, id: efx?.id },
  //     })
  //   } catch (e) {
  //     console.error('Error adding document: ', e)
  //   }
  // }

  function slugify(str: string) {
    str = str.replace(/^\s+|\s+$/g, '') // trim leading/trailing white space
    str = str.toLowerCase() // convert string to lowercase
    str = str
      .replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-') // remove consecutive hyphens
    return str
  }

  return {
    // setEfx,
    // efxTypes,
    // getEfxType,
    // DEFAULT_TYPE,
    runEffect,
    getEffects,
    getEffect,
  }
}

export default useEfx
