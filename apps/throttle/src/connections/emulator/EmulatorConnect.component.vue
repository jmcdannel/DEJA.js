<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import router from '@/router';
  import tttButton from '@/shared/ui/tttButton.component.vue'
  import ConnectionStatus from '@/core/ConnectionStatus.component.vue'
  import { useConnectionStore } from '@/connections/connectionStore.jsx'

  const connStore = useConnectionStore()
  const { isEmulated } = storeToRefs(connStore)

  const handleConnectClick = () => {
    connStore.connect('emulator')
    router.push({ name: 'home' })
  }
  const handleDisconnectClick = () => {
    connStore.disconnect()
    router.push({ name: 'home' })
  }
  const handleCancelClick = () => {
    router.push({ name: 'home' })
  }

</script>

<template>
  <main class="p-4 flex flex-col justify-between w-full overflow-auto forest-background">
    <header>
      <h1 class="fancy-title leading-tight text-transparent text-8xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600">Connect</h1>
      <h2 class="text-5xl flex items-end ">
         <span class="bg-clip-text bg-gradient-to-r from-red-800 to-fuchsia-700 uppercase font-extrabold">
          Emulator
        </span>
      </h2>
    </header>
    <main class="my-1 pt-8 flex-grow flex flex-col">
      <div class="p-2">
        <ConnectionStatus connectedLabel="Emulator" disconnectedLabel="Emulator" :connected="isEmulated" />
        <p class="p-4">
          Emulate a connection to a DCC-EC EX-CommandStation. This connection mode allows you to test the DEJA Throttle without a physical connection to a DCC-EC EX-CommandStation.
        </p>
      </div>
      <div class="flex-grow flex justify-between items-end">
        <tttButton variant="warning" size="lg" @click="handleCancelClick">Cancel</tttButton>
        <tttButton v-if="isEmulated" variant="error" size="lg" @click="handleDisconnectClick">Disconnect</tttButton>
        <tttButton v-else variant="success" size="lg" @click="handleConnectClick">Connect</tttButton>
      </div>
    </main>
  </main>
</template>