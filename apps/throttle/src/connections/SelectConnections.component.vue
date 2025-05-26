<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { useCurrentUser } from 'vuefire'

  import { 
    BsUsbSymbol,
    BsCloud,
    BsCloudFill,
    BsCpu,
    BsCupHotFill,
  } from 'vue3-icons/bs'
  import { useConnectionStore } from '@/connections/connectionStore'
  import StatusMenuItem from '@/core/StatusMenu/StatusMenuItem.component.vue'
  import DejaSignout from '@/deja-cloud/DejaSignout.vue'
  import DejaUser from '@/deja-cloud/DejaUser.vue'
  import useSerial from '@/api/serialApi'
  const serialApi = useSerial()
  const user = useCurrentUser()
  const connStore = useConnectionStore()
  const { 
    isEmulated, 
    isSerial,
  } = storeToRefs(connStore)  

  function handleDisconnect() {
    connStore.disconnect()
  }

  function handleSerial() {
    console.log('handleSerial', isSerial.value)
    try {
      if (isSerial.value) {
        serialApi.disconnect()
      } else {
        serialApi.connect()
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleEmulator() {
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

      <div class="stats stats-vertical w-full">
        <StatusMenuItem 
          :icon="BsCloudFill" 
          :is-connected="(!!user)"
          item-label="DEJA Cloud" 
          page="deja-cloud"
          @connect="$router.push({ name: 'deja-cloud' })"
          :class="!!user ? 'bg-gradient-to-r from-cyan-800 to-violet-800' : '' "
          @disconnect="handleDisconnect()">    
          <template v-if="(!!user)" v-slot:desc>
            <DejaUser class="m-1" />

            <button class="m-1 btn btn-primary "  @click="$router.push({ name: 'dejajs' })">
              <BsCpu class="h-3 w-3 stroke-none mx-1" />
              DejaJS Server
            </button>
            <button class="m-1 btn btn-primary"  @click="$router.push({ name: 'deja-direct' })">
              <BsCpu class="h-3 w-3 stroke-none mx-1" />
              DejaUSBDirect Server
            </button>

          </template>
          <template v-else v-slot:desc>
            <p class="py-1">
              Connect DEJA Throttle to a DEJA.js Server or DEJADirect Server. The Definitive, Transformative, Innovative DCC-EX CommandStation API.
            </p>
          </template>
          <template v-slot:actions>
            <DejaSignout v-if="(!!user)" />
            <template v-else>
              <button @click="$router.push({ name: 'deja-cloud' })" class="btn btn-sm btn-outline btn-primary">
                <BsCloud class="h-3 w-3 stroke-none mx-1 text-error" />
                Login
              </button>
            </template>
          </template>
        </StatusMenuItem>
      </div>
      <div class="divider"></div>
      <div class="stats stats-vertical w-full">
        <!-- <StatusMenuItem 
          :icon="BsDatabaseGear" 
          :is-connected="(isDejaServer)"
          item-label="DEJA Server" 
          @connect="handleDejaServer()"
          @disconnect="handleDisconnect()">    
          <v-chip v-if="(isDejaServer)" @click="$router.push({ name: 'deja-cloud' })" outline :color="isDejaServer ? 'success' : 'gray-500'">{{ layoutId }}</v-chip>          
        </StatusMenuItem>
        <StatusMenuItem 
          :icon="BiServer" 
          :is-connected="isDejaJS"
          item-label="DEJA.js" 
          page="dejajs"
          @disconnect="handleDisconnect()">    
          <LayoutChip v-if="isDejaJS" @click="$router.push({ name: 'dejajs' })" />
          <template v-slot:desc>
          </template>
        </StatusMenuItem> -->
        <StatusMenuItem 
          :icon="BsUsbSymbol" 
          :is-connected="isSerial"
          item-label="DEJA Throtltle Direct"  
          @disconnect="handleDisconnect()"
          @connect="handleSerial">    
          {{ isSerial ? 'Connected' : '' }}
          <template v-slot:desc>
            <p class="py-1">
              Connect DEJA Throttle to a DCCEX Command Station Arduino connected directly to this computer. Requires modern Chromium browser.
            </p>
          </template>
        </StatusMenuItem>
        <StatusMenuItem 
          :icon="BsCupHotFill" 
          :is-connected="isEmulated"
          item-label="DEJA Demo"
          @disconnect="handleDisconnect()"
          @connect="handleEmulator">    
          {{ isEmulated ? 'Connected' : '' }}
          <template v-slot:desc>
            <p class="py-1">
              Emulate a connection to a DCC-EC EX-CommandStation. This connection mode allows you to test the DEJA Throttle without a physical connection to a DCC-EC EX-CommandStation.
            </p>
          </template>
            
          <template v-slot:actions>
            <button @click="() => isEmulated ? handleEmulator() : handleDisconnect()" class="btn btn-sm btn-outline btn-primary">
              <BsCupHotFill class="h-3 w-3 stroke-none mx-1" />
              {{ isEmulated ? 'Disconnect' : 'Emulator' }}
            </button>
          </template>
        </StatusMenuItem>
      </div>
      
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