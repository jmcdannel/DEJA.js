<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { RouterLink } from 'vue-router'
  import router from '@/router';
  import { useConnectionStore } from '@/connections/connectionStore'
  import ConnectionStatus from '@/core/ConnectionStatus.component.vue'
  import linkIconSvg from '@/assets/icons/link.svg'
  
  const { layoutId, isEmulated, dejaConnected } = storeToRefs(useConnectionStore())  

  const handleConnectClick = () => {
    isEmulated.value = true
    dejaConnected.value = false
    router.push({ name: 'home' })
  }
  const handleDisconnectClick = () => {
    isEmulated.value = false
  }

  console.log('layoutId', layoutId.value  )

</script>

<template>
 <div class="card bg-base-100 bg-opacity-70 shadow-xl border-teal-900 border-2 mb-2">
    <div class="card-body">
      <h2 class="card-title">
        <img :src="linkIconSvg" alt="my-logo"  class="w-16 h-16 fill-white strike-white border-teal-500 border-2 rounded-xl p-2" />
        Layout ID
      </h2>
      <p>
        Enter your DEJA Layout ID to sync this app with your instance of DEJA.js connected to a DCC-EX EX-CommandStation.
      </p>
      <div class="card-actions justify-between items-center">
        <div class="flex">
          <div class="p-2 text-error">            
            <ConnectionStatus v-if="isEmulated" :connected="!!isEmulated" :connected-label="'Emulator'" />
            <ConnectionStatus v-else :connected="!!layoutId" :connected-label="layoutId ? layoutId : 'Layout ID'" />
          </div> 
        </div>
        <div>      
          
          <button v-if="isEmulated" class="btn text-orange-500 btn-outline border-orange-500" @click="handleDisconnectClick">Disconnect</button>
          <button v-else class="btn text-blue-500 btn-outline border-blue-500" @click="handleConnectClick">Emulator</button>
          
          <router-link v-if="!isEmulated"
            :to="`/connect/layout-id`"
            custom
            v-slot="{ navigate }"          
          >
            <button
              @click="navigate"
              role="link"
              class="btn text-violet-500 border-violet-500 btn-outline ml-2"
            >
            <span v-if="!layoutId">Connect</span>
            <span v-else>Configure</span>
            
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>