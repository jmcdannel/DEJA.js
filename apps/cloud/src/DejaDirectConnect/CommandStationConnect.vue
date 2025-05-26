<script setup lang="ts">
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { FaUsb } from 'vue3-icons/fa6'
import { useStorage } from '@vueuse/core'
import useSerial from './useSerial'
import { db } from "../firebase"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import CommandStation from './CommandStation.vue'


const layoutId = useStorage('@DEJA/layoutId', null)

const emit = defineEmits(['connected'])

dayjs.extend(relativeTime)

const {
  connect,
  isConnected
} = useSerial((msg) => {
  // console.log('useSerial.msg', msg)
  let delta
  let val = msg
  if (msg?.startsWith('= A')) {
    delta = 'trackA'
    val = msg.replace(/= A /, '')
  } else if (msg?.startsWith('= B')) {
    delta = 'trackB'
    val = msg.replace(/= B /, '')
  } else if (msg?.startsWith('* LCD2:')) {
    delta = 'LCD2'
    val = msg.replace(/\* LCD2:/, '')
  } else if (msg?.startsWith('* LCD3:')) {
    delta = 'LCD3'
    val = msg.replace(/\* LCD3:/, '')
  } else if (msg?.startsWith('* LCD4:')) {
    delta = 'LCD4'
    val = msg.replace(/\* LCD4:/, '')
  } else if (msg?.startsWith('iDCC-EX ')) {
    delta = 'version' 
  }

  delta && console.log('delta', delta, val)

  delta && layoutId.value && updateDoc(doc(db, 'layouts', layoutId.value),
    {
      [`dccEx.${delta}`]: val,
      ['dccEx.timestamp']: serverTimestamp()
    }, { merge: true })

  /*
  <= A MAIN>
  <= B PROG>
  <iDCC-EX V-5.0.9 / MEGA / STANDARD_MOTOR_SHIELD G-3bddf4d>
  <* LCD3:Ready *>
  <* LCD2:Power Off *>
  * <* LCD3:Free RAM= 5240b *>
  */
})


async function handleConnect() {
  console.log('handleConnect', layoutId.value)
  await connect()
  emit('connected')
  // await listen(layoutId.value)
}

</script>
<template>

  <main class="flex flex-col relative z-10 w-full">

    <template v-if="isConnected">
      <CommandStation />
    </template>
    <template v-else>
      <main>
        <button @click="handleConnect" class="w-auto text-xl m-4 p-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-300 border border-cyan-800 text-cyan-400 rounded-2xl hover:bg-cyan-900 hover:bg-opacity-20 flex items-center">
          <img src="/dcc-ex/android-chrome-192x192.png" alt="DCC-EX Logo" class="w-8 h-8 mr-2" :class="isConnected ? 'text-green-500' : 'text-gray-500'" /> 
          Connect DCC-EX Command Station
          <FaUsb class="ml-2 text-sky-500" />
        </button>
      </main>
    </template>
  </main>
</template>
