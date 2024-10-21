import { collection, serverTimestamp, addDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { db } from '@/firebase'

export const useDcc = () => {
  const layoutId = useStorage('@DEJA/cloud/layoutId', 'betatrack')

  const defaultCommands = [
    {
      id: 'p',
      type: 'toggle',
      label: 'Power',
      icon: 'mdi-power',
      command: ['0', '1'],
    },
    {
      id: 'pmain',
      type: 'toggle',
      label: 'Power MAIN',
      icon: 'mdi-power',
      command: ['0 MAIN', '1 MAIN'],
    },
    {
      id: 'r',
      type: 'dcc',
      label: 'Reset',
      icon: 'mdi-refresh',
      command: 'D RESET',
    },
    {
      id: 's',
      type: 'dcc',
      label: 'Status',
      icon: 'mdi-information',
      command: '=',
    },
    {
      id: 'e',
      type: 'dcc',
      label: 'Save <E>',
      icon: 'mdi-memory-arrow-down',
      command: 'E',
    },
    {
      id: 'z',
      type: 'dcc',
      label: 'List Outputs',
      icon: 'mdi-creation',
      command: 'Z',
    },
    {
      id: 'dcc',
      type: 'text',
      label: 'DCC Command',
      icon: 'mdi-code-tags',
      command: '',
    },
  ]

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
      console.error('Error adding document: ', e)
    }
  }
  return {
    sendDccCommand,
    defaultCommands,
  }
}

export default useDcc
