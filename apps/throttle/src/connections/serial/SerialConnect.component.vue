<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import router from '@/router';
  import tttButton from '@/shared/ui/tttButton.component.vue'
  import ConnectionStatus from '@/core/ConnectionStatus.component.vue';
  import useSerial from '@/api/serialApi'
  import { useConnectionStore } from '@/connections/connectionStore'

  const serialApi = useSerial()
  const connStore = useConnectionStore()
  const { serialConnected } = storeToRefs(connStore)

  const handleConnectClick = async (e:any) => {
    try {
      e.preventDefault();
      serialApi.connect()
    } catch (err) {
      console.error(err);
    }
  }
  const handleDisconnectClick = async (e:any) => {
    try {
      e.preventDefault();
      serialApi.disconnect()
    router.push({ name: 'home' })
    } catch (err) {
      console.error(err);
    }
  }
  const handleCancelClick = () => {
    router.push({ name: 'home' })
  }

</script>

<template>
  <main class="p-4 flex flex-col justify-between w-full">
    <header>
      <h1 class="fancy-title leading-tight text-transparent text-8xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600">Connect</h1>
      <h2 class="text-5xl flex items-end ">
        <span class="bg-clip-text bg-gradient-to-r from-red-800 to-fuchsia-700 uppercase font-extrabold">
          Serial
        </span>
      </h2>
    </header>
    <main class="my-1 pt-8 flex-grow flex flex-col">  
      
      <div class="p-2">
        <ConnectionStatus :connected="serialConnected" />
        <div className="divider"></div> 
        <p class="p-2">
          Connect DEJA Throttle to a DCCEX Command Station Arduino connected directly to this computer. Requires modern Chromium browser.
        </p>
      </div> 
          
      <div class="flex-grow flex justify-between items-end">
        <tttButton variant="warning" size="lg" @click="handleCancelClick">Cancel</tttButton>
        <tttButton v-if="serialConnected" variant="error" size="lg" @click="handleDisconnectClick">Disconnect</tttButton>
        <tttButton v-else variant="success" size="lg" @click="handleConnectClick">Connect</tttButton>
      </div>
    </main>
  </main>
</template>