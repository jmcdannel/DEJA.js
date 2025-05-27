<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { useConnectionStore } from '@/connections/connectionStore.jsx'
  import { useCurrentUser } from 'vuefire'

  const user = useCurrentUser()
  const connStore = useConnectionStore()
  const { isDejaServer, isDejaJS, isSerial, isEmulated, dccExConnected } = storeToRefs(connStore)

</script>

<template>
  <main class="flex items-center justify-center">
    <v-btn variant="tonal" color="light-blue" @click="$router.push({ name: 'connect' })">
      <ul class="flex items-center justify-center">
        <li class="mx-1">
          <v-icon v-if="isDejaServer" class="stroke-none" color="success">mdi-cloud</v-icon>
          <v-icon v-else-if="isDejaJS" class="stroke-none" color="success">mdi-lightning-bolt</v-icon>
          <v-icon v-else-if="isSerial" class="stroke-none" color="success">mdi-usb</v-icon>
          <v-icon v-else-if="isEmulated" class="stroke-none" color="success">mdi-coffee</v-icon>
          <v-icon v-else class="stroke-none" color="error">mdi-lightning-bolt</v-icon>
        </li>
        <li class="mx-1">
           <v-icon v-if="(dccExConnected || isEmulated || isSerial)" class="stroke-none" color="success">mdi-cpu-64-bit</v-icon>
          <v-icon v-else class="stroke-none" color="error">mdi-cpu-64-bit</v-icon>
        </li>
        <li class="mx-1">
          <v-avatar :size="16" v-if="user" class="w-4 h-4 text-success">
            <v-img v-if="user?.photoURL" :src="user?.photoURL" />
          </v-avatar>
          <v-icon v-else class="stroke-none" size="8" color="grey-500">mdi-cloud</v-icon>          
        </li>
      </ul>
    </v-btn>
  </main>
</template>
