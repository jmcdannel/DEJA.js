<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { RouterLink } from 'vue-router'
  import ConnectionStatus from '@/core/ConnectionStatus.component.vue'
  import { useConnectionStore } from '@/connections/connectionStore'
  import linkIconSvg from '@/assets/icons/link.svg'

  const DCCJS_LABEL = 'DEJA Server'
  const DCCEX_LABEL = 'DEJA.js API'

  const { mqttConnected, dejaConnected, layoutId } = storeToRefs(useConnectionStore())  

</script>

<template>
 <div class="card bg-base-100 bg-opacity-70 shadow-xl border-teal-900 border-2 mb-2">
    <div class="card-body">
      <h2 class="card-title">        
        <img :src="linkIconSvg" alt="my-logo"  class="w-16 h-16 fill-white strike-white border-teal-500 border-2 rounded-xl p-2" />
       DEJA.js
      </h2>
      <p>Connect to your layout via DEJA.js - the DCC-EX JavaScript API by Track & Trestle Technology (Josh McDannel)</p>
      <div class="card-actions justify-between items-center">
        <div class="flex p-2 text-error flex-col">
          <ConnectionStatus :connected="mqttConnected" :connected-label="DCCJS_LABEL" :disconnected-label="DCCJS_LABEL" />
          <ConnectionStatus :connected="dejaConnected" :connected-label="DCCEX_LABEL" :disconnected-label="DCCEX_LABEL" />
        </div>         
        <router-link
          :to="`/connect/deja/`"
          custom
          v-slot="{ navigate }"          
        >
          <button
            @click="navigate"
            role="link"
            class="btn btn-primary btn-outline"
            :disabled="!mqttConnected || !layoutId"
          >
            <span v-if="!dejaConnected">Connect</span>
            <span v-else>Configure</span>          
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>