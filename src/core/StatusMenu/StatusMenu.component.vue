<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useConnectionStore } from '@/connections/connectionStore.jsx'
  import { useCurrentUser } from 'vuefire'
  import StatusMenuItem from '@/core/StatusMenu/StatusMenuItem.component.vue'
  import useSerial from '@/api/serialApi'
  import { useDcc } from '@/api/dccApi'
  import { 
    BsFillLightningChargeFill,
    BsUsbSymbol,
    BsCloud,
    BsCloudFill,
    BsCpu,
    BsUsbPlug,
    BsUsbPlugFill,
    BsCupHotFill,
  } from 'vue3-icons/bs'
  import { BiServer, BiSolidServer } from "vue3-icons/bi"
import { serverTimestamp } from 'firebase/database'
import DejaSignout from '@/deja-cloud/DejaSignout.vue'
import DejaUser from '@/deja-cloud/DejaUser.vue'

  const user = useCurrentUser()
  const dccApi = useDcc()
  const serialApi = useSerial()
  const connStore = useConnectionStore()
  const { isDejaServer, isDejaJS, isSerial, isEmulated, dccExConnected, layoutId } = storeToRefs(connStore)

  const handleDisconnect = () => {
    connStore.disconnect()
  }

  const handleStatus = () => {
    dccApi.send('getStatus', { })
  }

  const handleSerial = () => {
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

  const handleEmulator = () => {
    console.log('handleEmulator', isEmulated.value)
    if (isEmulated.value) {
      connStore.disconnect()
    } else {
      connStore.connect('emulator')
    }
  }

  function getIcon() {
    if (isSerial.value) {
      return BsUsbSymbol
    } else if (isDejaJS.value) {
      return BsFillLightningChargeFill
    } else if (isDejaServer.value) {
      return BsCloud
    } else if (isEmulated) {
      return BsCupHotFill
    } else {
      return BsUsbPlug 
    }
  }

  const statusIcons = reactive([
    { 
      icon: getIcon(), 
      color:  (isEmulated.value || isDejaServer.value || isDejaJS.value || isSerial.value) ? 'text-success' : 'text-error' 
    },
    { 
      icon: BsCpu,
      color: (isEmulated.value || isDejaServer.value || isDejaJS.value || isSerial.value) ? 'text-success' : 'text-error' 
    },
    { 
      icon: BsCloudFill, 
      color: 'text-neutral' 
    }
  ])

  const disabledColor = '#999999'

</script>

<template>
  <main class="flex items-center justify-center">
    <v-btn variant="tonal" color="light-blue" @click="$router.push({ name: 'connect' })">
      <ul class="flex items-center justify-center">
        <li class="mx-1">
          <BsCloudFill v-if="isDejaServer" class="w-4 h-4 text-success stroke-none" />
          <BsFillLightningChargeFill v-else-if="isDejaJS" class="w-4 h-4 text-success  stroke-none" />
          <BsUsbSymbol v-else-if="isSerial" class="w-4 h-4 text-success  stroke-none" />
          <BsCupHotFill v-else-if="isEmulated" class="w-4 h-4 text-success  stroke-none" />
          <BsFillLightningChargeFill v-else class="w-4 h-4 text-error" />
        </li>
        <li class="mx-1">
          <BsCpu v-if="(dccExConnected || isEmulated || isSerial)" class="w-4 h-4 text-success stroke-none" />
          <BsCpu v-else class="w-4 h-4 text-error" />
        </li>
        <li class="mx-1">
          <v-avatar :size="16" v-if="user" class="w-4 h-4 text-success">
            <v-img  :src="user?.photoURL" />
          </v-avatar>
          <BsCloud v-else class="w-4 h-4 text-gray-400" />
        </li>
      </ul>
    </v-btn>
    
        <!-- <div class="stats stats-vertical shadow bg-slate-900">

          <template v-if="!(isDejaServer || isDejaJS || isEmulated || isSerial)">
            <StatusMenuItem 
              :icon="BsFillLightningChargeFill" 
              :is-connected="false"
              item-label="Connection" 
              page="deja"
              class="text-neutral">    
              <template v-slot:actions>
                <button @click="$router.push({ name: 'connect' })" class="btn btn-sm btn-outline mr-2" >
                  Connect
                </button>
              </template>
            </StatusMenuItem>
          </template>

          <template v-else>
            <StatusMenuItem 
              v-if="isDejaServer"
              :icon="BsFillLightningChargeFill" 
              :is-connected="isDejaServer"
              item-label="DEJA.js" 
              page="dejajd"
              @disconnect="handleDisconnect"
              class="text-pink-400">    
              {{ isDejaServer ? layoutId : '' }}
            </StatusMenuItem>
            <StatusMenuItem 
              v-if="isDejaJS"
              :icon="BsFillLightningChargeFill" 
              :is-connected="isDejaJS"
              item-label="DEJA.js" 
              page="dejajd"
              @disconnect="handleDisconnect"
              class="text-pink-400">    
              {{ isDejaJS ? layoutId : '' }}
            </StatusMenuItem>
            <StatusMenuItem 
              v-if="isSerial"
              :icon="BsUsbSymbol" 
              :is-connected="isSerial"
              item-label="USB Serial" 
              @disconnect="handleDisconnect"
              @connect="handleSerial">    
              {{ isSerial ? 'Connected' : '' }}
            </StatusMenuItem>
            <StatusMenuItem 
              v-if="isEmulated"
              :icon="BsCupHotFill" 
              :is-connected="isEmulated"
              item-label="Emulator"
              class="text-pink-400"
              @disconnect="handleDisconnect"
              @connect="handleEmulator">    
              {{ isEmulated ? 'Connected' : '' }}
            </StatusMenuItem>
          </template>


          <StatusMenuItem          
            :icon="BsCpu" 
            :is-connected="(dccExConnected || isSerial || isEmulated)"
            item-label="DCC-EX CommandStation" 
            page="deja"
            @connect="$router.push({ name: 'connect' })"
            class="text-purple-600">
            <router-link
              :to="`/connect`"
              custom
              v-slot="{ navigate }"
            >
              <v-chip v-if="isDejaJS" @click="navigate" outline closable>{{  layoutId }}</v-chip>
              <v-chip v-else-if="isDejaServer" @click="navigate" outline closable>{{  layoutId }}</v-chip>
              <v-chip v-else-if="isSerial" @click="navigate" outline>USB Direct</v-chip>
              <v-chip v-else-if="isEmulated" @click="navigate" outline>Emulated</v-chip>
              <v-chip :color="disabledColor" v-else @click="navigate" outline>Disconnected</v-chip>
            </router-link>
            <template v-if="layoutId" v-slot:actions>            
              <button class="btn btn-sm btn-outline mx-2" @click="handleStatus">
                Get Status
              </button>
              <router-link
              :to="`/connect`"
              custom
              v-slot="{ navigate }"
              >
                <button class="btn btn-sm btn-outline" @click="navigate">
                  Connect
                </button>
              </router-link>
            </template>
          </StatusMenuItem>

          <StatusMenuItem 
              :icon="BsCloudFill" 
              :is-connected="!!user"
              item-label="DEJA Cloud" 
              page="deja"
              class="text-neutral">   
              <template v-if="!!user" slot="desc">
                <DejaUser class="text-sm my-2" />
              </template> 
              <template v-if="!!user" v-slot:actions>
                <DejaSignout class="outline" outline />
              </template>
              <template v-else v-slot:actions>
                <button @click="$router.push({ name: 'deja-cloud' })" class="btn btn-sm btn-outline mr-2" >
                  Login
                </button>
                <button @click="$router.push({ name: 'deja-cloud' })" class="btn btn-sm btn-outline" >
                  Sign Up
                </button>
              </template>
            </StatusMenuItem>

        </div> -->
    
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
