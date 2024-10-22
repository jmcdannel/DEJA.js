import { computed, effect } from 'vue'
import {
  doc,
  collection,
  serverTimestamp,
  setDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@/firebase'
import { useLayout } from '@/Layout/useLayout'
import { useTurnouts } from '@/Turnouts/useTurnouts'
import { useDcc } from '@/DCCEX/useDcc'
import { useDejaJS } from '@/DejaJS/useDejaJS'
import { useEfxIcon } from '@/Effects/useEfxIcon'

export const useEfx = () => {
  const layoutId = useStorage('@DEJA/cloud/layoutId', 'betatrack')
  const { getDevices, getDevice } = useLayout()
  const { getTurnout } = useTurnouts()
  const { sendDccCommand } = useDcc()
  const { sendDejaCommand } = useDejaJS()
  const { getIconComponent } = useEfxIcon()

  const efxCol = computed(() =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/effects`) : null
  )

  function getEffects() {
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

  const efxTypes = [
    {
      value: 'light',
      label: 'Light',
      icon: getIconComponent('headlight'),
      color: 'yellow',
      require: ['device', 'pin'],
    },
    {
      value: 'led',
      label: 'LED',
      icon: getIconComponent('led'),
      color: 'lime',
      require: ['device', 'pin'],
    },
    {
      value: 'streetlight',
      label: 'Street Light',
      icon: getIconComponent('streetlight'),
      color: 'yellow',
      require: ['device', 'pin'],
    },
    {
      value: 'relay',
      label: 'Relay',
      icon: getIconComponent('relay'),
      color: 'indigo',
      require: ['device', 'pin'],
    },
    {
      value: 'frog',
      label: 'Frog Juicer',
      icon: getIconComponent('frog'),
      color: 'green',
      require: ['device', 'pin'],
    },
    {
      value: 'power',
      label: 'Power',
      icon: getIconComponent('power'),
      color: 'red',
      require: ['device', 'pin'],
    },
    {
      value: 'pin',
      label: 'PIN',
      icon: getIconComponent('pin'),
      color: 'orange',
      require: ['device', 'pin'],
    },
    {
      value: 'sound',
      label: 'Sound',
      icon: getIconComponent('sound'),
      color: 'cyan',
      require: ['sound'],
    },
    {
      value: 'macro',
      label: 'Macro',
      icon: getIconComponent('magic'),
      color: 'purple',
      require: [''],
    },
  ]

  function getEfxType(value: string) {
    return efxTypes.find((item) => item.value === value)
  }

  const DEFAULT_TYPE = getEfxType('pin')

  async function setEfx(efxId, efx) {
    console.log('setEfx', efx)
    try {
      // const newDoc = await collection(db, `layouts/${layoutId.value}/effects`)
      //   .doc(efx.id)
      //   .set(newEfx)
      const id = efxId
        ? efxId
        : slugify(`${efx['device'] || 'macro'}-${efx.type}-${efx.name}`)
      await setDoc(doc(db, `layouts/${layoutId.value}/effects`, id), {
        ...efx,
        timestamp: serverTimestamp(),
      })
      return true
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function deleteEfx(efxId) {
    try {
      console.log('deleteEfx', efxId)
      await deleteDoc(doc(db, `layouts/${layoutId.value}/effects`, efxId))
    } catch (e) {
      console.error('Error deleting document: ', e)
    }
  }

  async function runEffect(efx) {
    console.log('dejaCloud runEffect', efx, efx?.id)

    try {
      if (efx?.type === 'macro') {
        await runMacro(efx)
        return
      }
      const device = await getDevice(efx['device'])
      console.log('device', device, device?.type)

      if (device?.type === 'dcc-ex') {
        sendDccCommand({ action: 'output', payload: efx })
      } else if (device?.type === 'deja-arduino') {
        sendDejaCommand({ action: 'effects', payload: { ...efx, id: efx?.id } })
      }
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  async function runMacro(efx) {
    try {
      console.log('dejaCloud runMacro', efx, efx?.id)
      const devices = await getDevices()
      const dccExDevice = devices.value.find(
        (device) => device.type === 'dcc-ex'
      ) // TODO: support multiple dcc-ex devices
      console.log('dccExDevice', dccExDevice, devices.value)
      const items = efx?.[efx.state ? 'on' : 'off']
      const effectItems = items.filter((i) => i.type === 'effect')
      const dejaEffectItems = effectItems.filter(
        (i) => i.device !== dccExDevice.id
      )
      const dccEffectItems = effectItems.filter(
        (i) => i.device === dccExDevice.id
      )
      const turnoutItems = items.filter((i) => i.type === 'turnout')
      const dejaTurnoutItems = turnoutItems.filter(
        (i) => i.device !== dccExDevice.id
      )
      const dccTurnoutItems = turnoutItems.filter(
        (i) => i.device === dccExDevice.id
      )

      console.log(
        'items',
        items,
        effectItems,
        dejaEffectItems,
        dccEffectItems,
        turnoutItems,
        dejaTurnoutItems,
        dccTurnoutItems
      )

      dccEffectItems.forEach(async (macroItem) => {
        const macroEfx = await getEffect(macroItem.id)
        sendDccCommand({
          action: 'output',
          payload: {
            ...macroEfx,
            state: efx.state ? macroItem.state : !macroItem.state,
          },
        })
      })

      dccTurnoutItems.forEach(async (macroItem) => {
        const macroTurnout = await getTurnout(macroItem.id)
        sendDccCommand({
          action: 'turnout',
          payload: {
            turnoutId: macroTurnout.turnoutIdx,
            state: efx.state ? macroItem.state : !macroItem.state,
          },
        })
      })

      const promisesDejaEffects = dejaEffectItems.map(async (macroItem) => {
        const macroEfx = await getEffect(macroItem.id)
        return {
          ...macroEfx,
          state: efx.state ? macroItem.state : !macroItem.state,
        }
      })
      const dejaEffects = await Promise.all(promisesDejaEffects)

      const promisesDejaTurnouts = dejaTurnoutItems.map(async (macroItem) => {
        const macroTurnout = await getTurnout(macroItem.id)
        return {
          ...macroTurnout,
          state: efx.state ? macroItem.state : !macroItem.state,
        }
      })
      const dejaTurnouts = await Promise.all(promisesDejaTurnouts)

      const dejaDevices = [
        ...new Set([...dejaEffects, ...dejaTurnouts].map((i) => i.device)),
      ]
      const macro = {}
      dejaDevices.map((device) => {
        macro[device] = {
          effects: dejaEffects.filter((i) => i.device === device),
          turnouts: dejaTurnouts.filter((i) => i.device === device),
        }
      })
      console.log('dejaEffects', macro, dejaDevices, dejaEffects, dejaTurnouts)

      sendDejaCommand({
        action: 'macro',
        payload: { macro, id: efx?.id },
      })
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

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
    setEfx,
    efxTypes,
    getEfxType,
    DEFAULT_TYPE,
    runEffect,
    getEffects,
    getEffect,
    deleteEfx,
  }
}

export default useEfx
