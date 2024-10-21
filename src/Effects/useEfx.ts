import { computed } from 'vue'
import { doc, collection, serverTimestamp, setDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@/firebase'
import { useLayout } from '@/Layout/useLayout'
import { useDcc } from '@/DCCEX/useDcc'
import { useDejaJS } from '@/DejaJS/useDejaJS'
import { useEfxIcon } from '@/Effects/useEfxIcon'

export const useEfx = () => {
  const layoutId = useStorage('@DEJA/cloud/layoutId', 'betatrack')
  const { getDevice } = useLayout()
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

  /*
  case 'light':
      case 'frog':
      case 'relay':
      case 'pin':
      case 'power':
        effect.state = payload.state;
        return [pinCommand(effect)];
      case 'ialed':
        return [ialedCommand(effect)];
      case 'serial-ialed':
        return [ialedCommand(effect)];
      case 'sound':
        return [soundCommand(effect)];
      case 'signal':
        const signalCommands = await signalCommand(effect);
        return signalCommands;
      case 'macro':
        const macroCommands = await macroCommand(effect);
        return macroCommands;
      default: 
        // no op

  */

  const efxTypes = [
    {
      value: 'light',
      label: 'Light',
      icon: getIconComponent('headlight'),
      color: 'yellow',
    },
    {
      value: 'led',
      label: 'LED',
      icon: getIconComponent('led'),
      color: 'lime',
    },
    {
      value: 'streetlight',
      label: 'Street Light',
      icon: getIconComponent('streetlight'),
      color: 'yellow',
    },
    {
      value: 'relay',
      label: 'Relay',
      icon: getIconComponent('relay'),
      color: 'indigo',
    },
    {
      value: 'frog',
      label: 'Frog Juicer',
      icon: getIconComponent('frog'),
      color: 'green',
    },
    {
      value: 'power',
      label: 'Power',
      icon: getIconComponent('power'),
      color: 'red',
    },
    {
      value: 'pin',
      label: 'PIN',
      icon: getIconComponent('pin'),
      color: 'orange',
    },
    {
      value: 'sound',
      label: 'Sound',
      icon: getIconComponent('sound'),
      color: 'cyan',
    },
    {
      value: 'macro',
      label: 'Macro',
      icon: getIconComponent('magic'),
      color: 'purple',
    },
  ]

  function getEfxType(value: string) {
    return efxTypes.find((item) => item.value === value)
  }

  const DEFAULT_TYPE = getEfxType('pin')

  async function setEfx(efxId, efx) {
    console.log('createEfx', name)
    try {
      // const newDoc = await collection(db, `layouts/${layoutId.value}/effects`)
      //   .doc(efx.id)
      //   .set(newEfx)
      const id = efxId
        ? efxId
        : slugify(`${efx['interface']}-${efx.type}-${efx.name}`)
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
    console.log('dejaCloud SEND', efx, efx?.id)

    try {
      const device = await getDevice(efx['interface'])
      console.log('device', device, device?.type)

      if (device?.type === 'dcc-ex') {
        sendDccCommand({ action: 'output', payload: efx })
      } else if (device?.type === 'deja-arduino') {
        sendDejaCommand({ action: 'effects', payload: { ...efx, id: efx?.id } })
      }

      // await addDoc(
      //   collection(db, `layouts/${layoutId.value}/dccCommands`),
      //   command
      // )
      console.log('Document written with ID: ', efx, device)
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
  }
}

export default useEfx
