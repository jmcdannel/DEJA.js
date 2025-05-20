<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useConnectionStore } from '@/connections/connectionStore.jsx'
  import StatusItemDeja from '@/core/StatusItemDeja.component.vue'
  import StatusMenuItem from '@/core/StatusMenuItem.component.vue'
  import useSerial from '@/api/serialApi'

  import { 
    BsFillLightningChargeFill,
    BsCloudFill,
    BsUsbSymbol,
    BsCpu,
    BsCupHotFill,
    BsFillPersonFill,
  } from 'vue3-icons/bs'

  const serialApi = useSerial()
  const connStore = useConnectionStore()
  const { mqttConnected, dejaConnected, isEmulated, serialConnected, layoutId } = storeToRefs(connStore)

  const handleEmulator = () => {
    console.log('handleEmulator', isEmulated.value)
    if (isEmulated.value) {
      connStore.disconnect()
    } else {
      connStore.connect('emulator')
    }
  }

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

  function getIcon() {
    return serialConnected.value
      ? BsUsbSymbol
      : dejaConnected.value
        ? BsFillLightningChargeFill
        : isEmulated.value
          ? BsCupHotFill
          : BsFillLightningChargeFill
  }

  const statusIcons = reactive([
    { 
      icon: getIcon(), 
      color:  (isEmulated.value || dejaConnected.value || serialConnected.value) ? 'text-success' : 'text-error' 
    },
    { 
      icon: BsCpu,
      color: (serialConnected.value || dejaConnected.value && layoutId || isEmulated.value) ? 'text-success' : 'text-error' 
    },
    { 
      icon: BsCloudFill, 
      color: 'text-neutral' 
    }
  ])

</script>

<template>
  <main class="flex">
    <div class="dropdown dropdown-oepn dropdown-end">
      <div tabindex="0" role="button" class="btn m-1">
        <ul class="flex items-center justify-center">
          <li class="mx-1">
            <BsFillLightningChargeFill v-if="dejaConnected" class="w-4 h-4 text-success  stroke-none" />
            <BsUsbSymbol v-else-if="serialConnected" class="w-4 h-4 text-success  stroke-none" />
            <BsCupHotFill v-else-if="isEmulated" class="w-4 h-4 text-success  stroke-none" />
            <BsFillLightningChargeFill v-else class="w-4 h-4 text-error" />
          </li>
          <li class="mx-1">
            <BsCpu v-if="layoutId || isEmulated || serialConnected" class="w-4 h-4 text-success  stroke-none" />
            <BsCpu v-else class="w-4 h-4 text-error" />
          </li>
          <li class="mx-1">
            <BsCloudFill class="w-4 h-4 text-neutral  stroke-none" />
          </li>
        </ul>
      </div>
      <div
        tabindex="0"
        class="dropdown-content z-[1] w-auto">
        <div class="stats stats-vertical shadow bg-slate-900">

          <StatusMenuItem 
            v-if="dejaConnected || (!isEmulated && !serialConnected && !dejaConnected)"
            :icon="BsFillLightningChargeFill" 
            :is-connected="dejaConnected"
            item-label="DEJA.js" 
            page="deja"
            @disconnect="handleDisconnect"
            class="text-pink-400">    
            {{ dejaConnected ? 'Connected' : '' }}
          </StatusMenuItem>
          <StatusMenuItem 
            v-if="serialConnected || (!isEmulated && !serialConnected && !dejaConnected)"
            :icon="BsUsbSymbol" 
            :is-connected="serialConnected"
            item-label="USB Serial" 
            @disconnect="handleDisconnect"
            @connect="handleSerial">    
            {{ serialConnected ? 'Connected' : '' }}
          </StatusMenuItem>
          <StatusMenuItem 
            v-if="isEmulated || (!isEmulated && !serialConnected && !dejaConnected)"
            :icon="BsCupHotFill" 
            :is-connected="isEmulated"
            item-label="Emulator"
            class="text-pink-400"
            @disconnect="handleDisconnect"
            @connect="handleEmulator">    
            {{ isEmulated ? 'Connected' : '' }}
          </StatusMenuItem>

          <StatusMenuItem 
            :icon="BsCpu" 
            :is-connected="!!layoutId || isEmulated || serialConnected"
            item-label="DCC-EX CommandStation" 
            page="deja"
            class="text-purple-600">    
            {{ (!!layoutId || isEmulated || serialConnected) ? 'Connected' : '' }}
            <template v-slot:actions>
              <button class="btn btn-sm btn-outline mr-2" disabled>
                Get Status
              </button>
              <button class="btn btn-sm btn-outline" disabled>
                View Log
              </button>
            </template>
          </StatusMenuItem>

          <StatusMenuItem 
            :icon="BsCloudFill" 
            :is-connected="false"
            item-label="DEJA Cloud" 
            page="deja"
            class="text-neutral">    
            <div class="flex items-center text-xs"><BsFillPersonFill class="w-6 h-6 inline-flex rounded-full bg-green-400 p-1 m-1" />trainguy@example.com</div>
            <template v-slot:desc>
              <p class="mt-1">Coming Soon</p>
            </template>
            <template v-slot:actions>
              <button class="btn btn-sm btn-outline mr-2" disabled>
                Login
              </button>
              <button class="btn btn-sm btn-outline" disabled>
                Sign Up
              </button>
            </template>
          </StatusMenuItem>

        </div>
      </div>
    </div>
    
    <!-- <button
      @click="$router.push({ name: 'connect' })"
      class="btn btn-ghost relative flex flex-row"
          :class="{
          'text-blue-500': emulated(),
          'text-error': !anyConnected(),
          'text-green-300': anyConnected()
      }">
      <span class="">{{ getLabel() }}</span>
      <BsFillLightningChargeFill class="w-4 h-4 fill-green-300 stroke-green-300" />

      
    </button> -->



  </main>
</template>
