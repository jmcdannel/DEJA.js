<script setup lang="ts">
import { doc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import { useStorage } from '@vueuse/core'
import useSerial from './useSerial'
import { db } from '@repo/firebase-config'
import CommandStationLCD from './CommandStationLCD.vue'
import CommandStationTracks from './CommandStationTracks.vue'
import CommandStationStats from './CommandStationStats.vue'

const layoutId = useStorage('@DEJA/layoutId', '')

const layoutDoc = layoutId.value
  ? doc(db, 'layouts', layoutId.value)
  : null
const layout = useDocument(layoutDoc)

const {
  disconnect
} = useSerial(() => {})

async function handleDisconnect() {
  await disconnect()
}
</script>
<template>

  <main>
      <article class="p-4 flex flex-wrap gap-2 items-center relative" v-if="layout">
        
        <CommandStationLCD :dccEx="layout.dccEx" />
        <CommandStationTracks :dccEx="layout.dccEx" />
        <CommandStationStats :dccEx="layout.dccEx" />

        
      </article>
      <div class="px-4  py-2">
        <button @click="handleDisconnect" class="border bg-transparent border-cyan-800 py-1 px-2 text-cyan-400 p-4 rounded-md hover:bg-cyan-900 hover:bg-opacity-20 flex items-center">
          Disconnect
        </button>
      </div>

  </main>
</template>

<style scoped>

:root {
  --size: 55vh;
  --s: calc(var(55vh) / 6);
  --bor: calc(var(55vh) / 30);
  --boxShadow: calc(var(55vh) / 12);
}

</style>