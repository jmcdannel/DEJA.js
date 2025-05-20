<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { RouterLink } from 'vue-router'
  import { useConnectionStore } from '@/connections/connectionStore'
  import ConnectionStatus from '@/core/ConnectionStatus.component.vue'
  import linkIconSvg from '@/assets/icons/link.svg'
  
  const { isEmulated } = storeToRefs(useConnectionStore())  

</script>

<template>
 <div class="card bg-base-100 bg-opacity-70 shadow-xl border-teal-900 border-2 mb-2">
    <div class="card-body">
      <h2 class="card-title">
        <img :src="linkIconSvg" alt="my-logo"  class="w-16 h-16 fill-white strike-white border-teal-500 border-2 rounded-xl p-2" />
        Emulator
      </h2>
      <p>
        Emulate a DCC-EX EX-CommandStation connection and use the throttle as if it were connected to a real system.
      </p>
      <div class="card-actions justify-between items-center">
        <div class="flex">
          <div class="p-2 text-error">            
            <ConnectionStatus :connected="isEmulated" :connected-label="'Emulator'" />
          </div> 
        </div>
        
        <router-link
          :to="`/connect/emulator`"
          custom
          v-slot="{ navigate }"          
        >
          <button
            @click="navigate"
            role="link"
            class="btn btn-primary btn-outline"
          >
          <span v-if="!isEmulated">Connect</span>
          <span v-else>Configure</span>
          
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>