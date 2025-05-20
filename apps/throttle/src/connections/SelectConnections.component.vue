<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { 
    BsFillLightningChargeFill,
    BsUsbSymbol,
    BsCpu,
    BsCupHotFill,
  } from 'vue3-icons/bs'
  import Status from './Status.component.vue';
  import { useConnectionStore } from '@/connections/connectionStore'
  import StatusMenuItem from '@/core/StatusMenuItem.component.vue'
  import useSerial from '@/api/serialApi'
 
  const serialApi = useSerial()
  const connStore = useConnectionStore()
  const { isEmulated, dejaConnected, serialConnected } = storeToRefs(connStore)  

  const handleDisconnect = () => {
    connStore.disconnect()
  }

  const handleSerial = () => {
    console.log('handleSerial', serialConnected.value)
    if (serialConnected.value) {
      handleSerialDisconnect()
    } else {
      handleSerialConnect()
    }
  }

  const handleSerialConnect = async () => {
    try {
      serialApi.connect()
    } catch (err) {
      console.error(err);
    }
  }
  const handleSerialDisconnect = async () => {
    try {
      serialApi.disconnect()
    } catch (err) {
      console.error(err);
    }
  }

  const handleEmulator = () => {
    console.log('handleEmulator', isEmulated.value)
    if (isEmulated.value) {
      connStore.disconnect()
    } else {
      connStore.connect('emulator')
    }
  }

</script>
<template>    
    <main class="py-3 px-4 pb-24 overflow-auto forest-background items-center justify-center">
      <h2 class="mb-4 fancy-title leading-tight text-transparent text-2xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600">
        Connect
        Your
        <strong class="text-8xl font-extralight uppercase">Layout</strong>
      </h2>

      <Transition name="slide-out" mode="out-in">
      <div class="stats stats-vertical w-full">
        <StatusMenuItem 
          :icon="BsFillLightningChargeFill" 
          :is-connected="dejaConnected"
          item-label="DEJA.js" 
          page="deja"
          @disconnect="handleDisconnect()"
          class="text-pink-400">    
          {{ dejaConnected ? 'Connected' : '' }}
          <template v-slot:desc>
            <p class="py-1">
              Connect DEJA Throttle to a DEJA.js server. The Definitive, Tranformative, Innovative DCC-EX CommandStation API. Requires modern Chromium browser.
            </p>
          </template>
        </StatusMenuItem>
        <StatusMenuItem 
          :icon="BsUsbSymbol" 
          :is-connected="serialConnected"
          item-label="USB Serial"  
            @disconnect="handleDisconnect()"
          @connect="handleSerial">    
          {{ serialConnected ? 'Connected' : '' }}
          <template v-slot:desc>
            <p class="py-1">
              Connect DEJA Throttle to a DCCEX Command Station Arduino connected directly to this computer. Requires modern Chromium browser.
            </p>
          </template>
        </StatusMenuItem>
        <StatusMenuItem 
          :icon="BsCupHotFill" 
          :is-connected="isEmulated"
          item-label="Emulator"
          class="text-pink-400"
          @connect="handleEmulator">    
          {{ isEmulated ? 'Connected' : '' }}
          <template v-slot:desc>
            <p class="py-1">
              Emulate a connection to a DCC-EC EX-CommandStation. This connection mode allows you to test the DEJA Throttle without a physical connection to a DCC-EC EX-CommandStation.
            </p>
          </template>
        </StatusMenuItem>
      </div>
    </Transition> 
    </main>
</template>

<style scoped>
  .fancy-title {
    word-spacing: 90vw; 
  }

  .slide-out-enter-active, .slide-out-leave-active {
    transition: transform 0.5s;
  }
  .slide-out-enter-active {
    transform: translateX(100%);
  }
  .slide-out-enter-to {
    transform: translateX(0);
  }

  /* @media screen and (max-width: 640px) {
    .fancy-title {
      word-spacing: normal;
    }
  } */
</style>